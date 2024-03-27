import { logger } from "../../../../rag-pipeline/lambdas/event-handler/utils/pt";
import { ReferenceDocuments } from "../models/referenceDocuments";
import { AssessmentTemplate } from "../models/assessmentTemplate";
import { Question } from "../models/question";
import { GeneratedQuestions } from "../models/generatedQuestions";
import { BedrockAgentRuntime, KnowledgeBaseRetrievalResult } from "@aws-sdk/client-bedrock-agent-runtime";
import { BedrockRuntime } from "@aws-sdk/client-bedrock-runtime";
import { XMLBuilder, XMLParser } from "fast-xml-parser";


const CLAUDE_3_HAIKU = "anthropic.claude-3-haiku-20240307-v1:0";
const bedrock = new BedrockRuntime();
const bedrockAgentRuntime = new BedrockAgentRuntime();
const parser = new XMLParser();
const builder = new XMLBuilder();

export class GenAiService {
  private knowledgeBaseId: string;


  constructor(knowledgeBaseId: string) {
    this.knowledgeBaseId = knowledgeBaseId;
  }

  private async callLLM(modelId, prompt): Promise<string> {
    logger.debug(prompt);
    const body = JSON.stringify({
      "anthropic_version": "bedrock-2023-05-31",
      "max_tokens": 4096,
      "messages": [
        {
          "role": "user",
          "content": [
            { "type": "text", "text": prompt },
          ],
        },
      ],
    });
    const response = await bedrock.invokeModel({
      body: body,
      modelId: modelId,
      accept: "application/json",
      contentType: "application/json",
    });

    //TODO find out what Types we should expect
    const text = response.body.transformToString();
    //logger.info(text);
    const modelRes = JSON.parse(text);
    const contentElementElement = modelRes.content[0]["text"];

    return contentElementElement;
  }

  public async getTopics(referenceDocuments: ReferenceDocuments) {

    let prompt = `
Extract the key topics covered in the lecture. The lecture content is covered in the documents below.
Tell me the topics of the subject covered, do not include examples used to explain the concept.
For each topic, include a brief description of what was covered.
    `;

    for (let i = 0; i < referenceDocuments.documentsContent.length; i++) {
      const document = referenceDocuments.documentsContent[i];
      prompt += `Document ${i}:\n`;
      prompt += document;
    }
    logger.debug(prompt);
    let llmResponse = await this.callLLM(CLAUDE_3_HAIKU, prompt);
    logger.debug(llmResponse);
    return llmResponse;
  }

  public async generateInitialQuestions(topicsExtractionOutput: string, assessmentTemplate: AssessmentTemplate) {

    let prompt = `
Craft a multiple-choice questionnaire (${assessmentTemplate.totalQuestions} questions)  for a university student based on the Provided Summarised Transcript.
Do not make references to the transcript or the lecture, the quiz should be clear and concise.
Do not ask questions on whether the topic was covered or not in the lecture.
Build ${assessmentTemplate.easyQuestions} easy, ${assessmentTemplate.mediumQuestions} medium, and ${assessmentTemplate.hardQuestions} hard questions.
The questionnaire should be in the ISO 639-2 Code: ${assessmentTemplate.docLang}
The text below is a summarised transcript of the lecture that the teacher provided today
The answer choices must be around the topics covered in the lecture.
The question must be focused the topics covered in the lecture and not on general topics around the subject.
Test the examinee's understanding of essential concepts mentioned in the transcript.
Follow these guidelines:
Ensure that only one answer is correct.

Formulate a question that probes knowledge of the Core Concepts.
Present four answer choices labeled as A, B, C, and D.
Indicate the correct answer labeled as 'answer'.
Articulate a reasoned and concise defense for your chosen answer without relying on direct references to the text labeled as "explanation"

Structure your response in this format and do not include any additional text, respond with the XML content only. The response must be valid XML following this format:
\`\`\`xml
<response>
    <questions>
        <questionText>
            [Question]
        </questionText>
        <answers>
            <answerText>[Option A]</answerText>
        </answers>
        <answers>
            <answerText>[Option B]</answerText>
        </answers>
        <answers>
            <answerText>[Option C]</answerText>
        </answers>
        <answers>
            <answerText>[Option D]</answerText>
        </answers>
        <correctAnswer>[Correct Answer Letter]</correctAnswer>
        <explanation>[Explanation for Correctness]</explanation>
    </questions>
    <!-- all other questions below   -->
</response>
\`\`\`
    `;
    prompt += `Provided Summarised Transcript: \n ${topicsExtractionOutput}`;

    logger.debug(prompt);
    const llmResponse = await this.callLLM(CLAUDE_3_HAIKU, prompt);
    logger.debug(llmResponse);
    return llmResponse;
  }

  public async getRelevantDocuments(question: Question) {
    //logger.info(question as any);

    const kbQuery = `Find the relevant documents for the following quiz question:\n${JSON.stringify(question)}`;
    logger.debug(`KB query: ${kbQuery}`);
    const retrievedDocs = await bedrockAgentRuntime.retrieve({
      knowledgeBaseId: this.knowledgeBaseId,
      retrievalQuery: {
        text: kbQuery.substring(0, 1000), // limit to 1000 chars
      },
    });
    const retrievalResults = retrievedDocs.retrievalResults;
    logger.debug(retrievedDocs as any);
    return retrievalResults;
  }

  public async improveQuestions(generatedQuestions: string) {

    logger.debug(generatedQuestions);
    const parsedQuestions: GeneratedQuestions = parser.parse(generatedQuestions);
    let improvedQuestions: Question[] = [];

    for (let i = 0; i < parsedQuestions.response.questions.length; i++) {
      const question = parsedQuestions.response.questions[i];
      const relevantDocs = await this.getRelevantDocuments(question);
      const improvedQuestion = await this.improveQuestion(question, relevantDocs);
      improvedQuestions.push(improvedQuestion);
    }
    return Promise.resolve(improvedQuestions);
  }

  private async improveQuestion(originalQuestion: Question, relevantDocs: KnowledgeBaseRetrievalResult[] | undefined) {
    if (!(relevantDocs && relevantDocs.length > 0)) {
      return originalQuestion;
    }

    logger.info(originalQuestion as any);
    const xmlQuestion = builder.build(originalQuestion);
    logger.info(xmlQuestion as any);
    const xmlDocs = builder.build(relevantDocs);
    logger.info(xmlDocs as any);
    let prompt = `
If relevant, use the content in the EXTRACTED_DOCUMENTS to improve the QUESTION.
Structure your response in the FORMAT.
Any reference to the EXTRACTED_DOCUMENTS, should include the uri of the document. 

QUESTION:
${xmlQuestion}

EXTRACTED_DOCUMENTS:
${xmlDocs}


Structure your response in this format and do not include any additional imput. The response must be valid XML following this FORMAT:
\`\`\`xml
<question>
    <questionText>
        [Question]
    </questionText>
    <answers>
        <answerText>[Option A]</answerText>
    </answers>
    <answers>
        <answerText>[Option B]</answerText>
    </answers>
    <answers>
        <answerText>[Option C]</answerText>
    </answers>
    <answers>
        <answerText>[Option D]</answerText>
    </answers>
    <correctAnswer>[Correct Answer Letter]</correctAnswer>
    <explanation>[Explanation for Correctness]</explanation>
</question>
\`\`\`
    `;

    logger.debug(prompt);
    const llmResponse = await this.callLLM(CLAUDE_3_HAIKU, prompt);
    logger.debug(llmResponse);
    const { question }: { question: Question } = parser.parse(llmResponse);
    return question;
  }
}
