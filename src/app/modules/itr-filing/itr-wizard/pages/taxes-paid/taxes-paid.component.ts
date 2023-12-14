import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  Input,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { GridOptions, ValueSetterParams } from 'ag-grid-community';
import {
  ITR_JSON,
  OnSalary,
  OtherThanSalary16A,
  OtherThanSalary26QB,
  OtherThanTDSTCS,
  TCS,
  TaxPaid,
} from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';
import { AppConstants } from 'src/app/modules/shared/constants';
import { AgGridMaterialSelectEditorComponent } from 'src/app/modules/shared/dropdown.component';
import { CustomDateComponent } from 'src/app/modules/shared/date.component';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import * as moment from 'moment';
import { WizardNavigation } from '../../../../itr-shared/WizardNavigation';
import { TdsOtherThanSalaryComponent } from '../../components/tds-other-than-salary/tds-other-than-salary.component';
import { TdsOnSalaryComponent } from '../../components/tds-on-salary/tds-on-salary.component';
import { SelectionComponent } from './selection-component/selection-component.component';
import { MatDialog } from '@angular/material/dialog';
import { RowGroupingDisplayType } from 'ag-grid-community';
import { TcsComponent } from '../../components/tcs/tcs.component';
import { AdvanceTaxPaidComponent } from '../../components/advance-tax-paid/advance-tax-paid.component';
import { TdsTypeCellRenderer } from './tds-type-cell-renderer';
import { param } from 'jquery';

@Component({
  selector: 'app-taxes-paid',
  templateUrl: './taxes-paid.component.html',
  styleUrls: ['./taxes-paid.component.scss'],
})
export class TaxesPaidComponent extends WizardNavigation implements OnInit {
  loading: boolean = false;
  @ViewChild('other') private tdsOtherThanSalaryComponent;
  @ViewChild('panBased') private tdsOtherThanSalaryComponent1;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  itrDocuments = [];
  deletedFileData: any = [];
  step: any = 0;
  isAddSalary: number;
  isAddTcs: number;
  isAddAdvance: number;
  allTdsDetails: GridOptions;
  public groupDisplayType: RowGroupingDisplayType = 'groupRows';
  onSalary: any = [];
  isTaxesPaid: Number;
  @Input() taxPaid: TaxPaid;
  assetList: any;

  constructor(
    public utilsService: UtilsService,
    private itrMsService: ItrMsService,
    private matDialog: MatDialog,
    private datePipe: DatePipe
  ) {
    super();
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(
      sessionStorage.getItem(AppConstants.ITR_JSON)
    );
    let taxPaidData = this.ITR_JSON.taxPaid;
    if (taxPaidData) {
      this.taxPaid = taxPaidData;
    } else {
      this.taxPaid = {
        onSalary: [],
        otherThanSalary16A: [],
        otherThanSalary26QB: [],
        otherThanTDSTCS: [],
        paidRefund: [],
        tcs: []
      };
    }

    this.allTdsDetails = <GridOptions>{
      rowData: this.tdsDetailCreateRowData(),
      columnDefs: this.tdsDetailCreateColumnDef(
        this.headOfIncomeDropdownTDS2,
        this.headOfIncomeDropdownTDS3
      ),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      rowSelection: 'multiple',
      isRowSelectable: (params) => {
        return !params.data.isFullWidth;
      },
      onGridReady: (params) => {},
      isFullWidthRow: (params) => {
        // return isFullWidth(params.rowNode.data);
        return params.rowNode.data.isFullWidth;
      },
      // see AG Grid docs cellRenderer for details on how to build cellRenderers
      fullWidthCellRenderer: TdsTypeCellRenderer,
      onSelectionChanged: (event) => {
        event.api.getSelectedRows().forEach((row) => {
          row.hasEdit = true;
        });
        if (event.api.getSelectedRows().length === 0) {
          this.assetList.forEach((asset: any) => {
            asset.hasEdit = false;
          });
        }
      },
      sortable: true,
      pagination: true,
      paginationPageSize: 20,
    };
    this.allTdsDetails.api?.setRowData(this.assetList);
  }

  headOfIncomeDropdownTDS2 = [
    {
      name: 'Income from business and Profession',
      code: 'BP',
      disabled: false,
    },
    { name: 'Income from House Property', code: 'HP', disabled: false },
    { name: 'Income from Other Source', code: 'OS', disabled: false },
    { name: 'Exempt Income', code: 'EI', disabled: false },
    { name: 'Not Applicable(194N)', code: 'NA', disabled: false },
  ];

  headOfIncomeDropdownTDS3 = [
    {
      name: 'Income from business and Profession',
      code: 'BP',
      disabled: false,
    },
    { name: 'Income from House Property', code: 'HP', disabled: false },
    { name: 'Income from Capital Gains', code: 'CG', disabled: false },
    { name: 'Income from Other Source', code: 'OS', disabled: false },
    { name: 'Exempt Income', code: 'EI', disabled: false },
    { name: 'Not Applicable(194N)', code: 'NA', disabled: false },
  ];

  ngOnInit() {
    this.getItrDocuments();
  }

  editTaxesPaid(type, index?) {
    if (type === 'tdsOnSalary') {
      const dialogRef = this.matDialog.open(TdsOnSalaryComponent, {
        data: {
          isTaxesPaid: this.isTaxesPaid,
          assetIndex: index,
        },
        closeOnNavigation: true,
        disableClose: false,
        width: '100%',
      });

      dialogRef.afterClosed().subscribe((result) => {
        console.log('Result of tdsOnSalary:', result);
        if (result !== undefined) {
          if (index != null) {
            this.taxPaid.onSalary[index] = result.cgObject.salaryArray[0];
            this.Copy_ITR_JSON.taxPaid = this.taxPaid;
          }
          this.allTdsDetails.api?.setRowData(this.tdsDetailCreateRowData());
          this.saveAll();
        }
      });
    } else if (type === 'tdsOtherThanSalary16A') {
      const dialogRef = this.matDialog.open(TdsOtherThanSalaryComponent, {
        data: {
          isTaxesPaid: this.isTaxesPaid,
          assetIndex: index,
          showHeadOfIncome: 'TDTS',
        },
        closeOnNavigation: true,
        disableClose: false,
        width: '100%',
      });

      dialogRef.afterClosed().subscribe((result) => {
        console.log('Result of tdsOtherThanSalary16A:', result);
        if (result !== undefined) {
          if (index != null) {
            this.taxPaid.otherThanSalary16A[index] =
              result?.cgObject?.salaryArray[0];
            this.Copy_ITR_JSON.taxPaid = this.taxPaid;
            this.allTdsDetails.api?.setRowData(this.tdsDetailCreateRowData());
            this.saveAll();
          }
        }
      });
    } else if (type === 'tdsOtherThanSalaryPanBased') {
      const dialogRef = this.matDialog.open(TdsOtherThanSalaryComponent, {
        data: {
          isTaxesPaid: this.isTaxesPaid,
          assetIndex: index,
          showHeadOfIncome: 'TDTSP',
        },
        closeOnNavigation: true,
        disableClose: false,
        width: '100%',
      });

      dialogRef.afterClosed().subscribe((result) => {
        console.log('Result of tdsOtherThanSalary16A:', result);
        if (result !== undefined) {
          if (index != null) {
            this.taxPaid.otherThanSalary26QB[index] =
              result?.cgObject?.salaryArray[0];
            this.Copy_ITR_JSON.taxPaid = this.taxPaid;
            this.allTdsDetails.api?.setRowData(this.tdsDetailCreateRowData());
            this.saveAll();
          }
        }
      });
    } else if (type === 'tcs') {
      const dialogRef = this.matDialog.open(TcsComponent, {
        data: {
          isTaxesPaid: this.isTaxesPaid,
          assetIndex: index,
        },
        closeOnNavigation: true,
        disableClose: false,
        width: '100%',
      });

      dialogRef.afterClosed().subscribe((result) => {
        console.log('Result of tcs:', result);
        if (result !== undefined) {
          if (index != null) {
            this.taxPaid.tcs[index] = result?.cgObject?.salaryArray[0];
            this.Copy_ITR_JSON.taxPaid = this.taxPaid;
            this.allTdsDetails.api?.setRowData(this.tdsDetailCreateRowData());
            this.saveAll();
          }
        }
      });
    } else if (type === 'selfAssessment') {
      const dialogRef = this.matDialog.open(AdvanceTaxPaidComponent, {
        data: {
          isTaxesPaid: this.isTaxesPaid,
          assetIndex: index,
        },
        closeOnNavigation: true,
        disableClose: false,
        width: '100%',
      });

      dialogRef.afterClosed().subscribe((result) => {
        console.log('Result of advanceTax:', result);
        if (result !== undefined) {
          if (index != null) {
            this.taxPaid.otherThanTDSTCS[index] =
              result?.cgObject?.salaryArray[0];
            this.Copy_ITR_JSON.taxPaid = this.taxPaid;
            this.allTdsDetails.api?.setRowData(this.tdsDetailCreateRowData());
            this.saveAll();
          }
        }
      });
    }
  }

  addTaxesPaid(isEdit, index?) {
    this.isTaxesPaid = Math.random();
    const dialogRefSelect = this.matDialog.open(SelectionComponent, {
      data: {
        assetIndex: this.totalEntries
      },
      closeOnNavigation: true,
      disableClose: false,
      width: '700px',
    });

    dialogRefSelect.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        if (result.type === 'tdsOnSalary') {
          if(!this.taxPaid?.onSalary){
            this.taxPaid.onSalary = [];
          }
          this.taxPaid?.onSalary?.push(result.cgObject.salaryArray[0]);
        }
        if (result.type === 'tdsOtherThanSalary16A') {
          if(!this.taxPaid?.otherThanSalary16A){
            this.taxPaid.otherThanSalary16A = [];
          }
          this.taxPaid?.otherThanSalary16A?.push(
            result.cgObject.salaryArray[0]
          );
        }
        if (result.type === 'tdsOtherThanSalaryPanBased') {
          if(!this.taxPaid?.otherThanSalary26QB){
            this.taxPaid.otherThanSalary26QB = [];
          }
          this.taxPaid?.otherThanSalary26QB?.push(
            result.cgObject.salaryArray[0]
          );
        }
        if (result.type === 'tcs') {
          if(!this.taxPaid?.tcs){
            this.taxPaid.tcs = [];
          }
          this.taxPaid?.tcs?.push(result.cgObject.salaryArray[0]);
        }
        if (result.type === 'selfAssessment') {
          if(!this.taxPaid?.otherThanTDSTCS){
            this.taxPaid.otherThanTDSTCS = [];
          }
          this.taxPaid?.otherThanTDSTCS?.push(result.cgObject.salaryArray[0]);
        }
        this.Copy_ITR_JSON.taxPaid = this.taxPaid;
        sessionStorage.setItem(
          AppConstants.ITR_JSON,
          JSON.stringify(this.Copy_ITR_JSON)
        );
        this.allTdsDetails.api?.setRowData(this.tdsDetailCreateRowData());
      }
    });
    this.allTdsDetails.api?.setRowData(this.tdsDetailCreateRowData());
  }

  totalEntries = 0;
  tdsDetailCreateRowData() {
    let counter = 0;
    this.totalEntries = 0;
    this.assetList = [];
    if (this.taxPaid?.onSalary?.length > 0) {
      this.assetList.push({
        isFullWidth: true,
        tdsType: 'TDS On Salary',
      });
    }
    this.taxPaid?.onSalary?.forEach((asset) => {
      let copy: any = {};
      Object.assign(copy, asset);
      copy.isFullWidth = false;
      copy.hasEdit = false;
      // set tds Type
      copy.tdsType = 'TDS On Salary';
      copy.tdsCode = 'tdsOnSalary';
      this.assetList.push(copy);
      copy.index = counter++;
      copy.srNo = copy.index;
    });
    this.totalEntries += counter;

    counter = 0;
    if (this.taxPaid?.otherThanSalary16A?.length > 0) {
      this.assetList.push({
        isFullWidth: true,
        tdsType: 'TDS Other than Salary',
      });
    }
    this.taxPaid?.otherThanSalary16A?.forEach((asset) => {
      let copy: any = {};
      Object.assign(copy, asset);
      copy.hasEdit = false;
      // set tds Type
      copy.tdsType = 'TDS Other than Salary';
      copy.tdsCode = 'tdsOtherThanSalary16A';
      this.assetList.push(copy);
      copy.index = counter++;
      copy.srNo = copy.index;
    });
    this.totalEntries += counter;

    counter = 0;
    if (this.taxPaid?.otherThanSalary26QB?.length > 0) {
      this.assetList.push({
        isFullWidth: true,
        tdsType: 'TDS other than salary (panBased) 26QB',
      });
    }
    this.taxPaid?.otherThanSalary26QB?.forEach((asset) => {
      let copy: any = {};
      Object.assign(copy, asset);
      copy.hasEdit = false;

      // set tds Type
      copy.tdsType = 'TDS other than salary (panBased) 26QB';
      copy.tdsCode = 'tdsOtherThanSalaryPanBased';

      // Rename specific properties
      copy.deductorTAN = copy.deductorPAN;
      delete copy.deductorPAN;

      this.assetList.push(copy);
      copy.index = counter++;
      copy.srNo = copy.index;
    });
    this.totalEntries += counter;

    counter = 0;
    if (this.taxPaid?.otherThanTDSTCS?.length > 0) {
      this.assetList.push({
        isFullWidth: true,
        tdsType: 'Self assessment or Advance tax',
      });
    }
    this.taxPaid?.otherThanTDSTCS?.forEach((asset) => {
      let copy: any = {};
      Object.assign(copy, asset);
      copy.hasEdit = false;

      // Rename specific properties
      copy.deductorName = copy.bsrCode;
      copy.deductorTAN = copy.challanNumber;
      copy.totalAmountCredited = this.datePipe.transform(
        new Date(copy.dateOfDeposit),
        'dd/MM/yyyy'
      );
      copy.totalTdsDeposited = copy.totalTax;

      delete copy.bsrCode;
      delete copy.challanNumber;
      delete copy.dateOfDeposit;
      delete copy.totalTax;
      // set tds Type
      copy.tdsType = 'Self assessment or Advance tax';
      copy.tdsCode = 'selfAssessment';
      this.assetList.push(copy);
      copy.index = counter++;
      copy.srNo = copy.index;
    });
    this.totalEntries += counter;

    counter = 0;
    if (this.taxPaid?.tcs?.length > 0) {
      this.assetList.push({
        isFullWidth: true,
        tdsType: 'TCS',
      });
    }
    this.taxPaid?.tcs?.forEach((asset) => {
      let copy: any = {};
      Object.assign(copy, asset);
      copy.hasEdit = false;
      // Rename specific properties
      copy.deductorName = copy.collectorName;
      copy.deductorTAN = copy.collectorTAN;
      copy.totalAmountCredited = copy.totalAmountPaid;
      copy.totalTdsDeposited = copy.totalTcsDeposited;

      // set tds Type
      copy.tdsType = 'TCS';
      copy.tdsCode = 'tcs';

      delete copy.collectorName;
      delete copy.collectorTAN;
      delete copy.totalAmountPaid;
      delete copy.totalTcsDeposited;
      this.assetList.push(copy);
      copy.index = counter++;
      // copy.srNo = copy.index;
    });
    this.totalEntries += counter;

    return this.assetList;
  }

  tdsDetailCreateColumnDef(headOfIncomeDropdownTDS2, headOfIncomeDropdownTDS3) {
    return [
      // {
      //   headerName: 'TDS Type',
      //   field: 'tdsType',
      //   rowGroup: true,
      // },
      {
        field: '',
        headerCheckboxSelection: true,
        width: 80,
        pinned: 'left',
        checkboxSelection: (params) => {
          return true;
        },
        cellStyle: function (params: any) {
          return {
            textAlign: 'center',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
          };
        },
      },
      {
        headerName: 'TAN / PAN / Challan Number',
        field: 'deductorTAN',
        editable: false,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.deductorTAN;
        },
      },
      {
        headerName: 'Name / BSR Code',
        field: 'deductorName',
        width: 120,
        editable: false,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.deductorName;
        },
      },
      {
        headerName: 'Total Amount Credited / Date of Deposit',
        field: 'totalAmountCredited',
        width: 120,
        editable: false,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.totalAmountCredited;
        },
      },
      {
        headerName: 'Total TDS deposited',
        field: 'totalTdsDeposited',
        width: 120,
        editable: false,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.totalTdsDeposited;
        },
      },
      {
        headerName: 'Head of Income',
        field: 'headOfIncome',
        editable: false,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          if (params.data.tdsCode === 'tdsOtherThanSalary16A' && params.data.headOfIncome) {
            return headOfIncomeDropdownTDS2.filter(
              (item) => item.code === params.data.headOfIncome
            )[0]?.name;
          }
          if (params.data.tdsCode === 'tdsOtherThanSalaryPanBased' && params.data.headOfIncome) {
            return headOfIncomeDropdownTDS3.filter(
              (item) => item.code === params.data.headOfIncome
            )[0]?.name;
          }
          return '';
        },
      },
      {
        headerName: 'Edit',
        editable: false,
        suppressMovable: true,
        suppressMenu: true,
        sortable: true,
        width: 70,
        pinned: 'right',
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Edit">
          <i class="fa fa-pencil" aria-hidden="true" data-action-type="edit"></i>
         </button>`;
        },
        cellStyle: {
          textAlign: 'center',
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
        },
      },
    ];
  }

  public onTdsDetailRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          console.log('DATA FOR DELETE Asset:', params.data);
          this.deleteAsset();
          break;
        }
        case 'edit': {
          this.editTaxesPaid(params.data.tdsCode, params.data.index);
          break;
        }
      }
    }
  }

  isAssetSelected() {
    return this.assetList.filter((asset) => asset.hasEdit === true).length > 0;
  }

  deleteAsset() {
    //delete improvement for asset
    let filteredArray = this.assetList.filter(
      (asset) => asset.hasEdit === true
    );

    if (filteredArray && filteredArray.length > 0) {
      let filtered = this.taxPaid?.onSalary?.filter(
        (item) =>
          !filteredArray
            ?.filter((element) => element?.tdsType === 'TDS On Salary')
            ?.map((element) => element.srNo)
            ?.includes(parseInt(item.srNo))
      );
      console.log(filtered);
      if(filtered){
        this.taxPaid.onSalary = filtered;
      }

      let filtered1 = this.taxPaid?.otherThanSalary16A?.filter(
        (item) =>
          !filteredArray
            ?.filter((element) => element?.tdsType === 'TDS Other than Salary')
            ?.map((element) => element?.srNo)
            ?.includes(parseInt(item?.srNo))
      );
      console.log(filtered1);

      if(filtered1){
        this.taxPaid.otherThanSalary16A = filtered1;
      }

      let filtered2 = this.taxPaid?.otherThanSalary26QB?.filter(
        (item) =>
          !filteredArray
            ?.filter(
              (element) =>
                element?.tdsType === 'TDS other than salary (panBased) 26QB'
            )
            ?.map((element) => element?.srNo)
            ?.includes(parseInt(item?.srNo))
      );
      console.log(filtered2);
      if(filtered2){
        this.taxPaid.otherThanSalary26QB = filtered2;
      }

      let filtered3 = this.taxPaid?.otherThanTDSTCS?.filter(
        (item) =>
          !filteredArray
            ?.filter(
              (element) => element?.tdsType === 'Self assessment or Advance tax'
            )
            ?.map((element) => element?.srNo)
            ?.includes(parseInt(item?.srNo))
      );
      console.log(filtered3);
      if(filtered3){
        this.taxPaid.otherThanTDSTCS = filtered3;
      }

      let filtered4 = this.taxPaid?.tcs?.filter(
        (item) =>
          !filteredArray
            ?.filter((element) => element?.tdsType === 'TCS')
            ?.map((element) => element?.srNo)
            ?.includes(item?.srNo)
      );
      console.log(filtered4);
      if(filtered4){
        this.taxPaid.tcs = filtered4;
      }
    }

    console.log(this.taxPaid);
    this.Copy_ITR_JSON.taxPaid = this.taxPaid;
    sessionStorage.setItem(
      AppConstants.ITR_JSON,
      JSON.stringify(this.Copy_ITR_JSON)
    );
    this.assetList = this.assetList?.filter((asset) => asset?.hasEdit != true);
    this.allTdsDetails?.api?.setRowData(this.tdsDetailCreateRowData());
  }

  saveAll() {
    this.loading = true;

    this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
      (result: ITR_JSON) => {
        this.ITR_JSON = result;
        sessionStorage.setItem(
          AppConstants.ITR_JSON,
          JSON.stringify(this.ITR_JSON)
        );
        this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
        this.loading = false;
        this.utilsService.showSnackBar('Tds updated successfully.');
        this.saveAndNext.emit(false);
        // this.saveAndNext.emit({ subTab: true, tabName: 'CAPITAL' });
      },
      (error) => {
        this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
        this.utilsService.showSnackBar('Failed to update tds.');
        this.loading = false;
      }
    );
  }

  getItrDocuments() {
    const param1 = `/cloud/signed-s3-urls?currentPath=${this.ITR_JSON.userId}/ITR/2019-20/Original/ITR Filing Docs`;
    this.itrMsService.getMethod(param1).subscribe((result: any) => {
      this.itrDocuments = result;
    });
  }

  deleteFile(fileName) {
    let adminId = this.utilsService.getLoggedInUserID();
    var path = '/itr/cloud/files?actionBy=' + adminId;
    let filePath = `${this.ITR_JSON.userId}/ITR/2019-20/Original/ITR Filing Docs/${fileName}`;
    var reqBody = [filePath];
    console.log(
      'URL path: ',
      path,
      ' filePath: ',
      filePath,
      ' Request body: ',
      reqBody
    );
    // https://uat-api.taxbuddy.com/itr/cloud/files?actionBy=%7BuserId%7D
    this.itrMsService.deleteMethodWithRequest(path, reqBody).subscribe(
      (response: any) => {
        this.utilsService.showSnackBar(response.response);
        this.getItrDocuments();
      },
      (error) => {
        this.utilsService.showSnackBar(error.response);
      }
    );
  }

  deletedFileInfo(cloudFileId) {
    this.deletedFileData = [];
    this.loading = true;
    let param = '/cloud/log?cloudFileId=' + cloudFileId;
    this.itrMsService.getMethod(param).subscribe(
      (res: any) => {
        this.loading = false;
        this.deletedFileData = res;
        console.log('Deleted file detail info: ', this.deletedFileData);
      },
      (error) => {
        this.loading = false;
      }
    );
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
    docType: '',
  };
  getDocsUrl(index) {
    if (this.itrDocuments.length > 0) {
      const docType = this.itrDocuments[index].fileName.split('.').pop();
      if (this.itrDocuments[index].isPasswordProtected) {
        this.docDetails.docUrl =
          this.itrDocuments[index].passwordProtectedFileUrl;
      } else {
        this.docDetails.docUrl = this.itrDocuments[index].signedUrl;
      }
      this.docDetails.docType = docType;
    } else {
      this.docDetails.docUrl = '';
      this.docDetails.docType = '';
    }
  }

  //new design
  addMore(type) {
    if (type === 'salary') {
      this.isAddSalary = Math.random();
    } else if (type === 'other') {
      this.tdsOtherThanSalaryComponent.addSalary();
    } else if (type === 'panBased') {
      this.tdsOtherThanSalaryComponent1.addSalary();
    } else if (type === 'tcs') {
      this.isAddTcs = Math.random();
    } else if (type === 'advance') {
      this.isAddAdvance = Math.random();
    }
  }
  setStep(index: number) {
    this.step = index;
  }

  goBack() {
    this.saveAndNext.emit(false);
    //this.router.navigate(['/itr-filing/itr']);
  }
}

function extractValues(mappings) {
  const array = [];
  if (mappings) {
    mappings.forEach((element) => {
      array.push(element);
    });
  }
  // console.log("")
  return array;
}

function lookupValue(mappings, key) {
  let country = '';
  mappings.forEach((element) => {
    if (element.code === key) {
      country = element.name;
    }
  });
  if (country !== '' && country !== undefined && country !== null) {
    return `${country[0]}${country.substr(1).toLowerCase()}`;
  } else {
    return '';
  }
}

// convert value to code
function lookupKey(mappings, name) {
  mappings.forEach((element) => {
    if (element.code === name) {
      return element.name;
    }
  });
}
