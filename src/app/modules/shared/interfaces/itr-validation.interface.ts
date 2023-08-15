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
  E2: {
    code: 'E2',
    message: 'Date of birth is not present',
    relatedSchedule: 'other',
  },
  E3: {
    code: 'E3',
    message: 'Gender is not present',
    relatedSchedule: 'other',
  },

  E4: {
    code: 'E4',
    message: 'Father name is not present',
    relatedSchedule: 'other',
  },

  E5: {
    code: 'E5',
    message: 'PAN number is not present',
    relatedSchedule: 'other',
  },
  E6: {
    code: 'E6',
    message: 'Mobile number of the user is not present',
    relatedSchedule: 'other',
  },
  E7: {
    code: 'E7',
    message: 'Email address of the user is not present',
    relatedSchedule: 'other',
  },
  E8: {
    code: 'E8',
    message: 'Atleast last name is required to file ITR',
    relatedSchedule: 'other',
  },
  E9: {
    code: 'E9',
    message: 'Employer category of the user is not present',
    relatedSchedule: 'other',
  },
  E10: {
    code: 'E10',
    message: 'Pincode is missing from the address provided',
    relatedSchedule: 'other',
  },
  E11: {
    code: 'E11',
    message: 'Country is missing from the address provided',
    relatedSchedule: 'other',
  },
  E12: {
    code: 'E12',
    message: 'State is missing from the address provided',
    relatedSchedule: 'other',
  },
  E13: {
    code: 'E13',
    message: 'City is missing from the address provided',
    relatedSchedule: 'other',
  },
  E14: {
    code: 'E14',
    message: 'Atlease one bank detail is required to file ITR',
    relatedSchedule: 'other',
  },
  E15: {
    code: 'E15',
    message: 'Atleast one bank account has to be nominated for refund',
    relatedSchedule: 'other',
  },
  E16: {
    code: 'E16',
    message: 'employer details are missing',
    relatedSchedule: 'other',
  },
  E17: {
    code: 'E17',
    message: 'house property address details are missing',
    relatedSchedule: 'other',
  },
  E18: {
    code: 'E18',
    message: 'co-owner details are missing',
    relatedSchedule: 'other',
  },
  E19: {
    code: 'E19',
    message: 'tenant details are missing',
    relatedSchedule: 'other',
  },
  E20: {
    code: 'E20',
    message: 'gross rent required if LOP or DLOP',
    relatedSchedule: 'other',
  },
  E21: {
    code: 'E21',
    message: 'missing nonSpec income details',
    relatedSchedule: 'other',
  },
  E22: {
    code: 'E22',
    message: 'missing spec income details',
    relatedSchedule: 'other',
  },
  E23: {
    code: 'E23',
    message: 'missing nature of business',
    relatedSchedule: 'other',
  },
  E24: {
    code: 'E24',
    message: 'incorrect nature of business details',
    relatedSchedule: 'other',
  },
  E25: {
    code: 'E25',
    message: 'dividend income cannot be negative',
    relatedSchedule: 'other',
  },
  E26: {
    code: 'E26',
    message: 'other income cannot be negative',
    relatedSchedule: 'other',
  },
  E27: {
    code: 'E27',
    message: 'exempt income is more than 5000, incorrect ITR type',
    relatedSchedule: 'other',
  },
  E28: {
    code: 'E28',
    message: 'incorrect tax paid salary details',
    relatedSchedule: 'other',
  },
  E29: {
    code: 'E29',
    message: 'incorrect tax paid other than salary details',
    relatedSchedule: 'other',
  },
  E30: {
    code: 'E30',
    message: 'incorrect tax paid other than salary pan based details',
    relatedSchedule: 'other',
  },
  E31: {
    code: 'E31',
    message: 'incorrect tcs details',
    relatedSchedule: 'other',
  },
  E32: {
    code: 'E32',
    message: 'incorrect advance or SAT details',
    relatedSchedule: 'other',
  },
  E33: {
    code: 'E33',
    message: 'Bank account number or bank name is missing',
    relatedSchedule: 'other',
  },
};
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

  getErrorSchedule(errorCode: string) {
    return ErrorMsgsSchedule[errorCode];
  }
}
