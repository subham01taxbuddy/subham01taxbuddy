import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "src/app/modules/shared/material.module";
import { SharedModule } from "src/app/modules/shared/shared.module";
import { NgxLoadingModule } from "ngx-loading";
import { LeadsRoutingModule } from "./leads-routing.module";
import { LeadsInfoComponent } from './leads-info/leads-info.component';
import { LeadsHeadComponent } from './leads-head/leads-head.component';
import { LeadDialogComponent } from './lead-dialog/lead-dialog.component';

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
        // OwlDateTimeModule, 
        // OwlNativeDateTimeModule
    ],
    entryComponents: [LeadDialogComponent]
})
export class LeadsModule{ }