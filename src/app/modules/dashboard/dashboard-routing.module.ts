import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import {OwnerDashboardComponent} from "./owner-dashboard/owner-dashboard.component";
import {MainDashboardComponent} from "./main-dashboard/main-dashboard.component";
import {AttendanceReportComponent} from "./attendance-report/attendance-report.component";
import { LeaderDashboardComponent } from './leader-dashboard/leader-dashboard.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'owner', component: OwnerDashboardComponent },
  { path: 'main', component: MainDashboardComponent },
  { path: 'attendance', component: AttendanceReportComponent },
  { path: 'leader', component: LeaderDashboardComponent },
 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
