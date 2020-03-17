import { NgModule } from "@angular/core";
import { TaxSummaryComponent } from './tax-summary/tax-summary.component';
import { SummaryRoutingModule } from "./summary-routing.module";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { SharedModule } from "app/shared/shared.module";
import { NgxLoadingModule } from "ngx-loading";

@NgModule({
    declarations:[TaxSummaryComponent],
    imports:[
        SummaryRoutingModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        SharedModule,
        NgxLoadingModule.forRoot({}),
    ]
})

export class SummaryModule {}