import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxLoadingModule } from 'ngx-loading';

// Pipes
import { SelectFilterPipe ,SelectObjFilterPipe} from '../pipes/filter.pipe';
import { SelectObjectFilterPipe } from '../pipes/object-filter.pipe';
import { BacktipsDatePipe } from '../pipes/backtips-date.pipe';

// Additional Components
import { ModalModule } from 'ngx-bootstrap/modal';

import { routes } from './pages.routing';
import { environment } from '../../environments/environment';
import Auth from '@aws-amplify/auth';
import Storage from '@aws-amplify/storage';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { SharedModule } from '../modules/shared/shared.module';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { NeedHelpComponent } from './need-help/need-help.component';
import { FormControlTypePipe } from "../pipes/formcontroltype.pipe";
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
        NeedHelpComponent,
        AisCredsDialogComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes),
        NgxLoadingModule.forRoot({}),
        ModalModule.forRoot(),
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
    exports: [
        BacktipsDatePipe,
        AgGridModule,
        FormsModule,
        ReactiveFormsModule,
        NgxLoadingModule,
        NeedHelpComponent,
        FormControlTypePipe
    ]
})
export class PagesModule { }
