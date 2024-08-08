import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ItrWizardComponent } from './itr-wizard/itr-wizard.component';
import { ShowUserDocumnetsComponent } from './show-user-documnets/show-user-documnets.component';
import { AddClientsComponent } from './itr-wizard/components/add-clients/add-clients.component';
import { PrefillIdComponent } from './itr-wizard/pages/prefill-id/prefill-id.component';
import { SourceOfIncomesComponent } from './itr-wizard/pages/source-of-incomes/source-of-incomes.component';
import { AllPersonalInformationComponent } from './itr-wizard/pages/all-personal-information/all-personal-information.component';
import { OtherIncomeComponent } from './other-income/other-income.component';
import { InvestmentsDeductionsComponent } from './itr-wizard/pages/investments-deductions/investments-deductions.component';
import { TaxesPaidComponent } from './itr-wizard/pages/taxes-paid/taxes-paid.component';
import { DeclarationComponent } from './declaration/declaration.component';
import { SalaryComponent } from './salary/salary.component';
import { HousePropertyComponent } from './house-property/house-property.component';
import { ForeignIncomeComponent } from './itr-wizard/pages/foreign-income/foreign-income.component';
import { AllBusinessIncomeComponent } from './itr-wizard/pages/all-business-income/all-business-income.component';
import { SummaryComponent } from './summary/summary.component';
import { CapitalGainComponent } from './itr-wizard/components/capital-gain/capital-gain.component';
import { OtherAssetsComponent } from './itr-wizard/components/capital-gain/other-assets/other-assets.component';
import { ZeroCouponBondsComponent } from './itr-wizard/components/zero-coupon-bonds/zero-coupon-bonds.component';
import { SharesAndEquityComponent } from './itr-wizard/pages/shares-and-equity/shares-and-equity.component';
import { ScheduleALComponent } from './itr-wizard/components/capital-gain/more-info/schedule-al/schedule-al.component';
import { MoreInformationComponent } from './itr-wizard/pages/more-information/more-information.component';
import { PresumptiveIncomeComponent } from './business-income/presumptive-income/presumptive-income.component';
import { BalanceSheetComponent } from './business-income/balance-sheet/balance-sheet.component';
import { ProfitLossAcComponent } from './business-income/profit-loss-ac/profit-loss-ac.component';
import { ScheduleCflComponent } from './itr-wizard/pages/schedule-cfl/schedule-cfl.component';
import { OldVsNewComponent } from './itr-wizard/components/old-vs-new/old-vs-new.component';
import { ValidationErrorScreenComponent } from '../shared/components/validation-error-screen/validation-error-screen.component';
import { ScheduleFsiComponent } from './itr-wizard/pages/schedule-fsi/schedule-fsi.component';
import { ScheduleTrComponent } from './itr-wizard/pages/schedule-tr/schedule-tr.component';
import { ScheduleFaComponent } from './itr-wizard/pages/schedule-fa/schedule-fa.component';
import { CryptoVdaComponent } from './itr-wizard/pages/crypto-vda/crypto-vda.component';
import { PartnerInFirmsComponent } from './itr-wizard/pages/partner-in-firms/partner-in-firms.component';
import { ExemptIncomeComponent } from "./exempt-income/exempt-income.component";
import { LabFormComponent } from "./itr-wizard/components/capital-gain/land-and-building/lab-form/lab-form.component";
import { BondsDebentureComponent } from "./itr-wizard/components/capital-gain/bonds-debenture/bonds-debenture.component";
import { ScheduleEsopComponent } from './itr-wizard/pages/schedule-esop/schedule-esop.component';

const routes: Routes = [
  {
    path: 'itr',
    component: ItrWizardComponent,
    children: [
      { path: 'prefill', component: PrefillIdComponent },
      { path: 'sources', component: SourceOfIncomesComponent },
      { path: 'personal-info', component: AllPersonalInformationComponent },
      { path: 'other-income', component: OtherIncomeComponent },
      {
        path: 'investments-deductions',
        component: InvestmentsDeductionsComponent,
      },
      { path: 'taxes-paid', component: TaxesPaidComponent },
      { path: 'declaration', component: DeclarationComponent },
      { path: 'old-vs-new', component: OldVsNewComponent },
      {
        path: 'salary',
        component: SalaryComponent,
        // children: [
        //   {
        //     path: 'details/:id',
        //     component: SalaryComponent,
        //   },
        // ],
      },
      { path: 'house-property', component: HousePropertyComponent },
      {
        path: 'business',
        component: AllBusinessIncomeComponent,
        children: [
          { path: 'presumptive', component: PresumptiveIncomeComponent },
          { path: 'balance-sheet', component: BalanceSheetComponent },
          { path: 'pnlaccounts', component: ProfitLossAcComponent },
        ],
      },
      {
        path: 'capital-gain',
        component: CapitalGainComponent,
        children: [
          { path: 'lab', component: LabFormComponent },
          { path: 'listed', component: SharesAndEquityComponent },
          { path: 'unlisted', component: SharesAndEquityComponent },
          { path: 'bonds', component: BondsDebentureComponent },
          { path: 'zcb', component: ZeroCouponBondsComponent },
          { path: 'other', component: OtherAssetsComponent },
        ],
      },
      { path: 'crypto', component: CryptoVdaComponent },
      {
        path: 'more-info',
        component: MoreInformationComponent,
        children: [
          { path: 'exempt-income', component: ExemptIncomeComponent },
          { path: 'schedule-al', component: ScheduleALComponent },
          { path: 'schedule-cfl', component: ScheduleCflComponent },
          { path: 'schedule-esop', component: ScheduleEsopComponent },
          { path: 'partner-in-firms', component: PartnerInFirmsComponent },
        ],
      },
      {
        path: 'nri',
        component: ForeignIncomeComponent,
        children: [
          { path: 'schedule-fsi', component: ScheduleFsiComponent },
          { path: 'schedule-tr', component: ScheduleTrComponent },
          { path: 'schedule-fa', component: ScheduleFaComponent },
        ],
      },
      { path: 'eri', component: AddClientsComponent },
      { path: 'summary', component: SummaryComponent },
      { path: 'validation-errors', component: ValidationErrorScreenComponent },
      // ],
      // },
      // { path: 'team-itrs', canActivate: [RoleBaseAuthGuardService], component: MyTeamItrsComponent },
      // { path: 'delay', canActivate: [RoleBaseAuthGuardService], component: DelayComponent },
      // { path: 'tasks', component: FilingTasksComponent },
      // { path: 'user-docs/:userId', component: ShowUserDocumnetsComponent },
      { path: '', redirectTo: '/itr-filing/itr', pathMatch: 'full' },
    ],
  },
  {
    path: 'docs/user-docs',
    component: ShowUserDocumnetsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ItrFilingRoutingModule { }
