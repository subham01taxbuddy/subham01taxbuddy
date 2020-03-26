import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { SharedModule } from "app/shared/shared.module";
import { NgxLoadingModule } from "ngx-loading";
import { invoiceRoutingModule } from "./invoice-routing.module";
import { InvoicesComponent } from './invoices/invoices.component';
import { InvoicesStatusComponent } from './invoices/invoices-status/invoices-status.component';
import { AddInvoiceComponent } from "./invoices/add-invoice/add-invoice.component";

@NgModule({
    declarations:[AddInvoiceComponent, InvoicesComponent, InvoicesStatusComponent],
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