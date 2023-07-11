import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PayoutsComponent } from './payouts.component';
import { PayProcessingComponent } from './pay-processing/pay-processing.component';
import { PayoutAdjustmentComponent } from './payout-adjustment/payout-adjustment.component';

const routes: Routes = [
  { path: '', component: PayoutsComponent },
  { path:'pay-processing',component:PayProcessingComponent},
  { path:'payouts-adjustments',component:PayoutAdjustmentComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PayoutsRoutingModule { }
