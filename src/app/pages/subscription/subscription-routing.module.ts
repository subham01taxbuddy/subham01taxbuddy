import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AddInvoiceComponent } from "./add-invoice/add-invoice.component";
import { AddNewPlanComponent } from "./add-new-plan/add-new-plan.component";
import { InvoicesStatusComponent } from "./invoices-status/invoices-status.component";
import { MySubscriptionComponent } from "./my-subscription/my-subscription.component";
import { SubscriptionDetailComponent } from "./subscription-detail/subscription-detail.component";
import { SubscriptionHeadComponent } from "./subscription-head/subscription-head.component";

const routes: Routes = [
    // {path:'', component: SubscriptionDetailComponent},
    // {path:'sub/:subscriptionId', component: AddNewPlanComponent}  
    {
        path: '', component: SubscriptionHeadComponent,
        children: [
            { path: 'sub', component: SubscriptionDetailComponent },
            { path: 'invoices', component: InvoicesStatusComponent },
            { path: 'sub/:subscriptionId', component: AddNewPlanComponent },
            { path: 'add-invoice', component: AddInvoiceComponent },
            { path: 'my-sub', component: MySubscriptionComponent },
            { path: '', redirectTo: '/pages/subscription/sub', pathMatch: 'full' }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SubscriptionRoutingModule { }