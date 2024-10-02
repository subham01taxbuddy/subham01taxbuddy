import { AddClientDialogComponent } from './add-client-dialog/add-client-dialog.component';
import { AckFailureComponent } from './acknowledgement/ack-failure/ack-failure.component';
import { AckDelayComponent } from './acknowledgement/ack-delay/ack-delay.component';
import { AckSuccessComponent } from './acknowledgement/ack-success/ack-success.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ItrFilingRoutingModule } from './itr-filing.routing';
import { CustomerProfileComponent } from './itr-wizard/components/customer-profile/customer-profile.component';
import { ItrFilingComponent } from './itr-filing.component';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { ItrWizardComponent } from './itr-wizard/itr-wizard.component';
import { PersonalInformationComponent } from './itr-wizard/components/personal-information/personal-information.component';
import { SalaryComponent } from './salary/salary.component';
import { HousePropertyComponent } from './house-property/house-property.component';
import { OtherIncomeComponent } from './other-income/other-income.component';
import { InvestmentsDeductionsComponent } from './itr-wizard/pages/investments-deductions/investments-deductions.component';
import { DeclarationComponent } from './declaration/declaration.component';
import { SummaryComponent } from './summary/summary.component';
import { DocumentUploadComponent } from './document-upload/document-upload.component';
import { ReviseReturnDialogComponent } from './revise-return-dialog/revise-return-dialog.component';
import { DelayComponent } from './delay/delay.component';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { FilingTasksComponent } from './filing-tasks/filing-tasks.component';
import { ShowUserDocumnetsComponent } from './show-user-documnets/show-user-documnets.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { PrefillDataComponent } from './itr-wizard/pages/prefill-id/components/prefill-data/prefill-data.component';
import { DeleteConfirmationDialogComponent } from './components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { NriDetailsDialogComponent } from './components/nri-details-dialog/nri-details-dialog.component';
import { BusinessIncomeComponent } from './business-income/business-income.component';
import { PresumptiveIncomeComponent } from './business-income/presumptive-income/presumptive-income.component';
import { PresumptiveBusinessIncomeComponent } from './business-income/presumptive-income/presumptive-business-income/presumptive-business-income.component';
import { PresumptiveProfessionalIncomeComponent } from './business-income/presumptive-income/presumptive-professional-income/presumptive-professional-income.component';
import { ProfitLossAcComponent } from './business-income/profit-loss-ac/profit-loss-ac.component';
import { BalanceSheetComponent } from './business-income/balance-sheet/balance-sheet.component';
import { BusinessDialogComponent } from './business-income/presumptive-income/presumptive-business-income/business-dialog/business-dialog.component';
import { ProfessionalDialogComponent } from './business-income/presumptive-income/presumptive-professional-income/professional-dialog/professional-dialog.component';
import { NonSpeculativeIncomeComponent } from './business-income/profit-loss-ac/non-speculative-income/non-speculative-income.component';
import { SpeculativeIncomeComponent } from './business-income/profit-loss-ac/speculative-income/speculative-income.component';
import { AddUpdateTradingComponent } from './business-income/profit-loss-ac/non-speculative-income/add-update-trading/add-update-trading.component';
import { DepreciationDialogComponent } from './business-income/balance-sheet/depreciation-dialog/depreciation-dialog.component';
import { PrefillIdComponent } from './itr-wizard/pages/prefill-id/prefill-id.component';
import { SourceOfIncomesComponent } from './itr-wizard/pages/source-of-incomes/source-of-incomes.component';
import { PagesModule } from 'src/app/pages/pages.module';
import { AllPersonalInformationComponent } from './itr-wizard/pages/all-personal-information/all-personal-information.component';
import { OtherInformationComponent } from './itr-wizard/components/other-information/other-information.component';
import { DonationsComponent } from './itr-wizard/components/donations/donations.component';
import { MedicalExpensesComponent } from './itr-wizard/components/medical-expenses/medical-expenses.component';
import { ForeignIncomeComponent } from './itr-wizard/pages/foreign-income/foreign-income.component';
import { UploadDocComponent } from './itr-wizard/components/upload-doc/upload-doc.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TdsOnSalaryComponent } from './itr-wizard/components/tds-on-salary/tds-on-salary.component';
import { TdsOtherThanSalaryComponent } from './itr-wizard/components/tds-other-than-salary/tds-other-than-salary.component';
import { TcsComponent } from './itr-wizard/components/tcs/tcs.component';
import { AdvanceTaxPaidComponent } from './itr-wizard/components/advance-tax-paid/advance-tax-paid.component';
import { AllBusinessIncomeComponent } from './itr-wizard/pages/all-business-income/all-business-income.component';
import { AddClientsComponent } from './itr-wizard/components/add-clients/add-clients.component';
import { TaxesPaidComponent } from './itr-wizard/pages/taxes-paid/taxes-paid.component';
import { AllSalaryIncomeComponent } from './itr-wizard/pages/all-salary-income/all-salary-income.component';
import { CapitalGainComponent } from './itr-wizard/components/capital-gain/capital-gain.component';
import { LandAndBuildingComponent } from './itr-wizard/components/capital-gain/land-and-building/land-and-building.component';
import { LabFormComponent } from './itr-wizard/components/capital-gain/land-and-building/lab-form/lab-form.component';
import { AddInvestmentDialogComponent } from './itr-wizard/components/capital-gain/land-and-building/add-investment-dialog/add-investment-dialog.component';
import { EquityMfComponent } from './itr-wizard/components/capital-gain/equity-mf/equity-mf.component';
import { ListedUnlistedDialogComponent } from './itr-wizard/components/capital-gain/equity-mf/listed-unlisted-dialog/listed-unlisted-dialog.component';
import { InvestmentDialogComponent } from './itr-wizard/components/capital-gain/investment-dialog/investment-dialog.component';
import { OtherAssetsComponent } from './itr-wizard/components/capital-gain/other-assets/other-assets.component';
import { OtherAssetsDialogComponent } from './itr-wizard/components/capital-gain/other-assets/other-assets-dialog/other-assets-dialog.component';
import { OtherImprovementDialogComponent } from './itr-wizard/components/capital-gain/other-assets/other-improvement-dialog/other-improvement-dialog.component';
import { BondsDebentureComponent } from './itr-wizard/components/capital-gain/bonds-debenture/bonds-debenture.component';
import { BondsComponent } from './itr-wizard/components/capital-gain/bonds/bonds.component';
import { MoreInfoComponent } from './itr-wizard/components/capital-gain/more-info/more-info.component';
import { ScheduleALComponent } from './itr-wizard/components/capital-gain/more-info/schedule-al/schedule-al.component';
import { ZeroCouponBondsComponent } from './itr-wizard/components/zero-coupon-bonds/zero-coupon-bonds.component';
import { SecurityDeductionComponent } from './itr-wizard/components/capital-gain/equity-mf/security-deduction/security-deduction.component';
import { SharesAndEquityComponent } from './itr-wizard/pages/shares-and-equity/shares-and-equity.component';
import { MoreInformationComponent } from './itr-wizard/pages/more-information/more-information.component';
import { FileParserComponent } from './itr-wizard/components/file-parser/file-parser.component';
import { OtherAssetImprovementComponent } from './itr-wizard/components/capital-gain/other-assets/other-asset-improvement/other-asset-improvement.component';
import { ScheduleCflComponent } from './itr-wizard/pages/schedule-cfl/schedule-cfl.component';
import { OldVsNewComponent } from './itr-wizard/components/old-vs-new/old-vs-new.component';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { SelectionComponent } from './itr-wizard/pages/taxes-paid/selection-component/selection-component.component';
import { TdsTypeCellRenderer } from './itr-wizard/pages/taxes-paid/tds-type-cell-renderer';
import { ScheduleFsiComponent } from './itr-wizard/pages/schedule-fsi/schedule-fsi.component';
import { ScheduleTrComponent } from './itr-wizard/pages/schedule-tr/schedule-tr.component';
import { ScheduleFaComponent } from './itr-wizard/pages/schedule-fa/schedule-fa.component';
import { BusinessInputAutocompleteComponent } from './components/business-input-autocomplete/business-input-autocomplete.component';
import { CryptoVdaComponent } from './itr-wizard/pages/crypto-vda/crypto-vda.component';
import { PartnerInFirmsComponent } from './itr-wizard/pages/partner-in-firms/partner-in-firms.component';
import { BifurcationComponent } from './salary/bifurcation/bifurcation.component';
import { SalaryBifurcationComponent } from './salary/salary-bifurcation/salary-bifurcation.component';
import { CalculatorsComponent } from './salary/calculators/calculators.component';
import { BreakUpComponent } from './salary/break-up/break-up.component';
import { OtherDeductionsComponent } from './itr-wizard/components/other-deductions/other-deductions.component';
import {ItrSharedModule} from "../itr-shared/itr-shared.module";
import {ExemptIncomeComponent} from "./exempt-income/exempt-income.component";
import { ScheduleEsopComponent } from './itr-wizard/pages/schedule-esop/schedule-esop.component';
import {NorDetailsDialogComponent} from "./components/nor-details-dialog/nor-details-dialog.component";
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { UpdateIncomeSourcesComponent } from './itr-wizard/pages/taxes-paid/update-income-sources/update-income-sources.component';
import { SpeculativeMainComponent } from './business-income/speculative-main/speculative-main.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ItrFilingRoutingModule,
        NgxImageZoomModule,
        // PdfViewerModule,
        SharedModule,
        PagesModule,
        NgxDocViewerModule,
        NgxPaginationModule,
        ItrSharedModule,
        NgxExtendedPdfViewerModule
    ],
    providers: [
        DatePipe,
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
    ],
    declarations: [
        ItrFilingComponent,
        CustomerProfileComponent,
        ItrWizardComponent,
        PersonalInformationComponent,
        SalaryComponent,
        HousePropertyComponent,
        OtherIncomeComponent,
        InvestmentsDeductionsComponent,
        // AddDonationDialogComponent,
        TaxesPaidComponent,
        DeclarationComponent,
        SummaryComponent,
        AckSuccessComponent,
        AckDelayComponent,
        AckFailureComponent,
        // KommunicateDialogComponent,
        DocumentUploadComponent,
        ReviseReturnDialogComponent,
        DelayComponent,
        FilingTasksComponent,
        ShowUserDocumnetsComponent,
        AddClientDialogComponent,
        PrefillDataComponent,
        DeleteConfirmationDialogComponent,
        NriDetailsDialogComponent,
        OtherInformationComponent,
        CapitalGainComponent,
        LandAndBuildingComponent,
        LabFormComponent,
        AddInvestmentDialogComponent,
        EquityMfComponent,
        ListedUnlistedDialogComponent,
        InvestmentDialogComponent,
        OtherAssetsComponent,
        OtherAssetsDialogComponent,
        OtherImprovementDialogComponent,
        MoreInfoComponent,
        ScheduleALComponent,
        BondsDebentureComponent,
        BondsComponent,
        BusinessIncomeComponent,
        PresumptiveIncomeComponent,
        PresumptiveBusinessIncomeComponent,
        PresumptiveProfessionalIncomeComponent,
        ProfitLossAcComponent,
        BalanceSheetComponent,
        BusinessDialogComponent,
        ProfessionalDialogComponent,
        NonSpeculativeIncomeComponent,
        SpeculativeIncomeComponent,
        AddUpdateTradingComponent,
        DepreciationDialogComponent,
        PrefillIdComponent,
        SourceOfIncomesComponent,
        AllPersonalInformationComponent,
        DonationsComponent,
        MedicalExpensesComponent,
        InvestmentsDeductionsComponent,
        ForeignIncomeComponent,
        UploadDocComponent,
        TdsOnSalaryComponent,
        TdsOtherThanSalaryComponent,
        TcsComponent,
        AdvanceTaxPaidComponent,
        AllBusinessIncomeComponent,
        AddClientsComponent,
        ZeroCouponBondsComponent,
        BondsDebentureComponent,
        AllSalaryIncomeComponent,
        SecurityDeductionComponent,
        SharesAndEquityComponent,
        MoreInformationComponent,
        OtherAssetImprovementComponent,
        FileParserComponent,
        ScheduleCflComponent,
        OldVsNewComponent,
        SelectionComponent,
        TdsTypeCellRenderer,
        BusinessInputAutocompleteComponent,
        ScheduleFsiComponent,
        ScheduleTrComponent,
        ScheduleFaComponent,
        CryptoVdaComponent,
        PartnerInFirmsComponent,
        BifurcationComponent,
        SalaryBifurcationComponent,
        CalculatorsComponent,
        BreakUpComponent,
        OtherDeductionsComponent,
        ExemptIncomeComponent,
        ScheduleEsopComponent,
        NorDetailsDialogComponent,
        UpdateIncomeSourcesComponent,
        SpeculativeMainComponent,
    ],
    exports: [CustomerProfileComponent]
})
export class ItrFilingModule {}
