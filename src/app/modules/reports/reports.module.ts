import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsComponent } from './reports.component';
import {ReportsRoutingModule} from './reports.routing'
import { CallingReportsComponent } from './calling-reports/calling-reports.component';
import { DailyCallingReportComponent } from './calling-reports/daily-calling-report/daily-calling-report.component';
import { MissedInboundCallsComponent } from './calling-reports/missed-inbound-calls/missed-inbound-calls.component';
import { ScheduleCallReportComponent } from './calling-reports/schedule-call-report/schedule-call-report.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxLoadingModule } from 'ngx-loading';
import { JsonToCsvService } from '../shared/services/json-to-csv.service';
import { ItrFilingReportComponent } from './itr-filing-report/itr-filing-report.component';
import { MissedChatReportComponent } from './missed-chat-report/missed-chat-report.component';

@NgModule({
  imports: [
    CommonModule,
    ReportsRoutingModule,
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    NgxLoadingModule.forRoot({}),
  ],
  declarations: [
    ReportsComponent,
    CallingReportsComponent,
    DailyCallingReportComponent,
    MissedInboundCallsComponent,
    ScheduleCallReportComponent,
    ItrFilingReportComponent,
    MissedChatReportComponent,
  ],
  entryComponents: [
    ReportsComponent,
  ],
  providers:[JsonToCsvService],

})
export class ReportsModule { }
