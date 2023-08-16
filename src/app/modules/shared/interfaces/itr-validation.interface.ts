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
    relatedSchedule: 'personalInfo',
  },
  E2: {
    code: 'E2',
    message: 'Date of birth is not present',
    relatedSchedule: 'personalInfo',
  },
  E3: {
    code: 'E3',
    message: 'Gender is not present',
    relatedSchedule: 'personalInfo',
  },

  E4: {
    code: 'E4',
    message: 'Father name is not present',
    relatedSchedule: 'personalInfo',
  },

  E5: {
    code: 'E5',
    message: 'PAN number is not present',
    relatedSchedule: 'personalInfo',
  },
  E6: {
    code: 'E6',
    message: 'Mobile number of the user is not present',
    relatedSchedule: 'personalInfo',
  },
  E7: {
    code: 'E7',
    message: 'Email address of the user is not present',
    relatedSchedule: 'personalInfo',
  },
  E8: {
    code: 'E8',
    message: 'Atleast last name is required to file ITR',
    relatedSchedule: 'personalInfo',
  },
  E9: {
    code: 'E9',
    message: 'Employer category of the user is not present',
    relatedSchedule: 'personalInfo',
  },
  E10: {
    code: 'E10',
    message: 'Pincode is missing from the address provided',
    relatedSchedule: 'personalInfo',
  },
  E11: {
    code: 'E11',
    message: 'Country is missing from the address provided',
    relatedSchedule: 'personalInfo',
  },
  E12: {
    code: 'E12',
    message: 'State is missing from the address provided',
    relatedSchedule: 'personalInfo',
  },
  E13: {
    code: 'E13',
    message: 'City is missing from the address provided',
    relatedSchedule: 'personalInfo',
  },
  E14: {
    code: 'E14',
    message: 'Atlease one bank detail is required to file ITR',
    relatedSchedule: 'personalInfo',
  },
  E15: {
    code: 'E15',
    message: 'Atleast one bank account has to be nominated for refund',
    relatedSchedule: 'personalInfo',
  },
  E16: {
    code: 'E16',
    message: 'Employer details are missing',
    relatedSchedule: 'salary',
  },
  E17: {
    code: 'E17',
    message: 'House property address details are missing',
    relatedSchedule: 'houseProperty',
  },
  E18: {
    code: 'E18',
    message: 'Co-owner details are missing',
    relatedSchedule: 'houseProperty',
  },
  E19: {
    code: 'E19',
    message: 'Tenant details are missing',
    relatedSchedule: 'houseProperty',
  },
  E20: {
    code: 'E20',
    message: 'Gross rent is required if property type is LOP or DLOP',
    relatedSchedule: 'houseProperty',
  },
  E21: {
    code: 'E21',
    message: 'Missing nonSpec income details',
    relatedSchedule: 'businessIncome',
  },
  E22: {
    code: 'E22',
    message: 'Missing spec income details',
    relatedSchedule: 'businessIncome',
  },
  E23: {
    code: 'E23',
    message: 'Missing nature of business',
    relatedSchedule: 'businessIncome',
  },
  E24: {
    code: 'E24',
    message: 'Incorrect nature of business details',
    relatedSchedule: 'businessIncome',
  },
  E25: {
    code: 'E25',
    message: 'Dividend income cannot be negative',
    relatedSchedule: 'otherSources',
  },
  E26: {
    code: 'E26',
    message: 'Other income cannot be negative',
    relatedSchedule: 'otherSources',
  },
  E27: {
    code: 'E27',
    message: 'Exempt income is more than 5000, incorrect ITR type',
    relatedSchedule: 'otherSources',
  },
  E28: {
    code: 'E28',
    message: 'Incorrect tax paid salary details',
    relatedSchedule: 'taxesPaid',
  },
  E29: {
    code: 'E29',
    message: 'Incorrect tax paid other than salary details',
    relatedSchedule: 'taxesPaid',
  },
  E30: {
    code: 'E30',
    message: 'Incorrect tax paid other than salary pan based details',
    relatedSchedule: 'taxesPaid',
  },
  E31: {
    code: 'E31',
    message: 'Incorrect TCS details',
    relatedSchedule: 'taxesPaid',
  },
  E32: {
    code: 'E32',
    message: 'Incorrect advance or SAT details',
    relatedSchedule: 'taxesPaid',
  },
  E33: {
    code: 'E33',
    message: 'Bank account number or bank name is missing',
    relatedSchedule: 'personalInfo',
  },

  E34: {
    code: 'E34',
    message: 'Capital gain details are missing. Please contact your developer',
    relatedSchedule: 'capitalGain',
  },

  E35: {
    code: 'E35',
    message:
      'There is some issue with the deduction details under capital gain schedule',
    relatedSchedule: 'capitalGain',
  },
};
export interface Schedules {
  personalInfo: String;
  otherSources: String;
  investmentsDeductions: String;
  taxesPaid: String;
  declaration: String;
  salary: String;
  houseProperty: String;
  businessIncome: String;
  capitalGain: String;
  speculativeIncome: String;
  foreignIncome: String;
  moreInformation: String;

  // customerProfile: any;
  // personalInformation: any;
  // otherInformation: any;
  // salary: any;
  // houseProperty: any;
  // presumptiveBusiness: any;
  // presumptiveProfessional: any;
  // nonSpecIncome: any;
  // specIncome: any;
  // natOfBusiness: any;
  // balanceSheet: any;
  // landAndBuildingCG: any;
  // listedEquityCG: any;
  // unlistedEquityCG: any;
  // bondsDebentCG: any;
  // zeroCouponBondsCG: any;
  // anyOtherAssetsCG: any;
  // otherIncomes: any;
  // exemptIncomes: any;
  // scheduleAL: any;
  // cflDetails: any;
  // deductions: any;
  // deduction80G: any;
  // deduction80D: any;
  // tdsOnSalary: any;
  // tdsOtherThanSalary: any;
  // tdsOtherThanSalaryPanBased: any;
  // tcsDetails: any;
  // advSelfAssessmentTax: any;
  // declaration: any;
  // other: any;
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
