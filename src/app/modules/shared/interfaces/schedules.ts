export class Schedules {
  public PERSONAL_INFO = 'personalInfo';
  public OTHER_SOURCES = 'otherSources';
  public INVESTMENTS_DEDUCTIONS = 'investmentsDeductions';
  public TAXES_PAID = 'taxesPaid';
  public DECLARATION = 'declaration';

  titleMap: any = {};
  pathMap: any = {};

  constructor() {
    this.titleMap[this.PERSONAL_INFO] = 'Personal Information';
    this.titleMap[this.OTHER_SOURCES] = 'Other Sources of Income';
    this.titleMap[this.INVESTMENTS_DEDUCTIONS] = 'Investments/Deductions';
    this.titleMap[this.TAXES_PAID] = 'Taxes Paid';
    this.titleMap[this.DECLARATION] = 'Declaration/Errors';
    this.pathMap[this.PERSONAL_INFO] = '/itr/personal-info';
    this.pathMap[this.OTHER_SOURCES] = '/itr/other-income';
    this.pathMap[this.INVESTMENTS_DEDUCTIONS] = '/itr/investments-deductions';
    this.pathMap[this.TAXES_PAID] = '/itr/taxes-paid';
    this.pathMap[this.DECLARATION] = '/itr/declaration';
  }

  public getTitle(key) {
    return this.titleMap[key];
  }
  public getNavigationPath(key) {
    return this.pathMap[key];
  }
}
