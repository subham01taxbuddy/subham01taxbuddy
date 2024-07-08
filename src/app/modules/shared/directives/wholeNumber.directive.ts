import {HostListener, Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'wholeNumber'
})
export class WholeNumberPipe implements PipeTransform {

    transform(value: number): string {
        if (!Number.isInteger(value)) {
            return ''; // Return an empty string if the value is not an integer
        }

        return value.toString();
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
