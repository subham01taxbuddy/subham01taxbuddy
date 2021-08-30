import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { SharedModule } from "app/shared/shared.module";
import { NgxLoadingModule } from "ngx-loading";
import { MainReportsRoutingModule } from "./main-reports-routing";
import { MainReportsComponent } from './main-reports/main-reports.component';
import { KnowlarityReportComponent } from './knowlarity-report/knowlarity-report.component';
import { RepoBySmeNameComponent } from './knowlarity-report/repo-by-sme-name/repo-by-sme-name.component';
import { RepoByAgentNameComponent } from './knowlarity-report/repo-by-agent-name/repo-by-agent-name.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ItrFillingReportComponent } from './itr-filling-report/itr-filling-report.component';
import { MissedChatReportComponent } from './missed-chat-report/missed-chat-report.component';

@NgModule({
    declarations: [MainReportsComponent, KnowlarityReportComponent, RepoBySmeNameComponent, RepoByAgentNameComponent, ItrFillingReportComponent, MissedChatReportComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MainReportsRoutingModule,
        SharedModule,
        NgxLoadingModule.forRoot({}),
    ]
})

export class MainReportsModule {}