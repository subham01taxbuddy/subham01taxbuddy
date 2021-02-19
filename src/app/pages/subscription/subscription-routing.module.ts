import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SubscriptionDetailComponent } from "./subscription-detail/subscription-detail.component";

const routes : Routes = [
    {path:'', component: SubscriptionDetailComponent}
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SubscriptionRoutingModule{}