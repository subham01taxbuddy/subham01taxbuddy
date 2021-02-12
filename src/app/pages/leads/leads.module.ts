import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "app/shared/material.module";
import { SharedModule } from "app/shared/shared.module";
import { NgxLoadingModule } from "ngx-loading";
import { LeadsRoutingModule } from "./leads-routing.module";
import { LeadsInfoComponent } from './leads-info/leads-info.component';
import { LeadsHeadComponent } from './leads-head/leads-head.component';
import { LeadDialogComponent } from './lead-dialog/lead-dialog.component';
import { OwlDateTimeModule } from "ng-pick-datetime/date-time/date-time.module";
import { OwlNativeDateTimeModule } from "ng-pick-datetime/date-time/adapter/native-date-time.module";

@NgModule({
    declarations: [LeadsInfoComponent, LeadsHeadComponent, LeadDialogComponent],
    imports: [
        LeadsRoutingModule,
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
    entryComponents: [LeadDialogComponent]
})
export class LeadsModule{ }