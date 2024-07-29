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
        let inputValue = event.clipboardData.getData('text/plain');
        const cleanedValue = inputValue.split('.')[0];
        if (cleanedValue !== inputValue) {
            inputValue = cleanedValue;
            document.execCommand('insertText', false, inputValue);
        } else {
            if(inputValue.match(/^[0-9.]+$/)){
                document.execCommand('insertText', false, inputValue);
            }
        }
    }
}
