import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DirectFilingComponent } from "./pages/direct-filing/direct-filing.component";

const routes: Routes = [
    {
        path: '', component: DirectFilingComponent,
        children: [
            { path: 'direct-filing', component: DirectFilingComponent },
            { path: '', redirectTo: '/eri/direct-filing', pathMatch: 'full' }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class EriFlowRoutingModule { }