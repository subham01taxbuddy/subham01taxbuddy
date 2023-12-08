import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { SharedModule } from "src/app/modules/shared/shared.module";
import { NgxLoadingModule } from "ngx-loading";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { EriFlowRoutingModule } from "./eri-flow.routing";
import { AddClientComponent } from "./components/add-client/add-client.component";
import { PrefillDataComponent } from "./components/prefill-data/prefill-data.component";
import { EVerifyComponent } from "./components/e-verify/e-verify.component";
import { ItrSharedModule } from "../itr-shared/itr-shared.module";
import {PagesModule} from "../../pages/pages.module";

@NgModule({
    declarations: [
        AddClientComponent,
        PrefillDataComponent,
        EVerifyComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        EriFlowRoutingModule,
        NgxLoadingModule.forRoot({}),
        ItrSharedModule,
        PagesModule
    ]
})

export class EriFlowModule { }
