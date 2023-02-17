import { ItrFilingComponent } from './itr-filing.component';
import { CustomerProfileComponent } from './itr-wizard/components/customer-profile/customer-profile.component';
import { UsersComponent } from './users/users.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ItrWizardComponent } from './itr-wizard/itr-wizard.component';
import { AcknowledgementComponent } from './acknowledgement/acknowledgement.component';
import { DirectUploadComponent } from './direct-upload/direct-upload.component';
import { MyAssignedItrsComponent } from './my-assigned-itrs/my-assigned-itrs.component';
import { MyTeamItrsComponent } from './my-team-itrs/my-team-itrs.component';
import { DelayComponent } from './delay/delay.component';
import { FilingTasksComponent } from './filing-tasks/filing-tasks.component';
import { ShowUserDocumnetsComponent } from './show-user-documnets/show-user-documnets.component';
import { RoleBaseAuthGuardService } from 'src/app/modules/shared/services/role-base-auth-guard.service';
import { AddClientsComponent} from './itr-wizard/components/add-clients/add-clients.component';
import { PrefillIdComponent } from './itr-wizard/pages/prefill-id/prefill-id.component';
import { SourceOfIncomesComponent } from './itr-wizard/pages/source-of-incomes/source-of-incomes.component';
import { AllPersonalInformationComponent } from './itr-wizard/pages/all-personal-information/all-personal-information.component';
import { OtherIncomeComponent } from './other-income/other-income.component';
import { InvestmentsDeductionsComponent } from './itr-wizard/pages/investments-deductions/investments-deductions.component';
import { TaxesPaidComponent } from './itr-wizard/pages/taxes-paid/taxes-paid.component';
import { DeclarationComponent } from './declaration/declaration.component';
import { SalaryComponent } from './salary/salary.component';
import { HousePropertyComponent } from './house-property/house-property.component';
import { BusinessComponent } from './business/business.component';
import { CapitalGainComponent } from './capital-gain/capital-gain.component';
import { SpeculativeIncomeComponent } from './business-income/profit-loss-ac/speculative-income/speculative-income.component';
import { ForeignIncomeComponent } from './itr-wizard/pages/foreign-income/foreign-income.component';
import { AllBusinessIncomeComponent } from './itr-wizard/pages/all-business-income/all-business-income.component';

const routes: Routes = [
  {
    // path: '',
    // component: ItrWizardComponent,
    // children: [
    // { path: 'my-itrs', component: MyAssignedItrsComponent },
    // { path: 'customer-profile', component: CustomerProfileComponent },
    // {
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
      { path: 'salary', component: SalaryComponent },
      { path: 'house-property', component: HousePropertyComponent },
      { path: 'business', component: AllBusinessIncomeComponent },
      { path: 'capital-gain', component: CapitalGainComponent },
      { path: 'future-options', component: SpeculativeIncomeComponent },
      { path: 'nri', component: ForeignIncomeComponent },
      { path: 'eri', component: AddClientsComponent },
      // ],
      // },
      // { path: 'direct-upload', component: DirectUploadComponent },
      // { path: 'acknowledgement', component: AcknowledgementComponent },
      // { path: 'team-itrs', canActivate: [RoleBaseAuthGuardService], component: MyTeamItrsComponent },
      // { path: 'delay', canActivate: [RoleBaseAuthGuardService], component: DelayComponent },
      // { path: 'tasks', component: FilingTasksComponent },
      // { path: 'user-docs/:userId', component: ShowUserDocumnetsComponent },
      // { path: 'add-client', component: AddClientComponent },
      { path: '', redirectTo: '/itr-filing/itr', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ItrFilingRoutingModule {}
