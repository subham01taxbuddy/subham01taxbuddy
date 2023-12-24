import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { FixedAssetsDetails, ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddBalanceSheetComponent } from '../add-balance-sheet/add-balance-sheet.component';
import { AppConstants } from 'src/app/modules/shared/constants';
@Component({
  selector: 'app-depreciation-dialog',
  templateUrl: './depreciation-dialog.component.html',
  styleUrls: ['./depreciation-dialog.component.scss']
})
export class DepreciationDialogComponent implements OnInit {
  @Output() onSave = new EventEmitter();
  loading: boolean = false;
  depreciationForm: FormGroup;
  config: any;

  assetTypeList = [
    { key: 'LaptopComputer', value: 'Laptop & Computers (40%)' },
    { key: 'PlantAndMachinery', value: 'Plant & Machinery (Mobile phones & others, etc.) (15%)' },
    { key: 'FurnitureAndFittings', value: 'Furniture & Fittings (10%)' },
    { key: 'IntangibleAssets', value: 'Intangible Assets (25%)' },
  ]
  depreciationRateList = [
    { key: 'FULL', value: 'Full Rate' },
    { key: 'HALF', value: 'Half Rate' },
  ]

  public depreciationGridOptions: GridOptions;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  depreciationData: FixedAssetsDetails = {
    hasEdit: true,
    id: null,
    assetType: null,
    description: null,
    bookValue: null,
    depreciationRate: null,
    depreciationAmount: null,
    fixedAssetClosingAmount: null,
  }
  @Input() depreciationObj: any;

  constructor(
    public matDialog: MatDialog,
    public itrMsService: ItrMsService,
    public utilsService: UtilsService,
    public toastMsgService: ToastMessageService,
    public fb: FormBuilder,
    public dialogRef: MatDialogRef<DepreciationDialogComponent>,
    // @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

  }

  ngOnInit(): void {
    // let rowData = this.data.list ? this.data.list : [];
    // this.getDepreciationTableData(rowData);
    console.log('depreciationObj', this.depreciationObj);
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.config = {
      itemsPerPage: 2,
      currentPage: 1,
    };
    console.log(this.Copy_ITR_JSON);
    this.depreciationForm = this.initDepreciationForm();
    if (this.Copy_ITR_JSON?.business.fixedAssetsDetails && this.Copy_ITR_JSON?.business.fixedAssetsDetails.length > 0) {
      this.Copy_ITR_JSON.business.fixedAssetsDetails.forEach(item => {
        this.addMore(item);
      })
    } else {
      this.addMore();
    }
  }




  initDepreciationForm() {
    return this.fb.group({
      totalGrossBlock: [],
      totalDepreciationAmount: [],
      totalNetBlock: [],
      depreciationArray: this.fb.array([]),
    })
  }

  createForm(obj?: FixedAssetsDetails): FormGroup {
    return this.fb.group({
      hasEdit: [],
      id: [obj?.id || null],
      assetType: [obj?.assetType || null, Validators.required],
      description: [obj?.description || null, Validators.required],
      bookValue: [obj?.bookValue || null, Validators.required],
      depreciationRate: [obj?.depreciationRate || null, Validators.required],
      depreciationAmount: [obj?.depreciationAmount || null],
      fixedAssetClosingAmount: [obj?.fixedAssetClosingAmount || null],
    })
  }

  saveDepreciationDetails(formGroup: any) {
    console.log(formGroup)
    if (formGroup.valid) {
      this.loading = true;
      let param = '/calculate/depreciation';
      let request = {
        "assetType": formGroup.controls['assetType'].value,
        "bookValue": formGroup.controls['bookValue'].value,
        "depreciationRate": formGroup.controls['depreciationRate'].value,
      };
      this.itrMsService.postMethod(param, request).subscribe((result: any) => {
        if (result.success) {
          formGroup.controls['depreciationAmount'].setValue(result.data.depreciationAmount);
          formGroup.controls['fixedAssetClosingAmount'].setValue(result.data.bookValueAfterDepreciation);
          this.toastMsgService.alert("message", "Depreciation amount and depreciation percentage calculated successfully.");
          this.calculateDepreciationTotal();
        } else {
          this.loading = false;
          this.toastMsgService.alert("error", "Failed to calculate Depreciation amount and depreciation percentage.");
        }
        // this.dialogRef.close(this.depreciationForm.value);
        this.loading = false;
      },
        error => {
          this.loading = false;
          this.toastMsgService.alert("error", "Failed to calculate Depreciation amount and depreciation percentage.");

        })

    }
  }

  save() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    if (this.depreciationForm.valid) {
      console.log("formGroup", this.depreciationForm)
      // this.Copy_ITR_JSON.fixedAssetsDetails = this.depreciationForm.value;
      const depreciationArray = <FormArray>this.depreciationForm.get('depreciationArray');
      this.Copy_ITR_JSON.fixedAssetsDetails = depreciationArray.getRawValue();
      sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.Copy_ITR_JSON));
      this.onSave.emit(this.Copy_ITR_JSON);
      this.loading = false;
      this.utilsService.showSnackBar('depreciation data saved successfully.');
    } else {
      this.loading = false;
      this.utilsService.showSnackBar('Failed to save depreciation data.');
    }
  }

  get getDepreciationArray() {
    return <FormArray>this.depreciationForm.get('depreciationArray');
  }

  addMore(item?) {
    const depreciationArray = <FormArray>this.depreciationForm.get('depreciationArray');
    depreciationArray.push(this.createForm(item));
    this.calculateDepreciationTotal();
  }

  edit(i, formGroup: any) {
    formGroup['controls']['description'].enable()
    formGroup['controls']['assetType'].enable()
    formGroup['controls']['bookValue'].enable()
    formGroup['controls']['depreciationRate'].enable()
    formGroup['controls']['depreciationAmount'].enable()
    formGroup['controls']['fixedAssetClosingAmount'].enable()
    // (formGroup['controls'][i]).enable();
  }


  cancel() {
    this.dialogRef.close();
  }

  deleteDepreciationArray() {
    const depreciationArray = <FormArray>this.depreciationForm.get('depreciationArray');
    depreciationArray.controls = depreciationArray.controls.filter(element => !(element as FormGroup).controls['hasEdit'].value);
    this.calculateDepreciationTotal();
  }

  calculateDepreciationTotal() {
    let totalGrossBlock = 0;
    let totalDepreciationAmount = 0;
    let totalNetBlock = 0;
    const depreciationArray = <FormArray>this.depreciationForm.get('depreciationArray');
    if (depreciationArray.controls.length) {
      depreciationArray.controls.forEach((element, index) => {
        if ((element as FormGroup).controls['bookValue'].value) {
          totalGrossBlock += Number((element as FormGroup).controls['bookValue'].value);
          this.depreciationForm.controls['totalGrossBlock'].setValue(totalGrossBlock);
        }
        if ((element as FormGroup).controls['depreciationAmount'].value) {
          totalDepreciationAmount += Number((element as FormGroup).controls['depreciationAmount'].value);
          this.depreciationForm.controls['totalDepreciationAmount'].setValue(totalDepreciationAmount);
        }
        if ((element as FormGroup).controls['fixedAssetClosingAmount'].value) {
          totalNetBlock += Number((element as FormGroup).controls['fixedAssetClosingAmount'].value);
          this.depreciationForm.controls['totalNetBlock'].setValue(totalNetBlock);
        }
      })
      this.save();
    } else {
      this.depreciationForm.controls['totalGrossBlock'].setValue(0);
      this.depreciationForm.controls['totalDepreciationAmount'].setValue(0);
      this.depreciationForm.controls['totalNetBlock'].setValue(0);
      this.save();
    }
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  fieldGlobalIndex(index) {
    return this.config.itemsPerPage * (this.config.currentPage - 1) + index;
  }

  getDepreciationTableData(rowsData) {
    this.depreciationGridOptions = <GridOptions>{
      rowData: rowsData,
      columnDefs: this.createDepreciationColumnDef(rowsData),
      onGridReady: () => {
        this.depreciationGridOptions.api.sizeColumnsToFit();
      },
      suppressDragLeaveHidesColumns: true,
      enableCellChangeFlash: true,
      defaultColDef: {
        resizable: true,
        editable: false
      },
      suppressRowTransform: true
    };
  }

  createDepreciationColumnDef(rowsData) {
    return [
      {
        headerName: 'Description *',
        field: 'description',
        suppressMovable: true,
        editable: false,
        width: 200,
        valueGetter: function nameFromCode(params) {
          return params.data.description ? params.data.description.toLocaleString('en-IN') : params.data.description;
        },
      },

      {
        headerName: 'Asset Type *',
        field: 'assetType',
        suppressMovable: true,
        editable: false,
        width: 200,
        valueGetter: function nameFromCode(params) {
          return params.data.assetType ? params.data.assetType.toLocaleString('en-IN') : params.data.assetType;
        },
      },

      {
        headerName: 'Book Value *',
        field: 'bookValue',
        editable: false,
        suppressMovable: true,
        width: 200,
        valueGetter: function nameFromCode(params) {
          let bookValue = 100 * params.data.depreciationAmount / (100 - params.data.fixedAssetClosingAmount);
          return params.data.bookValue ? params.data.bookValue.toLocaleString('en-IN') : bookValue;
        },
      },

      {
        headerName: 'Depreciation Rate *',
        editable: false,
        field: 'depreciationRate',
        width: 150,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.depreciationRate ? params.data.depreciationRate.toLocaleString('en-IN') : params.data.depreciationRate;
        },
      },
      {
        headerName: 'Depreciation Amount',
        editable: false,
        field: 'depreciationAmount',
        width: 150,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.depreciationAmount ? params.data.depreciationAmount.toLocaleString('en-IN') : params.data.depreciationAmount;
        },
      },
      {
        headerName: 'Closing Fixed Asset Amount',
        editable: false,
        field: 'fixedAssetClosingAmount',
        width: 150,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.fixedAssetClosingAmount ? params.data.fixedAssetClosingAmount.toLocaleString('en-IN') : params.data.fixedAssetClosingAmount;
        },
      },

      {
        headerName: 'Actions',
        editable: false,
        suppressMovable: true,
        suppressMenu: true,
        sortable: true,
        pinned: 'right',
        width: 100,
        cellStyle: { textAlign: 'center' },
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button"  title="Update Bonds details" style="border: none;
          background: transparent; font-size: 16px; cursor:pointer;color: green">
          <i class="fa fa-pencil" aria-hidden="true" data-action-type="edit"></i>
         </button>
          <button type="button" class="action_icon add_button" title="Delete Bonds" style="border: none;
          background: transparent; font-size: 16px; cursor:pointer;color: red">
          <i class="fa fa-trash" aria-hidden="true" data-action-type="remove"></i>
         </button>`;
        },
      },
    ];
  }


  public onDepreciationRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          this.deleteDepreciation(params.rowIndex);
          break;
        }
        case 'edit': {
          this.addDepreciationRow('EDIT', params.data, 'depreciation', params.rowIndex);
          break;
        }
      }
    }
  }

  deleteDepreciation(index) {
    this.depreciationGridOptions.rowData.splice(index, 1);
    this.depreciationGridOptions.api.setRowData(this.depreciationGridOptions.rowData);
  }

  addDepreciationRow(mode, data: any, type, index?) {
    if (mode === 'ADD') {
      const length = this.depreciationGridOptions.rowData.length;
      data.srn = length + 1;
    }

    const dialogRef = this.matDialog.open(AddBalanceSheetComponent, {
      data: {
        mode: mode,
        data: data,
        type: type
      },
      closeOnNavigation: true,
      disableClose: false,
      width: '700px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('DepreciationDialogData=', result);
      if (result !== undefined) {
        if (mode === 'ADD') {
          this.depreciationGridOptions.rowData.push(result);
          this.depreciationGridOptions.api.setRowData(this.depreciationGridOptions.rowData);
        }
        if (mode === 'EDIT') {
          this.depreciationGridOptions.rowData[index] = result;
          this.depreciationGridOptions.api.setRowData(this.depreciationGridOptions.rowData);
        }
      }
    });

  }
  closeDepreciationDialog() {
    this.dialogRef.close(this.depreciationGridOptions.rowData);
  }
}
