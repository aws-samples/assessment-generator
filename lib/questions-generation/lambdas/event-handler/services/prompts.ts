// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { AssessmentTemplate } from '../models/assessmentTemplate';
import { AssessType, MultiChoice, FreeText } from '../../../../../ui/src/graphql/API';
import { ReferenceDocuments } from '../models/referenceDocuments';

export function getInitialQuestionsPrompt(assessmentTemplate: AssessmentTemplate, topicsExtractionOutput: string) {
  // TODO add topic to response for each question
  let prompt = `
Craft a ${assessmentTemplate.assessType} questionnaire (${
    assessmentTemplate.totalQuestions
  } questions)  for a university student based on the Provided Summarised Transcript.
Ensure you have ONLY ${assessmentTemplate.totalQuestions} questions.
Do not make references to the transcript or the lecture, the quiz should be clear and concise.
Do not ask questions on whether the topic was covered or not in the lecture.
Build ${assessmentTemplate.easyQuestions} easy, ${assessmentTemplate.mediumQuestions} medium, and ${assessmentTemplate.hardQuestions} hard questions.
The questionnaire should be in the ISO 639-2 Code: ${assessmentTemplate.docLang}

Use the Bloom's Taxonomy of category ${
    assessmentTemplate.taxonomy
  } to generate the questionaire and make sure the questions generated satisfy the description of the category ${
    assessmentTemplate.taxonomy
  } in the Bloom's Taxonomy.

The text below is a summarised transcript of the lecture that the teacher provided today

${
  assessmentTemplate.assessType === AssessType.multiChoiceAssessment
    ? `
  The questions are muliple choice questions.
  The answer choices must be around the topics covered in the lecture.
  Ensure that only one answer is correct.
  Indicate the correct answer labeled as 'answer'.
  Articulate a reasoned and concise defense for your chosen answer without relying on direct references to the text labeled as "explanation"
`
    : ''
}

${
  assessmentTemplate.assessType === AssessType.freeTextAssessment
    ? `
  The questions are free text questions. for every question create a rubric weight grading guidance in a <rubric> tag. In <rubric> there should be a list (minimum 2) of expected points to be covered in the answer and the weight associated with this point, only use single digit integer values for weights.
`
    : ''
}

The question must be focused the topics covered in the lecture and not on general topics around the subject.
Test the examinee's understanding of essential concepts mentioned in the transcript.
Follow these guidelines:

Formulate a question that probes knowledge of the Core Concepts.

Structure your response in this format and do not include any additional text, respond with the XML content only. The response must be valid XML following this format and please ensure you follow below format:
\`\`\`xml
<response>
    <questions>
        <title>[Brief question title] ([Difficulty])</title>
        <question>
            [Question]
        </question>
    ${
      assessmentTemplate.assessType === AssessType.multiChoiceAssessment
        ? `
            <answerChoices>[Option 1]</answerChoices>
            <answerChoices>[Option 2]</answerChoices>
            <answerChoices>[Option 3]</answerChoices>
            <answerChoices>[Option 4]</answerChoices>
            <correctAnswer>[Correct Answer Number]</correctAnswer>
            <explanation>[Explanation for Correctness]</explanation>
    `
        : ''
    }
    ${
      assessmentTemplate.assessType === AssessType.freeTextAssessment
        ? `
          <rubric>
            <weight>[weight_value]</weight>
            <point>[Point 1]</point>
          </rubric>
          <rubric>
            <weight>[weight_value]</weight>
            <point>[Point 2]</point>
          </rubric>
          <!-- all other rubric points below   -->
    `
        : ''
    }
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

export function getRelevantDocumentsPrompt(question: MultiChoice | FreeText) {
  const kbQuery = `Find the relevant documents for the following quiz question:\n${JSON.stringify(question)}`;
  return kbQuery;
}

export function improveQuestionPrompt(xmlQuestion: any, xmlDocs: any, assessmentTemplate: AssessmentTemplate) {
  let prompt = `
If relevant, use the content in the EXTRACTED_DOCUMENTS to improve the QUESTION.
Structure your response in the FORMAT.
Any reference to the EXTRACTED_DOCUMENTS, should include the uri of the document and the page number (if present in the <x-amz-bedrock-kb-document-page-number>). 
The questionnaire should be in the ISO 639-2 Code: ${assessmentTemplate.docLang}

QUESTION:
${xmlQuestion}

EXTRACTED_DOCUMENTS:
${xmlDocs}


Structure your response in this format and do not include any additional imput. The response must be valid XML following this FORMAT:
\`\`\`xml
<question>
    <title>[Brief question title] ([Difficulty])</title>
    <question>
        [Question]
    </question>
    ${
      assessmentTemplate.assessType === AssessType.multiChoiceAssessment
        ? `
        <!-- for multiple choice questions only -->
            <answerChoices>[Option 1]</answerChoices>
            <answerChoices>[Option 2]</answerChoices>
            <answerChoices>[Option 3]</answerChoices>
            <answerChoices>[Option 4]</answerChoices>
            <correctAnswer>[Correct Answer Number]</correctAnswer>
        <!-- for multiple choice questions only -->
        <explanation>[Explanation for Correctness]</explanation>
    `
        : ''
    }
    ${
      assessmentTemplate.assessType === AssessType.freeTextAssessment
        ? `
          <rubric>
            <weight>[weight_value]</weight>
            <point>[Point 1]</point>
          </rubric>
          <rubric>
            <weight>[weight_value]</weight>
            <point>[Point 2]</point>
          </rubric>
          <!-- all other rubric points below   -->
    `
        : ''
    }
</question>
\`\`\`
    `;
  return prompt;
}
