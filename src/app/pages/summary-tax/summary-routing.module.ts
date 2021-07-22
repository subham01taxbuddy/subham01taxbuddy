import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { TaxSummaryComponent } from "./tax-summary/tax-summary.component";
import { Itr2mainComponent } from "./itr2main/itr2main.component";
import { SummaryTaxComponent } from "./summary-tax/summary-tax.component";
;

const routes: Routes = [
    { path: '', component: SummaryTaxComponent,
    children: [
        // { path: '', component: TaxSummaryComponent},
        { path: 'itrFirst', component: TaxSummaryComponent},
        { path: 'itrSecond', component: Itr2mainComponent },
        { path: '', redirectTo: '/pages/tax-summary/itrFirst', pathMatch: 'full' }
    ]},
    
   
]
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class SummaryRoutingModule {}