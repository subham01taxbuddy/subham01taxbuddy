import { Injectable } from '@angular/core';

export interface ItrValidationObject {
  errorCode: string;
  message?: string;
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
  E36: {
    code: 'E36',
    message:
      'There is some issue with the cost of improvement details under capital gain schedule',
    relatedSchedule: 'capitalGain',
  },
  E37: {
    code: 'E37',
    message:
      'There is some issue with the buyer details under capital gain schedule',
    relatedSchedule: 'capitalGain',
  },
  E38: {
    code: 'E38',
    message:
      'There is some issue with the land and building asset details under capital gain schedule',
    relatedSchedule: 'capitalGain',
  },
  E39: {
    code: 'E39',
    message:
      'There is some issue with the Equity listed asset details under capital gain schedule',
    relatedSchedule: 'capitalGain',
  },
  E40: {
    code: 'E40',
    message:
      'There is some issue with the Equity unlisted asset details under capital gain schedule',
    relatedSchedule: 'capitalGain',
  },
  E41: {
    code: 'E41',
    message:
      'There is some issue with the Bonds details under capital gain schedule',
    relatedSchedule: 'capitalGain',
  },
  E42: {
    code: 'E42',
    message:
      'There is some issue with the Zero Coupon Bonds details under capital gain schedule',
    relatedSchedule: 'capitalGain',
  },
  E43: {
    code: 'E43',
    message:
      'There is some issue with the Gold details under capital gain schedule',
    relatedSchedule: 'capitalGain',
  },
  E44: {
    code: 'E44',
    message: 'Leave Encashment earned on retirement cannot be claimed for more than one employer.',
    relatedSchedule: 'salary',
  },
  E45: {
    code: 'E45',
    message: 'Leave Encashment earned on retirement has a maximum limit of 3,00,000 RS for deduction.',
    relatedSchedule: 'salary',
  },
  E46: {
    code: 'E46',
    message: 'Gratuity exemption cannot be claimed for more than one employer.',
    relatedSchedule: 'salary',
  },
  E47: {
    code: 'E47',
    message: 'The maximum limit for Gratuity exemption for other than central/ state govt employees is 20 lakh',
    relatedSchedule: 'salary',
  },
  TDS_ON_SALARY_NOT_ALLOWED: {
    code: 'TDS_ON_SALARY_NOT_ALLOWED',
    message: 'In Schedule TDS from salary, “Total tax deducted" cannot be more than "Income chargeable under the head Salary',
    relatedSchedule: 'salary',
  },
  TDS_ON_HP_NOT_ALLOWED: {
    code: 'TDS_ON_HP_NOT_ALLOWED',
    message: 'In Schedule TDS from salary, “Total tax deducted" cannot be more than "Income chargeable under the head House property',
    relatedSchedule: 'houseProperty',
  },
  TDS_ON_BP_NOT_ALLOWED: {
    code: 'TDS_ON_BP_NOT_ALLOWED',
    message: 'In Schedule TDS on income other than salary, “Total tax deducted" cannot be more than "Income chargeable under the head Business',
    relatedSchedule: 'businessIncome',
  },
  TDS_ON_CG_NOT_ALLOWED: {
    code: 'TDS_ON_CG_NOT_ALLOWED',
    message: 'In Schedule TDS on income other than salary, “Total tax deducted" cannot be more than "Income chargeable under the head Capital Gain',
    relatedSchedule: 'capitalGain',
  },
  TDS_ON_OS_NOT_ALLOWED: {
    code: 'TDS_ON_OS_NOT_ALLOWED',
    message: 'In Schedule TDS on income other than salary, “Total tax deducted" cannot be more than "Income chargeable under the head Other Source',
    relatedSchedule: 'otherSources',
  },
  TDS_ON_EI_NOT_ALLOWED: {
    code: 'TDS_ON_EI_NOT_ALLOWED',
    message: 'In Schedule TDS on income other than salary, “Total tax deducted" cannot be more than "Income chargeable under the head Exempt Income',
    relatedSchedule: 'exemptIncome',
  },
  EI_SEC_10_26AAA_NOT_AVAILABLE: {
    code: 'EI_SEC_10_26AAA_NOT_AVAILABLE',
    message: 'The taxpayers while preparing the return that this deduction is available only for certain Sikkimese assessees',
    relatedSchedule: 'exemptIncome',
  },
  EI_SEC_10_26_NOT_AVAILABLE: {
    code: 'EI_SEC_10_26_NOT_AVAILABLE',
    message: 'The taxpayers while preparing the return that this deduction is available only for certain category of assesses of NE Region and Ladakh)(If you are a member of a Scheduled Tribe in Tripura, Nagaland, Mizoram, Manipur, and Arunachal Pradesh, you are eligible for tax exemptions under Section 10 (26) Of the Income Tax Act)',
    relatedSchedule: 'exemptIncome',
  },
  BUSINESS_INCOME_CLAIM_NRI: {
    code: 'BUSINESS_INCOME_CLAIM_NRI',
    message: 'NRI CAN NOT DECLARE BUSINESS INCOME UNDER PRESEMTIVE TAXATION',
    relatedSchedule: 'businessIncome',
  },
  FAMILY_PENSION_CLAIM_INCORRECT: {
    code: 'FAMILY_PENSION_CLAIM_INCORRECT',
    message: 'FAMILY PENSION CLAIM INCORRECT',
    relatedSchedule: 'otherSources',
  },
  RETURN_INTEREST_CLAIM_INCORRECT: {
    code: 'RETURN_INTEREST_CLAIM_INCORRECT',
    message: 'INTEREST FROM INCOME TAX REFUND CLAIM INCORRECT',
    relatedSchedule: 'otherSources',
  },
  FD_RD_INTEREST_CLAIM_INCORRECT: {
    code: 'FD_RD_INTEREST_CLAIM_INCORRECT',
    message: 'FD RD INTEREST CLAIM INCORRECT',
    relatedSchedule: 'otherSources',
  },
  SAVING_INTEREST_CLAIM_INCORRECT: {
    code: 'SAVING_INTEREST_CLAIM_INCORRECT',
    message: 'SAVING INTEREST CLAIM INCORRECT',
    relatedSchedule: 'otherSources',
  },
  PF_INTEREST_CLAIM_INCORRECT: {
    code: 'PF_INTEREST_CLAIM_INCORRECT',
    message: 'PF INTEREST CLAIM INCORRECT',
    relatedSchedule: 'otherSources',
  },
  MAX_44AD_RECIEPT_LIMIT_EXCEED: {
    code: 'MAX_44AD_RECIEPT_LIMIT_EXCEED',
    message: 'if the taxpayer has filed ITR-4 then the gross receipt/income U/S 44AD cannot be more than Rs. 2 crores',
    relatedSchedule: 'businessIncome',
  },
  CG_GOLD_EXPENSE_CLAIM_INCORRECT: {
    code: 'CG_GOLD_EXPENSE_CLAIM_INCORRECT',
    message: 'CG GOLD EXPENSE CLAIM INCORRECT',
    relatedSchedule: 'capitalGain',
  },
  CG_ZCB_EXPENSE_CLAIM_INCORRECT: {
    code: 'CG_ZCB_EXPENSE_CLAIM_INCORRECT',
    message: 'CG ZCB EXPENSE CLAIM INCORRECT',
    relatedSchedule: 'capitalGain',
  },
  CG_BONDS_EXPENSE_CLAIM_INCORRECT: {
    code: 'CG_BONDS_EXPENSE_CLAIM_INCORRECT',
    message: 'CG BONDS EXPENSE CLAIM INCORRECT',
    relatedSchedule: 'capitalGain',
  },
  CG_EQ_LISTED_2018_PURCHASE_COST_INCORRECT: {
    code: 'CG_EQ_LISTED_2018_PURCHASE_COST_INCORRECT',
    message: 'CG EQ LISTED 2018 PURCHASE COST INCORRECT',
    relatedSchedule: 'capitalGain',
  },
  CG_EQ_LISTED_QTY_RATE_INCORRECT: {
    code: 'CG_EQ_LISTED_QTY_RATE_INCORRECT',
    message: 'CG EQ LISTED QTY RATE INCORRECT',
    relatedSchedule: 'capitalGain',
  },
  CG_EQ_LISTED_2018_QTY_RATE_INCORRECT: {
    code: 'CG_EQ_LISTED_2018_QTY_RATE_INCORRECT',
    message: 'CG EQ LISTED 2018 QTY RATE INCORRECT',
    relatedSchedule: 'capitalGain',
  },
  CG_EQ_LISTED_EXPENSE_CLAIM_INCORRECT: {
    code: 'CG_EQ_LISTED_EXPENSE_CLAIM_INCORRECT',
    message: 'CG EQ LISTED EXPENSE CLAIM INCORRECT',
    relatedSchedule: 'capitalGain',
  },
  CG_LAB_EXPENSE_CLAIM_INCORRECT: {
    code: 'CG_LAB_EXPENSE_CLAIM_INCORRECT',
    message: 'CG LAND AND BUILDING EXPENSE CLAIM INCORRECT',
    relatedSchedule: 'capitalGain',
  },
  PURCHASE_VALUE_NOT_FOUND: {
    code: 'PURCHASE_VALUE_NOT_FOUND',
    message: 'PURCHASE VALUE NOT FOUND',
    relatedSchedule: 'capitalGain',
  },
  SALE_VALUE_NOT_FOUND: {
    code: 'SALE_VALUE_NOT_FOUND',
    message: 'SALE VALUE NOT FOUND',
    relatedSchedule: 'capitalGain',
  },
  SALE_DATE_NOT_FOUND: {
    code: 'SALE_DATE_NOT_FOUND',
    message: 'SALE DATE NOT FOUND',
    relatedSchedule: 'capitalGain',
  },
  PURCHASE_DATE_NOT_FOUND: {
    code: 'PURCHASE_DATE_NOT_FOUND',
    message: 'PURCHASE DATE NOT FOUND',
    relatedSchedule: 'capitalGain',
  },
  GAIN_TYPE_NOT_FOUND: {
    code: 'GAIN_TYPE_NOT_FOUND',
    message: 'GAIN TYPE NOT FOUND',
    relatedSchedule: 'capitalGain',
  },
  BUSINESS_NATURE_NOT_FOUND: {
    code: 'BUSINESS_NATURE_NOT_FOUND',
    message: 'BUSINESS NATURE NOT FOUND',
    relatedSchedule: 'businessIncome',
  },
  TENANT_NAME_NOT_FOUND: {
    code: 'TENANT_NAME_NOT_FOUND',
    message: 'TENANT NAME NOT FOUND',
    relatedSchedule: 'houseProperty',
  },
  RENT_AMT_INCORRECT: {
    code: 'RENT_AMT_INCORRECT',
    message: 'LET OUT SELECTED THEN RENT AMOUNT SHOULD NOT BE ZERO',
    relatedSchedule: 'houseProperty',
  },
  HP_TAX_CLAIM_INCORRECT: {
    code: 'HP_TAX_CLAIM_INCORRECT',
    message: 'RENT AMOUNT IS NOT THERE THEN HP TAX IS NOT ALLOWED TO CLAIM',
    relatedSchedule: 'houseProperty',
  },
  CO_OWNER_SHARE_INCORRECT: {
    code: 'CO_OWNER_SHARE_INCORRECT',
    message: 'CO OWNER SHARE INCORRECT',
    relatedSchedule: 'houseProperty',
  },
  CO_OWNER_DUPLICATE_PAN: {
    code: 'CO_OWNER_DUPLICATE_PAN',
    message: 'CO OWNER DUPLICATE PAN',
    relatedSchedule: 'houseProperty',
  },
  SOP_INTEREST_EXCEED_MAX_LIMIT: {
    code: 'SOP_INTEREST_EXCEED_MAX_LIMIT',
    message: 'SOP INTEREST EXCEED MAX LIMIT',
    relatedSchedule: 'houseProperty',
  },
  SOP_EXCEED_MAX_LIMIT: {
    code: 'SOP_EXCEED_MAX_LIMIT',
    message: 'SOP EXCEED MAX LIMIT',
    relatedSchedule: 'houseProperty',
  },
  PT_EXCEED_MAX_LIMIT: {
    code: 'PT_EXCEED_MAX_LIMIT',
    message: 'Professional tax u/s 16(iii) will be allowed only to the extent of Rs.5000/-',
    relatedSchedule: 'salary',
  },
  ENTERTAINMENT_EXCEED_MAX_LIMIT: {
    code: 'ENTERTAINMENT_EXCEED_MAX_LIMIT',
    message: 'Entertainment allowance u/s 16(ii) will be allowed only to Central Govt, State Govt, PSU employees and will be allowed to the extent of Rs 5000 or 1/5th of Salary whichever is lower.',
    relatedSchedule: 'salary',
  },
  ENTERTAINMENT_CLAIM_INCORRECT: {
    code: 'ENTERTAINMENT_CLAIM_INCORRECT',
    message: 'Entertainment allowance u/s 16(ii) will be allowed to employees of only Central Government, State Government and PSU.',
    relatedSchedule: 'salary',
  },
  ALLOWANCE_EXCEED_GROSS_SALARY: {
    code: 'ALLOWANCE_EXCEED_GROSS_SALARY',
    message: 'Total of all allowances to the extent exempt u/s 10 cannot be more than Gross Salary',
    relatedSchedule: 'salary',
  },
  ALLOWANCE_EXCEED_MAX_LIMIT: {
    code: 'ALLOWANCE_EXCEED_MAX_LIMIT',
    message: 'Total of exempt allowances excluding HRA shall not exceed total of (1a+1b+1c) as reduced by HRA',
    relatedSchedule: 'salary',
  },
  ALLOWANCE_EXCEED_OTHER: {
    code: 'ALLOWANCE_EXCEED_OTHER',
    message: 'ALLOWANCE EXCEED OTHER',
    relatedSchedule: 'salary',
  },
  PROVISO_CLAIM_INCORRECT: {
    code: 'PROVISO_CLAIM_INCORRECT',
    message: 'First proviso, 10(10B)-Second Proviso and 10(10C) 1(52) In exempt allowances only Sec 10(10B) (i) OR Sec 10(10B) (ii) OR Sec 10(10C) can be selected.',
    relatedSchedule: 'salary',
  },
  VRS_MAX_LIMIT_EXCEED: {
    code: 'VRS_MAX_LIMIT_EXCEED',
    message: 'Amount received/receivable on voluntary retirement or termination of service cannot exceed Rs. 5,00,000',
    relatedSchedule: 'salary',
  },
  RETIREMENT_CLAIM_DUPLICATE: {
    code: 'RETIREMENT_CLAIM_DUPLICATE',
    message: 'RETIREMENT CLAIM DUPLICATE',
    relatedSchedule: 'salary',
  },
  LEAVES_ENCASH_DUPLICATE: {
    code: 'LEAVES_ENCASH_DUPLICATE',
    message: 'LEAVES ENCASH DUPLICATE',
    relatedSchedule: 'salary',
  },
  PENSION_DUPLICATE: {
    code: 'PENSION_DUPLICATE',
    message: 'Commuted pension shall not be allowed against more than one Employer.',
    relatedSchedule: 'salary',
  },
  GRATUITY_DUPLICATE: {
    code: 'GRATUITY_DUPLICATE',
    message: 'Gratuity shall not be allowed against more than one Employer.',
    relatedSchedule: 'salary',
  },
  LEAVES_ENCASH_MAX_LIMIT_EXCEED: {
    code: 'LEAVES_ENCASH_MAX_LIMIT_EXCEED',
    message: 'Earned leave encashment cannot be more than Salary as per section 17(1)',
    relatedSchedule: 'salary',
  },
  GRATUITY_MAX_LIMIT_EXCEED: {
    code: 'GRATUITY_MAX_LIMIT_EXCEED',
    message: 'Death-cum-retirement gratuity received cannot be more than Rs. 20,00,000',
    relatedSchedule: 'salary',
  },
  TOTAL_ALLOWANCE_EXCEED_SALARY: {
    code: 'TOTAL_ALLOWANCE_EXCEED_SALARY',
    message: 'TOTAL ALLOWANCE EXCEED SALARY',
    relatedSchedule: 'salary',
  },
  ALLOWANCE_EXCEED_SALARY: {
    code: 'ALLOWANCE_EXCEED_SALARY',
    message: 'ALLOWANCE EXCEED SALARY',
    relatedSchedule: 'salary',
  },
  SALARY_ALLOWANCE_REPEAT: {
    code: 'SALARY_ALLOWANCE_REPEAT',
    message: 'SALARY ALLOWANCE REPEAT',
    relatedSchedule: 'salary',
  },
  SALARY_PROFITS_IN_LIEU_REPEAT: {
    code: 'SALARY_PROFITS_IN_LIEU_REPEAT',
    message: 'SALARY PROFITS IN LIEU REPEAT',
    relatedSchedule: 'salary',
  },
  SALARY_PERQUISITES_REPEAT: {
    code: 'SALARY_PERQUISITES_REPEAT',
    message: 'SALARY PERQUISITES REPEAT',
    relatedSchedule: 'salary',
  },
  SPEC_INCOME_TURNOVER_INCORRECT: {
    code: 'SPEC_INCOME_TURNOVER_INCORRECT',
    message: 'SPEC INCOME TURNOVER INCORRECT',
    relatedSchedule: 'businessIncome',
  },
  BUSINESS_INCOME_CLAIM_HUF: {
    code: 'BUSINESS_INCOME_CLAIM_HUF',
    message: 'BUSINESS INCOME CLAIM HUF',
    relatedSchedule: 'businessIncome',
  },
  BUSINESS_INCOME_MIN_INCORRECT: {
    code: 'BUSINESS_INCOME_MIN_INCORRECT',
    message: 'BUSINESS INCOME MIN INCORRECT',
    relatedSchedule: 'businessIncome',
  },
  BUSINESS_INCOME_TURNOVER_INCORRECT: {
    code: 'BUSINESS_INCOME_TURNOVER_INCORRECT',
    message: 'BUSINESS INCOME TURNOVER INCORRECT',
    relatedSchedule: 'businessIncome',
  },
  BUSINESS_INCOME_NOT_FOUND: {
    code: 'BUSINESS_INCOME_NOT_FOUND',
    message: 'BUSINESS INCOME NOT FOUND',
    relatedSchedule: 'businessIncome',
  },
  BUSINESS_DESC_NOT_FOUND: {
    code: 'BUSINESS_DESC_NOT_FOUND',
    message: 'BUSINESS DESCRIPTION NOT FOUND',
    relatedSchedule: 'businessIncome',
  },
  BALANCE_SHEET_NOT_FOUND: {
    code: 'BALANCE_SHEET_NOT_FOUND',
    message: 'BALANCE SHEET NOT FOUND',
    relatedSchedule: 'balanceSheet',
  },
  PARTNER_FIRM_DTLS_NOT_FOUND: {
    code: 'PARTNER_FIRM_DTLS_NOT_FOUND',
    message: 'PARTNER FIRM DTLS NOT FOUND',
    relatedSchedule: 'personalInfo',
  },
  UNLISTED_SHARE_DTLS_NOT_FOUND: {
    code: 'UNLISTED_SHARE_DTLS_NOT_FOUND',
    message: '"Whether you have held unlisted equity shares at any time during the previous year?" is selected as Yes, then the details should be filled.',
    relatedSchedule: 'personalInfo',
  },
  DIRECTOR_DTLS_NOT_FOUND: {
    code: 'DIRECTOR_DTLS_NOT_FOUND',
    message: '"Whether you were Director in a company at any time during the previous year?" is selected as Yes then the respective details should be filled',
    relatedSchedule: 'personalInfo',
  },
  SCH_5A_DTLS_NO_FLAG_FOUND: {
    code: 'SCH_5A_DTLS_NO_FLAG_FOUND',
    message: 'SCH 5A DTLS NO FLAG FOUND BUT DATA IS THERE',
    relatedSchedule: 'personalInfo',
  },
  SCH_5A_SPOUSE_PAN_NOT_FOUND: {
    code: 'SCH_5A_SPOUSE_PAN_NOT_FOUND',
    message: 'The assessee is governed by Portuguese Code, then "PAN of Spouse" should be provided',
    relatedSchedule: 'personalInfo',
  },
  SEVEN_PROVISO_TRAVEL_NOT_FOUND: {
    code: 'SEVEN_PROVISO_TRAVEL_NOT_FOUND',
    message: 'Are you filing return of income under the Seventh proviso to Section 139(1) is selected as Yes then the respective details should be filled',
    relatedSchedule: 'personalInfo',
  },
  SEVEN_PROVISO_DEPOSIT_NOT_FOUND: {
    code: 'SEVEN_PROVISO_DEPOSIT_NOT_FOUND',
    message: 'Are you filing return of income under the Seventh proviso to Section 139(1) is selected as Yes then the respective details should be filled',
    relatedSchedule: 'personalInfo',
  },
  SEVEN_PROVISO_ELE_NOT_FOUND: {
    code: 'SEVEN_PROVISO_ELE_NOT_FOUND',
    message: 'SEVENTH PROVISO ELE NOT FOUND',
    relatedSchedule: 'personalInfo',
  },
  FORM_10IE_NOT_FOUND: {
    code: 'FORM_10IE_NOT_FOUND',
    message: 'FORM 10IE DETAILS NOT FOUND',
    relatedSchedule: 'otherSources',
  },
  RES_STATUS_NOT_FOUND: {
    code: 'RES_STATUS_NOT_FOUND',
    message: 'RESIDENTIAL STATUS NOT FOUND',
    relatedSchedule: 'personalInfo',
  },
  NEW_REGIME_AFTER_DUE_DATE: {
    code: 'NEW_REGIME_AFTER_DUE_DATE',
    message: 'NEW REGIME AFTER DUE DATE',
    relatedSchedule: 'otherSources',
  },
  RETURN_TYPE_NOT_FOUND: {
    code: 'RETURN_TYPE_NOT_FOUND',
    message: 'RETURN TYPE NOT FOUND',
    relatedSchedule: 'personalInfo',
  },
  BANK_NOT_FOUND: {
    code: 'BANK_NOT_FOUND',
    message: 'BANK DETAILS NOT FOUND',
    relatedSchedule: 'personalInfo',
  },
  EMPLOYER_CAT_NOT_FOUND: {
    code: 'EMPLOYER_CAT_NOT_FOUND',
    message: 'EMPLOYER CATEGORY NOT FOUND',
    relatedSchedule: 'personalInfo',
  },
  EMAIL_NOT_FOUND: {
    code: 'EMAIL_NOT_FOUND',
    message: 'EMAIL NOT FOUND',
    relatedSchedule: 'personalInfo',
  },
  CONTACT_NO_NOT_FOUND: {
    code: 'CONTACT_NO_NOT_FOUND',
    message: 'Assessee should enter valid Mobile Number',
    relatedSchedule: 'personalInfo',
  },
  ADDRESS_NOT_FOUND: {
    code: 'ADDRESS_NOT_FOUND',
    message: 'ADDRESS NOT FOUND',
    relatedSchedule: 'personalInfo',
  },
  DOB_NOT_FOUND: {
    code: 'DOB_NOT_FOUND',
    message: 'DOB NOT FOUND',
    relatedSchedule: 'personalInfo',
  },
  LAST_NAME_NOT_FOUND: {
    code: 'LAST_NAME_NOT_FOUND',
    message: 'LAST NAME NOT FOUND',
    relatedSchedule: 'personalInfo',
  },
  AADHAR_NOT_FOUND: {
    code: 'AADHAR_NOT_FOUND',
    message: 'AADHAR NOT FOUND',
    relatedSchedule: 'personalInfo',
  },
  PAN_NOT_FOUND: {
    code: 'PAN_NOT_FOUND',
    message: 'PAN NOT FOUND',
    relatedSchedule: 'personalInfo',
  },
  BS_DIFF_NEEDS_ZERO_OR_MAKE_44AA_FLAG_NO: {
    code: 'BS_DIFF_NEEDS_ZERO_OR_MAKE_44AA_FLAG_NO',
    message: 'You are not required to maintain BOA, so either choose 44AA as No or else Fill the B/S and difference should be 0',
    relatedSchedule: 'balanceSheet',
  },
  NON_SPECULATIVE_INCOME_BS_DIFF_NEEDS_ZERO_AND_MAKE_44AA_FLAG_YES: {
    code: 'NON_SPECULATIVE_INCOME_BS_DIFF_NEEDS_ZERO_AND_MAKE_44AA_FLAG_YES',
    message: 'In case of Non Speculative Income balance sheet difference needs to be zero and select BOA as "Yes"',
    relatedSchedule: 'balanceSheet',
  },
  NON_SPECULATIVE_INCOME_BS_DIFF_NEEDS_ZERO: {
    code: 'NON_SPECULATIVE_INCOME_BS_DIFF_NEEDS_ZERO',
    message: 'In case of Non Speculative Income balance sheet difference needs to be zero',
    relatedSchedule: 'balanceSheet',
  },
  NON_SPECULATIVE_INCOME_NEEDS_MAKE_44AA_FLAG_YES: {
    code: 'NON_SPECULATIVE_INCOME_NEEDS_MAKE_44AA_FLAG_YES',
    message: 'In case of Non Speculative Income select BOA as "Yes"',
    relatedSchedule: 'personalInfo',
  },
  NON_SPECULATIVE_INCOME_NEEDS_MAKE_44AA_FLAG_NO: {
    code: 'NON_SPECULATIVE_INCOME_NEEDS_MAKE_44AA_FLAG_No',
    message: 'There is no non-speculative income, so choose "NO" for BOA under section 44AA.',
    relatedSchedule: 'personalInfo',
  },
  NON_SPECULATIVE_INCOME_NEEDS_BALANCE_SHEET: {
    code: 'NON_SPECULATIVE_INCOME_NEEDS_BALANCE_SHEET',
    message: 'In case of Non Speculative Income, please fill balance sheet',
    relatedSchedule: 'balanceSheet',
  },
  IMMOVABLE_PROPERTY_INCOMPLETE: {
    code: 'IMMOVABLE_PROPERTY_INCOMPLETE',
    message: 'Please fill all immovable asset details in schedule AL',
    relatedSchedule: 'moreInformation',
  },
  FOREIGN_INCOME_TR_SECTION_NOT_FOUND: {
    code: 'FOREIGN_INCOME_TR_SECTION_NOT_FOUND',
    message: 'To claim tax relief against foreign income, please select tax relief section in schedule TR',
    relatedSchedule: 'foreignIncome',
  },
  TDS_INCOME_HEAD_MISSING: {
    code: 'TDS_INCOME_HEAD_MISSING',
    message: 'Source of income head is missing in TDS entry, please update in schedule Taxes Paid',
    relatedSchedule: 'taxesPaid',
  },
  NPS_EMPLOYEE_CONTRI_MORE_THAN_SALARY: {
    code: 'NPS_EMPLOYEE_CONTRI_MORE_THAN_SALARY',
    message: '80CCD1 investment declared exceeds the allowed value',
    relatedSchedule: 'investmentsDeductions',
  },
  NPS_EMPLOYER_CONTRI_INCORRECT: {
    code: 'NPS_EMPLOYER_CONTRI_INCORRECT',
    message: '80CCD2 investment is not allowed for pensioners',
    relatedSchedule: 'investmentsDeductions',
  },
  NPS_EMPLOYER_CONTRI_MORE_THAN_SALARY: {
    code: 'NPS_EMPLOYER_CONTRI_MORE_THAN_SALARY',
    message: '80CCD2 investment declared exceeds the allowed value',
    relatedSchedule: 'investmentsDeductions',
  },
  TDS_SALARY_MORE_THAN_AMT: {
    code: 'TDS_SALARY_MORE_THAN_AMT',
    message: 'TDS on salary is more than the amount credited',
    relatedSchedule: 'taxesPaid',
  },
  TDS_16A_MORE_THAN_AMT: {
    code: 'TDS_16A_MORE_THAN_AMT',
    message: 'TDS other than salary is more than the amount credited',
    relatedSchedule: 'taxesPaid',
  },
  TDS_26QB_MORE_THAN_AMT: {
    code: 'TDS_26QB_MORE_THAN_AMT',
    message: 'TDS on sale/rent of property is more than the amount credited',
    relatedSchedule: 'taxesPaid',
  },
  TCS_MORE_THAN_AMT: {
    code: 'TCS_MORE_THAN_AMT',
    message: 'TCS collected is more than the amount credited',
    relatedSchedule: 'taxesPaid',
  }
};
export interface Schedules {
  personalInfo: string;
  otherSources: string;
  investmentsDeductions: string;
  taxesPaid: string;
  declaration: string;
  salary: string;
  houseProperty: string;
  businessIncome: string;
  capitalGain: string;
  speculativeIncome: string;
  foreignIncome: string;
  moreInformation: string;

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

  getErrorSchedule(errorCode: string) {
    return ErrorMsgsSchedule[errorCode];
  }

  getMessage(errorCode: string) {
    return ErrorMsgsSchedule[errorCode].message;
  }
}
