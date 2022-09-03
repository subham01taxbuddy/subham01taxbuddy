import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { NgxLoadingModule } from 'ngx-loading';

// Pipes
import { SelectFilterPipe } from '../pipes/filter.pipe';
import { SelectObjFilterPipe } from '../pipes/filter.pipe';
import { SelectObjectFilterPipe } from '../pipes/object-filter.pipe';
import { BacktipsDatePipe } from '../pipes/backtips-date.pipe';
import { CapitalizeFirstPipe } from '../pipes/capitalize-first.pipe';
import { SafePipe } from '../pipes/safe-html.pipe';

// Additional Components
import { ConfirmationModalComponent } from '../additional-components/confirmation-popup/confirmation-popup.component';
import { InputCheckboxSelectComponent } from '../additional-components/input-checkbox-select/input-checkbox-select.component';
import { InputCheckboxSelectObjectComponent } from '../additional-components/input-checkbox-select-object/input-checkbox-select-object.component';
import { InputComponent } from '../additional-components/input/input.component';
import { InputWithCurrrencySelectComponent } from '../additional-components/input-with-currency-select/input-with-currency-select.component';
import { CalendarComponent } from '../additional-components/calendar/calendar.component';
import { InputSelectComponent } from '../additional-components/input-select/input-select.component';
import { InputSelectObjectComponent } from '../additional-components/input-select-object/input-select-object.component';
import { InputSelectFilteredObjectComponent } from '../additional-components/input-select-filtered-object/input-select-filtered-object.component';
import { InputCheckboxComponent } from '../additional-components/input-checkbox/input-checkbox.component';
import { InputUploadComponent } from '../additional-components/input-upload/input-upload.component';
import { InputQuantityComponent } from '../additional-components/input-quantity/input-quantity.component';
import { InputTagsComponent } from '../additional-components/input-tags/input-tags.component';
import { InputTagsViewComponent } from '../additional-components/input-tags-view/input-tags-view.component';
import { ToggleComponent } from '../additional-components/toggle/toggle.component';
import { AttributesFilterComponent } from '../additional-components/attributes-filter/attributes-filter.component';
import { ModalModule } from 'ngx-bootstrap/modal';

//Pages Component
import { BusinessComponent } from './business/business.component';
import { BusinessProfileComponent } from './business/business-profile/business-profile.component';
import { GSTCloudComponent } from './business/gst-cloud/gst-cloud.component';
import { AddUpdateGSTBillInvoiceComponent } from './business/gst-cloud/add-update-gst-bill-invoice/add-update-gst-bill-invoice.component';
import { AddUpdateCreditDebitNoteInvoiceComponent } from './business/gst-cloud/add-update-credit-debit-note-invoice/add-update-credit-debit-note-invoice.component';
import { BusinessDocumentsComponent } from './business/business-documents/business-documents.component';
import { PartyListComponent } from './business/party-list/party-list.component';
import { ImportPartyListComponent } from './business/import-party-list/import-party-list.component';
import { GST3BComputationComponent } from './business/gst-3b-computation/gst-3b-computation.component';


import { routes } from './pages.routing';
import { environment } from '../../environments/environment';
import Auth from '@aws-amplify/auth';
import Storage from '@aws-amplify/storage';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { ValidateOtpByWhatAppComponent } from '../modules/auth/components/validate-otp-by-what-app/validate-otp-by-what-app.component';
import { AgGridCheckboxComponent } from '../additional-components/ag-grid-checkbox/ag-grid-checkbox.component';
import { SharedModule } from '../modules/shared/shared.module';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { NeedHelpComponent } from './need-help/need-help.component';


Auth.configure(environment.AMPLIFY_CONFIG);

Storage.configure({
  AWSS3: {
    bucket: environment.s3_cred.bucket,
    region: environment.s3_cred.region
  }
});


export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  }
};
@NgModule({
  declarations: [
    BusinessComponent,
    BusinessProfileComponent,
    GSTCloudComponent,
    AddUpdateGSTBillInvoiceComponent,
    AddUpdateCreditDebitNoteInvoiceComponent,
    BusinessDocumentsComponent,
    PartyListComponent,
    ImportPartyListComponent,
    GST3BComputationComponent,
    SelectObjectFilterPipe,
    SelectFilterPipe,
    SelectObjFilterPipe,
    BacktipsDatePipe,
    CapitalizeFirstPipe,
    SafePipe,
    ConfirmationModalComponent,
    InputCheckboxSelectComponent,
    InputCheckboxSelectObjectComponent,
    InputComponent,
    InputWithCurrrencySelectComponent,
    CalendarComponent,
    InputSelectComponent,
    InputSelectObjectComponent,
    InputSelectFilteredObjectComponent,
    InputCheckboxComponent,
    InputUploadComponent,
    InputQuantityComponent,
    InputTagsComponent,
    InputTagsViewComponent,
    ToggleComponent,
    AttributesFilterComponent,
    AgGridCheckboxComponent,
    ValidateOtpByWhatAppComponent,
    NeedHelpComponent,

  ],
  entryComponents: [
    ConfirmationModalComponent,
    AgGridCheckboxComponent,
    ValidateOtpByWhatAppComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forChild(routes),
    NgxLoadingModule.forRoot({}),
    ModalModule.forRoot(),
    PdfViewerModule,
    NgxExtendedPdfViewerModule,
    SharedModule,
  ],
  providers: [
    SelectObjectFilterPipe,
    SelectFilterPipe,
    SelectObjFilterPipe,
    BacktipsDatePipe,
    CapitalizeFirstPipe,
    SafePipe,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],

  exports: [CalendarComponent, BacktipsDatePipe, AgGridModule, AgGridCheckboxComponent, AttributesFilterComponent, FormsModule,
    ReactiveFormsModule,
    HttpClientModule, InputSelectObjectComponent, NgxLoadingModule, InputUploadComponent, NgxExtendedPdfViewerModule, NeedHelpComponent]
})
export class PagesModule { }
