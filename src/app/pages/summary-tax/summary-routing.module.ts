import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { TaxSummaryComponent } from "./tax-summary/tax-summary.component";
import { Itr2mainComponent } from "./itr2main/itr2main.component";
import { SummaryTaxComponent } from "./summary-tax/summary-tax.component";
import { NewItrSummaryComponent } from "./new-itr-summary/new-itr-summary.component";
import { ItrOneComponent } from "./new-itr-summary/itr-one/itr-one.component";
;

const routes: Routes = [
    { path: '', component: SummaryTaxComponent,
    children: [
        // { path: '', component: TaxSummaryComponent},
        { path: 'itrFirst', component: TaxSummaryComponent},
        { path: 'itrSecond', component: Itr2mainComponent },
        { path: 'new-summary', component: NewItrSummaryComponent,
            children: [
                {path: 'itr-one', component: ItrOneComponent}
            ]
        },
        { path: '', redirectTo: '/pages/tax-summary/itrFirst', pathMatch: 'full' }
    ]},
    
   
]
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class SummaryRoutingModule {}