import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { AlertRoutingModule } from './alert-routing.module';
import { CreateAlertComponent } from './components/create-alert/create-alert.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxLoadingModule } from 'ngx-loading';
import { SharedModule } from '../shared/shared.module';
import { AgGridModule } from 'ag-grid-angular';
import { MaterialModule } from '../shared/material.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AlertPopupComponent } from './components/alert-popup/alert-popup.component';
import { AlertPushNotificationComponent } from './components/alert-push-notification/alert-push-notification.component';


@NgModule({
  declarations: [
    CreateAlertComponent,
    AlertPopupComponent,
    AlertPushNotificationComponent
  ],
  imports: [
    CommonModule,
    AlertRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxLoadingModule.forRoot({}),
    SharedModule,
    AgGridModule,
    MaterialModule,
    NgxPaginationModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    NgxMaterialTimepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  providers: [DatePipe]
})
export class AlertModule { }
