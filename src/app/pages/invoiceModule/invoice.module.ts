import { NgModule } from "@angular/core";
import { AddInvoiceComponent } from './add-invoice/add-invoice.component';
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { SharedModule } from "app/shared/shared.module";
import { NgxLoadingModule } from "ngx-loading";
import { invoiceRoutingModule } from "./invoice-routing.module";

@NgModule({
    declarations:[AddInvoiceComponent],
    imports:[
        invoiceRoutingModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        SharedModule,
        NgxLoadingModule.forRoot({}),
    ]
})
export class InvoiceModule {}