// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { AssessType, Lang } from '../../../../../ui/src/graphql/API';
import { DataService } from '../services/dataService';
import { logger } from '../../../../rag-pipeline/lambdas/event-handler/utils/pt';

const dataService = new DataService();
export class AssessmentTemplate {
  docLang: Lang;
  assessType: AssessType;
  totalQuestions: number;
  easyQuestions: number;
  mediumQuestions: number;
  hardQuestions: number;

  constructor(docLang: Lang, assessType: AssessType, totalQuestions: number, easyQuestions: number, mediumQuestions: number, hardQuestions: number) {
    this.docLang = docLang;
    this.assessType = assessType;
    this.totalQuestions = totalQuestions;
    this.easyQuestions = easyQuestions;
    this.mediumQuestions = mediumQuestions;
    this.hardQuestions = hardQuestions;
  }

  static async fromId(assessmentTemplateId: string | undefined, userId: string) {
    if (!assessmentTemplateId) {
      return Promise.resolve(new AssessmentTemplate(Lang.EN, AssessType.MultipleChoiceQuestionnaire, 10, 5, 3, 2));
    }
    // TODO read data from DDB
    const existingAssessmentTemplate = dataService.getExistingAssessmentTemplate(assessmentTemplateId, userId);
    logger.info(existingAssessmentTemplate as any);
    return await existingAssessmentTemplate;
  }
}
