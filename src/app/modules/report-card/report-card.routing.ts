import { ReportCardComponent } from './report-card.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SmeComponent } from './pages/sme/sme.component';

const routes: Routes = [
  {
    path: '', component: ReportCardComponent,
    children: [
      { path: 'sme', component: SmeComponent },
      { path: '', redirectTo: '/report-card/sme', pathMatch: 'full' }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportCardRoutingModule { }
