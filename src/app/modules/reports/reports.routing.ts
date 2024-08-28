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
import { PaymentReceivedComponent } from './payment-received/payment-received.component';
import { ProformaInvoiceComponent } from './proforma-invoice/proforma-invoice.component';
import { TdsReportComponent } from './tds-report/tds-report.component';
import { MissedChatListComponent } from './missed-chat-list/missed-chat-list.component';
import { MissedInboundCallListComponent } from './missed-inbound-call-list/missed-inbound-call-list.component';
import { DailySignUpReportComponent } from './daily-sign-up-report/daily-sign-up-report.component';
import { CustomerSignUpComponent } from './customer-sign-up/customer-sign-up.component';
import { FillingDonePaymentNotReceivedComponent } from './filling-done-payment-not-received/filling-done-payment-not-received.component';
import { DocumentsUploadedFilingNotDoneComponent } from './documents-uploaded-filing-not-done/documents-uploaded-filing-not-done.component';
import { ClientAddedFilingNotDoneComponent } from './client-added-filing-not-done/client-added-filing-not-done.component';
import { FilingSlaComponent } from './filing-sla/filing-sla.component';
import { PrefillUploadedSummaryNotSentComponent } from './prefill-uploaded-summary-not-sent/prefill-uploaded-summary-not-sent.component';
import { ItrFiledUsersComponent } from './itr-filed-users/itr-filed-users.component';
import { TransactionComponent } from './transaction/transaction.component';


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
      },
      {
        path:'payment-received',
        component: PaymentReceivedComponent,
      },
      {
        path:'itr-filed-users',
        component: ItrFiledUsersComponent,
      },
      {
        path:'proforma-invoice',
        component:ProformaInvoiceComponent,
      },
      {
        path:'tds-report',
        component:TdsReportComponent,
      },
      {
        path: 'missed-inbound-calls-list',
        component: MissedInboundCallListComponent,
      },
      {
        path: 'missed-chat-list',
        component: MissedChatListComponent,
      },
      {
        path: 'daily-sign-up-report',
        component: DailySignUpReportComponent,
      },
      {
        path:'customer-sign-up',
        component:CustomerSignUpComponent,
      },
      {
        path:'filling-done-payment-not-received',
        component:FillingDonePaymentNotReceivedComponent,
      },
      {
        path:'documents-uploaded-filing-not-done',
        component:DocumentsUploadedFilingNotDoneComponent,
      },
      {
        path:'client-added-filing-not-done',
        component:ClientAddedFilingNotDoneComponent,
      },
      {
        path:'filing-sla',
        component:FilingSlaComponent,
      },
      {
        path:'prefill-uploaded-pending-summary',
        component:PrefillUploadedSummaryNotSentComponent,
      },
      {
        path:'transaction-report',
        component:TransactionComponent,
      }
    ],

  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
