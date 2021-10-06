import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { SharedModule } from "app/shared/shared.module";
import { NgxLoadingModule } from "ngx-loading";
import { ChartModule } from 'angular-highcharts';
import { MainReportsRoutingModule } from "./main-reports-routing";
import { MainReportsComponent } from './main-reports/main-reports.component';
import { KnowlarityReportComponent } from './knowlarity-report/knowlarity-report.component';
import { RepoBySmeNameComponent } from './knowlarity-report/repo-by-sme-name/repo-by-sme-name.component';
import { RepoByAgentNameComponent } from './knowlarity-report/repo-by-agent-name/repo-by-agent-name.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ItrFillingReportComponent } from './itr-filling-report/itr-filling-report.component';
import { MissedChatReportComponent } from './missed-chat-report/missed-chat-report.component';
import { SmewiseReportComponent } from "./itr-filling-report/smewise-report/smewise-report.component";
import { AllFilingReportComponent } from "./itr-filling-report/all-filing-report/all-filing-report.component";
import { InvoiceFailedReportComponent } from "./invoice-failed/invoice-failed.component";
import { SmeTlWiseReportComponent } from "./invoice-failed/sme-tl-wise/sme-tl-wise-report.component";
import { DetailReportComponent } from "./invoice-failed/detail-report/detail-report.component";
import { FilingDashboardComponent } from "./itr-filling-report/filing-dashboard/filing-dashboard.component";
import { SpamTableComponent } from './spam-table/spam-table.component';
import { UserChatsComponent } from './spam-table/user-chats/user-chats.component';
import { MissedInbondCallsComponent } from './knowlarity-report/missed-inbond-calls/missed-inbond-calls.component';

@NgModule({
    declarations: [MainReportsComponent,
        KnowlarityReportComponent,
        RepoBySmeNameComponent,
        RepoByAgentNameComponent,
        ItrFillingReportComponent,
        MissedChatReportComponent,
        SmewiseReportComponent,
        AllFilingReportComponent,
        InvoiceFailedReportComponent,
        SmeTlWiseReportComponent,
        DetailReportComponent,
        FilingDashboardComponent,
        SpamTableComponent,
        UserChatsComponent,
        MissedInbondCallsComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MainReportsRoutingModule,
        SharedModule,
        ChartModule,
        NgxLoadingModule.forRoot({}),
    ],
    entryComponents: [UserChatsComponent]
})

export class MainReportsModule { }