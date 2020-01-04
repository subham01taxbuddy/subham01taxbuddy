import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UpperCaseDirective, InputDataMaskDirective, /* converToLowerCaseDirective */ } from './input-data-mask.directive';
import { AgGridModule } from 'ag-grid-angular';
import { NumericEditor } from './numeric-editor.component';


@NgModule({
    declarations: [
        UpperCaseDirective,
        InputDataMaskDirective,
        NumericEditor
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        AgGridModule.withComponents([NumericEditor]),
    ],
    exports: [
        UpperCaseDirective,
        InputDataMaskDirective,
        NumericEditor,
        AgGridModule
    ],
    providers: [],
})
export class SharedModule { }
