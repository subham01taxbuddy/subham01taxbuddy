import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxLoadingModule } from "ngx-loading";
import { SubscriptionDetailComponent } from './subscription-detail/subscription-detail.component';
import { SubscriptionRoutingModule } from "./subscription-routing.module";
import { AddNewPlanComponent } from './add-new-plan/add-new-plan.component';
import { AddSubscriptionComponent } from './add-subscription/add-subscription.component';
import { SubscriptionHeadComponent } from './subscription-head/subscription-head.component';
import { AddInvoiceComponent } from "./add-invoice/add-invoice.component";
import { InvoicesStatusComponent } from "./invoices-status/invoices-status.component";
import { InvoiceDialogComponent } from "./invoice-dialog/invoice-dialog.component";
import { MySubscriptionComponent } from './my-subscription/my-subscription.component';
import { MainSubsciptionComponent } from './main-subsciption/main-subsciption.component';
import { TeamSubscriptionsComponent } from './team-subscriptions/team-subscriptions.component';
import { FilingCalendarComponent } from './filing-calendar/filing-calendar.component';
import { NgxPaginationModule } from "ngx-pagination";
import { CreditNotesComponent } from './credit-notes/credit-notes.component';
import { SharedModule } from "src/app/modules/shared/shared.module";
import { MaterialModule } from "src/app/modules/shared/material.module";

@NgModule({
    declarations: [SubscriptionDetailComponent, AddNewPlanComponent, AddSubscriptionComponent, SubscriptionHeadComponent,
        AddInvoiceComponent, InvoicesStatusComponent, InvoiceDialogComponent, MySubscriptionComponent, MainSubsciptionComponent, TeamSubscriptionsComponent, FilingCalendarComponent, CreditNotesComponent],
    imports: [
        SubscriptionRoutingModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        SharedModule,
        MaterialModule,
        NgxLoadingModule.forRoot({}),
        // OwlDateTimeModule,
        // OwlNativeDateTimeModule,
        NgxPaginationModule
    ],
    entryComponents: [AddSubscriptionComponent, InvoiceDialogComponent, FilingCalendarComponent]
})

export class SubscriptionModule { }