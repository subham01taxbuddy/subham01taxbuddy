import { AddImmovableDialogComponent } from './capital-gain/more-info/schedule-al/add-immovable-dialog/add-immovable-dialog.component';
import { ScheduleALComponent } from './capital-gain/more-info/schedule-al/schedule-al.component';
import { MoreInfoComponent } from './capital-gain/more-info/more-info.component';
import { AddClientDialogComponent } from './add-client-dialog/add-client-dialog.component';
import { AckFailureComponent } from './acknowledgement/ack-failure/ack-failure.component';
import { AckDelayComponent } from './acknowledgement/ack-delay/ack-delay.component';
import { AckSuccessComponent } from './acknowledgement/ack-success/ack-success.component';
// import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UsersComponent } from './users/users.component';
import { PagesModule } from './../pages.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItrFilingRoutingModule } from './itr-filing.routing';
import { CustomerProfileComponent } from './customer-profile/customer-profile.component';
import { ItrFilingComponent } from './itr-filing.component';
import { NgxLoadingModule } from 'ngx-loading';
// import { NgxImageZoomModule } from 'ngx-image-zoom';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { ItrWizardComponent } from './itr-wizard/itr-wizard.component';
import { PersonalInformationComponent } from './personal-information/personal-information.component';
import { SalaryComponent } from './salary/salary.component';
import { HousePropertyComponent } from './house-property/house-property.component';
import { OtherIncomeComponent } from './other-income/other-income.component';
import { InvestmentsDeductionsComponent } from './investments-deductions/investments-deductions.component';
import { AddDonationDialogComponent } from './investments-deductions/add-donation-dialog/add-donation-dialog.component';
import { TaxesPaidComponent } from './taxes-paid/taxes-paid.component';
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
import { PrefillDataComponent } from './prefill-data/prefill-data.component';
import { CoOwnerComponent } from './house-property/co-owner/co-owner.component';
import { DeleteConfirmationDialogComponent } from './components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { NriDetailsDialogComponent } from './components/nri-details-dialog/nri-details-dialog.component';
import { OtherInformationComponent } from './other-information/other-information.component';
import { UnlistedSharesComponent } from './other-information/unlisted-shares/unlisted-shares.component';
import { DirectorInCompanyComponent } from './other-information/director-in-company/director-in-company.component';
import { CapitalGainComponent } from './capital-gain/capital-gain.component';
import { LandAndBuildingComponent } from './capital-gain/land-and-building/land-and-building.component';
import { LabFormComponent } from './capital-gain/land-and-building/lab-form/lab-form.component';
import { AddInvestmentDialogComponent } from './capital-gain/land-and-building/add-investment-dialog/add-investment-dialog.component';
import { EquityMfComponent } from './capital-gain/equity-mf/equity-mf.component';
import { ListedUnlistedDialogComponent } from './capital-gain/equity-mf/listed-unlisted-dialog/listed-unlisted-dialog.component';
import { InvestmentDialogComponent } from './capital-gain/investment-dialog/investment-dialog.component';
import { OtherAssetsDialogComponent } from './capital-gain/other-assets/other-assets-dialog/other-assets-dialog.component';
import { OtherAssetsComponent } from './capital-gain/other-assets/other-assets.component';
import { OtherImprovementDialogComponent } from './capital-gain/other-assets/other-improvement-dialog/other-improvement-dialog.component';
import { BondsDebentureComponent } from './capital-gain/bonds-debenture/bonds-debenture.component';
import { BondsComponent } from './capital-gain/bonds/bonds.component';
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
        NgxPaginationModule
        // NgxExtendedPdfViewerModule
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
        AddDonationDialogComponent,
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
        AddImmovableDialogComponent,
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
       ],
    entryComponents: [AddDonationDialogComponent, /* WhatsAppDialogComponent, */ /* KommunicateDialogComponent, */
        /* FilingStatusDialogComponent, */ ReviseReturnDialogComponent, UpdateManualFilingComponent,
        CoOwnerComponent,
        DeleteConfirmationDialogComponent,
        NriDetailsDialogComponent,
        UnlistedSharesComponent,
        DirectorInCompanyComponent,
        AddInvestmentDialogComponent,
        ListedUnlistedDialogComponent,
        InvestmentDialogComponent,
        OtherAssetsDialogComponent,
        OtherImprovementDialogComponent]

})
export class ItrFilingModule { }
