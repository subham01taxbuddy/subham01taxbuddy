export interface ItrValidation {
  errorCode: keyof itrValidationErrorCode;
  message: itrValidationErrorCode[ItrValidation['errorCode']];
  errorMsgToBeDisplayed: String;
  relatedSchedule: keyof Schedules;
  itrType: any;
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
  other: any;
}

export interface itrValidationErrorCode {
  E1: 'itr type error';
  E2: 'missing date of Birth';
  E3: 'missing gender';
  E4: 'missing father name';
  E5: 'missing pan number';
  E6: 'missing contact number';
  E7: 'missing email address';
  E8: 'missing last name';
  E9: 'missing employer category';
  E10: 'missing pincode';
  E11: 'missing country';
  E12: 'missing state';
  E13: 'missing city';
  E14: 'missing bank details';
  E15: 'not nominated for refund';
  E16: 'Employer details are missing';
}
