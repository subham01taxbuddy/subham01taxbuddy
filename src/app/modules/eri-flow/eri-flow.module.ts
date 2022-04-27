import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { SharedModule } from "src/app/modules/shared/shared.module";
import { NgxLoadingModule } from "ngx-loading";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { EriFlowRoutingModule } from "./eri-flow.routing";
import { DirectFilingComponent } from "./pages/direct-filing/direct-filing.component";
import { AddClientComponent } from "./components/add-client/add-client.component";
import { PrefillDataComponent } from "./components/prefill-data/prefill-data.component";
import { GenerateSummaryComponent } from "./components/generate-summary/generate-summary.component";
import { SubmitFilingComponent } from "./components/submit-filing/submit-filing.component";
import { EVerifyComponent } from "./components/e-verify/e-verify.component";
import { TaxSummaryComponent } from "src/app/pages/summary-tax/tax-summary/tax-summary.component";

@NgModule({
    declarations: [
        DirectFilingComponent,
        AddClientComponent,
        PrefillDataComponent,
        GenerateSummaryComponent,
        SubmitFilingComponent,
        EVerifyComponent,
        // TaxSummaryComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        EriFlowRoutingModule,
        NgxLoadingModule.forRoot({}),
    ],
})

export class EriFlowModule { }