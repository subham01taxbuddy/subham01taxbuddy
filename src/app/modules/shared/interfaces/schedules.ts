export class Schedules {
  public PERSONAL_INFO = 'personalInfo';
  public OTHER_SOURCES = 'otherSources';
  public INVESTMENTS_DEDUCTIONS = 'investmentsDeductions';
  public TAXES_PAID = 'taxesPaid';
  public DECLARATION = 'declaration';
  public SALARY = 'salary';
  public HOUSE_PROPERTY = 'houseProperty';
  public BUSINESS_INCOME = 'businessIncome';
  public CAPITAL_GAIN = 'capitalGain';
  public SPECULATIVE_INCOME = 'speculativeIncome';
  public FOREIGN_INCOME = 'foreignIncome';
  public MORE_INFORMATION = 'moreInformation';

  titleMap: any = {};
  pathMap: any = {};

  constructor() {
    this.titleMap[this.PERSONAL_INFO] = 'Personal Information';
    this.titleMap[this.OTHER_SOURCES] = 'Other Sources of Income';
    this.titleMap[this.INVESTMENTS_DEDUCTIONS] = 'Investments/Deductions';
    this.titleMap[this.TAXES_PAID] = 'Taxes Paid';
    this.titleMap[this.MORE_INFORMATION] = 'More Information';
    this.titleMap[this.DECLARATION] = 'Declaration/Errors';
    this.titleMap[this.SALARY] = 'Salary';
    this.titleMap[this.HOUSE_PROPERTY] = 'House Property';
    this.titleMap[this.BUSINESS_INCOME] = 'Business/Professional Income';
    this.titleMap[this.CAPITAL_GAIN] = 'Capital Gain';
    this.titleMap[this.SPECULATIVE_INCOME] = 'Future/Options';
    this.titleMap[this.FOREIGN_INCOME] = 'Foreign Income/NRI';

    this.pathMap[this.PERSONAL_INFO] = '/itr/personal-info';
    this.pathMap[this.OTHER_SOURCES] = '/itr/other-income';
    this.pathMap[this.INVESTMENTS_DEDUCTIONS] = '/itr/investments-deductions';
    this.pathMap[this.TAXES_PAID] = '/itr/taxes-paid';
    this.pathMap[this.MORE_INFORMATION]='/itr/more-info';
    this.pathMap[this.DECLARATION] = '/itr/declaration';
    this.pathMap[this.SALARY] = '/itr/salary';
    this.pathMap[this.HOUSE_PROPERTY] = '/itr/house-property';
    this.pathMap[this.BUSINESS_INCOME] = '/itr/business';
    this.pathMap[this.CAPITAL_GAIN] = '/itr/capital-gain';
    this.pathMap[this.SPECULATIVE_INCOME] = '/itr/future-options';
    this.pathMap[this.FOREIGN_INCOME] = '/itr/nri';
  }

  public getTitle(key) {
    return this.titleMap[key];
  }
  public getNavigationPath(key) {
    return this.pathMap[key];
  }
}
