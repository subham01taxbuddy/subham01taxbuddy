import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GstCloudComponent } from './gst-cloud/gst-cloud.component';
import { GstFilingComponent } from './gst-filing.component';

const routes: Routes = [
    {
        path: '', component: GstFilingComponent,
        children: [
            { path: 'cloud', component: GstCloudComponent },
            { path: '', redirectTo: '/pages/gst-filing/cloud', pathMatch: 'full' }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class GstFilingRoutingModule { }
