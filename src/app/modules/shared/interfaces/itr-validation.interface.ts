export interface ItrValidation {
  errorCode: any;
  message: String;
  errorMsgToBeDisplayed: String;
  relatedSchedule: String;
}

export interface Schedules {
  customerProfile: any;
  personalInformation: any;
  otherInformation: any;
  salary: any;
  houseProperty: any;
  presumptiveBusiness: any;
  presumptiveProfessional: any;
  nonSpecIncome: any;
  specIncome: any;
  natOfBusiness: any;
  balanceSheet: any;
  landAndBuildingCG: any;
  listedEquityCG: any;
  unlistedEquityCG: any;
  bondsDebentCG: any;
  zeroCouponBondsCG: any;
  anyOtherAssetsCG: any;
  otherIncomes: any;
  exemptIncomes: any;
  scheduleAL: any;
  cflDetails: any;
  deductions: any;
  deduction80G: any;
  deduction80D: any;
  tdsOnSalary: any;
  tdsOtherThanSalary: any;
  tdsOtherThanSalaryPanBased: any;
  tcsDetails: any;
  advSelfAssessmentTax: any;
  declaration: any;
}

export interface itrValidationErrorCode {
  E1: 'ITR Type Error';
}
