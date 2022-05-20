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
import { SumaryDialogComponent } from "./components/sumary-dialog/sumary-dialog.component";
import { Itr4partComponent } from "./components/itr4part/itr4part.component";
import { Itr2mainComponent } from "./components/itr2main/itr2main.component";
import { NewItrSummaryComponent } from "./components/new-itr-summary/new-itr-summary.component";
import { ItrOneComponent } from "./components/new-itr-summary/itr-one/itr-one.component";
import { ItrThreeComponent } from "./components/new-itr-summary/itr-three/itr-three.component";
import { TaxSummaryComponent } from "./components/tax-summary/tax-summary.component";

@NgModule({
    declarations: [
        DirectFilingComponent,
        AddClientComponent,
        PrefillDataComponent,
        GenerateSummaryComponent,
        SubmitFilingComponent,
        EVerifyComponent,
        // TaxSummaryComponent

        TaxSummaryComponent,
        SumaryDialogComponent,
        Itr4partComponent,
        Itr2mainComponent,
        NewItrSummaryComponent,
        ItrOneComponent,
        ItrThreeComponent
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