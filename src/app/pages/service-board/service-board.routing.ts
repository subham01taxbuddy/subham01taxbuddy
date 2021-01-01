import { PreparingItrComponent } from './preparing-itr/preparing-itr.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DocUploadedComponent } from './doc-uploaded/doc-uploaded.component';
import { ServiceBoardComponent } from './service-board.component';
import { AwatingConfirmationComponent } from './awating-confirmation/awating-confirmation.component';
import { InvoiceToBeGenerateComponent } from './invoice-to-be-generate/invoice-to-be-generate.component';
import { UnpaidInvoicesComponent } from './unpaid-invoices/unpaid-invoices.component';

const routes: Routes = [
    {
        path: '', component: ServiceBoardComponent,
        children: [
            { path: 'doc-uploaded', component: DocUploadedComponent },
            { path: 'preparing-itr', component: PreparingItrComponent },
            { path: 'awating-confirmation', component: AwatingConfirmationComponent },
            { path: 'invoice-to-be-generate', component: InvoiceToBeGenerateComponent },
            { path: 'unpaid-invoices', component: UnpaidInvoicesComponent },
            { path: '', redirectTo: 'doc-uploaded', pathMatch: 'full' }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ServiceBoardRoutingModule { }
