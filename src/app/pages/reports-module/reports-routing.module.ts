import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportsComponent } from './reports.component';
import { UserGstStatusReportComponent } from './user-gst-status-report/user-gst-status-report.component';
import { Gstr1Component } from './gstr1/gstr1.component';

const routes: Routes = [
    {
        path: '', component: ReportsComponent,
        children: [
            { path: 'user-gst-status-report', component: UserGstStatusReportComponent },
            { path: 'gstr1', component: Gstr1Component },
            { path: '', redirectTo: 'user-gst-status-report', pathMatch: 'full' }
        ]
    },

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ReportsRoutingModule { }
