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
import { MoreInfoCflComponent } from './more-info-cfl/more-info-cfl.component';
import { CgZeroCouponsComponent } from './cg-zero-coupons/cg-zero-coupons.component';
import {CgUnlistedSecurityComponent } from './cg-unlisted-security/cg-unlisted-security.component';
import {CgBondsDebtsComponent} from './cg-bonds-debts/cg-bonds-debts.component';
import {SpeculativeIncomeComponent} from "./speculative-income/speculative-income.component";
import { ScheduleFsiComponent } from '../modules/itr-filing/itr-wizard/pages/schedule-fsi/schedule-fsi.component';
import { ScheduleTrComponent } from './schedule-tr/schedule-tr.component';
import { ScheduleFaComponent } from './schedule-fa/schedule-fa.component';
import { ScheduleVdaComponent } from './schedule-vda/schedule-vda.component';
import { ListScheduleComponent } from './list-schedule/list-schedule.component';

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
  { path: 'more-info-cfl', component: MoreInfoCflComponent},
  { path: 'cg-bonds-debts', component: CgBondsDebtsComponent},
  { path: 'cg-unlisted-security', component: CgUnlistedSecurityComponent},
  { path: 'cg-zero-coupons', component: CgZeroCouponsComponent},
  { path: 'schedule-fsi', component: ScheduleFsiComponent},
  { path: 'schedule-tr', component: ScheduleTrComponent},
  { path: 'schedule-fa', component: ScheduleFaComponent},
  { path: 'schedule-vda', component: ScheduleVdaComponent},
  { path: 'list-schedule', component: ListScheduleComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UxRoutingModule { }
