import { CreateUpdateSubscriptionComponent } from './components/assigned-subscription/create-update-subscription/create-update-subscription.component';
import { AssignedSubscriptionComponent } from './components/assigned-subscription/assigned-subscription.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionComponent } from './subscription.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { AgGridModule } from 'ag-grid-angular';
import { NgxLoadingModule } from 'ngx-loading';
import { NgxPaginationModule } from 'ngx-pagination';
import { MaterialModule } from '../shared/material.module';
import { SubscriptionRoutingModule } from './subscription-routing.module';
import { SharedModule } from '../shared/shared.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PerformaInvoiceComponent } from './components/performa-invoice/performa-invoice.component';
import { TaxInvoiceComponent } from './components/tax-invoice/tax-invoice.component';
import { AddSubscriptionComponent } from './components/assigned-subscription/add-subscription/add-subscription.component';
import { OldInvoicesComponent } from './components/old-invoices/old-invoices.component';
import {PauseInvoiceReminderComponent} from "./components/pause-invoice-reminder/pause-invoice-reminder.component";
import { CancelSubscriptionComponent } from './components/cancel-subscription/cancel-subscription.component';
import { ApproveRejectComponent } from './components/approve-reject/approve-reject.component';
import { RefundRequestComponent } from './components/refund-request/refund-request.component';
import { AngularFireRemoteConfigModule } from '@angular/fire/compat/remote-config';
import { MobileEncryptDecryptService } from 'src/app/services/mobile-encr-decr.service';
import { RemoteConfigService } from 'src/app/services/remote-config-service';
import { CreditNoteComponent } from './components/credit-note/credit-note.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxLoadingModule.forRoot({}),
    AgGridModule,
    MaterialModule,
    NgxPaginationModule,
    MatCardModule,
    SubscriptionRoutingModule,
    MatFormFieldModule,
    SharedModule,
    AngularFireRemoteConfigModule

  ],
  declarations: [
    SubscriptionComponent,
    AssignedSubscriptionComponent,
    CreateUpdateSubscriptionComponent,
    PerformaInvoiceComponent,
    TaxInvoiceComponent,
    AddSubscriptionComponent,
    OldInvoicesComponent,
    PauseInvoiceReminderComponent,
    CancelSubscriptionComponent,
    ApproveRejectComponent,
    RefundRequestComponent,
    CreditNoteComponent
  ],
  providers:[
    MobileEncryptDecryptService,
    RemoteConfigService
  ]
})
export class SubscriptionModule { }
