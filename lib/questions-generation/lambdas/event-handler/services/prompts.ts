import { AssessmentTemplate } from "../models/assessmentTemplate";
import { QandA } from "../../../../../ui/src/graphql/API";
import { ReferenceDocuments } from "../models/referenceDocuments";

export function getInitialQuestionsPrompt(assessmentTemplate: AssessmentTemplate, topicsExtractionOutput: string) {
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
  return prompt;
}

export function getTopicsPrompt(referenceDocuments: ReferenceDocuments) {
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
  return prompt;
}

export function getRelevantDocumentsPrompt(question: QandA) {
  const kbQuery = `Find the relevant documents for the following quiz question:\n${JSON.stringify(question)}`;
  return kbQuery;
}

export function improveQuestionPrompt(xmlQuestion: any, xmlDocs: any) {
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
  return prompt;
}