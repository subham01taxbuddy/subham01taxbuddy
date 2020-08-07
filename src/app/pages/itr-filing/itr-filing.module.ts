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
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { SharedModule } from 'app/shared/shared.module';
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
import { UpdateStatusComponent } from './update-status/update-status.component';
import { DirectUploadComponent } from './direct-upload/direct-upload.component';
// import { InputUploadComponent } from 'app/additional-components/input-upload/input-upload.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ItrFilingRoutingModule,
        NgxLoadingModule.forRoot({}),
        NgxImageZoomModule.forRoot(),
        PdfViewerModule,
        SharedModule,
        PagesModule
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
        UpdateStatusComponent,
        DirectUploadComponent,
        // InputUploadComponent
    ],
    entryComponents: [AddDonationDialogComponent]

})
export class ItrFilingModule { }
