import { AssessmentTemplate } from "./assessmentTemplate";
import { GenerateAssessmentRequest } from "./generateAssessmentRequest";
import { GetObjectCommand, GetObjectCommandOutput, S3Client } from "@aws-sdk/client-s3";


const s3Client = new S3Client();

export class ReferenceDocuments {
  private static SOURCE_BUCKET = process.env.Q_GENERATION_BUCKET;
  documentsContent: string[];
  assessmentTemplate: AssessmentTemplate;
  knowledgeBaseId: string;

  constructor(documentsContent: string[], assessmentTemplate: AssessmentTemplate, knowledgeBaseId) {
    this.documentsContent = documentsContent;
    this.assessmentTemplate = assessmentTemplate;
    this.knowledgeBaseId = knowledgeBaseId;
  }


  static async fromJSON(apiGWRequestBody: string): Promise<ReferenceDocuments> {
    const parsedBody = JSON.parse(apiGWRequestBody) as GenerateAssessmentRequest;
    let documentsContent = await Promise.all(parsedBody.documents.map(async (s3ObjectKey) => {
      const getObjectCommand = new GetObjectCommand({
        Bucket: this.SOURCE_BUCKET,
        Key: s3ObjectKey,
      });
      const s3response: GetObjectCommandOutput = await s3Client.send<GetObjectCommand>(getObjectCommand);
      const document = await s3response.Body?.transformToString();
      if (!document) {
        throw new Error(`Empty object: ${s3ObjectKey}`);
      }
      return document;
    }));

    if (!(documentsContent && documentsContent.length > 0)) {
      throw new Error("No valid documents");
    }

    const assessmentTemplate = await AssessmentTemplate.fromId(parsedBody.assessmentTemplateId);
    return new ReferenceDocuments(documentsContent, assessmentTemplate, parsedBody.knowledgeBaseId);
  }
}