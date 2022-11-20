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
// import { InputUploadComponent } from 'app/additional-components/input-upload/input-upload.component';

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
        AddInvestmentDialogComponent
    ],
    entryComponents: [AddDonationDialogComponent, /* WhatsAppDialogComponent, */ /* KommunicateDialogComponent, */
        /* FilingStatusDialogComponent, */ ReviseReturnDialogComponent, UpdateManualFilingComponent,
        CoOwnerComponent,
        DeleteConfirmationDialogComponent,
        NriDetailsDialogComponent,
        UnlistedSharesComponent,
        DirectorInCompanyComponent,
        AddInvestmentDialogComponent]

})
export class ItrFilingModule { }
