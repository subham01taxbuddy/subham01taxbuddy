import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AddInvoiceComponent } from "./add-invoice/add-invoice.component";

const routes: Routes=[
    {path:'' ,component: AddInvoiceComponent}
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class invoiceRoutingModule {}