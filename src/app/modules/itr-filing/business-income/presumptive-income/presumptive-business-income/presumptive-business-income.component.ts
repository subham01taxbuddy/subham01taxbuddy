import { NewPresumptiveIncomes } from './../../../../shared/interfaces/itr-input.interface';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { businessIncome, ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { BusinessDialogComponent } from './business-dialog/business-dialog.component';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-presumptive-business-income',
  templateUrl: './presumptive-business-income.component.html',
  styleUrls: ['./presumptive-business-income.component.scss']
})
export class PresumptiveBusinessIncomeComponent implements OnInit {
  public businessGridOptions: GridOptions;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  loading: boolean;
  natureOfBusinessList: [];
  businessArray = [];

  constructor(
    public matDialog: MatDialog,
    public itrMsService: ItrMsService,
    public utilsService: UtilsService
  ) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    let natureOfBusiness = JSON.parse(sessionStorage.getItem('NATURE_OF_BUSINESS'));
    if (natureOfBusiness) {
      this.natureOfBusinessList = natureOfBusiness.filter((item: any) => item.section === '44AD');
    } else {
      console.log('business list not found');
    }

  }

  ngOnInit(): void {
    if (this.Copy_ITR_JSON.business.presumptiveIncomes) {
      let data = this.Copy_ITR_JSON.business.presumptiveIncomes.filter((item: any) => item.businessType === "BUSINESS");
      console.log("data from session storage",data);
      this.businessArray = data;
    } else {
      this.businessArray = [];
    }
  }

  getBusinessName(data){
    let business = this.natureOfBusinessList?.filter((item: any) => item.code === data.natureOfBusiness);
    return business && business[0] ? (business[0] as any).label : null;
  }

  getByBank(item,incomeType,incomeSubType){
    let bank = item.incomes?.filter(item => (item.incomeType === 'BANK'));
    if (incomeSubType == 'receipts'){
        return bank[0] ? bank[0].receipts : null;
      }else if (incomeSubType == 'presumptiveIncome'){
        return bank[0] ? bank[0].presumptiveIncome : null;
    }
  }

  getByCash(item, incomeType, incomeSubType) {
    let cash = item.incomes?.filter(item => (item.incomeType === 'CASH'));
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
    this.isAllSelected() ?
        this.selection.clear() :
        this.businessArray.forEach(row => this.selection.select(row));
  }
  removeSelectedRows() {
    this.selection.selected.forEach(item => {
     let index: number = this.businessArray.findIndex(d => d === item);
     this.businessArray.splice(index, 1);
   });
   this.selection = new SelectionModel<NewPresumptiveIncomes>(true, []);
 }

  getMastersData() {
    this.loading = true;
    const param = '/itrmaster';
    this.itrMsService.getMethod(param).subscribe((result: any) => {
      let natureOfBusinessAll = result.natureOfBusiness;
      this.loading = false;
      sessionStorage.setItem('NATURE_OF_BUSINESS', JSON.stringify(natureOfBusinessAll));
      this.natureOfBusinessList = natureOfBusinessAll.filter((item: any) => item.section === '44AD');
      sessionStorage.setItem('MASTER', JSON.stringify(result));
    }, error => {
      this.loading = false;
      this.utilsService.showSnackBar('Failed to get nature of Business list, please try again.');
      this.utilsService.smoothScrollToTop();

    });
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
      width: '700px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('result add',result);
      if (result !== undefined) {
        if (mode === 'ADD') {
          this.businessArray.push(result);
        }else {
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
        natureList: this.businessArray
      },
      closeOnNavigation: true,
      disableClose: false,
      width: '700px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('result edit',result);
      if (result) {
        let itemIndex = this.businessArray.findIndex(item=> item.tradeName == this.selection.selected[0].tradeName )
        this.businessArray[itemIndex] = result;
      }

    });
  }

  onContinue() {
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
      let data = this.Copy_ITR_JSON.business.presumptiveIncomes.filter((item: any) => item.businessType != "BUSINESS");
      this.Copy_ITR_JSON.business.presumptiveIncomes = (data).concat(this.businessArray)
    }
    console.log(this.Copy_ITR_JSON);


    this.utilsService.saveItrObject( this.Copy_ITR_JSON).subscribe((result: any) => {
      this.ITR_JSON = result;
      this.loading = false;
      sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
      this.utilsService.showSnackBar('Business income added successfully');
      this.utilsService.smoothScrollToTop();
    }, error => {
      this.loading = false;
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      this.utilsService.showSnackBar('Failed to add business income, please try again.');
      this.utilsService.smoothScrollToTop();
    });
  }
}
