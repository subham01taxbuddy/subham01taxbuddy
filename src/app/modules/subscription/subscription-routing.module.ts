import { TaxInvoiceComponent } from './components/tax-invoice/tax-invoice.component';
import { AssignedSubscriptionComponent } from './components/assigned-subscription/assigned-subscription.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SubscriptionComponent } from './subscription.component';
import { CreateUpdateSubscriptionComponent } from './components/assigned-subscription/create-update-subscription/create-update-subscription.component';
import { PerformaInvoiceComponent } from './components/performa-invoice/performa-invoice.component';
import { AddSubscriptionComponent } from './components/assigned-subscription/add-subscription/add-subscription.component';
import { OldInvoicesComponent } from './components/old-invoices/old-invoices.component';
import {PauseInvoiceReminderComponent} from "./components/pause-invoice-reminder/pause-invoice-reminder.component";

// const routes: Routes = [{ path: '', component: SubscriptionComponent }];

const routes: Routes = [
  {
      path: '', component: SubscriptionComponent,
      children: [
          {path: 'assigned-subscription', component: AssignedSubscriptionComponent },
          {path :'create-subscription', component:CreateUpdateSubscriptionComponent},
          // {path :'add-subscription', component:AddSubscriptionComponent},
          {path :'proforma-invoice', component:PerformaInvoiceComponent},
          {path :'tax-invoice', component:TaxInvoiceComponent},
          {path :'old-invoices', component:OldInvoicesComponent},
          {path :'pause-reminders', component:PauseInvoiceReminderComponent},
          { path: '', redirectTo: '/subscription/assigned-subscription', pathMatch: 'full' }
      ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubscriptionRoutingModule { }
