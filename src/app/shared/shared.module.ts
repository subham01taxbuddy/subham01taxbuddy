import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UpperCaseDirective, InputDataMaskDirective, converToLowerCaseDirective } from './input-data-mask.directive';


@NgModule({
    declarations: [
        UpperCaseDirective,
        InputDataMaskDirective,
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
    ],
    exports: [
        UpperCaseDirective,
        InputDataMaskDirective,
    ],
    providers: [],
})
export class SharedModule { }
