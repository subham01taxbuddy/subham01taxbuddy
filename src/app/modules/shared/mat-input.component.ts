import { ICellEditorAngularComp } from 'ag-grid-angular';
import { ViewChildren, ViewContainerRef, QueryList, Component, AfterViewInit } from '@angular/core';

@Component({
    selector: "app-input-cell",
    template: `
        <mat-card appearance="outlined">
        <form class="container" tabindex="0" (keydown)="onKeyDown($event)">
            <mat-form-field class="example-full-width">
                <input matInput [(ngModel)]="receipts" placeholder="Amount/ month" pattern="[0-9]*"
                       [ngModelOptions]="{standalone: true}" maxlength="14" name="receiptsAmount" #receiptsAmount="ngModel">
                       <mat-error *ngIf="receiptsAmount.errors"> Please enter numbers only</mat-error>
            </mat-form-field>
        </form>
        </mat-card>
    `,
    /* <mat-form-field class="example-full-width">
                <input #input matInput [(ngModel)]="lastName" placeholder="Last Name"
                       [ngModelOptions]="{standalone: true}">
            </mat-form-field> */
    styles: [
        `
                     .container {
                         width: 250px;
                     }
                 `
    ]
})
export class MatInputComponent implements ICellEditorAngularComp, AfterViewInit {
    public receipts: any;

    // private firstName: string;
    // private lastName: string;

    @ViewChildren('input', { read: ViewContainerRef })
    public inputs!: QueryList<any>;
    private focusedInput = 0;

    agInit(params: any): void {
        this.receipts = params.value;

        // simple implementation - we assume a full name consists of a first and last name only
        // this.firstName = this.params.value.split(" ")[0];
        // this.lastName = this.params.value.split(" ")[1];
    }

    // dont use afterGuiAttached for post gui events - hook into ngAfterViewInit instead for this
    ngAfterViewInit() {
        this.focusOnInputNextTick(this.inputs.first);
    }

    private focusOnInputNextTick(input: ViewContainerRef) {
        window.setTimeout(() => {
        }, 0);
    }

    getValue() {
        return `${this.receipts}`;
    }

    isPopup(): boolean {
        return true;
    }

    /*
     * A little over complicated for what it is, but the idea is to illustrate how you might tab between multiple inputs
     * say for example in full row editing
     */
    onKeyDown(event:any): void {
        const key = event.which || event.keyCode;
        if (key === 9) {
            // tab
            this.preventDefaultAndPropagation(event);

            // either move one input along, or cycle back to 0
            this.focusedInput = this.focusedInput === this.inputs.length - 1 ? 0 : this.focusedInput + 1;

            const focusedInput = this.focusedInput;
            const inputToFocusOn = this.inputs.find((item: any, index: number) => {
                return index === focusedInput;
            });

            this.focusOnInputNextTick(inputToFocusOn);
        } else if (key === 13) {
            // enter
            // perform some validation on enter - in this example we assume all inputs are mandatory
            // in a proper application you'd probably want to inform the user that an input is blank
            this.inputs.forEach(input => {
                if (!input.element.nativeElement.value) {
                    this.preventDefaultAndPropagation(event);
                    this.focusOnInputNextTick(input);
                }
            });
        }
    }

    private preventDefaultAndPropagation(event:any) {
        event.preventDefault();
        event.stopPropagation();
    }
}
