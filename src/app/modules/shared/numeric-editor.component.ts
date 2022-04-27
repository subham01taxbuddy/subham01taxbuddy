import { AfterViewInit, Component, ViewChild, ViewContainerRef } from '@angular/core';

import { ICellEditorAngularComp } from 'ag-grid-angular';

@Component({
    selector: 'app-numeric-cell',
    template: `<input #input type="number" maxlength="14" (keydown)="onKeyDown($event)" [(ngModel)]="value" style="width: 100%" oninput="javascript: if (this.value.length > this.maxLength) this.value = this.value.slice(0, this.maxLength);"
    onkeypress="return event.charCode >= 48 && event.charCode <= 57">`
})
export class NumericEditorComponent implements ICellEditorAngularComp, AfterViewInit {
    private params: any;
    public value!: number;
    private cancelBeforeStart = false;

    // @ViewChild('input', { read: ViewContainerRef }) public input;


    agInit(params: any): void {
        this.params = params;
        this.value = this.params.value;

        // only start edit if key pressed is a number, not a letter
        // this.cancelBeforeStart = params.charPress && ('1234567890'.indexOf(params.charPress) < 0);
    }

    getValue(): any {
        return this.value;
    }

    isCancelBeforeStart(): boolean {
        return this.cancelBeforeStart;
    }

    // will reject the number if it greater than 99999999999999
    // not very practical, but demonstrates the method.
    isCancelAfterEnd(): boolean {
        return this.value > 99999999999999 || this.value === 0;
    }

    onKeyDown(event:any): void {
        /*  if (!this.isKeyPressedNumeric(event)) {
             if (event.preventDefault) event.preventDefault();
         } */
    }

    // dont use afterGuiAttached for post gui events - hook into ngAfterViewInit instead for this
    ngAfterViewInit() {
        window.setTimeout(() => {
            // this.input.element.nativeElement.focus();
        });
    }

    /*  private getCharCodeFromEvent(event): any {
         event = event || window.event;
         return (typeof event.which === "undefined") ? event.keyCode : event.which;
     }

     private isCharNumeric(charStr): boolean {
         return !!/\d/.test(charStr);
     }

     private isKeyPressedNumeric(event): boolean {
         const charCode = this.getCharCodeFromEvent(event);
         const charStr = event.key ? event.key : String.fromCharCode(charCode);
         return this.isCharNumeric(charStr);
     } */
}
