import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CallingReportsComponent } from './calling-reports/calling-reports.component';
import { DailyCallingReportComponent } from './calling-reports/daily-calling-report/daily-calling-report.component';
import { MissedInboundCallsComponent } from './calling-reports/missed-inbound-calls/missed-inbound-calls.component';
import { ScheduleCallReportComponent } from './calling-reports/schedule-call-report/schedule-call-report.component';
import { ReportsComponent } from './reports.component';
import { ItrFilingReportComponent } from './itr-filing-report/itr-filing-report.component';
import { MissedChatReportComponent } from './missed-chat-report/missed-chat-report.component';
import { RevenueReportComponent } from './revenue-report/revenue-report.component';
import { PayoutReportComponent } from './payout-report/payout-report.component';
import { UsersItrPaymentDoneComponent } from './users-itr-payment-done/users-itr-payment-done.component';


const routes: Routes = [
  {
    path: '',
    component: ReportsComponent,
    children: [
      {
        path: 'calling-reports',
        component: CallingReportsComponent,
        children: [
          {
            path: 'daily-calling-report',
            component: DailyCallingReportComponent,
          },
          {
            path: 'schedule-call-report',
            component: ScheduleCallReportComponent,
          },
          {
            path: 'missed-inbound-calls',
            component: MissedInboundCallsComponent,
          },
          {
            path: '',
            redirectTo: 'daily-calling-report',
            pathMatch: 'full',
          },
        ],
      },
      // {
      //   path: '',
      //   redirectTo: 'calling-report',
      //   pathMatch: 'full',
      // },
      {
        path: 'itr-filing-report',
        component: ItrFilingReportComponent,
      },
      {
        path: 'missed-chat-report',
        component: MissedChatReportComponent,
      },
      {
        path: 'revenue-report',
        component: RevenueReportComponent,
      },
      {
        path:'payout-report',
        component: PayoutReportComponent,
      },
      {
        path:'users-itr-payment-done',
        component:UsersItrPaymentDoneComponent,
      }
    ],

  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
