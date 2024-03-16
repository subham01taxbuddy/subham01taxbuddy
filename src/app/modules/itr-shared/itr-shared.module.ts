// import { UpperCaseDirective } from './../shared/input-data-mask.directive';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { ShimmerModule } from '@sreyaj/ng-shimmer';
import { MaterialModule } from '../shared/material.module';
import { BankDialogComponent } from './dialogs/bank-dialog/bank-dialog.component';
import { NoAccountCasesComponent } from './dialogs/no-account-cases/no-account-cases.component';
import {WizardNavigation} from "./WizardNavigation";
import { SideSummaryPanelComponent } from './side-summary-panel/side-summary-panel.component';
import { PreviousSummaryPanelComponent } from './previous-summary-panel/previous-summary-panel.component';



@NgModule({
    declarations: [
        BankDialogComponent,
        NoAccountCasesComponent,
        SideSummaryPanelComponent,
        PreviousSummaryPanelComponent,
        // UpperCaseDirective
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
        BankDialogComponent,
        NoAccountCasesComponent,
        SideSummaryPanelComponent,
        PreviousSummaryPanelComponent,
    ],
    providers: [],
    entryComponents: [BankDialogComponent, NoAccountCasesComponent]
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
