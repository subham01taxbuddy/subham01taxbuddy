import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PayoutsRoutingModule } from './payouts-routing.module';
import { PayoutsComponent } from './payouts.component';
import {NgxLoadingModule} from "ngx-loading";
import {NgxPaginationModule} from "ngx-pagination";
import {AgGridModule} from "ag-grid-angular";
import {MaterialModule} from "../shared/material.module";
import {PagesModule} from "../../pages/pages.module";
import {SharedModule} from "../shared/shared.module";
import { PayProcessingComponent } from './pay-processing/pay-processing.component';


@NgModule({
  declarations: [
    PayoutsComponent,
    PayProcessingComponent
  ],
  imports: [
    CommonModule,
    PayoutsRoutingModule,
    NgxLoadingModule.forRoot({}),
    NgxPaginationModule,
    AgGridModule,
    MaterialModule,
    PagesModule,
    SharedModule
  ]
})
export class PayoutsModule { }
