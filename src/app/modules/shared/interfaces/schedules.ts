import { Injectable } from '@angular/core';

@Injectable()
export class Schedules {
  public PERSONAL_INFO = 'personalInfo';
  public OTHER_SOURCES = 'otherSources';
  public INVESTMENTS_DEDUCTIONS = 'investmentsDeductions';
  public TAXES_PAID = 'taxesPaid';
  public DECLARATION = 'declaration';
  public SALARY = 'salary';
  public BALANCE_SHEET = 'balanceSheet';
  public EXEMPT_INCOME = 'exemptIncome';
  public HOUSE_PROPERTY = 'houseProperty';
  public BUSINESS_INCOME = 'businessIncome';
  public CAPITAL_GAIN = 'capitalGain';
  public SPECULATIVE_INCOME = 'speculativeIncome';
  public FOREIGN_INCOME = 'foreignIncome';
  public MORE_INFORMATION = 'moreInformation';
  public CRYPTO_VDA = 'cryptoVda';

  titleMap: any = {};
  pathMap: any = {};
  keysMap: any = {};
  stateMap: any = {};
  queryParamsMap: any = {};

  constructor() {
    this.titleMap[this.PERSONAL_INFO] = 'Personal Information';
    this.titleMap[this.OTHER_SOURCES] = 'Other Sources of Income';
    this.titleMap[this.INVESTMENTS_DEDUCTIONS] = 'Investments/Deductions';
    this.titleMap[this.TAXES_PAID] = 'Taxes Paid';
    this.titleMap[this.MORE_INFORMATION] = 'More Information';
    this.titleMap[this.DECLARATION] = 'Declaration/Errors';
    this.titleMap[this.SALARY] = 'Salary';
    this.titleMap[this.BALANCE_SHEET] = 'Balance Sheet';
    this.titleMap[this.EXEMPT_INCOME] = 'Exempt Income';
    this.titleMap[this.HOUSE_PROPERTY] = 'House Property';
    this.titleMap[this.BUSINESS_INCOME] = 'Business/Professional Income';
    this.titleMap[this.CAPITAL_GAIN] = 'Capital Gain';
    this.titleMap[this.SPECULATIVE_INCOME] = 'Future/Options';
    this.titleMap[this.FOREIGN_INCOME] = 'Foreign Income/NRI';
    this.titleMap[this.CRYPTO_VDA] = 'Crypto/Vda';

    this.pathMap[this.PERSONAL_INFO] = '/itr/personal-info';
    this.pathMap[this.OTHER_SOURCES] = '/itr/other-income';
    this.pathMap[this.INVESTMENTS_DEDUCTIONS] = '/itr/investments-deductions';
    this.pathMap[this.TAXES_PAID] = '/itr/taxes-paid';
    this.pathMap[this.MORE_INFORMATION] = '/itr/more-info';
    this.pathMap[this.DECLARATION] = '/itr/declaration';
    this.pathMap[this.SALARY] = '/itr/salary';
    this.pathMap[this.BALANCE_SHEET] = '/itr/business/balance-sheet';
    this.pathMap[this.EXEMPT_INCOME] = '/itr/more-info/exempt-income';
    this.pathMap[this.HOUSE_PROPERTY] = '/itr/house-property';
    this.pathMap[this.BUSINESS_INCOME] = '/itr/business';
    this.pathMap[this.CAPITAL_GAIN] = '/itr/capital-gain';
    this.pathMap[this.SPECULATIVE_INCOME] = '/itr/future-options';
    this.pathMap[this.FOREIGN_INCOME] = '/itr/nri';
    this.pathMap[this.CRYPTO_VDA] = '/itr/crypto';

    this.keysMap[this.SALARY] = 'SALARY';
    this.keysMap[this.HOUSE_PROPERTY] = 'HOUSE_PROPERTY';
    this.keysMap[this.BUSINESS_INCOME] = 'BUSINESS_AND_PROFESSION';
    this.keysMap[this.BALANCE_SHEET] = 'BUSINESS_AND_PROFESSION';
    this.keysMap[this.CAPITAL_GAIN] = 'CAPITAL_GAINS';
    this.keysMap[this.SPECULATIVE_INCOME] = 'FUTURE_AND_OPTIONS';
    this.keysMap[this.FOREIGN_INCOME] = 'FOREIGN_INCOME_NRI_EXPAT';
    this.keysMap[this.CRYPTO_VDA] = 'CRYPTO_VDA';

    this.stateMap[this.EXEMPT_INCOME] = {showList: false};
    this.stateMap[this.BALANCE_SHEET] = {hideOutlet: false};

    this.queryParamsMap[this.EXEMPT_INCOME] = {type:'exemptIncome'};

  }

  public getKey(key) {
    return this.keysMap[key];
  }

  public getTitle(key) {
    return this.titleMap[key];
  }

  public getState(key) {
    return this.stateMap[key];
  }

  public getQueryParams(key) {
    return this.queryParamsMap[key];
  }

  public getNavigationPath(key) {
    return this.pathMap[key];
  }
}
