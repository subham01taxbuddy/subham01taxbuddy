import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { ICellEditorParams } from 'ag-grid-community';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';

export const MY_FORMATS = {
    parse: {
        dateInput: 'DD/MM/YYYY',
    },
    display: {
        dateInput: 'DD/MM/YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};

@Component({
    selector: 'app-loading-overlay',
    template: `
    <mat-form-field>
            <input matInput [matDatepicker]="picker" [(ngModel)]="value" [min]="minDate" [max]="maxDate">
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
        </mat-form-field>
        <mat-datepicker panelClass="ag-custom-component-popup" #picker (selectedChanged)="onSelectChange($event)"></mat-datepicker>
    `,
    styles: [

    ],
    providers: [
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }]
})
export class CustomDateComponent implements AfterViewInit {
    minDate = new Date(1900, 0, 1);
    maxDate = new Date();

    columnWidth!: string;
    params!: ICellEditorParams;
    public value!: string;
    @ViewChild('picker', { read: MatDatepicker }) picker!: MatDatepicker<Date>;

    ngAfterViewInit() {
        this.picker.open();
    }

    isPopup(): boolean {
        return false;
    }

    isCancelBeforeStart(): boolean {
        return false;
    }

    isCancelAfterEnd(): boolean {
        return false;
    }

    agInit(params: any): void {
        this.params = params;
        this.value = params.value;
    }

    getValue(): string {
        return this.value;
    }

    onSelectChange(e: any): void {
        setTimeout(() => {
            this.params.stopEditing();
        });
    }
}
