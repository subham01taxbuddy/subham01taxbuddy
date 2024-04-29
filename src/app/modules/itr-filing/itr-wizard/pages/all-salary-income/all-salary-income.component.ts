import { Component, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { AppConstants } from '../../../../shared/constants';
import { FormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from '../../../../../services/utils.service';
import { ItrMsService } from '../../../../../services/itr-ms.service';
import { WizardNavigation } from '../../../../itr-shared/WizardNavigation';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-all-salary-income',
  templateUrl: './all-salary-income.component.html',
  styleUrls: ['./all-salary-income.component.scss'],
})
export class AllSalaryIncomeComponent
  extends WizardNavigation
  implements OnInit
{
  loading: boolean = false;
  salaryIncomeFormGroup: UntypedFormGroup;
  taxableIncomes: any = [];
  showList: boolean;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  constructor(
    public utilsService: UtilsService,
    private itrMsService: ItrMsService,
    private router: Router,
    private fb: UntypedFormBuilder
  ) {
    super();
    this.showList = true;
  }

  ngOnInit(): void {
    this.initEmployersList();
    this.updatingTaxableIncome();
  }

  updatingTaxableIncome(save?) {
    this.taxableIncomes = [];
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    // Loop through each index in the ITR_JSON.employers array
    if (save) {
      for (let i = 0; i < this.ITR_JSON.employers.length; i++) {
        const taxableIncome = this.ITR_JSON.employers[i].taxableIncome;
        this.taxableIncomes[i] = taxableIncome;
        console.log(this.taxableIncomes, 'taxableIncome');
      }
    } else {
      for (let i = 0; i < this.ITR_JSON.employers.length; i++) {
        const taxableIncome = this.ITR_JSON.employers[i].taxableIncome;
        this.taxableIncomes.push(taxableIncome);
        console.log(this.taxableIncomes, 'taxableIncome');
      }
    }
  }

  initEmployersList() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(
      sessionStorage.getItem(AppConstants.ITR_JSON)
    );

    let employers = [];
    this.ITR_JSON.employers.forEach((employer) => {
      employers.push(
        this.fb.group({
          employerName: employer.employerName,
          selected: [false],
        })
      );
    });
    this.salaryIncomeFormGroup = this.fb.group({
      employersArray: this.fb.array(employers),
    });
  }

  subscription: Subscription;

  subscribeToEmmiter(componentRef) {
    const child: WizardNavigation = componentRef;
    child.saveAndNext.subscribe(() => {
      this.initEmployersList();
      this.updatingTaxableIncome();
      this.showList = true;
    });
  }

  unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  get getEmployerArray() {
    return <FormArray>this.salaryIncomeFormGroup.get('employersArray');
  }

  deleteEmployers() {
    let employersArray = this.salaryIncomeFormGroup.controls[
      'employersArray'
    ] as FormArray;
    let nonSelected = employersArray.controls.filter(
      (item: any) => item.controls['selected'].value === false
    );

    let employers = [];
    nonSelected.forEach((employer: UntypedFormGroup) => {
      employers.push(
        this.Copy_ITR_JSON.employers.filter(
          (item: any) =>
            item.employerName == employer.controls['employerName'].value
        )[0]
      );
    });

    this.Copy_ITR_JSON.employers = employers;

    if (this.Copy_ITR_JSON.employers.length > 0) {
      this.Copy_ITR_JSON.systemFlags.hasSalary = true;
    } else {
      if (this.Copy_ITR_JSON.planIdSelectedByTaxExpert === 22) {
        //here 22 is salary planId
        this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
        this.utilsService.showSnackBar(
          'You have selected Salary Income Plan, at least one employer details is required.'
        );
        return;
      }
      this.Copy_ITR_JSON.systemFlags.hraAvailed = false;
      this.Copy_ITR_JSON.systemFlags.hasSalary = false;
    }

    this.loading = true;

    const param = `/itr/itr-type`;
    this.itrMsService.postMethod(param, this.Copy_ITR_JSON).subscribe(
      (res: any) => {
        this.Copy_ITR_JSON.itrType = res?.data?.itrType;
        const param1 = '/taxitr?type=employers';
        this.itrMsService.postMethod(param1, this.Copy_ITR_JSON).subscribe(
          (result: any) => {
            this.ITR_JSON = result;
            this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
            sessionStorage.setItem(
              AppConstants.ITR_JSON,
              JSON.stringify(this.ITR_JSON)
            );
            this.initEmployersList();
            this.updatingTaxableIncome();

            this.loading = false;
            this.utilsService.showSnackBar('Employer deleted Successfully.');
          },
          (error) => {
            this.loading = false;
            this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
            // this.utilsService.disposable.unsubscribe();
            this.utilsService.showSnackBar('Failed to delete employer detail.');
            this.utilsService.smoothScrollToTop();
          }
        );
      },
      (error) => {
        console.log('error fetching itr type', error);
        this.utilsService.showSnackBar('Failed to delete employer detail');
      }
    );
  }

  isEmployerSelected() {
    let employers = this.salaryIncomeFormGroup.controls[
      'employersArray'
    ] as FormArray;
    let selected = employers.controls.filter(
      (item: any) => item.controls['selected'].value === true
    );
    return selected.length > 0;
  }
  addEmployer(index) {
    this.showList = false;
    this.router.navigate(['/itr-filing/itr/salary/details', index], {
      state: {
        data: index,
      },
    });
  }

  editEmployerDetails(index) {
    this.showList = false;
    this.router.navigate(['/itr-filing/itr/salary/details', index], {
      state: {
        //employer: this.ITR_JSON.employers[index],
        data: index,
      },
    });
  }

  goBack() {
    this.saveAndNext.emit(true);
  }
}
