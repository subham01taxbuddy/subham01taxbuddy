import { NewPresumptiveIncomes } from './../../../../shared/interfaces/itr-input.interface';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import {
  businessIncome,
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
  natureOfBusinessList: any;
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

  constructor(
    public matDialog: MatDialog,
    public itrMsService: ItrMsService,
    public utilsService: UtilsService,
    private fb: FormBuilder
  ) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    this.getMastersData();
    let natureOfBusiness = JSON.parse(
      sessionStorage.getItem('NATURE_OF_BUSINESS')
    );
    if (natureOfBusiness) {
      this.natureOfBusinessList = natureOfBusiness.filter(
        (item: any) => item.section === '44AD'
      );
    } else {
      console.log('business list not found');
    }
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

    // if (this.Copy_ITR_JSON.business?.presumptiveIncomes) {
    //   let data = this.Copy_ITR_JSON.business?.presumptiveIncomes?.filter(
    //     (item: any) => item.businessType === 'BUSINESS'
    //   );
    //   console.log('data from session storage', data);
    //   this.businessArray = data;
    // } else {
    //   this.businessArray = [];
    // }
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

    return this.fb.group({
      id: null,
      index: [index],
      hasEdit: [false],
      natureOfBusiness: [
        income?.natureOfBusiness || null,
        [Validators.required],
      ],
      tradeName: [income?.tradeName || null, [Validators.required]],
      bankReceipts: [bank ? bank.receipts : null, [Validators.required]],
      bankPreIncome: [
        bank ? bank.presumptiveIncome : null,
        [Validators.required],
      ],
      cashReceipts: [cash ? cash.receipts : null, [Validators.required]],
      cashPreIncome: [
        cash ? cash.presumptiveIncome : null,
        [Validators.required],
      ],
    });
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

  calculatePresumptive(event, index, incomeType) {
    if (incomeType === 'cash') {
      this.amountSix = (
        (this.busIncomeForm.controls['busIncomeFormArray'] as FormArray)
          .controls[index] as FormGroup
      ).controls['cashReceipts'].value;

      this.maxSixAmt = (
        (this.busIncomeForm.controls['busIncomeFormArray'] as FormArray)
          .controls[index] as FormGroup
      ).controls['cashReceipts'].value;

      this.amountSix = Math.round(Number((this.amountSix / 100) * 6));

      (
        (this.busIncomeForm.controls['busIncomeFormArray'] as FormArray)
          .controls[index] as FormGroup
      ).controls['cashPreIncome'].setValue(this.amountSix);

      (
        (this.busIncomeForm.controls['busIncomeFormArray'] as FormArray)
          .controls[index] as FormGroup
      ).controls['cashPreIncome'].setValidators([
        Validators.min(this.amountSix),
        Validators.max(this.maxSixAmt),
      ]);

      (
        (this.busIncomeForm.controls['busIncomeFormArray'] as FormArray)
          .controls[index] as FormGroup
      ).controls['cashPreIncome'].updateValueAndValidity();
    } else {
      this.amountEight = (
        (this.busIncomeForm.controls['busIncomeFormArray'] as FormArray)
          .controls[index] as FormGroup
      ).controls['bankReceipts'].value;

      this.maxEightAmt = (
        (this.busIncomeForm.controls['busIncomeFormArray'] as FormArray)
          .controls[index] as FormGroup
      ).controls['bankReceipts'].value;

      this.amountEight = Math.round(Number((this.amountEight / 100) * 6));

      (
        (this.busIncomeForm.controls['busIncomeFormArray'] as FormArray)
          .controls[index] as FormGroup
      ).controls['bankPreIncome'].setValue(this.amountEight);

      (
        (this.busIncomeForm.controls['busIncomeFormArray'] as FormArray)
          .controls[index] as FormGroup
      ).controls['bankPreIncome'].setValidators([
        Validators.min(this.amountEight),
        Validators.max(this.maxEightAmt),
      ]);

      (
        (this.busIncomeForm.controls['busIncomeFormArray'] as FormArray)
          .controls[index] as FormGroup
      ).controls['bankPreIncome'].updateValueAndValidity();
    }
  }

  // OLD CODE
  getBusinessName(data) {
    // console.log('data>=',data)
    return (
      (
        this.natureOfBusinessList?.find(
          (item: any) => item?.code === data?.natureOfBusiness
        ) as any
      )?.label || null
    );
    // console.log('business name =',business)
    // return business && business[0] ? (business[0] as any)?.label : null;
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

  getMastersData() {
    this.loading = true;
    const param = '/itrmaster';
    this.itrMsService.getMethod(param).subscribe(
      (result: any) => {
        let natureOfBusinessAll = result.natureOfBusiness;
        this.loading = false;
        sessionStorage.setItem(
          'NATURE_OF_BUSINESS',
          JSON.stringify(natureOfBusinessAll)
        );
        this.natureOfBusinessList = natureOfBusinessAll.filter(
          (item: any) => item.section === '44AD'
        );
        sessionStorage.setItem('MASTER', JSON.stringify(result));
      },
      (error) => {
        this.loading = false;
        this.utilsService.showSnackBar(
          'Failed to get nature of Business list, please try again.'
        );
        this.utilsService.smoothScrollToTop();
      }
    );
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
          if (data.natureOfBusiness == element.natureOfBusiness) {
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

      // check if business is present
      if (!this.Copy_ITR_JSON.business) {
        this.Copy_ITR_JSON.business = {
          presumptiveIncomes: [],
          profitLossACIncomes: [],
          financialParticulars: null,
          fixedAssetsDetails: [],
          businessDescription: [],
        };
        this.Copy_ITR_JSON.business.presumptiveIncomes = presBusinessIncome;
      } else if (!this.Copy_ITR_JSON.business.presumptiveIncomes) {
        this.Copy_ITR_JSON.business.presumptiveIncomes = presBusinessIncome;
      }

      // check if presumptive income is present under business
      if (!this.Copy_ITR_JSON.business.presumptiveIncomes) {
        this.Copy_ITR_JSON.business.presumptiveIncomes = [];
      }

      // if presumptive is present then check the length of presumptive
      if (!presBusinessArray || presBusinessArray.length === 0) {
        this.Copy_ITR_JSON.business.presumptiveIncomes = presBusinessIncome;
      } else {
        this.Copy_ITR_JSON.business.presumptiveIncomes = presBusinessIncome;
      }

      this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
        (result: any) => {
          this.ITR_JSON = result;
          this.loading = false;
          sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
          this.utilsService.showSnackBar(
            'Presumptive business income added successfully'
          );
          this.utilsService.smoothScrollToTop();
        },
        (error) => {
          this.loading = false;
          this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
          this.utilsService.showSnackBar(
            'Failed to add presumptive business income, please try again.'
          );
          this.utilsService.smoothScrollToTop();
        }
      );
    } else {
      this.utilsService.showSnackBar(
        'Please check if all the presumptive business income details are correct'
      );
      this.loading = false;
    }

    // let presBusinessIncome = [];
    // this.dataSource.data.forEach((element) => {
    //   let isAdded = false;
    //   presBusinessIncome.forEach((data) => {
    //     if (data.natureOfBusiness == element.natureOfBusiness) {
    //       isAdded = true;
    //       data.incomes.push({
    //         id: null,
    //         incomeType: 'PROFESSIONAL',
    //         receipts: element.receipts,
    //         presumptiveIncome: element.presumptiveIncome,
    //         periodOfHolding: null,
    //         minimumPresumptiveIncome: null,
    //         registrationNo: null,
    //         ownership: null,
    //         tonnageCapacity: null,
    //       });
    //     }
    //   });
    //   if (!isAdded) {
    //     presBusinessIncome.push({
    //       id: null,
    //       businessType: 'PROFESSIONAL',
    //       natureOfBusiness: element.natureOfBusiness,
    //       label: null,
    //       tradeName: element.tradeName,
    //       salaryInterestAmount: null,
    //       taxableIncome: null,
    //       exemptIncome: null,
    //       incomes: [
    //         {
    //           id: null,
    //           incomeType: 'PROFESSIONAL',
    //           receipts: element.receipts,
    //           presumptiveIncome: element.presumptiveIncome,
    //           periodOfHolding: null,
    //           minimumPresumptiveIncome: null,
    //           registrationNo: null,
    //           ownership: null,
    //           tonnageCapacity: null,
    //         },
    //       ],
    //     });
    //   }
    // });
  }

  onContinues() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    this.loading = true;
    // let presBusinessIncome = [];
    // this.businessGridOptions.rowData.forEach(element => {
    //   let isAdded = false;
    //   presBusinessIncome.forEach(data => {
    //     if (data.natureOfBusiness == element.natureOfBusiness) {
    //       isAdded = true;
    //       data.incomes.push({
    //         "id": element.id,
    //         "incomeType": "BUSINESS",
    //         "receipts": element.receipts,
    //         "presumptiveIncome": element.presumptiveIncome,
    //         "periodOfHolding": element.periodOfHolding,
    //         "minimumPresumptiveIncome": element.minimumPresumptiveIncome,
    //         "registrationNo": null,
    //         "ownership": null,
    //         "tonnageCapacity": null
    //       });
    //     }
    //   });
    //   if (!isAdded) {
    //     presBusinessIncome.push({
    //       "id": element.id,
    //       "businessType": "BUSINESS",
    //       "natureOfBusiness": element.natureOfBusiness,
    //       "label": null,
    //       "tradeName": element.tradeName,
    //       "salaryInterestAmount": null,
    //       "taxableIncome": null,
    //       "exemptIncome": null,
    //       "incomes": [{
    //         "id": element.id,
    //         "incomeType": "BUSINESS",
    //         "receipts": element.receipts,
    //         "presumptiveIncome": element.presumptiveIncome,
    //         "periodOfHolding": element.periodOfHolding,
    //         "minimumPresumptiveIncome": element.minimumPresumptiveIncome,
    //         "registrationNo": null,
    //         "ownership": null,
    //         "tonnageCapacity": null
    //       }]
    //     });
    //   };
    // });
    // console.log("presBusinessIncome", presBusinessIncome)

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
}
