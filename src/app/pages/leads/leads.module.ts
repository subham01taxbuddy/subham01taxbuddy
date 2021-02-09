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

@NgModule({
    declarations: [LeadsInfoComponent, LeadsHeadComponent],
    imports: [
        LeadsRoutingModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        SharedModule,
        MaterialModule,
        NgxLoadingModule.forRoot({}),
    ]
})
export class LeadsModule{ }