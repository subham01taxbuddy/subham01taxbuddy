import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PayoutsComponent } from './payouts.component';
import { PayProcessingComponent } from './pay-processing/pay-processing.component';
import { PayoutAdjustmentComponent } from './payout-adjustment/payout-adjustment.component';
import { PayoutAdjustmentReportComponent } from './payout-adjustment-report/payout-adjustment-report.component';

const routes: Routes = [
  { path: '', component: PayoutsComponent },
  { path:'pay-processing',component:PayProcessingComponent},
  { path:'payouts-adjustments',component:PayoutAdjustmentComponent},
  { path:'payouts-adjustment-report',component:PayoutAdjustmentReportComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PayoutsRoutingModule { }
