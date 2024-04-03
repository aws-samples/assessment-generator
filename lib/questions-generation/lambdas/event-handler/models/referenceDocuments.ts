import { AssessmentTemplate } from "./assessmentTemplate";
import { GetObjectCommand, GetObjectCommandOutput, S3Client } from "@aws-sdk/client-s3";
import { GenerateAssessmentInput } from "../../../../../ui/src/graphql/API";
import { logger } from "../../../../rag-pipeline/lambdas/event-handler/utils/pt";


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
    const knowledgeBaseId = "0LZGU4OWBW";

    let documentsContent = await Promise.all(documents.map(async (s3ObjectKey) => {
      if (s3ObjectKey == null) {
        return;
      }
      const getObjectCommandParams = {
        Bucket: this.SOURCE_BUCKET,
        Key: `public/${s3ObjectKey}`,
      };
      logger.info(`Getting Object ${s3ObjectKey}`, getObjectCommandParams as any);
      const s3response: GetObjectCommandOutput = await s3Client.send<GetObjectCommand>(new GetObjectCommand(getObjectCommandParams));
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