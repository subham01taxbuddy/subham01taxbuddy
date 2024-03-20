import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { MaterialModule } from '../shared/material.module';
import { BankDialogComponent } from './dialogs/bank-dialog/bank-dialog.component';
import { NoAccountCasesComponent } from './dialogs/no-account-cases/no-account-cases.component';
import { SideSummaryPanelComponent } from './side-summary-panel/side-summary-panel.component';
import { PreviousSummaryPanelComponent } from './previous-summary-panel/previous-summary-panel.component';



@NgModule({
    declarations: [
        BankDialogComponent,
        NoAccountCasesComponent,
        SideSummaryPanelComponent,
        PreviousSummaryPanelComponent,
    ],
    imports: [
        CommonModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule
    ],
    exports: [
        CommonModule,
        MaterialModule,
        BankDialogComponent,
        NoAccountCasesComponent,
        SideSummaryPanelComponent,
        PreviousSummaryPanelComponent,
    ],
    providers: []
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
