import { FormControl } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { GridOptions, ICellRendererParams } from 'ag-grid-community';
import { NumericEditorComponent } from 'src/app/modules/shared/numeric-editor.component';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { AppConstants } from 'src/app/modules/shared/constants';
import { UtilsService } from 'src/app/services/utils.service';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { AgTooltipComponent } from 'src/app/modules/shared/components/ag-tooltip/ag-tooltip.component';

@Component({
  selector: 'app-other-income',
  templateUrl: './other-income.component.html',
  styleUrls: ['./other-income.component.css']
})
export class OtherIncomeComponent implements OnInit {
  @Output() saveAndNext = new EventEmitter<any>();
  public exemptIncomesGridOptions: GridOptions;

  public otherIncomeGridOptions: GridOptions;
  loading: boolean = false;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  itrDocuments = [];
  deletedFileData: any = [];
  famPenDeduction: any;
  totalFamPenDeduction: any;

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
  }, /* {
    "value": "FAMILLY_PENSION",
    "label": "Any Other Income",
  } */];

  exemptIncomesDropdown = [{
    id: null,
    seqNum: 1,
    value: "AGIR",
    label: "Agriculture Income (less than or equal to RS. 5000)",
    detailed: false
  }, {
    id: null,
    seqNum: 2,
    value: "10(10D)",
    label: "Sec 10 (10D) - Any sum received under a life insurance policy, including the sum allocated by way of bonus on such policy except sum as mentioned in sub-clause (a) to (d) of Sec.10 (10D)",
    detailed: false
  }, {
    "id": null,
    "seqNum": 3,
    "value": "10(11)",
    "label": "Sec 10(11) - Statutory Provident Fund received) ",
    "detailed": false
  }, {
    "id": null,
    "seqNum": 4,
    "value": "10(12)",
    "label": "Sec 10(12) - Recognized Provident Fund received",
    "detailed": false
  }, {
    "id": null,
    "seqNum": 5,
    "value": "10(13)",
    "label": "Sec 10(13) - Approved superannuation fund received",
    "detailed": false
  }, {
    "id": null,
    "seqNum": 6,
    "value": "10(16)",
    "label": "Sec 10(16) - Scholarships granted to meet the cost of education",
    "detailed": false
  }, {
    "id": null,
    "seqNum": 7,
    "value": "DMDP",
    "label": "Defense Medical disability pension",
    "detailed": false
  }, {
    "id": null,
    "seqNum": 8,
    "value": "10(17)",
    "label": "Sec 10(17) - Allowance MP/MLA/MLC ",
    "detailed": false
  }, {
    "id": null,
    "seqNum": 9,
    "value": "10(17A)",
    "label": "Sec 10(17A) - Award instituted by government",
    "detailed": false
  }, {
    "id": null,
    "seqNum": 10,
    "value": "10(18)",
    "label": "Sec 10(18) - Pension received by winner of Param Vir Chakra or Maha-Vir Chakra or such other gallantry award",
    "detailed": false
  }, {
    "id": null,
    "seqNum": 11,
    "value": "10(10BC)",
    "label": "Sec 10(10BC) - Any amount from the Central/State Govt/Local authority by way of compensation on account of any disaster ",
    "detailed": false
  }, {
    "id": null,
    "seqNum": 12,
    "value": "10(19)",
    "label": "Sec 10(19) - Armed Forces Family Pension in case of death during operational duty ",
    "detailed": false
  }, {
    "id": null,
    "seqNum": 13,
    "value": "10(26)",
    "label": "Sec 10 (26) - Any Income as referred to in section 10(26)",
    "detailed": false
  }, {
    "id": null,
    "seqNum": 14,
    "value": "10(26AAA)",
    "label": "Sec 10(26AAA) - Any income as referred to in section 10(26",
    "detailed": false
  }, {
    "id": null,
    "seqNum": 10,
    "value": "OTH",
    "label": "Any other ",
    "detailed": false
  }]


  familyPension = new FormControl(null)
  dividendIncomes: FormGroup;
  constructor(public utilsService: UtilsService,
    private itrMsService: ItrMsService, public fb: FormBuilder,) { }

  ngOnInit() {
    this.dividendIncomes = this.fb.group({
      quarter1: [null],
      quarter2: [null],
      quarter3: [null],
      quarter4: [null],
      quarter5: [null],
    })
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.exemptIncomesCallInConstructor(this.exemptIncomesDropdown);

    this.otherIncomeCallInConstructor(this.otherIncomeDropdown);
    this.setOtherIncomeValues();
    this.getItrDocuments();

    console.log('OTHERE deletedFileData LENGTH ---> ', this.deletedFileData.length);


  }

  // Salary Grid Start
  otherIncomeCallInConstructor(otherIncomeDropdown) {
    this.otherIncomeGridOptions = <GridOptions>{
      rowData: this.otherIncomeCreateRowData(otherIncomeDropdown),
      columnDefs: this.otherIncomeCreateColumnDef(otherIncomeDropdown),
      onGridReady: () => {
        this.otherIncomeGridOptions.api.sizeColumnsToFit();
      },
      // frameworkComponents: {
      //   numericEditor: NumericEditorComponent
      // },
      suppressDragLeaveHidesColumns: true,
      // enableCellChangeFlash: true,
      enableCellTextSelection: true,
      defaultColDef: {
        resizable: true
      },
    };
  }


  otherIncomeCreateColumnDef(otherIncomeDropdown) {
    return [
      {
        headerName: 'Salary Type',
        field: 'incomeType',
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          if (otherIncomeDropdown.length !== 0) {
            const nameArray = otherIncomeDropdown.filter((item: any) => item.value === params.data.incomeType);
            return nameArray[0].label;
          } else {
            return params.data.incomeType;
          }
        },
        editable: false,
        tooltip: function (params) {
          if (otherIncomeDropdown.length !== 0) {
            const nameArray = otherIncomeDropdown.filter((item: any) => item.value === params.data.incomeType);
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
        // cellEditor: 'numericEditor',
        headerComponentParams: { menuIcon: 'fa-external-link-alt' }
      },

      {
        headerName: 'Clear',
        suppressMovable: true,
        editable: false,
        suppressMenu: true,
        sortable: true,
        width: 75,
        cellStyle: { textAlign: 'center' },
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Clear" style="border: none;
          background: transparent; font-size: 16px; cursor:pointer;color: red">
        <i class="fa fa-times-circle" aria-hidden="true" data-action-type="remove"></i>
       </button>`;
        },
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
          this.otherIncomeGridOptions.api?.setRowData(this.otherIncomeGridOptions.rowData);
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
    console.log('Dividend Income,', this.dividendIncomes.value);

    this.Copy_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON.dividendIncomes = [
      {
        "income": this.dividendIncomes.controls['quarter1'].value,
        "date": "2022-04-28T18:30:00.000Z",
        quarter: 1
      },
      {
        "income": this.dividendIncomes.controls['quarter2'].value,
        "date": "2022-07-28T18:30:00.000Z",
        quarter: 2
      },
      {
        "income": this.dividendIncomes.controls['quarter3'].value,
        "date": "2022-09-28T18:30:00.000Z",
        quarter: 3
      },
      {
        "income": this.dividendIncomes.controls['quarter4'].value,
        "date": "2022-12-28T18:30:00.000Z",
        quarter: 4
      },
      {
        "income": this.dividendIncomes.controls['quarter5'].value,
        "date": "2023-03-20T18:30:00.000Z",
        quarter: 5
      }
    ]
    console.log('Copy ITR JSON', this.Copy_ITR_JSON)
    this.loading = true;
    this.Copy_ITR_JSON.incomes = this.Copy_ITR_JSON.incomes.filter((item: any) => item.incomeType !== 'SAVING_INTEREST' &&
      item.incomeType !== 'FD_RD_INTEREST' && item.incomeType !== 'TAX_REFUND_INTEREST' &&
      item.incomeType !== 'ANY_OTHER' && item.incomeType !== 'FAMILLY_PENSION')
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
    if (this.utilsService.isNonZero(this.familyPension.value)) {
      this.Copy_ITR_JSON.incomes.push({
        "amount": this.familyPension.value,
        "incomeType": "FAMILLY_PENSION",
        "details": "FAMILLY_PENSION",
        "expenses": 0
      })
    }

    this.Copy_ITR_JSON.exemptIncomes = []
    for (let i = 0; i < this.exemptIncomesGridOptions.rowData.length; i++) {
      if (this.utilsService.isNonZero(this.exemptIncomesGridOptions.rowData[i].amount)) {
        this.Copy_ITR_JSON.exemptIncomes.push({
          natureDesc: this.exemptIncomesGridOptions.rowData[i].natureDesc,
          OthNatOfInc: '',
          amount: Number(this.exemptIncomesGridOptions.rowData[i].amount)
        });
        // totalAllowExempt = totalAllowExempt + Number(this.exemptIncomesGridOptions.rowData[i].amount);
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
    this.otherIncomeGridOptions.columnDefs = this.otherIncomeCreateColumnDef(this.otherIncomeDropdown);
    if (this.ITR_JSON.incomes instanceof Array) {
      let otherIncomes = this.ITR_JSON.incomes.filter(item => item.incomeType === 'SAVING_INTEREST' || item.incomeType === 'FD_RD_INTEREST' || item.incomeType === 'TAX_REFUND_INTEREST' || item.incomeType === 'ANY_OTHER');
      for (let i = 0; i < otherIncomes.length; i++) {
        const id = this.otherIncomeGridOptions.rowData.filter((item: any) => item.incomeType === otherIncomes[i].incomeType)[0].id;
        this.otherIncomeGridOptions.rowData.splice(id, 1, {
          id: id,
          incomeType: otherIncomes[i].incomeType,
          amount: otherIncomes[i].amount,
        });
      }

      let famPension = this.ITR_JSON.incomes.filter(item => item.incomeType === 'FAMILLY_PENSION');
      if (famPension.length > 0) {
        this.familyPension.setValue(famPension[0].amount);
        this.calFamPension();
      }
      // const sec17_1 = this.ITR_JSON.incomes.filter((item:any) => item.incomeType === 'SEC17_1');
      // if (sec17_1.length > 0) {
      //   this.summarySalaryForm.controls['sec17_1'].setValue(sec17_1[0].OthNatOfInc);
      // }
    }


    if (this.ITR_JSON.dividendIncomes instanceof Array) {
      for (let i = 0; i < this.ITR_JSON.dividendIncomes.length; i++) {
        switch (this.ITR_JSON.dividendIncomes[i].quarter) {
          case 1: {
            this.dividendIncomes.controls['quarter1'].setValue(this.ITR_JSON.dividendIncomes[i].income);
            break;
          }
          case 2: {
            this.dividendIncomes.controls['quarter2'].setValue(this.ITR_JSON.dividendIncomes[i].income);
            break;
          }
          case 3: {
            this.dividendIncomes.controls['quarter3'].setValue(this.ITR_JSON.dividendIncomes[i].income);
            break;
          }
          case 4: {
            this.dividendIncomes.controls['quarter4'].setValue(this.ITR_JSON.dividendIncomes[i].income);
            break;
          }
          case 5: {
            this.dividendIncomes.controls['quarter5'].setValue(this.ITR_JSON.dividendIncomes[i].income);
            break;
          }
        }
      }
    }

    this.exemptIncomesGridOptions.rowData = this.exemptIncomesCreateRowData(this.exemptIncomesDropdown);
    this.exemptIncomesGridOptions.columnDefs = this.exemptIncomeCreateColumnDef(this.exemptIncomesDropdown);
    if (this.ITR_JSON.exemptIncomes instanceof Array) {
      // const allowance = this.localEmployer.allowance.filter((item: any) => item.natureDesc !== 'ALL_ALLOWANCES');
      for (let i = 0; i < this.ITR_JSON.exemptIncomes.length; i++) {
        const id = this.exemptIncomesGridOptions.rowData.filter((item: any) => item.natureDesc === this.ITR_JSON.exemptIncomes[i].natureDesc)[0].id;
        this.exemptIncomesGridOptions.rowData.splice(id, 1, {
          id: id,
          natureDesc: this.ITR_JSON.exemptIncomes[i].natureDesc,
          OthNatOfInc: this.ITR_JSON.exemptIncomes[i].OthNatOfInc,
          amount: this.ITR_JSON.exemptIncomes[i].amount
        });
      }
    }

  }

  getItrDocuments() {
    const param1 =
      `/cloud/signed-s3-urls?currentPath=${this.ITR_JSON.userId}/ITR/2019-20/Original/ITR Filing Docs`;
    this.itrMsService.getMethod(param1).subscribe((result: any) => {
      this.itrDocuments = result;
    })
  }

  deleteFile(fileName) {
    let adminId = JSON.parse(localStorage.getItem("UMD"));
    var path = '/itr/cloud/files?actionBy=' + adminId.USER_UNIQUE_ID;
    let filePath = `${this.ITR_JSON.userId}/ITR/2019-20/Original/ITR Filing Docs/${fileName}`;
    var reqBody = [filePath];
    console.log('URL path: ', path, ' filePath: ', filePath, ' Request body: ', reqBody);
    // https://uat-api.taxbuddy.com/itr/cloud/files?actionBy=%7BuserId%7D
    this.itrMsService.deleteMethodWithRequest(path, reqBody).subscribe((response: any) => {
      this.utilsService.showSnackBar(response.response);
      this.getItrDocuments();
    },
      error => {
        this.utilsService.showSnackBar(error.response);
      })
  }

  deletedFileInfo(cloudFileId) {
    this.deletedFileData = [];
    this.loading = true;
    let param = '/cloud/log?cloudFileId=' + cloudFileId;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      this.loading = false;
      this.deletedFileData = res;
      console.log('Deleted file detail info: ', this.deletedFileData);
    },
      error => {
        this.loading = false;
      })
  }

  closeDialog() {
    this.deletedFileData = [];
  }

  afterUploadDocs(fileUpload) {
    if (fileUpload === 'File uploaded successfully') {
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

    console.log('docDetails => ', this.docDetails)
  }

  getTotal() {
    return this.dividendIncomes.controls['quarter1'].value + this.dividendIncomes.controls['quarter2'].value + this.dividendIncomes.controls['quarter3'].value + this.dividendIncomes.controls['quarter4'].value + this.dividendIncomes.controls['quarter5'].value;
  }
  calFamPension() {
    if (this.familyPension.valid) {
      this.famPenDeduction = (this.familyPension.value / 3 > 15000 ? 15000 : this.familyPension.value / 3).toFixed()
      this.totalFamPenDeduction = (this.familyPension.value - this.famPenDeduction).toFixed();
    }
  }

  exemptIncomesCallInConstructor(exemptIncomesDropdown) {
    this.exemptIncomesGridOptions = <GridOptions>{
      rowData: this.exemptIncomesCreateRowData(exemptIncomesDropdown),
      columnDefs: this.exemptIncomeCreateColumnDef(exemptIncomesDropdown),
      onGridReady: () => {
        this.exemptIncomesGridOptions.api.sizeColumnsToFit();
      },

      // frameworkComponents: {
      //   numericEditor: NumericEditorComponent
      // },
      suppressDragLeaveHidesColumns: true,
      // enableCellChangeFlash: true,
      enableCellTextSelection: true,
      defaultColDef: {
        resizable: true,
        cellRendererFramework: AgTooltipComponent,
        cellRendererParams: (params: ICellRendererParams) => {
          this.formatToolTip(params.data)
        }
      },
    };
  }

  formatToolTip(params: any) {
    const nameArray = this.exemptIncomesDropdown.filter((item: any) => item.value === params.natureDesc);
    let temp = nameArray[0].label;
    const lineBreak = false;
    return { temp, lineBreak }
  }

  exemptIncomeCreateColumnDef(exemptIncomesDropdown) {
    return [
      {
        headerName: 'Income Type',
        field: 'natureDesc',
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          console.log('AAAA', params);
          if (exemptIncomesDropdown.length !== 0) {
            const nameArray = exemptIncomesDropdown.filter((item: any) => item.value === params.data.natureDesc);
            return nameArray[0].label;
          } else {
            return params.data.natureDesc;
          }
        },
        editable: false,
        tooltip: function (params) {
          console.log('AAAA', params);
          if (exemptIncomesDropdown.length !== 0) {
            const nameArray = exemptIncomesDropdown.filter((item: any) => item.value === params.data.natureDesc);
            return nameArray[0].label;
          } else {
            return params.data.natureDesc;
          }
        },
      },
      {
        headerName: 'Exempt Amount',
        field: 'amount',
        editable: true,
        suppressMovable: true,
        cellEditor: 'numericEditor',
        width: 100,
      },
      {
        headerName: 'Clear',
        editable: false,
        suppressMovable: true,
        suppressMenu: true,
        sortable: true,
        width: 60,
        cellStyle: { textAlign: 'center' },
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Clear" style="border: none;
          background: transparent; font-size: 16px; cursor:pointer;color: red">
          <i class="fa fa-times-circle" aria-hidden="true" data-action-type="remove"></i>
         </button>`;
        },
      },
    ];
  }

  public onExemptIncomesRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          this.exemptIncomesGridOptions.rowData.splice(params.rowIndex, 1, {
            id: params.data.id,
            natureDesc: params.data.natureDesc,
            OthNatOfInc: '',
            amount: 0
          });
          this.exemptIncomesGridOptions.api?.setRowData(this.exemptIncomesGridOptions.rowData);
          break;
        }
      }
    }
  }

  exemptIncomesCreateRowData(exemptIncomesDropdown) {
    const data = [];
    for (let i = 0; i < exemptIncomesDropdown.length; i++) {
      data.push({
        id: i,
        natureDesc: exemptIncomesDropdown[i].value,
        OthNatOfInc: '',
        amount: null
      });
    }
    return data;
  }
}
