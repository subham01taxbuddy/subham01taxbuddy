import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { NumericEditor } from 'app/shared/numeric-editor.component';
import { ITR_JSON } from 'app/shared/interfaces/itr-input.interface';
import { AppConstants } from 'app/shared/constants';
import { UtilsService } from 'app/services/utils.service';
import { ItrMsService } from 'app/services/itr-ms.service';

@Component({
  selector: 'app-other-income',
  templateUrl: './other-income.component.html',
  styleUrls: ['./other-income.component.css']
})
export class OtherIncomeComponent implements OnInit {
  @Output() saveAndNext = new EventEmitter<any>();

  public otherIncomeGridOptions: GridOptions;
  loading: boolean = false;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  itrDocuments = [];
  otherIncomeDropdown = [{
    "value": "SAVING_INTEREST",
    "label": "Interest from Saving Account",
  }, {
    "value": "FD_RD_INTEREST",
    "label": "Interest from Deposits((Bank/ Post-Office/ Co-operative Society)",
  }, {
    "value": "TAX_REFUND_INTEREST",
    "label": "Interest from Income tax refund",
  }, {
    "value": "ANY_OTHER",
    "label": "Any Other Income",
  }]
  constructor(public utilsService: UtilsService,
    private itrMsService: ItrMsService) { }

  ngOnInit() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.otherIncomeCallInConstructor(this.otherIncomeDropdown);
    this.setOtherIncomeValues();
    this.getItrDocuments();

  }

  // Salary Grid Start
  otherIncomeCallInConstructor(otherIncomeDropdown) {
    this.otherIncomeGridOptions = <GridOptions>{
      rowData: this.otherIncomeCreateRowData(otherIncomeDropdown),
      columnDefs: this.otherIncomeCreateColoumnDef(otherIncomeDropdown),
      onGridReady: () => {
        this.otherIncomeGridOptions.api.sizeColumnsToFit();
      },
      frameworkComponents: {
        numericEditor: NumericEditor
      },
      suppressDragLeaveHidesColumns: true,
      enableCellChangeFlash: true,
      defaultColDef: {
        resizable: true
      },
    };
  }


  otherIncomeCreateColoumnDef(otherIncomeDropdown) {
    return [
      {
        headerName: 'Salary Type',
        field: 'incomeType',
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          if (otherIncomeDropdown.length !== 0) {
            const nameArray = otherIncomeDropdown.filter(item => item.value === params.data.incomeType);
            return nameArray[0].label;
          } else {
            return params.data.incomeType;
          }
        },
        editable: false,
        tooltip: function (params) {
          if (otherIncomeDropdown.length !== 0) {
            const nameArray = otherIncomeDropdown.filter(item => item.value === params.data.incomeType);
            return nameArray[0].label;
          } else {
            return params.data.incomeType;
          }
        },
        suppressMenu: true
      },
      {
        headerName: 'Gross Amount',
        field: 'amount',
        suppressMovable: true,
        editable: true,
        cellEditor: 'numericEditor',
        headerComponentParams: { menuIcon: 'fa-external-link-alt' }
      },

      {
        headerName: 'Clear',
        suppressMovable: true,
        editable: false,
        suppressMenu: true,
        sortable: true,
        template:
          `<button type="button" class="action_icon add_button" title="Clear" style="border: none;
          background: transparent; font-size: 16px; cursor:pointer;color: red">
        <i class="fa fa-times-circle" aria-hidden="true" data-action-type="remove"></i>
       </button>`,
        width: 75,
        cellStyle: { textAlign: 'center' }
      },

    ];
  }

  public onOtherIncomeRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          this.otherIncomeGridOptions.rowData.splice(params.rowIndex, 1, {
            id: params.data.id,
            incomeType: params.data.incomeType,
            amount: null,
          });
          this.otherIncomeGridOptions.api.setRowData(this.otherIncomeGridOptions.rowData);
          break;
        }
      }
    }
  }

  otherIncomeCreateRowData(otherIncomeDropdown) {
    const data = [];
    for (let i = 0; i < otherIncomeDropdown.length; i++) {
      data.push({
        id: i,
        incomeType: otherIncomeDropdown[i].value,
        amount: null,
      });
    }
    return data;
  }

  saveOtherIncome() {
    debugger
    this.Copy_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.loading = true;
    this.Copy_ITR_JSON.incomes = this.Copy_ITR_JSON.incomes.filter(item => item.incomeType !== 'SAVING_INTEREST' &&
      item.incomeType !== 'FD_RD_INTEREST' && item.incomeType !== 'TAX_REFUND_INTEREST' &&
      item.incomeType !== 'ANY_OTHER')
    for (let i = 0; i < this.otherIncomeGridOptions.rowData.length; i++) {
      if (this.utilsService.isNonEmpty(this.otherIncomeGridOptions.rowData[i].amount)) {
        this.Copy_ITR_JSON.incomes.push({
          expenses: 0,
          amount: Number(this.otherIncomeGridOptions.rowData[i].amount),
          incomeType: this.otherIncomeGridOptions.rowData[i].incomeType,
          details: null
        });
      }
    }

    const param = '/itr/' + this.ITR_JSON.userId + '/' + this.ITR_JSON.itrId + '/' + this.ITR_JSON.assessmentYear;
    this.itrMsService.putMethod(param, this.Copy_ITR_JSON).subscribe((result: ITR_JSON) => {
      this.ITR_JSON = result;
      sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      this.loading = false;
      this.utilsService.showSnackBar('Other Income updated successfully.');
      this.saveAndNext.emit(true);
    }, error => {
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      this.utilsService.showSnackBar('Failed to update other income.');
      this.loading = false;
    });

  }

  setOtherIncomeValues() {
    this.otherIncomeGridOptions.rowData = this.otherIncomeCreateRowData(this.otherIncomeDropdown);
    this.otherIncomeGridOptions.columnDefs = this.otherIncomeCreateColoumnDef(this.otherIncomeDropdown);
    if (this.ITR_JSON.incomes instanceof Array) {
      for (let i = 0; i < this.ITR_JSON.incomes.length; i++) {
        const id = this.otherIncomeGridOptions.rowData.filter(item => item.incomeType === this.ITR_JSON.incomes[i].incomeType)[0].id;
        this.otherIncomeGridOptions.rowData.splice(id, 1, {
          id: id,
          incomeType: this.ITR_JSON.incomes[i].incomeType,
          amount: this.ITR_JSON.incomes[i].amount,
        });
      }
      // const sec17_1 = this.ITR_JSON.incomes.filter(item => item.incomeType === 'SEC17_1');
      // if (sec17_1.length > 0) {
      //   this.summarySalaryForm.controls['sec17_1'].setValue(sec17_1[0].taxableAmount);
      // }
    }
  }

  getItrDocuments() {
    const param1 =
      `/cloud/signed-s3-urls?currentPath=${this.ITR_JSON.userId}/ITR/2019-20/Original/ITR Filing Docs`;
    this.itrMsService.getMethod(param1).subscribe((result: any) => {
      this.itrDocuments = result;
    })
  }

  afterUploadDocs(fileUpload){
    if(fileUpload === 'File uploaded successfully'){
       this.getItrDocuments();
    }
  }

  zoom: number = 1.0;
  incrementZoom(amount: number) {
    this.zoom += amount;
  }

  docDetails = {
    docUrl: '',
    docType: ''
  };
  getDocsUrl(index) {

    if (this.itrDocuments.length > 0) {
      const docType = this.itrDocuments[index].fileName.split('.').pop();
      if (this.itrDocuments[index].isPasswordProtected) {
        this.docDetails.docUrl = this.itrDocuments[index].passwordProtectedFileUrl;
      } else {
        this.docDetails.docUrl = this.itrDocuments[index].signedUrl;
      }
      this.docDetails.docType = docType;
    } else {
      this.docDetails.docUrl = '';
      this.docDetails.docType = '';
    }
  }
}
