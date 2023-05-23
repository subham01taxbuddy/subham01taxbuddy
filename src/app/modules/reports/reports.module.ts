import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsComponent } from './reports.component';
import {ReportsRoutingModule} from './reports.routing'
import { CallingReportsComponent } from './calling-reports/calling-reports.component';
import { DailyCallingReportComponent } from './calling-reports/daily-calling-report/daily-calling-report.component';
import { MissedInboundCallsComponent } from './calling-reports/missed-inbound-calls/missed-inbound-calls.component';
import { ScheduleCallReportComponent } from './calling-reports/schedule-call-report/schedule-call-report.component';

@NgModule({
  imports: [
    CommonModule,
    ReportsRoutingModule
  ],
  declarations: [
    ReportsComponent,
    CallingReportsComponent,
    DailyCallingReportComponent,
    MissedInboundCallsComponent,
    ScheduleCallReportComponent,
  ],
  entryComponents: [
    ReportsComponent,
  ],
})
export class ReportsModule { }
