import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { Itr2mainComponent } from "./components/itr2main/itr2main.component";
import { ItrOneComponent } from "./components/new-itr-summary/itr-one/itr-one.component";
import { ItrThreeComponent } from "./components/new-itr-summary/itr-three/itr-three.component";
import { NewItrSummaryComponent } from "./components/new-itr-summary/new-itr-summary.component";
import { TaxSummaryComponent } from "./components/tax-summary/tax-summary.component";
import { DirectFilingComponent } from "./pages/direct-filing/direct-filing.component";

const routes: Routes = [
    {
        path: '', component: DirectFilingComponent,
        children: [
            { path: 'direct-filing', component: DirectFilingComponent ,
                
                children: [
                    { path: 'itrFirst', component: TaxSummaryComponent },
                    { path: 'itrSecond', component: Itr2mainComponent },
                    {
                        path: 'new-summary', component: NewItrSummaryComponent,
                        children: [
                            { path: 'itr-one', component: ItrOneComponent },
                            { path: 'itr-three', component: ItrThreeComponent }
                        ]
                    },
                ]
            },
            
        ]
    },
    { path: '', redirectTo: '/eri/direct-filing', pathMatch: 'full' }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class EriFlowRoutingModule { }