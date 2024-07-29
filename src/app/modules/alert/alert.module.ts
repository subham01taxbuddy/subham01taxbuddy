import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AlertRoutingModule } from './alert-routing.module';
import { CreateAlertComponent } from './components/create-alert/create-alert.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxLoadingModule } from 'ngx-loading';
import { SharedModule } from '../shared/shared.module';
import { AgGridModule } from 'ag-grid-angular';
import { MaterialModule } from '../shared/material.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { SmeManagementNewRoutingModule } from '../sme-management-new/sme-management-new.routing';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@NgModule({
  declarations: [
    CreateAlertComponent
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
    MatProgressSpinnerModule
  ]
})
export class AlertModule { }
