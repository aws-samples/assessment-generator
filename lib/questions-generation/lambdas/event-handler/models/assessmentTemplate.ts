import { AssessType, Lang } from "../../../../../ui/src/graphql/API";

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

  static async fromId(assessmentTemplateId: string) {
    // TODO read data from DDB
    return Promise.resolve(new AssessmentTemplate(Lang.EN, AssessType.Type1, 12, 3, 3, 3));
  }
}