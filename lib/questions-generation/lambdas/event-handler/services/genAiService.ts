import { logger } from "../../../../rag-pipeline/lambdas/event-handler/utils/pt";
import { ReferenceDocuments } from "../models/referenceDocuments";
import { AssessmentTemplate } from "../models/assessmentTemplate";
import { GeneratedQuestions } from "../models/generatedQuestions";
import { BedrockAgentRuntime, KnowledgeBaseRetrievalResult } from "@aws-sdk/client-bedrock-agent-runtime";
import { BedrockRuntime } from "@aws-sdk/client-bedrock-runtime";
import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { QandA } from "../../../../../ui/src/graphql/API";


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
    // why generate answers at this step? can we generate them after?
    // make sure you explain in AB3, do answers improve by generated after with KB
    // framework to evaluate how to improve prompts - evaluate questions - a/b testing - compare cost, effectiveness,

    // question that will come up - how do you evaluate responses - e.g. standard metrics - why Haiku, why Opus etc
    // put in context of running in production as a customer - what would I want to know?

    // what was the methodology for creating the promtps - what did you try, lessons learnt (slide)
    // split prompts in a separate file for easier history lookup - or how could you load the prompt extrernally
    // during AB3 - note down talking points on potential improvements (e.g. how you could improve/change) from

    // try a Meta-prompt - ask how to improve the prompt - could reformulate/change - check Anthropic metaprompt - watch the training, see official docs

    // KB topics - chunking, different mechanism?
    // KB can you run Step Function instead of Lambda? future improvement Metadata

    // assessment template - prompt injection

    // Metrics for questions generations - use PT metrics
    // could you generate by batch - enable customer to view

    // how do you reslove internal link to HTTP accessible link - using

    // AB3 - start from demo, show happy path, avoid getting derailed (especially if answer is coming later)
    // explain customer can pick their own design and adapt
    


    // TODO add topic to response for each question
    let prompt = `
Craft a multiple-choice questionnaire (${assessmentTemplate.totalQuestions} questions)  for a university student based on the Provided Summarised Transcript.
Ensure you have ONLY ${assessmentTemplate.totalQuestions} questions.
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
Present four answer choices labeled as 1, 2, 3, and 4.
Indicate the correct answer labeled as 'answer'.
Articulate a reasoned and concise defense for your chosen answer without relying on direct references to the text labeled as "explanation"

Structure your response in this format and do not include any additional text, respond with the XML content only. The response must be valid XML following this format:
\`\`\`xml
<response>
    <questions>
        <title>[Brief question title]</title>
        <question>
            [Question]
        </question>
        <answers>[Option 1]</answers>
        <answers>[Option 2]</answers>
        <answers>[Option 3]</answers>
        <answers>[Option 4]</answers>
        <correctAnswer>[Correct Answer Number]</correctAnswer>
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

  public async getRelevantDocuments(question: QandA) {
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
    let improvedQuestions: QandA[] = [];

    for (let i = 0; i < parsedQuestions.response.questions.length; i++) {
      const question = parsedQuestions.response.questions[i];
      const relevantDocs = await this.getRelevantDocuments(question);
      const improvedQuestion = await this.improveQuestion(question, relevantDocs);
      improvedQuestions.push(improvedQuestion);
    }
    return Promise.resolve(improvedQuestions);
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

  private async improveQuestion(originalQuestion: QandA, relevantDocs: KnowledgeBaseRetrievalResult[] | undefined): Promise<QandA> {
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
    <title>[Brief question title]</title>
    <question>
        [Question]
    </question>
    <answers>[Option 1]</answers>
    <answers>[Option 2]</answers>
    <answers>[Option 3]</answers>
    <answers>[Option 4]</answers>
    <correctAnswer>[Correct Answer Number]</correctAnswer>
    <explanation>[Explanation for Correctness]</explanation>
</question>
\`\`\`
    `;

    logger.debug(prompt);
    const llmResponse = await this.callLLM(CLAUDE_3_HAIKU, prompt);
    logger.debug(llmResponse);
    const { question }: { question: QandA } = parser.parse(llmResponse);
    return question;
  }
}
