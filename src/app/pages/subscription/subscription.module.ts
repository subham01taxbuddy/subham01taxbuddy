import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "app/shared/material.module";
import { SharedModule } from "app/shared/shared.module";
import { NgxLoadingModule } from "ngx-loading";
import { SubscriptionDetailComponent } from './subscription-detail/subscription-detail.component';
import { SubscriptionRoutingModule } from "./subscription-routing.module";

@NgModule({
    declarations: [SubscriptionDetailComponent],
    imports:[
        SubscriptionRoutingModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        SharedModule,
        MaterialModule,
        NgxLoadingModule.forRoot({}),
    ],

})

export class SubscriptionModule{}