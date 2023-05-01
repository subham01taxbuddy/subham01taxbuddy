import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import {OwnerDashboardComponent} from "./owner-dashboard/owner-dashboard.component";

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'owner', component: OwnerDashboardComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
