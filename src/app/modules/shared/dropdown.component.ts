import { Component, ViewChild } from '@angular/core';
import {  ICellEditorParams } from 'ag-grid-community';
import { AgEditorComponent, } from 'ag-grid-angular';

@Component({
    selector: 'app-ag-grid-material-select-editor',
    template: `

    <select #select (selectionChange)="onSelectChange($event)" [(ngModel)]="value" [style.width]="columnWidth">
<option *ngFor="let item of values" [value]="item.code">
{{ item.name | titlecase }}
</option>
</select>
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
    ]
})
export class AgGridMaterialSelectEditorComponent implements  AgEditorComponent {

    /* Material select box */
    /*
        <mat-select #select (selectionChange)="onSelectChange($event)" [(ngModel)]="value" [style.width]="columnWidth">
      <mat-option *ngFor="let item of values" [value]="item.countryCode">
        {{ item.countryName }}
      </mat-option>
    </mat-select>
     */

    columnWidth!: string;
    values!: any[];
    params!: ICellEditorParams;
    public value!: string;
    @ViewChild('select') select: any;





    isPopup(): boolean {
        return true;
    }

    isCancelBeforeStart(): boolean {
        return false;
    }

    isCancelAfterEnd(): boolean {
        return false;
    }

    agInit(params: any): void {
        this.params = params;
        this.columnWidth = params.column.actualWidth + 'px';
        this.values = params.values;
        this.value = params.value;
    }

    getValue(): string {
        return this.value;
    }

    onSelectChange(e:any): void {
        this.params.stopEditing();
    }

}
