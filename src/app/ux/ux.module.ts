import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UxRoutingModule } from './ux-routing.module';
import { UxComponent } from './ux.component';
import { SalaryComponent } from './salary/salary.component';
import { HousePropertyComponent } from './house-property/house-property.component';
import { OtherIncomeComponent } from './other-income/other-income.component';
import { ExemptAllowanceComponent } from './exempt-allowance/exempt-allowance.component';
import { LandBuildingComponent } from './land-building/land-building.component';
import { OtherAssetsComponent } from './other-assets/other-assets.component';
import { SecuritiesComponent } from './securities/securities.component';
import { PresumptiveIncomeComponent } from './presumptive-income/presumptive-income.component';
import { SpeculativeIncomeComponent } from './speculative-income/speculative-income.component';
import { BalanceSheetComponent } from './balance-sheet/balance-sheet.component';
import { InvestmentsDeductionsComponent } from './investments-deductions/investments-deductions.component';
import {PersonalInfoComponent} from "./personal-info/personal-info.component";
import { MoreInfoScheduleAlComponent } from './more-info-schedule-al/more-info-schedule-al.component';
import { MoreInfoCflComponent } from './more-info-cfl/more-info-cfl.component';
import { CgUnlistedSecurityComponent } from './cg-unlisted-security/cg-unlisted-security.component';
import { CgBondsDebtsComponent } from './cg-bonds-debts/cg-bonds-debts.component';
import { CgZeroCouponsComponent } from './cg-zero-coupons/cg-zero-coupons.component';

@NgModule({
  declarations: [
    UxComponent,
    PersonalInfoComponent,
    SalaryComponent,
    HousePropertyComponent,
    OtherIncomeComponent,
    ExemptAllowanceComponent,
    LandBuildingComponent,
    OtherAssetsComponent,
    SecuritiesComponent,
    PresumptiveIncomeComponent,
    SpeculativeIncomeComponent,
    BalanceSheetComponent,
    InvestmentsDeductionsComponent,
    MoreInfoScheduleAlComponent,
    MoreInfoCflComponent,
    CgUnlistedSecurityComponent,
    CgBondsDebtsComponent,
    CgZeroCouponsComponent,
  ],
  imports: [
    CommonModule,
    UxRoutingModule
  ]
})
export class UxModule { }
