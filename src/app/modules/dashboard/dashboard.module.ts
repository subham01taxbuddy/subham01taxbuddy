import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { OwnerDashboardComponent } from './owner-dashboard/owner-dashboard.component';


@NgModule({
  declarations: [
    DashboardComponent,
    OwnerDashboardComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule { }
