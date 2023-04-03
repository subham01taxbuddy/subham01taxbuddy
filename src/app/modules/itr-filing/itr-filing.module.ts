import { AddClientDialogComponent } from './add-client-dialog/add-client-dialog.component';
import { AckFailureComponent } from './acknowledgement/ack-failure/ack-failure.component';
import { AckDelayComponent } from './acknowledgement/ack-delay/ack-delay.component';
import { AckSuccessComponent } from './acknowledgement/ack-success/ack-success.component';
// import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UsersComponent } from './users/users.component';
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ItrFilingRoutingModule } from './itr-filing.routing';
import { CustomerProfileComponent } from './itr-wizard/components/customer-profile/customer-profile.component';
import { ItrFilingComponent } from './itr-filing.component';
import { NgxLoadingModule } from 'ngx-loading';
// import { NgxImageZoomModule } from 'ngx-image-zoom';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { ItrWizardComponent } from './itr-wizard/itr-wizard.component';
import { PersonalInformationComponent } from './itr-wizard/components/personal-information/personal-information.component';
import { SalaryComponent } from './salary/salary.component';
import { HousePropertyComponent } from './house-property/house-property.component';
import { OtherIncomeComponent } from './other-income/other-income.component';
import { InvestmentsDeductionsComponent } from './itr-wizard/pages/investments-deductions/investments-deductions.component';
// import { AddDonationDialogComponent } from './itr-wizard/pages/investments-deductions/add-donation-dialog/add-donation-dialog.component';
import { DeclarationComponent } from './declaration/declaration.component';
import { SummaryComponent } from './summary/summary.component';
import { AcknowledgementComponent } from './acknowledgement/acknowledgement.component';
// import { UpdateStatusComponent } from './update-status/update-status.component';
import { DirectUploadComponent } from './direct-upload/direct-upload.component';
import { MyAssignedItrsComponent } from './my-assigned-itrs/my-assigned-itrs.component';
import { BusinessComponent } from './business/business.component';
// import { WhatsAppDialogComponent } from './whats-app-dialog/whats-app-dialog.component';
import { MyTeamItrsComponent } from './my-team-itrs/my-team-itrs.component';
// import { KommunicateDialogComponent } from './kommunicate-dialog/kommunicate-dialog.component';
// import { FilingStatusDialogComponent } from './filing-status-dialog/filing-status-dialog.component';
import { DocumentUploadComponent } from './document-upload/document-upload.component';
import { ReviseReturnDialogComponent } from './revise-return-dialog/revise-return-dialog.component';
import { DelayComponent } from './delay/delay.component';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { FilingTasksComponent } from './filing-tasks/filing-tasks.component';
import { ShowUserDocumnetsComponent } from './show-user-documnets/show-user-documnets.component';
import { UpdateManualFilingComponent } from './update-manual-filing/update-manual-filing.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { AddClientComponent } from './add-client/add-client.component';
import { PrefillDataComponent } from './itr-wizard/pages/prefill-id/components/prefill-data/prefill-data.component';
import { CoOwnerComponent } from './house-property/co-owner/co-owner.component';
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
import { AddBalanceSheetComponent } from './business-income/balance-sheet/add-balance-sheet/add-balance-sheet.component';
import { DepreciationDialogComponent } from './business-income/balance-sheet/depreciation-dialog/depreciation-dialog.component';
import { PrefillIdComponent } from './itr-wizard/pages/prefill-id/prefill-id.component';
import { SourceOfIncomesComponent } from './itr-wizard/pages/source-of-incomes/source-of-incomes.component';
import { PagesModule } from 'src/app/pages/pages.module';
import { AllPersonalInformationComponent } from './itr-wizard/pages/all-personal-information/all-personal-information.component';
import { OtherInformationComponent } from './itr-wizard/components/other-information/other-information.component';
import { UnlistedSharesComponent } from './itr-wizard/components/other-information/unlisted-shares/unlisted-shares.component';
import { DirectorInCompanyComponent } from './itr-wizard/components/other-information/director-in-company/director-in-company.component';
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

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ItrFilingRoutingModule,
    NgxLoadingModule.forRoot({}),
    // NgxImageZoomModule.forRoot(),
    PdfViewerModule,
    SharedModule,
    PagesModule,
    NgxDocViewerModule,
    NgxPaginationModule,
    // NgxExtendedPdfViewerModule
  ],
  providers: [
    DatePipe,
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} },
  ],
  declarations: [
    ItrFilingComponent,
    UsersComponent,
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
    AcknowledgementComponent,
    AckSuccessComponent,
    AckDelayComponent,
    AckFailureComponent,
    // UpdateStatusComponent,
    DirectUploadComponent,
    MyAssignedItrsComponent,
    BusinessComponent,
    // WhatsAppDialogComponent,
    MyTeamItrsComponent,
    // KommunicateDialogComponent,
    // FilingStatusDialogComponent,
    DocumentUploadComponent,
    ReviseReturnDialogComponent,
    DelayComponent,
    FilingTasksComponent,
    ShowUserDocumnetsComponent,
    UpdateManualFilingComponent,
    AddClientComponent,
    AddClientDialogComponent,
    PrefillDataComponent,
    // InputUploadComponent
    CoOwnerComponent,
    DeleteConfirmationDialogComponent,
    NriDetailsDialogComponent,
    OtherInformationComponent,
    UnlistedSharesComponent,
    DirectorInCompanyComponent,
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
    AddBalanceSheetComponent,
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
    AllSalaryIncomeComponent,
    SecurityDeductionComponent,
    SharesAndEquityComponent,
    MoreInformationComponent,
    OtherAssetImprovementComponent,
    FileParserComponent,
    ScheduleCflComponent,
    OldVsNewComponent,
  ],

  exports: [CustomerProfileComponent],
  entryComponents: [
    ReviseReturnDialogComponent,
    UpdateManualFilingComponent,
    CoOwnerComponent,
    DeleteConfirmationDialogComponent,
    NriDetailsDialogComponent,
    UnlistedSharesComponent,
    DirectorInCompanyComponent,
    AddInvestmentDialogComponent,
    ListedUnlistedDialogComponent,
    InvestmentDialogComponent,
    OtherAssetsDialogComponent,
    OtherImprovementDialogComponent,
  ],
})
export class ItrFilingModule {}
