import { AssessmentTemplate } from "./assessmentTemplate";
import { GenerateAssessmentRequest } from "./generateAssessmentRequest";
import { GetObjectCommand, GetObjectCommandOutput, S3Client } from "@aws-sdk/client-s3";
import { GenerateAssessmentInput } from "../../../../../ui/src/graphql/API";


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
  static async fromRequest(generateAssessmentInput: GenerateAssessmentInput) {
    const documents = generateAssessmentInput.locations;
    const assessmentTemplateId = "";
    const knowledgeBaseId = "NFN8WIUXXX";

    let documentsContent = await Promise.all(documents.map(async (s3ObjectKey) => {
      if(s3ObjectKey==null){
        return;
      }
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

    const assessmentTemplate = await AssessmentTemplate.fromId(assessmentTemplateId);
    return new ReferenceDocuments(documentsContent, assessmentTemplate, knowledgeBaseId);
  }
}