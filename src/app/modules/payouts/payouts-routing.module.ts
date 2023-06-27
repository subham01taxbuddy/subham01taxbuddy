import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PayoutsComponent } from './payouts.component';
import { PayProcessingComponent } from './pay-processing/pay-processing.component';

const routes: Routes = [
  { path: '', component: PayoutsComponent },
  { path:'pay-processing',component:PayProcessingComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PayoutsRoutingModule { }
