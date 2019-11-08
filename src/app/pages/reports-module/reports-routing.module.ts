import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportsComponent } from './reports.component';
import { UserGstStatusReportComponent } from './user-gst-status-report/user-gst-status-report.component';

const routes: Routes = [
    {
        path: '',
        component: ReportsComponent,
    },
    {
        path: 'user-gst-status-report',
        component: UserGstStatusReportComponent,

    }

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ReportsRoutingModule { }
