import {Directive, HostBinding, HostListener, Inject, Pipe, PipeTransform} from '@angular/core';
import {DOCUMENT} from "@angular/common";

@Directive({
    selector:'[wholeNumber]'
})
export class WholeNumberPipe {
    @HostBinding('autocomplete') public autocomplete
    constructor(@Inject(DOCUMENT) private document: Document) {
        this.autocomplete = 'off'
    }
    @HostListener('keypress', ['$event']) public disableKeys(e: any) {
        return e.keyCode == 8 || (e.keyCode >= 48 && e.keyCode <= 57) || e.keyCode == 45;
    }

    @HostListener('paste', ['$event'])
    onPaste(event: ClipboardEvent) {
        event.preventDefault();
        // const pastedInput: string = event.clipboardData
        //     .getData('text/plain')
        //     .replace(/\D|(\.\d+)/g, ''); // get a digit-only string
        // document.execCommand('insertText', false, pastedInput);
        let inputValue = event.clipboardData.getData('text/plain');
        const cleanedValue = inputValue.split('.')[0];
        if (cleanedValue !== inputValue) {
            inputValue = cleanedValue;
            document.execCommand('insertText', false, inputValue);
        }
    }
}
