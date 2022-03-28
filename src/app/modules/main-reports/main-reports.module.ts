import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { NgxLoadingModule } from "ngx-loading";
import { ChartModule } from 'angular-highcharts';
import { MainReportsRoutingModule } from "./main-reports-routing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { EmailReportsComponent } from "./pages/email-reports/email-reports.component";
import { SharedModule } from "src/app/modules/shared/shared.module";
import { MainReportsComponent } from "./pages/main-reports/main-reports.component";
import { KnowlarityReportComponent } from "./pages/knowlarity-report/knowlarity-report.component";
import { RepoBySmeNameComponent } from "./pages/knowlarity-report/repo-by-sme-name/repo-by-sme-name.component";
import { RepoByAgentNameComponent } from "./pages/knowlarity-report/repo-by-agent-name/repo-by-agent-name.component";
import { ItrFillingReportComponent } from "./pages/itr-filling-report/itr-filling-report.component";
import { MissedChatReportComponent } from "./pages/missed-chat-report/missed-chat-report.component";
import { SmewiseReportComponent } from "./pages/itr-filling-report/smewise-report/smewise-report.component";
import { AllFilingReportComponent } from "./pages/itr-filling-report/all-filing-report/all-filing-report.component";
import { InvoiceFailedReportComponent } from "./pages/invoice-failed/invoice-failed.component";
import { SmeTlWiseReportComponent } from "./pages/invoice-failed/sme-tl-wise/sme-tl-wise-report.component";
import { DetailReportComponent } from "./pages/invoice-failed/detail-report/detail-report.component";
import { FilingDashboardComponent } from "./pages/itr-filling-report/filing-dashboard/filing-dashboard.component";
import { SpamTableComponent } from "./pages/spam-table/spam-table.component";
import { UserChatsComponent } from "./pages/spam-table/user-chats/user-chats.component";
import { MissedInbondCallsComponent } from "./pages/knowlarity-report/missed-inbond-calls/missed-inbond-calls.component";
import { LastYearFilingComponent } from "./pages/itr-filling-report/last-year-filing/last-year-filing.component";

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
        MissedInbondCallsComponent,
        LastYearFilingComponent,
        EmailReportsComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MainReportsRoutingModule,
        SharedModule,
        ChartModule,
    ],
    entryComponents: [UserChatsComponent]
})

export class MainReportsModule { }