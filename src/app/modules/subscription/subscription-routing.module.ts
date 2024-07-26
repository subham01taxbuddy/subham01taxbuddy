import { TaxInvoiceComponent } from './components/tax-invoice/tax-invoice.component';
import { AssignedSubscriptionComponent } from './components/assigned-subscription/assigned-subscription.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SubscriptionComponent } from './subscription.component';
import { CreateUpdateSubscriptionComponent } from './components/assigned-subscription/create-update-subscription/create-update-subscription.component';
import { PerformaInvoiceComponent } from './components/performa-invoice/performa-invoice.component';
import { OldInvoicesComponent } from './components/old-invoices/old-invoices.component';
import { PauseInvoiceReminderComponent } from "./components/pause-invoice-reminder/pause-invoice-reminder.component";
import { CancelSubscriptionComponent } from './components/cancel-subscription/cancel-subscription.component';
import { RefundRequestComponent } from './components/refund-request/refund-request.component';
import { CreditNoteComponent } from './components/credit-note/credit-note.component';
import { SubscriptionAdjustmentComponent } from './components/subscription-adjustment/subscription-adjustment.component';

const routes: Routes = [
  {
    path: '', component: SubscriptionComponent,
    children: [
      { path: 'assigned-subscription', component: AssignedSubscriptionComponent },
      { path: 'cancel-subscription', component: CancelSubscriptionComponent },
      { path: 'create-subscription', component: CreateUpdateSubscriptionComponent },
      // {path :'add-subscription', component:AddSubscriptionComponent},
      { path: 'proforma-invoice', component: PerformaInvoiceComponent },
      { path: 'tax-invoice', component: TaxInvoiceComponent },
      { path: 'old-invoices', component: OldInvoicesComponent },
      { path: 'pause-reminders', component: PauseInvoiceReminderComponent },
      { path: 'refund-request', component: RefundRequestComponent },
      { path: 'credit-note', component: CreditNoteComponent },
      { path: 'subscription-adjustment', component: SubscriptionAdjustmentComponent },
      { path: '', redirectTo: '/subscription/assigned-subscription', pathMatch: 'full' }
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubscriptionRoutingModule { }
