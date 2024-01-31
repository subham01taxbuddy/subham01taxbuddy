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
    message: 'In Schedule TDS from salary, “Total tax deducted" cannot be more than "Income chargeable under the head Salary',
    relatedSchedule: 'houseProperty',
  },
  TDS_ON_BP_NOT_ALLOWED: {
    code: 'TDS_ON_BP_NOT_ALLOWED',
    message: 'In Schedule TDS from salary, “Total tax deducted" cannot be more than "Income chargeable under the head Salary',
    relatedSchedule: 'businessIncome',
  },
  TDS_ON_CG_NOT_ALLOWED: {
    code: 'TDS_ON_CG_NOT_ALLOWED',
    message: 'In Schedule TDS from salary, “Total tax deducted" cannot be more than "Income chargeable under the head Salary',
    relatedSchedule: 'capitalGain',
  },
  TDS_ON_OS_NOT_ALLOWED: {
    code: 'TDS_ON_OS_NOT_ALLOWED',
    message: 'In Schedule TDS from salary, “Total tax deducted" cannot be more than "Income chargeable under the head Salary',
    relatedSchedule: 'otherSources',
  },
  TDS_ON_EI_NOT_ALLOWED: {
    code: 'TDS_ON_EI_NOT_ALLOWED',
    message: 'In Schedule TDS from salary, “Total tax deducted" cannot be more than "Income chargeable under the head Salary',
    relatedSchedule: 'otherSources',
  },
  EI_SEC_10_26AAA_NOT_AVAILABLE: {
    code: 'EI_SEC_10_26AAA_NOT_AVAILABLE',
    message: 'Sec 10(26AAA)-Any income as referred to in section 10(26AAA) drop-down cannot be selected more than one time under Exempt Income. (Message to be shown to the taxpayers while preparing the return that this deduction is available only for certain Sikkimese assessees)',
    relatedSchedule: 'otherSources',
  },
  EI_SEC_10_26_NOT_AVAILABLE: {
    code: 'EI_SEC_10_26_NOT_AVAILABLE',
    message: 'Sec 10(26)-Any income as referred to in section 10(26) drop-down cannot be selected more than one time under Exempt Income. (Message to be shown to the taxpayers while preparing the return that this deduction is available only for certain category of assesses of NE Region and Ladakh)(If you are a member of a Scheduled Tribe in Tripura, Nagaland, Mizoram, Manipur, and Arunachal Pradesh, you are eligible for tax exemptions under Section 10 (26) Of the Income Tax Act)',
    relatedSchedule: 'otherSources',
  },
  NRI_CLAIM_BUSINESS_INCORRECT: {
    code: 'NRI_CLAIM_BUSINESS_INCORRECT',
    message: 'Click',
    relatedSchedule: 'otherSources',
  },
  FAMILY_PENSION_CLAIM_INCORRECT: {
    code: 'FAMILY_PENSION_CLAIM_INCORRECT',
    message: '1(41) Family pension drop-down cannot be selected more than one time under Income from other sources.',
    relatedSchedule: 'otherSources',
  },
  RETURN_INTEREST_CLAIM_INCORRECT: {
    code: 'RETURN_INTEREST_CLAIM_INCORRECT',
    message: '1(40) Interest from Income Tax Refund drop-down cannot be selected more than one time under Income from other sources.',
    relatedSchedule: 'otherSources',
  },
  FD_RD_INTEREST_CLAIM_INCORRECT: {
    code: 'FD_RD_INTEREST_CLAIM_INCORRECT',
    message: '1(36) "Interest from Deposits (Bank/Post Office/Cooperative Society)" drop-down cannot be selected more than one time under Income from other sources',
    relatedSchedule: 'otherSources',
  },
  SAVING_INTEREST_CLAIM_INCORRECT: {
    code: 'SAVING_INTEREST_CLAIM_INCORRECT',
    message: '1(35) "Interest from savings bank account" drop-down cannot be selected more than one time under Income from other sources.',
    relatedSchedule: 'otherSources',
  },
  PF_INTEREST_CLAIM_INCORRECT: {
    code: 'PF_INTEREST_CLAIM_INCORRECT',
    message: '3(444) In Schedule OS, Sl. No. 1b should be equal to sum of (bi+bii+biii+biv+bv+bvi+bvii+bviii+bix) 1(82), 3(465), 4(64) In Schedule OS, only one of the Field is selected from the following in Sl. No. 1(b) :  i) Interest accrued on contributions to the provident fund to the extent taxable as per first proviso to section 10(11) ii) Interest accrued on contributions to provident fund to the extent taxable as per second proviso to section 10(11)  iii) Interest accrued on contributions to provident fund to the extent taxable as per first proviso to section 10(12) iv) Interest accrued on contributions to provident fund to the extent taxable as per second proviso to section 10(12)"',
    relatedSchedule: 'otherSources',
  },
  MAX_44AD_RECIEPT_LIMIT_EXCEED: {
    code: 'MAX_44AD_RECIEPT_LIMIT_EXCEED',
    message: '4(79) In the return of income, if the taxpayer has filed ITR-4 then the gross receipt/income U/S 44AD cannot be more than Rs. 2 crores',
    relatedSchedule: 'otherSources',
  },
  CG_GOLD_EXPENSE_CLAIM_INCORRECT: {
    code: 'CG_GOLD_EXPENSE_CLAIM_INCORRECT',
    message: 'Click',
    relatedSchedule: 'capitalGain',
  },
  CG_ZCB_EXPENSE_CLAIM_INCORRECT: {
    code: 'CG_ZCB_EXPENSE_CLAIM_INCORRECT',
    message: 'Click',
    relatedSchedule: 'capitalGain',
  },
  CG_BONDS_EXPENSE_CLAIM_INCORRECT: {
    code: 'CG_BONDS_EXPENSE_CLAIM_INCORRECT',
    message: 'Click',
    relatedSchedule: 'capitalGain',
  },
  CG_EQ_LISTED_2018_PURCHASE_COST_INCORRECT: {
    code: 'CG_EQ_LISTED_2018_PURCHASE_COST_INCORRECT',
    message: 'Click',
    relatedSchedule: 'capitalGain',
  },
  CG_EQ_LISTED_QTY_RATE_INCORRECT: {
    code: 'CG_EQ_LISTED_QTY_RATE_INCORRECT',
    message: 'Click',
    relatedSchedule: 'capitalGain',
  },
  CG_EQ_LISTED_2018_QTY_RATE_INCORRECT: {
    code: 'CG_EQ_LISTED_2018_QTY_RATE_INCORRECT',
    message: 'Click',
    relatedSchedule: 'capitalGain',
  },
  CG_EQ_LISTED_EXPENSE_CLAIM_INCORRECT: {
    code: 'CG_EQ_LISTED_EXPENSE_CLAIM_INCORRECT',
    message: 'Click',
    relatedSchedule: 'capitalGain',
  },
  CG_LAB_EXPENSE_CLAIM_INCORRECT: {
    code: 'CG_LAB_EXPENSE_CLAIM_INCORRECT',
    message: 'Click',
    relatedSchedule: 'capitalGain',
  },
  PURCHASE_VALUE_NOT_FOUND: {
    code: 'PURCHASE_VALUE_NOT_FOUND',
    message: 'Click',
    relatedSchedule: 'capitalGain',
  },
  SALE_VALUE_NOT_FOUND: {
    code: 'SALE_VALUE_NOT_FOUND',
    message: 'Click',
    relatedSchedule: 'capitalGain',
  },
  SALE_DATE_NOT_FOUND: {
    code: 'SALE_DATE_NOT_FOUND',
    message: 'Click',
    relatedSchedule: 'capitalGain',
  },
  PURCHASE_DATE_NOT_FOUND: {
    code: 'PURCHASE_DATE_NOT_FOUND',
    message: 'Click',
    relatedSchedule: 'capitalGain',
  },
  GAIN_TYPE_NOT_FOUND: {
    code: 'GAIN_TYPE_NOT_FOUND',
    message: 'Click',
    relatedSchedule: 'capitalGain',
  },
  BUSINESS_NATURE_NOT_FOUND: {
    code: 'BUSINESS_NATURE_NOT_FOUND',
    message: 'Click',
    relatedSchedule: 'businessIncome',
  },
  TENANT_NAME_NOT_FOUND: {
    code: 'TENANT_NAME_NOT_FOUND',
    message: 'Click',
    relatedSchedule: 'houseProperty',
  },
  RENT_AMT_INCORRECT: {
    code: 'RENT_AMT_INCORRECT',
    message: 'Click',
    relatedSchedule: 'houseProperty',
  },
  HP_TAX_CLAIM_INCORRECT: {
    code: 'HP_TAX_CLAIM_INCORRECT',
    message: 'Click',
    relatedSchedule: 'houseProperty',
  },
  CO_OWNER_SHARE_INCORRECT: {
    code: 'CO_OWNER_SHARE_INCORRECT',
    message: 'Click',
    relatedSchedule: 'houseProperty',
  },
  CO_OWNER_DUPLICATE_PAN: {
    code: 'CO_OWNER_DUPLICATE_PAN',
    message: 'Click',
    relatedSchedule: 'houseProperty',
  },
  SOP_INTEREST_EXCEED_MAX_LIMIT: {
    code: 'SOP_INTEREST_EXCEED_MAX_LIMIT',
    message: 'Click',
    relatedSchedule: 'houseProperty',
  },
  SOP_EXCEED_MAX_LIMIT: {
    code: 'SOP_EXCEED_MAX_LIMIT',
    message: 'Click',
    relatedSchedule: 'houseProperty',
  },
  PT_EXCEED_MAX_LIMIT: {
    code: 'PT_EXCEED_MAX_LIMIT',
    message: ' 2(269) In Schedule Salary, Professional tax u/s 16(iii) will be allowed only to the extent of Rs.5000/-',
    relatedSchedule: 'salary',
  },
  ENTERTAINMENT_EXCEED_MAX_LIMIT: {
    code: 'ENTERTAINMENT_EXCEED_MAX_LIMIT',
    message: '1(42) 4(36), 4(37), 3(143) 1) Entertainment allowance u/s 16(ii) will be allowed only to Central Govt, State Govt, PSU employees and will be allowed to the extent of Rs 5000 or 1/5th of Salary whichever is lower.',
    relatedSchedule: 'salary',
  },
  ENTERTAINMENT_CLAIM_INCORRECT: {
    code: 'ENTERTAINMENT_CLAIM_INCORRECT',
    message: ' 1(43), 2(267), 3(142) Entertainment allowance u/s 16(ii) will be allowed to employees of only Central Government, State Government and PSU.',
    relatedSchedule: 'salary',
  },
  ALLOWANCE_EXCEED_GROSS_SALARY: {
    code: 'ALLOWANCE_EXCEED_GROSS_SALARY',
    message: '1(48), 4(38) “Total of all allowances to the extent exempt u/s 10 cannot be more than Gross Salary',
    relatedSchedule: 'salary',
  },
  ALLOWANCE_EXCEED_MAX_LIMIT: {
    code: 'ALLOWANCE_EXCEED_MAX_LIMIT',
    message: ' 3(138) In Schedule Salary, Total of exempt allowances excluding HRA shall not exceed total of (1a+1b+1c) as reduced by HRA',
    relatedSchedule: 'salary',
  },
  ALLOWANCE_EXCEED_OTHER: {
    code: 'ALLOWANCE_EXCEED_OTHER',
    message: 'Click',
    relatedSchedule: 'salary',
  },
  PROVISO_CLAIM_INCORRECT: {
    code: 'PROVISO_CLAIM_INCORRECT',
    message: ' 1(81), 4(41), 4(62) 2(395), 3(155) Exempt allowance u/s 10(10B)-First proviso, 10(10B)-Second Proviso and 10(10C) 1(52) In exempt allowances only Sec 10(10B) (i) OR Sec 10(10B) (ii) OR Sec 10(10C) can be selected.',
    relatedSchedule: 'salary',
  },
  VRS_MAX_LIMIT_EXCEED: {
    code: 'VRS_MAX_LIMIT_EXCEED',
    message: '1(51)(50), 4(40), 2(394), 3(154) Exempt Allowance u/s 10(10C)-Amount received/receivable on voluntary retirement or termination of service cannot exceed Rs. 5,00,000',
    relatedSchedule: 'salary',
  },
  RETIREMENT_CLAIM_DUPLICATE: {
    code: 'RETIREMENT_CLAIM_DUPLICATE',
    message: 'Click',
    relatedSchedule: 'salary',
  },
  LEAVES_ENCASH_DUPLICATE: {
    code: 'LEAVES_ENCASH_DUPLICATE',
    message: 'Click',
    relatedSchedule: 'salary',
  },
  PENSION_DUPLICATE: {
    code: 'PENSION_DUPLICATE',
    message: '2(271), 3(145) In Schedule Salary, at Sl. No. 1a- Commuted pension shall not be allowed against more than one Employer.',
    relatedSchedule: 'salary',
  },
  GRATUITY_DUPLICATE: {
    code: 'GRATUITY_DUPLICATE',
    message: ' 2(270), 3(145) In Schedule Salary, at Sl. No. 1a- Gratuity shall not be allowed against more than one Employer.',
    relatedSchedule: 'salary',
  },
  LEAVES_ENCASH_MAX_LIMIT_EXCEED: {
    code: 'LEAVES_ENCASH_MAX_LIMIT_EXCEED',
    message: '1(190), 4(216) Exempt allowance u/s. 10(10AA) can be claimed only up to Rs. 3 Lakh for employer category other than "Central Government and State Government, CG- Pensioners, SGPensioner 2(405) Assessee claiming deduction u/s 10(10AA) more than the maximum limit of Rs 300000/- for employer category other than "Central and State Government 2(393), 3(152) Sec 10(10AA)-Earned leave encashment cannot be more than Salary as per section 17(1)',
    relatedSchedule: 'salary',
  },
  GRATUITY_MAX_LIMIT_EXCEED: {
    code: 'GRATUITY_MAX_LIMIT_EXCEED',
    message: '1(49),4(39), 2(260) 3(136), 3(150) Exempt allowance u/s 10(10)-Death-cum-retirement gratuity received cannot be more than Rs. 20,00,000',
    relatedSchedule: 'salary',
  },
  TOTAL_ALLOWANCE_EXCEED_SALARY: {
    code: 'TOTAL_ALLOWANCE_EXCEED_SALARY',
    message: 'Click',
    relatedSchedule: 'salary',
  },
  ALLOWANCE_EXCEED_SALARY: {
    code: 'ALLOWANCE_EXCEED_SALARY',
    message: 'Click',
    relatedSchedule: 'salary',
  },
  SALARY_ALLOWANCE_REPEAT: {
    code: 'SALARY_ALLOWANCE_REPEAT',
    message: 'Click',
    relatedSchedule: 'salary',
  },
  SALARY_PROFITS_IN_LIEU_REPEAT: {
    code: 'SALARY_PROFITS_IN_LIEU_REPEAT',
    message: 'Click',
    relatedSchedule: 'salary',
  },
  SALARY_PERQUISITES_REPEAT: {
    code: 'SALARY_PERQUISITES_REPEAT',
    message: 'Click',
    relatedSchedule: 'salary',
  },
  SPEC_INCOME_TURNOVER_INCORRECT: {
    code: 'SPEC_INCOME_TURNOVER_INCORRECT',
    message: 'Click',
    relatedSchedule: 'businessIncome',
  },
  BUSINESS_INCOME_CLAIM_HUF: {
    code: 'BUSINESS_INCOME_CLAIM_HUF',
    message: 'Click',
    relatedSchedule: 'businessIncome',
  },
  BUSINESS_INCOME_CLAIM_NRI: {
    code: 'BUSINESS_INCOME_CLAIM_NRI',
    message: 'Click',
    relatedSchedule: 'businessIncome',
  },
  BUSINESS_INCOME_MIN_INCORRECT: {
    code: 'BUSINESS_INCOME_MIN_INCORRECT',
    message: 'Click',
    relatedSchedule: 'businessIncome',
  },
  BUSINESS_INCOME_TURNOVER_INCORRECT: {
    code: 'BUSINESS_INCOME_TURNOVER_INCORRECT',
    message: 'Click',
    relatedSchedule: 'businessIncome',
  },
  BUSINESS_INCOME_NOT_FOUND: {
    code: 'BUSINESS_INCOME_NOT_FOUND',
    message: 'Click',
    relatedSchedule: 'businessIncome',
  },
  BUSINESS_DESC_NOT_FOUND: {
    code: 'BUSINESS_DESC_NOT_FOUND',
    message: 'Click',
    relatedSchedule: 'businessIncome',
  },
  BALANCE_SHEET_NOT_FOUND: {
    code: 'BALANCE_SHEET_NOT_FOUND',
    message: 'Click',
    relatedSchedule: 'businessIncome',
  },
  PARTNER_FIRM_DTLS_NOT_FOUND: {
    code: 'PARTNER_FIRM_DTLS_NOT_FOUND',
    message: 'Click',
    relatedSchedule: 'personalInfo',
  },
  UNLISTED_SHARE_DTLS_NOT_FOUND: {
    code: 'UNLISTED_SHARE_DTLS_NOT_FOUND',
    message: '2(6), 3(5) If "Whether you have held unlisted equity shares at any time during the previous year?" is selected as Yes, then the details should be filled.',
    relatedSchedule: 'personalInfo',
  },
  DIRECTOR_DTLS_NOT_FOUND: {
    code: 'DIRECTOR_DTLS_NOT_FOUND',
    message: '2(11) , 3(12) "Whether you were Director in a company at any time during the previous year?" is selected as Yes then the respective details should be filled',
    relatedSchedule: 'personalInfo',
  },
  SCH_5A_DTLS_NO_FLAG_FOUND: {
    code: 'SCH_5A_DTLS_NO_FLAG_FOUND',
    message: 'Click',
    relatedSchedule: 'personalInfo',
  },
  SCH_5A_SPOUSE_PAN_NOT_FOUND: {
    code: 'SCH_5A_SPOUSE_PAN_NOT_FOUND',
    message: ' 2(16) The assessee is governed by Portuguese Code, then "PAN of Spouse" should be provided',
    relatedSchedule: 'personalInfo',
  },
  SEVEN_PROVISO_TRAVEL_NOT_FOUND: {
    code: 'SEVEN_PROVISO_TRAVEL_NOT_FOUND',
    message: '2(10)/ 2(471) In Part A General, Are you filing return of income under the Seventh proviso to Section 139(1) is selected as Yes then the respective details should be filled',
    relatedSchedule: 'personalInfo',
  },
  SEVEN_PROVISO_DEPOSIT_NOT_FOUND: {
    code: 'SEVEN_PROVISO_DEPOSIT_NOT_FOUND',
    message: '2(10)/ 2(471) In Part A General, Are you filing return of income under the Seventh proviso to Section 139(1) is selected as Yes then the respective details should be filled',
    relatedSchedule: 'personalInfo',
  },
  SEVEN_PROVISO_ELE_NOT_FOUND: {
    code: 'SEVEN_PROVISO_ELE_NOT_FOUND',
    message: 'Click',
    relatedSchedule: 'personalInfo',
  },
  FORM_10IE_NOT_FOUND: {
    code: 'FORM_10IE_NOT_FOUND',
    message: 'Click',
    relatedSchedule: 'otherSources',
  },
  RES_STATUS_NOT_FOUND: {
    code: 'RES_STATUS_NOT_FOUND',
    message: 'Click',
    relatedSchedule: 'personalInfo',
  },
  NEW_REGIME_AFTER_DUE_DATE: {
    code: 'NEW_REGIME_AFTER_DUE_DATE',
    message: 'Click',
    relatedSchedule: 'otherSources',
  },
  RETURN_TYPE_NOT_FOUND: {
    code: 'RETURN_TYPE_NOT_FOUND',
    message: 'Click',
    relatedSchedule: 'personalInfo',
  },
  BANK_NOT_FOUND: {
    code: 'BANK_NOT_FOUND',
    message: 'Click',
    relatedSchedule: 'personalInfo',
  },
  EMPLOYER_CAT_NOT_FOUND: {
    code: 'EMPLOYER_CAT_NOT_FOUND',
    message: '1(83) Any drop-down of nature of income cannot be selected more than one time under Exempt Income.',
    relatedSchedule: 'personalInfo',
  },
  EMAIL_NOT_FOUND: {
    code: 'EMAIL_NOT_FOUND',
    message: 'Click',
    relatedSchedule: 'personalInfo',
  },
  CONTACT_NO_NOT_FOUND: {
    code: 'CONTACT_NO_NOT_FOUND',
    message: 'Assessee should enter valid Mobile Number',
    relatedSchedule: 'personalInfo',
  },
  ADDRESS_NOT_FOUND: {
    code: 'ADDRESS_NOT_FOUND',
    message: 'Click',
    relatedSchedule: 'personalInfo',
  },
  DOB_NOT_FOUND: {
    code: 'DOB_NOT_FOUND',
    message: '1(2), 4(4), 2(13), 3(3) Taxpayer claiming benefit of senior citizen & super senior citizen, but date of birth is not matching with PAN database',
    relatedSchedule: 'personalInfo',
  },
  LAST_NAME_NOT_FOUND: {
    code: 'LAST_NAME_NOT_FOUND',
    message: 'Click',
    relatedSchedule: 'personalInfo',
  },
  AADHAR_NOT_FOUND: {
    code: 'AADHAR_NOT_FOUND',
    message: 'Click',
    relatedSchedule: 'personalInfo',
  },
  PAN_NOT_FOUND: {
    code: 'PAN_NOT_FOUND',
    message: '1(193) Return which is getting filed should be as per role CD of the PAN',
    relatedSchedule: 'personalInfo',
  },
  BS_DIFF_NEEDS_ZERO_OR_MAKE_44AA_FLAG_NO: {
    code: 'BS_DIFF_NEEDS_ZERO_OR_MAKE_44AA_FLAG_NO',
    message: 'In case of ITR 3 balance sheet difference needs to be zero or select BOA as "No"',
    relatedSchedule: 'balanceSheet',
  }
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
