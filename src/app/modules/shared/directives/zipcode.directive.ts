import { DOCUMENT } from '@angular/common';
import { Directive, HostBinding, HostListener, Inject } from '@angular/core';

@Directive({
  selector: '[zipCode]',
})
export class ZipcodeDirective {
  @HostBinding('autocomplete') public autocomplete;

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.autocomplete = 'off';
  }


  @HostListener('keypress', ['$event'])
  public disableKeys(e: KeyboardEvent) {
    const charCode = e.keyCode;

    return (
      charCode == 8 ||
      (charCode >= 48 && charCode <= 57) ||
      (charCode >= 65 && charCode <= 90) ||
      (charCode >= 97 && charCode <= 122)
    );
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    event.preventDefault();


    let pastedData = event.clipboardData?.getData('text/plain') || '';

    const cleanedValue = this.cleanInput(pastedData);

    if (cleanedValue) {
      this.document.execCommand('insertText', false, cleanedValue);
    }
  }

  private cleanInput(input: string): string {
    return input.replace(/[^a-zA-Z0-9]/g, '');
  }
}
