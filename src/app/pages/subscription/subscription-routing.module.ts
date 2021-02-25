import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AddNewPlanComponent } from "./add-new-plan/add-new-plan.component";
import { SubscriptionDetailComponent } from "./subscription-detail/subscription-detail.component";

const routes : Routes = [
    {path:'', component: SubscriptionDetailComponent},
    {path:'sub/:subscriptionId', component: AddNewPlanComponent}   ///:id    //AddNewPlanComponent
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SubscriptionRoutingModule{}