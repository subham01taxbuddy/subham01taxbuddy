import { Injectable } from '@angular/core';

export interface ItrValidationObject {
  errorCode: String;
  message?: String;
  relatedSchedule: keyof Schedules;
}

export const ErrorMsgsSchedule = {
  E1: {
    code: 'E1',
    message: 'ITR type error',
    relatedSchedule: 'other',
  },
  E333: 'itr type error',
  E2: 'Date of birth is not present',
  E3: 'Gender is not present',
  E4: 'Father name is not present',
  E5: 'PAN number is not present',
  E6: 'Mobile number of the user is not present',
  E7: 'Email address of the user is not present',
  E8: 'Atleast last name is required to file ITR',
  E9: 'Employer category of the user is not present',
  E10: 'Pincode is missing from the address provided',
  E11: 'Country is missing from the address provided',
  E12: 'State is missing from the address provided',
  E13: 'City is missing from the address provided',
  E14: 'Atlease one bank detail is required to file ITR',
  E15: 'Atleast one bank account has to be nominated for refund',
  E16: 'employer details are missing',
  E17: 'house property address details are missing',
  E18: 'co-owner details are missing',
  E19: 'tenant details are missing',
  E20: 'gross rent required if LOP or DLOP',
  E21: 'missing nonSpec income details',
  E22: 'missing spec income details',
  E23: 'missing nature of business',
  E24: 'incorrect nature of business details',
  E25: 'dividend income cannot be negative',
  E26: 'other income cannot be negative',
  E27: 'exempt income is more than 5000, incorrect ITR type',
  E28: 'incorrect tax paid salary details',
  E29: 'incorrect tax paid other than salary details',
  E30: 'incorrect tax paid other than salary pan based details',
  E31: 'incorrect tcs details',
  E32: 'incorrect advance or SAT details',
  E33: 'Bank account number or bank name or bank account number is missing',
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

@Injectable({
  providedIn: 'root',
})
export class ItrValidations {
  constructor() {}

  getErrorSchedule(errorCode:string){
    return ErrorMsgsSchedule[errorCode];
  }

}
