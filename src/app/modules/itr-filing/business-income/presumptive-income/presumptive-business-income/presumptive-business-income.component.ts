import { NewPresumptiveIncomes } from './../../../../shared/interfaces/itr-input.interface';
import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import {
  ITR_JSON,
} from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { BusinessDialogComponent } from './business-dialog/business-dialog.component';
import { SelectionModel } from '@angular/cdk/collections';
import { FormArray, FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-presumptive-business-income',
  templateUrl: './presumptive-business-income.component.html',
  styleUrls: ['./presumptive-business-income.component.scss'],
})
export class PresumptiveBusinessIncomeComponent implements OnInit {

  public businessGridOptions: GridOptions;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  loading: boolean;

  businessArray = [];
  businessData: any;
  busIncomeForm: FormGroup;
  busIncomeFormArray: FormArray;
  submitted: boolean = false;
  amountSix: number = 0;
  maxSixAmt: number = 0;
  amountEight: number = 0;
  maxEightAmt: number = 0;
  config: any;
  @Output() presBusinessSaved = new EventEmitter<boolean>();

  constructor(
    public matDialog: MatDialog,
    public itrMsService: ItrMsService,
    public utilsService: UtilsService,
    private fb: FormBuilder
  ) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

  }

  ngOnInit(): void {
    this.config = {
      itemsPerPage: 2,
      currentPage: 1,
    };

    let presBusiness = this.ITR_JSON.business?.presumptiveIncomes?.filter(
      (acIncome) => acIncome.businessType === 'BUSINESS'
    );

    this.busIncomeFormArray = new FormArray([]);
    if (presBusiness && presBusiness.length > 0) {
      presBusiness.forEach((element, index) => {
        let form = this.createBusIncomeForm(index, element);
        this.busIncomeFormArray.push(form);
      });
    } else {
      let form = this.createBusIncomeForm(0, null);
      this.busIncomeFormArray.push(form);
    }
    this.busIncomeForm = this.fb.group({
      busIncomeFormArray: this.busIncomeFormArray,
    });

    this.busIncomeFormArray.controls.forEach((formgroup, index) => {
      this.calculatePresumptive(index, 'cash');
      this.calculatePresumptive(index, 'bank');
    });
  }

  get getBusIncomeArray() {
    return <FormArray>this.busIncomeForm.get('busIncomeFormArray');
  }

  createBusIncomeForm(index, income) {
    let cash = income?.incomes?.filter(
      (element) => element.incomeType === 'CASH'
    )[0];

    let bank = income?.incomes?.filter(
      (element) => element.incomeType === 'BANK'
    )[0];
    console.log(cash, bank);

    let form = this.fb.group({
      id: null,
      index: [index],
      hasEdit: [false],
      natureOfBusiness: [
        income?.natureOfBusiness || null,
        [Validators.required],
      ],
      tradeName: [income?.tradeName || null, [Validators.required]],
      description: [income?.description || null],
      bankReceipts: [bank ? bank.receipts : 0, [Validators.required]],
      bankPreIncome: [bank ? bank.presumptiveIncome : 0, [Validators.required]],
      cashReceipts: [cash ? cash.receipts : 0, [Validators.required]],
      cashPreIncome: [cash ? cash.presumptiveIncome : 0, [Validators.required]],
    });
    form.controls['natureOfBusiness'].setValue(income?.natureOfBusiness || null);
    return form;
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  fieldGlobalIndex(index) {
    return this.config.itemsPerPage * (this.config.currentPage - 1) + index;
  }

  addBusIncomeForm() {
    if (this.busIncomeForm.valid) {
      this.submitted = false;
      let form = this.createBusIncomeForm(0, null);
      (this.busIncomeForm.controls['busIncomeFormArray'] as FormArray).insert(
        0,
        form
      );
    } else {
      this.submitted = true;
    }
  }

  busSelected() {
    const busIncomeFormArray = <FormArray>(
      this.busIncomeForm?.get('busIncomeFormArray')
    );
    return (
      busIncomeFormArray.controls.filter(
        (element) => (element as FormGroup).controls['hasEdit'].value === true
      ).length > 0
    );
  }

  deleteArray() {
    const busIncomeFormArray = <FormArray>(
      this.busIncomeForm.get('busIncomeFormArray')
    );
    busIncomeFormArray.controls.forEach((element, index) => {
      if ((element as FormGroup).controls['hasEdit'].value) {
        busIncomeFormArray.removeAt(index);
      }
    });
  }

  calculatePresumptive(index, incomeType) {
    if (incomeType === 'cash') {
      this.amountEight = (
        (this.busIncomeForm.controls['busIncomeFormArray'] as FormArray)
          .controls[index] as FormGroup
      ).controls['cashReceipts'].value;

      this.maxEightAmt = (
        (this.busIncomeForm.controls['busIncomeFormArray'] as FormArray)
          .controls[index] as FormGroup
      ).controls['cashReceipts'].value;

      this.amountEight = Math.round(Number((this.amountEight / 100) * 8));

      (
        (this.busIncomeForm.controls['busIncomeFormArray'] as FormArray)
          .controls[index] as FormGroup
      ).controls['cashPreIncome'].setValue(this.amountEight);

      (
        (this.busIncomeForm.controls['busIncomeFormArray'] as FormArray)
          .controls[index] as FormGroup
      ).controls['cashPreIncome'].setValidators([
        Validators.min(this.amountEight),
        Validators.max(this.maxEightAmt),
      ]);

      (
        (this.busIncomeForm.controls['busIncomeFormArray'] as FormArray)
          .controls[index] as FormGroup
      ).controls['cashPreIncome'].updateValueAndValidity();
    } else {
      this.amountSix = (
        (this.busIncomeForm.controls['busIncomeFormArray'] as FormArray)
          .controls[index] as FormGroup
      ).controls['bankReceipts'].value;

      this.maxSixAmt = (
        (this.busIncomeForm.controls['busIncomeFormArray'] as FormArray)
          .controls[index] as FormGroup
      ).controls['bankReceipts'].value;

      this.amountSix = Math.round(Number((this.amountSix / 100) * 6));

      (
        (this.busIncomeForm.controls['busIncomeFormArray'] as FormArray)
          .controls[index] as FormGroup
      ).controls['bankPreIncome'].setValue(this.amountSix);

      (
        (this.busIncomeForm.controls['busIncomeFormArray'] as FormArray)
          .controls[index] as FormGroup
      ).controls['bankPreIncome'].setValidators([
        Validators.min(this.amountSix),
        Validators.max(this.maxSixAmt),
      ]);

      (
        (this.busIncomeForm.controls['busIncomeFormArray'] as FormArray)
          .controls[index] as FormGroup
      ).controls['bankPreIncome'].updateValueAndValidity();
    }
  }

  getByBank(item, incomeType, incomeSubType) {
    let bank = item.incomes?.filter((item) => item.incomeType === 'BANK');
    if (incomeSubType == 'receipts') {
      return bank[0] ? bank[0].receipts : null;
    } else if (incomeSubType == 'presumptiveIncome') {
      return bank[0] ? bank[0].presumptiveIncome : null;
    }
  }

  getByCash(item, incomeType, incomeSubType) {
    let cash = item.incomes?.filter((item) => item.incomeType === 'CASH');
    if (incomeSubType == 'receipts') {
      return cash[0] ? cash[0].receipts : null;
    } else if (incomeSubType == 'presumptiveIncome') {
      return cash[0] ? cash[0].presumptiveIncome : null;
    }
  }

  selection = new SelectionModel<NewPresumptiveIncomes>(true, []);

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.businessArray.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.businessArray.forEach((row) => this.selection.select(row));
  }
  removeSelectedRows() {
    this.selection.selected.forEach((item) => {
      let index: number = this.businessArray.findIndex((d) => d === item);
      this.businessArray.splice(index, 1);
    });
    this.selection = new SelectionModel<NewPresumptiveIncomes>(true, []);
  }

  deleteBusiness(index) {
    this.businessGridOptions.rowData.splice(index, 1);
    this.businessGridOptions.api.setRowData(this.businessGridOptions.rowData);
  }

  addBusinessRow(mode, data: any, index?) {
    const dialogRef = this.matDialog.open(BusinessDialogComponent, {
      data: {
        mode: mode,
        data: this.businessArray,
        natureList: this.businessArray,
      },
      closeOnNavigation: true,
      disableClose: false,
      width: '700px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('result add', result);
      if (result !== undefined) {
        if (mode === 'ADD') {
          this.businessArray.push(result);
        } else {
          this.loading = false;
          this.utilsService.showSnackBar('Failed to add business income');
        }
      }
    });
  }

  editBusinessRow(mode, data: any) {
    const dialogRef = this.matDialog.open(BusinessDialogComponent, {
      data: {
        mode: mode,
        data: this.selection.selected[0],
        natureList: this.businessArray,
      },
      closeOnNavigation: true,
      disableClose: false,
      width: '700px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('result edit', result);
      if (result) {
        let itemIndex = this.businessArray.findIndex(
          (item) => item.tradeName == this.selection.selected[0].tradeName
        );
        this.businessArray[itemIndex] = result;
      }
    });
  }

  onContinue() {
    this.loading = true;
    this.submitted = true;
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    if (this.busIncomeForm.valid) {
      this.submitted = false;

      // all the arrays with type professional under presumptive income
      let presBusinessArray = this.ITR_JSON.business?.presumptiveIncomes;

      // form values
      let BusinessFormIncome =
        this.busIncomeForm.controls['busIncomeFormArray'].value;

      // array that will be stored unde presumptive income
      let presBusinessIncome = [];

      // IF PROF INCOME FORM IS VALID
      BusinessFormIncome?.forEach((element) => {
        let isAdded = false;
        presBusinessIncome.forEach((data) => {
          if (data.natureOfBusiness === element.natureOfBusiness) {
            isAdded = true;

            data.incomes.push({
              id: null,
              incomeType: 'BANK',
              receipts: element.bankReceipts,
              presumptiveIncome: element.bankPreIncome,
              periodOfHolding: null,
              minimumPresumptiveIncome: null,
              registrationNo: null,
              ownership: null,
              tonnageCapacity: null,
            });

            data.incomes.push({
              id: null,
              incomeType: 'CASH',
              receipts: element.cashReceipts,
              presumptiveIncome: element.cashPreIncome,
              periodOfHolding: null,
              minimumPresumptiveIncome: null,
              registrationNo: null,
              ownership: null,
              tonnageCapacity: null,
            });
          }
        });

        if (!isAdded) {
          presBusinessIncome.push({
            id: null,
            businessType: 'BUSINESS',
            natureOfBusiness: element.natureOfBusiness,
            label: null,
            tradeName: element.tradeName,
            description: element.description,
            salaryInterestAmount: null,
            taxableIncome: null,
            exemptIncome: null,
            incomes: [
              {
                id: null,
                incomeType: 'BANK',
                receipts: element.bankReceipts,
                presumptiveIncome: element.bankPreIncome,
                periodOfHolding: null,
                minimumPresumptiveIncome: null,
                registrationNo: null,
                ownership: null,
                tonnageCapacity: null,
              },
              {
                id: null,
                incomeType: 'CASH',
                receipts: element.cashReceipts,
                presumptiveIncome: element.cashPreIncome,
                periodOfHolding: null,
                minimumPresumptiveIncome: null,
                registrationNo: null,
                ownership: null,
                tonnageCapacity: null,
              },
            ],
          });
        }
      });
      console.log('presBusinessIncome', presBusinessIncome);
      console.log(this.Copy_ITR_JSON);

      if (!this.Copy_ITR_JSON?.business?.presumptiveIncomes) {
        this.Copy_ITR_JSON.business.presumptiveIncomes = presBusinessIncome;
      } else {
        let data = this.Copy_ITR_JSON.business.presumptiveIncomes.filter(
          (item: any) => item.businessType !== 'BUSINESS'
        );
        this.Copy_ITR_JSON.business.presumptiveIncomes =
          data.concat(presBusinessIncome);
      }

      this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
        (result: any) => {
          this.ITR_JSON = result;
          this.loading = false;
          sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
          this.utilsService.smoothScrollToTop();
          this.presBusinessSaved.emit(true);
        },
        (error) => {
          this.loading = false;
          this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
          this.utilsService.smoothScrollToTop();
          this.presBusinessSaved.emit(false);
        }
      );
    } else {
      const busIncomeArray = this.getBusIncomeArray;

      // check if any recipt or presumptive income is 0 and remove that
      busIncomeArray.controls.forEach((element, index) => {
        if (
          (element.value.bankReceipts === 0 ||
            element.value.bankReceipts === '0') &&
          (element.value.bankPreIncome === 0 ||
            element.value.bankPreIncome === '0') &&
          (element.value.cashReceipts === 0 ||
            element.value.cashReceipts === '0') &&
          (element.value.cashPreIncome === 0 ||
            element.value.cashPreIncome === '0')
        ) {
          busIncomeArray.removeAt(index);
        }
      });

      // once removed check if all are not 0
      const allNonZero = busIncomeArray.controls.every((element) => {
        return (
          element.value.receipts !== 0 || element.value.presumptiveIncome !== 0
        );
      });

      //  if every value is non-zero then call function again
      if (allNonZero && this.busIncomeForm.valid) {
        this.onContinue();
        this.loading = false;
        this.presBusinessSaved.emit(false);
        this.utilsService.smoothScrollToTop();
      } else {
        this.loading = false;
        this.presBusinessSaved.emit(false);
      }
    }

  }

  onContinues() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    this.loading = true;

    if (!this.Copy_ITR_JSON.business.presumptiveIncomes) {
      this.Copy_ITR_JSON.business.presumptiveIncomes = this.businessArray;
    } else {
      let data = this.Copy_ITR_JSON.business.presumptiveIncomes.filter(
        (item: any) => item.businessType != 'BUSINESS'
      );
      this.Copy_ITR_JSON.business.presumptiveIncomes = data.concat(
        this.businessArray
      );
    }
    console.log(this.Copy_ITR_JSON);

    this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
      (result: any) => {
        this.ITR_JSON = result;
        this.loading = false;
        sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
        this.utilsService.showSnackBar('Business income added successfully');
        this.utilsService.smoothScrollToTop();
      },
      (error) => {
        this.loading = false;
        this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
        this.utilsService.showSnackBar(
          'Failed to add business income, please try again.'
        );
        this.utilsService.smoothScrollToTop();
      }
    );
  }

  businessClicked(event, index){
    (
      (this.busIncomeForm.controls['busIncomeFormArray'] as FormArray)
        .controls[index] as FormGroup
    ).controls['natureOfBusiness'].setValue(event);
  }


}
