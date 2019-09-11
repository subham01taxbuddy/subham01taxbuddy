/**
 * (c) OneGreenDiary Software Pvt. Ltd. 
 * This file is a part of OneGreenDiary platform code base.
 *
 * This file is distributed under following terms:
 * 1) OneGreenDiary owns the OneGreenDiary platform, of which this file is a part.
 * 2) Any modifications to the base platform by OneGreenDiary is owned by OneGreenDiary and will be 
 *    non-exclusively used by OneGreenDiary Software Pvt. Ltd. for its clients and partners.
 * 3) Rights of any third-party customizations that do not alter the base platform, 
 *    solely reside with the third-party.  
 * 4) OneGreenDiary Software Pvt. Ltd. is free to  change the licences of the base platform to permissive 
 *    opensource licences (e.g. Apache/EPL/MIT/BSD) in future.
 * 5) Onces OneGreenDiary platform is delivered to third party, they are free to modify the code for their internal use.
 *    Any such modifications will be solely owned by the third party.
 * 6) The third party may not redistribute the OneGreenDiary platform code base in any form without 
 *    prior agreement with OneGreenDiary Software Pvt. Ltd. 
 * 7) Third party agrees to preserve the above notice for all the OneGreenDiary platform files.
 */
 
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Component, OnInit, Input } from '@angular/core';
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
import { ConfirmationPopupComponent } from '../additional-components/confirmation-popup/confirmation-popup.component';
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

//helpers

// Simulate Web API
import { HomeComponent } from './home/home.component';

//Pages Component
import { PagesComponent } from './pages.component';
import { ListComponent } from './list/list.component';
import { BusinessComponent } from './business/business.component';
import { BusinessProfileComponent } from './business/business-profile/business-profile.component';
import { GSTCloudComponent } from './business/gst-cloud/gst-cloud.component';
import { BusinessDocumentsComponent } from './business/business-documents/business-documents.component';

//Login component
import { LoginComponent } from './login/login.component';

import { routes } from './pages.routing';

import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';


@NgModule({
  declarations: [
    PagesComponent,
    ListComponent,
    BusinessComponent,
    BusinessProfileComponent,
    GSTCloudComponent,
    BusinessDocumentsComponent,
    HomeComponent,
    LoginComponent,
    NavbarComponent,
    SidebarComponent,
    SelectObjectFilterPipe,
    SelectFilterPipe,
    SelectObjFilterPipe,
    BacktipsDatePipe,
    CapitalizeFirstPipe,
    SafePipe,
    ConfirmationPopupComponent,
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
    AttributesFilterComponent
  ],
  entryComponents:[
    HomeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forChild(routes),
    NgxLoadingModule.forRoot({}),
    ModalModule.forRoot()
  ],
  providers: [
    SelectObjectFilterPipe,
    SelectFilterPipe,
    SelectObjFilterPipe,
    BacktipsDatePipe,
    CapitalizeFirstPipe,
    SafePipe
  ],
  bootstrap: [PagesComponent]
})
export class PagesModule { }
