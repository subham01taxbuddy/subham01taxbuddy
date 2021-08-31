import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AllFilingReportComponent } from "./itr-filling-report/all-filing-report/all-filing-report.component";
import { ItrFillingReportComponent } from "./itr-filling-report/itr-filling-report.component";
import { SmewiseReportComponent } from "./itr-filling-report/smewise-report/smewise-report.component";
import { KnowlarityReportComponent } from "./knowlarity-report/knowlarity-report.component";
import { RepoByAgentNameComponent } from "./knowlarity-report/repo-by-agent-name/repo-by-agent-name.component";
import { RepoBySmeNameComponent } from "./knowlarity-report/repo-by-sme-name/repo-by-sme-name.component";
import { MainReportsComponent } from "./main-reports/main-reports.component";
import { MissedChatReportComponent } from "./missed-chat-report/missed-chat-report.component";

const routes: Routes = [
    {
        path: '', component: MainReportsComponent,
        children: [
            {
                path: 'knowlarity-repo', component: KnowlarityReportComponent,
                children: [
                    { path: 'sme-wise', component: RepoBySmeNameComponent },
                    { path: 'agent-wise', component: RepoByAgentNameComponent },
                    { path: '', redirectTo: 'sme-wise', pathMatch: '' }
                ]
            },
            {
                path: 'itr-filing', component: ItrFillingReportComponent,
                children: [
                    { path: 'sme-wise', component: SmewiseReportComponent },
                    { path: 'all', component: AllFilingReportComponent },
                    { path: '', redirectTo: 'sme-wise', pathMatch: '' }
                ]
            },
            { path: 'missed-chat', component: MissedChatReportComponent },
            { path: '', redirectTo: 'knowlarity-repo', pathMatch: '' }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class MainReportsRoutingModule { }