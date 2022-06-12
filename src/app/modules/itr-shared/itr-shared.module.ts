import { UpperCaseDirective } from './../shared/input-data-mask.directive';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { ShimmerModule } from '@sreyaj/ng-shimmer';
import { MaterialModule } from '../shared/material.module';
import { BankDialogComponent } from './dialogs/bank-dialog/bank-dialog.component';



@NgModule({
    declarations: [
        BankDialogComponent,
        UpperCaseDirective
    ],
    imports: [
        CommonModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        ShimmerModule
    ],
    exports: [
        CommonModule,
        MaterialModule,
        ShimmerModule,
        BankDialogComponent
    ],
    providers: [],
    entryComponents: [BankDialogComponent]
})
export class ItrSharedModule {
    static forRoot(): ModuleWithProviders<ItrSharedModule> {
        return {
            ngModule: ItrSharedModule,
            providers: [

            ]
        };
    }
}
