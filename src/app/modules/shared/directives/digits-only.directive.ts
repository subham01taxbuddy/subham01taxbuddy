import { DOCUMENT } from '@angular/common'
import { Directive, HostBinding, HostListener, Inject } from '@angular/core'

@Directive({
    selector: '[digitsOnly]',
})
export class DigitsOnlyDirective {
    @HostBinding('autocomplete') public autocomplete
    constructor(@Inject(DOCUMENT) private document: Document) {
        this.autocomplete = 'off'
    }
    @HostListener('keypress', ['$event']) public disableKeys(e: any) {
        return e.keyCode == 8 || (e.keyCode >= 48 && e.keyCode <= 57)
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
      const cleaned = input.replace(/[^0-9.]/g, '');
      const parts = cleaned.split('.');
      if (parts.length > 2) {
          return parts[0] + '.' + parts[1];
      }
      return cleaned;
  }
}
