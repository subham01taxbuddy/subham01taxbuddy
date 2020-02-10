import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UpperCaseDirective, InputDataMaskDirective, /* converToLowerCaseDirective */ } from './input-data-mask.directive';
import { AgGridModule } from 'ag-grid-angular';
import { NumericEditor } from './numeric-editor.component';
import { CustomDateComponent } from './date.component';
import { MatSelectComponent } from './mat-select.component';
import { MaterialModule } from './material.module';
import { AgGridMaterialSelectEditorComponent } from './dropdown.component';
import { CommonModule } from '@angular/common';


@NgModule({
    declarations: [
        UpperCaseDirective,
        InputDataMaskDirective,
        NumericEditor,
        CustomDateComponent,
        MatSelectComponent,
        AgGridMaterialSelectEditorComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        AgGridModule.withComponents([NumericEditor, CustomDateComponent ,AgGridMaterialSelectEditorComponent]),  //MatSelectComponent
    ],
    exports: [
        CommonModule,
        UpperCaseDirective,
        InputDataMaskDirective,
        NumericEditor,
        MaterialModule,
        CustomDateComponent,
        MatSelectComponent,
        AgGridModule,
        AgGridMaterialSelectEditorComponent
    ],
    providers: [],
})
export class SharedModule { }
