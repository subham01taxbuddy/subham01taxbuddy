import {EventEmitter, Output} from "@angular/core";

export abstract class WizardNavigation {
  saveAndNext: EventEmitter<any>;

  constructor() {
    this.saveAndNext = new EventEmitter();
  }
}
