import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { LeaderDashboardComponent } from './leader-dashboard/leader-dashboard.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'leader', component: LeaderDashboardComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
