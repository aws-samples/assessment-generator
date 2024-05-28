// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
 
import { AssessmentTemplate } from "./assessmentTemplate";
import { GetObjectCommand, GetObjectCommandOutput, S3Client } from "@aws-sdk/client-s3";
import { GenerateAssessmentInput } from "../../../../../ui/src/graphql/API";
import { logger } from "../../../../rag-pipeline/lambdas/event-handler/utils/pt";
import { DataService } from "../services/dataService";


const s3Client = new S3Client();
const dataService = new DataService();

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

  static async fromRequest(generateAssessmentInput: GenerateAssessmentInput, userId: string) {
    const documents = generateAssessmentInput.locations;
    const assessmentTemplateId = generateAssessmentInput.assessTemplateId || undefined;
    const {knowledgeBaseId} = await dataService.getExistingKnowledgeBase(generateAssessmentInput.courseId, userId);
    logger.info(`Using knowledgeBaseId: ${knowledgeBaseId}`);

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

    const assessmentTemplate = await AssessmentTemplate.fromId(assessmentTemplateId, userId);
    return new ReferenceDocuments(documentsContent, assessmentTemplate, knowledgeBaseId);
  }
}