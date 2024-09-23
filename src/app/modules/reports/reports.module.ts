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
import { RevenueReportComponent } from './revenue-report/revenue-report.component';
import { PayoutReportComponent } from './payout-report/payout-report.component';
import { UsersItrPaymentDoneComponent } from './users-itr-payment-done/users-itr-payment-done.component';
import { PaymentReceivedComponent } from './payment-received/payment-received.component';
import { ProformaInvoiceComponent } from './proforma-invoice/proforma-invoice.component';
import { TdsReportComponent } from './tds-report/tds-report.component';
import { MissedInboundCallListComponent } from './missed-inbound-call-list/missed-inbound-call-list.component';
import { MissedChatListComponent } from './missed-chat-list/missed-chat-list.component';
import { DailySignUpReportComponent } from './daily-sign-up-report/daily-sign-up-report.component';
import { CustomerSignUpComponent } from './customer-sign-up/customer-sign-up.component';
import { FillingDonePaymentNotReceivedComponent } from './filling-done-payment-not-received/filling-done-payment-not-received.component';
import { DocumentsUploadedFilingNotDoneComponent } from './documents-uploaded-filing-not-done/documents-uploaded-filing-not-done.component';
import { ViewCallDetailsComponent } from './calling-reports/daily-calling-report/view-call-details/view-call-details.component';
import { ViewChatLinksComponent } from './missed-chat-report/view-chat-links/view-chat-links.component';
import { ClientAddedFilingNotDoneComponent } from './client-added-filing-not-done/client-added-filing-not-done.component';
import { FilingSlaComponent } from './filing-sla/filing-sla.component';
import { PrefillUploadedSummaryNotSentComponent } from './prefill-uploaded-summary-not-sent/prefill-uploaded-summary-not-sent.component';
import { ItrFiledUsersComponent } from './itr-filed-users/itr-filed-users.component';
import { TransactionComponent } from './transaction/transaction.component';

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
        RevenueReportComponent,
        PayoutReportComponent,
        UsersItrPaymentDoneComponent,
        PaymentReceivedComponent,
        ProformaInvoiceComponent,
        TdsReportComponent,
        MissedInboundCallListComponent,
        MissedChatListComponent,
        DailySignUpReportComponent,
        CustomerSignUpComponent,
        FillingDonePaymentNotReceivedComponent,
        DocumentsUploadedFilingNotDoneComponent,
        ViewCallDetailsComponent,
        ViewChatLinksComponent,
        ClientAddedFilingNotDoneComponent,
        FilingSlaComponent,
        PrefillUploadedSummaryNotSentComponent,
        ItrFiledUsersComponent,
        TransactionComponent
    ],
    providers: [JsonToCsvService]
})
export class ReportsModule { }
