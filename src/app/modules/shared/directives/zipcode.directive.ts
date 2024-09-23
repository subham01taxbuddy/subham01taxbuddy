import { DOCUMENT } from '@angular/common'
import { Directive, HostBinding, HostListener, Inject } from '@angular/core'

@Directive({
    selector: '[zipCode]',
})
export class ZipcodeDirective {
    @HostBinding('autocomplete') public autocomplete
    constructor(@Inject(DOCUMENT) private document: Document) {
        this.autocomplete = 'off'
    }
    @HostListener('keypress', ['$event']) public disableKeys(e: any) {
        return e.keyCode == 8 || (e.keyCode >= 48 && e.keyCode <= 57) || e.keyCode >= 65 && e.keyCode <= 90 || e.keyCode >= 97 && e.keyCode <= 122 // keycodes for x and X
    }

    @HostListener('paste', ['$event'])
    onPaste(event: ClipboardEvent) {
        event.preventDefault();
        let inputValue = event.clipboardData.getData('text/plain');
        const cleanedValue = inputValue.split('.')[0];
        if (cleanedValue !== inputValue) {
            inputValue = cleanedValue;
            document.execCommand('insertText', false, inputValue);
        }
    }
}
