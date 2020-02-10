import { Component, ViewChild, ViewContainerRef, AfterViewInit } from '@angular/core';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { MatSelect } from '@angular/material';

@Component({
    selector: "radio-cell",
    template: `
    <mat-card>
        <div class="container" #group tabindex="0" (keydown)="onKeyDown($event)">
        <mat-form-field>
            <mat-select [(ngModel)]="selectedPeriod">
                <!-- <mat-option *ngFor="let period of periodOfHoldingDropdown" [value]="period">
                    {{ period }}
                </mat-option> -->
                <mat-option >B2B</mat-option>
                <mat-option >B2C</mat-option>
            </mat-select>
            </mat-form-field>
        </div>
    </mat-card>
`,
    styles: [
        `
            .container {
                width: 190px;
                height: 48px;
            }

            .container:focus {
                outline: none;
            }
        `
    ],
    
})
export class MatSelectComponent implements ICellEditorAngularComp, AfterViewInit {
    private params: any;

    public periodOfHoldingDropdown: number[];
    public selectedPeriod: number;
    private selectedIndex: number;

     @ViewChild('group', { static: true, read: ViewContainerRef }) select: MatSelect;
    public group;

    agInit(params: any): void {
        this.params = params;

        this.selectedPeriod = this.params.value;
        this.periodOfHoldingDropdown = this.params.periodOfHoldingDropdown;

        this.selectedIndex = this.periodOfHoldingDropdown.findIndex(item => {
            return item === this.params.value;
        });
    }

    // dont use afterGuiAttached for post gui events - hook into ngAfterViewInit instead for this
    ngAfterViewInit() {
        window.setTimeout(() => {
            this.group.element.nativeElement.focus();
        });
        this.selectPeriodOfHoldingBasedOnSelectedIndex();
    }

    private selectPeriodOfHoldingBasedOnSelectedIndex() {
        this.selectedPeriod = this.periodOfHoldingDropdown[this.selectedIndex];
    }

    getValue() {
        return this.selectedPeriod;
    }

    isPopup(): boolean {
        return true;
    }

    /*
     * A little over complicated for what it is, but the idea is to illustrate how you might navigate through the radio
     * buttons with up & down keys (instead of finishing editing)
     */
    onKeyDown(event): void {
        const key = event.which || event.keyCode;
        if (key === 38 || key === 40) {
            this.preventDefaultAndPropagation(event);

            if (key === 38) {
                // up
                this.selectedIndex = this.selectedIndex === 0 ? this.periodOfHoldingDropdown.length - 1 : this.selectedIndex - 1;
            } else if (key === 40) {
                // down
                this.selectedIndex = this.selectedIndex === this.periodOfHoldingDropdown.length - 1 ? 0 : this.selectedIndex + 1;
            }
            this.selectPeriodOfHoldingBasedOnSelectedIndex();
        }
    }

    private preventDefaultAndPropagation(event) {
        event.preventDefault();
        event.stopPropagation();
    }
}
