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
import { InvoiceDialogComponent } from './invoices/invoice-dialog/invoice-dialog.component';
// import { UpdateStatusComponent } from "../itr-filing/update-status/update-status.component";

@NgModule({
    declarations: [AddInvoiceComponent, InvoicesComponent, InvoicesStatusComponent, InvoiceDialogComponent, /* UpdateStatusComponent */],
    imports: [
        invoiceRoutingModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        SharedModule,
        NgxLoadingModule.forRoot({}),
    ],
    entryComponents: [InvoiceDialogComponent]
})
export class InvoiceModule { }