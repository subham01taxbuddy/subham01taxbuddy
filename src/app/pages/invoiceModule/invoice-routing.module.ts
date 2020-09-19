import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AddInvoiceComponent } from "./invoices/add-invoice/add-invoice.component";
import { InvoicesStatusComponent } from "./invoices/invoices-status/invoices-status.component";
import { InvoicesComponent } from "./invoices/invoices.component";

const routes: Routes = [
    {
        path: '', component: InvoicesComponent,
        children: [
            { path: 'generate', component: AddInvoiceComponent },
            { path: 'list', component: InvoicesStatusComponent },
            { path: '', redirectTo: '/pages/invoice/generate', pathMatch: 'full' }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class invoiceRoutingModule { }