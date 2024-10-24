import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { AgGridModule } from 'ag-grid-angular';
import { NgxLoadingModule } from 'ngx-loading';
import { NgxPaginationModule } from 'ngx-pagination';
import { MaterialModule } from '../shared/material.module';
import { SharedModule } from '../shared/shared.module';
import { LeaderDashboardComponent } from './leader-dashboard/leader-dashboard.component';
import { TeamReportDashboardComponent } from './team-report-dashboard/team-report-dashboard.component';
import { LeaderAttendanceDashboardComponent } from './leader-attendance-dashboard/leader-attendance-dashboard.component';
import { LeaderStatuswiseReportComponent } from './leader-statuswise-report/leader-statuswise-report.component';


@NgModule({
  declarations: [
    DashboardComponent,
    LeaderDashboardComponent,
    TeamReportDashboardComponent,
    LeaderAttendanceDashboardComponent,
    LeaderStatuswiseReportComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    MatFormFieldModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxLoadingModule.forRoot({}),
    SharedModule,
    AgGridModule,
    MaterialModule,
    NgxPaginationModule,
    MatCardModule,
  ]
})
export class DashboardModule { }
