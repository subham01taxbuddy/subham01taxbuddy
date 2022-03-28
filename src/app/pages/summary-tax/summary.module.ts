import { NgModule } from "@angular/core";
import { TaxSummaryComponent } from './tax-summary/tax-summary.component';
import { SummaryRoutingModule } from "./summary-routing.module";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { NgxLoadingModule } from "ngx-loading";
import { SumaryDialogComponent } from './sumary-dialog/sumary-dialog.component';
import { Itr4partComponent } from './itr4part/itr4part.component';
import { Itr2mainComponent } from './itr2main/itr2main.component';
import { SummaryTaxComponent } from './summary-tax/summary-tax.component';
import { NewItrSummaryComponent } from './new-itr-summary/new-itr-summary.component';
import { ItrOneComponent } from './new-itr-summary/itr-one/itr-one.component';
import { ItrThreeComponent } from './new-itr-summary/itr-three/itr-three.component';
import { SharedModule } from "src/app/modules/shared/shared.module";

@NgModule({
    declarations: [TaxSummaryComponent, SumaryDialogComponent, Itr4partComponent,
        Itr2mainComponent,
        SummaryTaxComponent, NewItrSummaryComponent, ItrOneComponent, ItrThreeComponent],
    imports: [
        SummaryRoutingModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        SharedModule,
        NgxLoadingModule.forRoot({}),

    ],
    entryComponents: [SumaryDialogComponent]
})

export class SummaryModule { }