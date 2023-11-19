import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UxComponent } from './ux.component';
import {PersonalInfoComponent} from "./personal-info/personal-info.component";
import {SalaryComponent} from "./salary/salary.component";
import {BalanceSheetComponent} from "./balance-sheet/balance-sheet.component";
import {ExemptAllowanceComponent} from "./exempt-allowance/exempt-allowance.component";
import {HousePropertyComponent} from "./house-property/house-property.component";
import {InvestmentsDeductionsComponent} from "./investments-deductions/investments-deductions.component";
import {LandBuildingComponent} from "./land-building/land-building.component";
import {OtherAssetsComponent} from "./other-assets/other-assets.component";
import {OtherIncomeComponent} from "./other-income/other-income.component";
import {PresumptiveIncomeComponent} from "./presumptive-income/presumptive-income.component";
import {SecuritiesComponent} from "./securities/securities.component";
import { MoreInfoScheduleAlComponent } from './more-info-schedule-al/more-info-schedule-al.component';
import {SpeculativeIncomeComponent} from "./speculative-income/speculative-income.component";

const routes: Routes = [
  { path: '', component: UxComponent },
  { path: 'personal-info', component: PersonalInfoComponent },
  { path: 'salary', component: SalaryComponent },
  { path: 'balance-sheet', component: BalanceSheetComponent },
  { path: 'exempt-allowance', component: ExemptAllowanceComponent },
  { path: 'house-property', component: HousePropertyComponent },
  { path: 'investments', component: InvestmentsDeductionsComponent },
  { path: 'land-building', component: LandBuildingComponent },
  { path: 'other-assets', component: OtherAssetsComponent },
  { path: 'other-income', component: OtherIncomeComponent},
  { path: 'presumptive-income', component: PresumptiveIncomeComponent},
  { path: 'speculative-income', component: SpeculativeIncomeComponent},
  { path: 'securities', component: SecuritiesComponent},
  { path: 'more-info-schedule-al', component: MoreInfoScheduleAlComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UxRoutingModule { }
