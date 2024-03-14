import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxLoadingModule } from 'ngx-loading';

// Pipes
import { SelectFilterPipe } from '../pipes/filter.pipe';
import { SelectObjFilterPipe } from '../pipes/filter.pipe';
import { SelectObjectFilterPipe } from '../pipes/object-filter.pipe';
import { BacktipsDatePipe } from '../pipes/backtips-date.pipe';

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
import { ModalModule } from 'ngx-bootstrap/modal';

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
// import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { NeedHelpComponent } from './need-help/need-help.component';
import {FormControlTypePipe} from "../pipes/formcontroltype.pipe";
import { AisCredsDialogComponent } from './itr-filing/ais-creds-dialog/ais-creds-dialog.component';


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
    SelectObjectFilterPipe,
    SelectFilterPipe,
    SelectObjFilterPipe,
    BacktipsDatePipe,
    FormControlTypePipe,
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
    AgGridCheckboxComponent,
    ValidateOtpByWhatAppComponent,
    NeedHelpComponent,
    AisCredsDialogComponent,
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
    RouterModule.forChild(routes),
    NgxLoadingModule.forRoot({}),
    ModalModule.forRoot(),
    PdfViewerModule,
    // NgxExtendedPdfViewerModule,
    SharedModule,
  ],
  providers: [
    SelectObjectFilterPipe,
    SelectFilterPipe,
    SelectObjFilterPipe,
    BacktipsDatePipe,
    FormControlTypePipe,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],

  exports: [CalendarComponent, BacktipsDatePipe, AgGridModule, AgGridCheckboxComponent, FormsModule,
    ReactiveFormsModule,
     InputSelectObjectComponent, NgxLoadingModule, InputUploadComponent, /*NgxExtendedPdfViewerModule,*/ NeedHelpComponent, FormControlTypePipe]
})
export class PagesModule { }
