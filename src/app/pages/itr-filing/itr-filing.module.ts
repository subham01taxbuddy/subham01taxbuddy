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
        InvestmentsDeductionsComponent, AddDonationDialogComponent, TaxesPaidComponent, DeclarationComponent, SummaryComponent],
    entryComponents: [AddDonationDialogComponent]

})
export class ItrFilingModule { }
