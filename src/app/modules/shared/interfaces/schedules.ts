export class Schedules {
  public PERSONAL_INFO = 'personalInfo';

  titleMap: any = {};
  componentMap: any = {};

  constructor() {
    this.titleMap[this.PERSONAL_INFO] = 'Personal Information';
    this.componentMap[this.PERSONAL_INFO] = '/itr/personal-info';
  }

  public getTitle(key) {
    return this.titleMap[key];
  }
  public getComponent(key) {
    return this.componentMap[key];
  }
}
