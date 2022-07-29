import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { EmailReportsComponent } from './pages/email-reports/email-reports.component';
import { DetailReportComponent } from "./pages/invoice-failed/detail-report/detail-report.component";
import { InvoiceFailedReportComponent } from "./pages/invoice-failed/invoice-failed.component";
import { SmeTlWiseReportComponent } from "./pages/invoice-failed/sme-tl-wise/sme-tl-wise-report.component";
import { AllFilingReportComponent } from "./pages/itr-filling-report/all-filing-report/all-filing-report.component";
import { FilingDashboardComponent } from "./pages/itr-filling-report/filing-dashboard/filing-dashboard.component";
import { ItrFillingReportComponent } from "./pages/itr-filling-report/itr-filling-report.component";
import { LastYearFilingComponent } from "./pages/itr-filling-report/last-year-filing/last-year-filing.component";
import { SmewiseReportComponent } from "./pages/itr-filling-report/smewise-report/smewise-report.component";
import { KnowlarityReportComponent } from "./pages/knowlarity-report/knowlarity-report.component";
import { MissedInbondCallsComponent } from "./pages/knowlarity-report/missed-inbond-calls/missed-inbond-calls.component";
import { RepoByAgentNameComponent } from "./pages/knowlarity-report/repo-by-agent-name/repo-by-agent-name.component";
import { RepoBySmeNameComponent } from "./pages/knowlarity-report/repo-by-sme-name/repo-by-sme-name.component";
import { MainReportsComponent } from "./pages/main-reports/main-reports.component";
import { MissedChatReportComponent } from "./pages/missed-chat-report/missed-chat-report.component";
import { SpamTableComponent } from "./pages/spam-table/spam-table.component";
import { StatusWiseCountComponent } from "./pages/status-wise-count/status-wise-count.component";

const routes: Routes = [
    {
        path: '', component: MainReportsComponent,
        children: [
            {
                path: 'knowlarity-repo', component: KnowlarityReportComponent,
                children: [
                    { path: 'sme-wise', component: RepoBySmeNameComponent },
                    { path: 'agent-wise', component: RepoByAgentNameComponent },
                    { path: 'missed-inbond-calls', component: MissedInbondCallsComponent },
                    { path: '', redirectTo: 'sme-wise', pathMatch: '' }
                ]
            },
            {
                path: 'itr-filing', component: ItrFillingReportComponent,
                children: [
                    { path: 'sme-wise', component: SmewiseReportComponent },
                    { path: 'all', component: AllFilingReportComponent },
                    { path: 'filing-dashboard', component: FilingDashboardComponent },
                    { path: 'last-year', component: LastYearFilingComponent },
                    { path: '', redirectTo: 'sme-wise', pathMatch: '' }
                ]
            },
            {
                path: 'invoice', component: InvoiceFailedReportComponent,
                children: [
                    { path: 'sme-tl', component: SmeTlWiseReportComponent },
                    { path: 'details', component: DetailReportComponent },
                    { path: '', redirectTo: 'sme-tl', pathMatch: '' }
                ]
            },
            { path: 'missed-chat', component: MissedChatReportComponent },
            { path: 'spam-report', component: SpamTableComponent },
            { path: 'email-me', component: EmailReportsComponent },
            { path: 'status-wise-count', component: StatusWiseCountComponent },
            { path: '', redirectTo: 'knowlarity-repo', pathMatch: '' }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class MainReportsRoutingModule { }