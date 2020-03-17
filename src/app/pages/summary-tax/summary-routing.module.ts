import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { TaxSummaryComponent } from "./tax-summary/tax-summary.component";

const routes: Routes = [
    { path: '', component: TaxSummaryComponent}
]
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class SummaryRoutingModule {}