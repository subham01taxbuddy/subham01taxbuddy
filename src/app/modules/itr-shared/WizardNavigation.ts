import {EventEmitter} from "@angular/core";

export abstract class WizardNavigation {
  saveAndNext: EventEmitter<any>;
  nextBreadcrumb: EventEmitter<String>;

  constructor() {
    this.saveAndNext = new EventEmitter();
    this.nextBreadcrumb = new EventEmitter();
  }
}
