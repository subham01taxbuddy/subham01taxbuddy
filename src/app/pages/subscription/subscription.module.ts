import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "app/shared/material.module";
import { SharedModule } from "app/shared/shared.module";
import { NgxLoadingModule } from "ngx-loading";
import { SubscriptionDetailComponent } from './subscription-detail/subscription-detail.component';
import { SubscriptionRoutingModule } from "./subscription-routing.module";
import { AddNewPlanComponent } from './add-new-plan/add-new-plan.component';
import { AddSubscriptionComponent } from './add-subscription/add-subscription.component';
import { SubscriptionHeadComponent } from './subscription-head/subscription-head.component';
import { AddInvoiceComponent } from "./add-invoice/add-invoice.component";
import { InvoicesStatusComponent } from "./invoices-status/invoices-status.component";
import { InvoiceDialogComponent } from "./invoice-dialog/invoice-dialog.component";
import { OwlDateTimeModule } from "ng-pick-datetime/date-time/date-time.module";
import { OwlNativeDateTimeModule } from "ng-pick-datetime/date-time/adapter/native-date-time.module";
import { MySubscriptionComponent } from './my-subscription/my-subscription.component';
import { MainSubsciptionComponent } from './main-subsciption/main-subsciption.component';
import { TeamSubscriptionsComponent } from './team-subscriptions/team-subscriptions.component';

@NgModule({
    declarations: [SubscriptionDetailComponent, AddNewPlanComponent, AddSubscriptionComponent, SubscriptionHeadComponent,
        AddInvoiceComponent, InvoicesStatusComponent, InvoiceDialogComponent, MySubscriptionComponent, MainSubsciptionComponent, TeamSubscriptionsComponent],
    imports:[
        SubscriptionRoutingModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        SharedModule,
        MaterialModule,
        NgxLoadingModule.forRoot({}),
        OwlDateTimeModule, 
        OwlNativeDateTimeModule
    ],
    entryComponents:[AddSubscriptionComponent, InvoiceDialogComponent]
})

export class SubscriptionModule{}