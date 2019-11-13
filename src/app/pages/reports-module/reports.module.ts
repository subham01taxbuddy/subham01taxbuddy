import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports.component';
import { UserGstStatusReportComponent } from './user-gst-status-report/user-gst-status-report.component';
import { PagesModule } from '../pages.module';
import { AgGridModule } from 'ag-grid-angular';
import { Gstr1Component } from './gstr1/gstr1.component';

@NgModule({
    declarations: [ReportsComponent, UserGstStatusReportComponent, Gstr1Component],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ReportsRoutingModule,
        PagesModule,
        AgGridModule.withComponents([])
    ],
})
export class ReportsModule { }
