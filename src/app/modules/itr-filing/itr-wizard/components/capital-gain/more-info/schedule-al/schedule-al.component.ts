import {
  Component,
  OnInit,
  Inject,
  Output,
  EventEmitter,
  ViewChild,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { UtilsService } from 'src/app/services/utils.service';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { WizardNavigation } from 'src/app/modules/itr-shared/WizardNavigation';
import {GridApi, GridOptions, RowGroupingDisplayType} from 'ag-grid-community';
import { TdsTypeCellRenderer } from '../../../../pages/taxes-paid/tds-type-cell-renderer';
import { AddAssetsComponent } from './add-assets/add-assets.component';
import { ConfirmDialogComponent } from 'src/app/modules/shared/components/confirm-dialog/confirm-dialog.component';
import {MatPaginator} from "@angular/material/paginator";
declare let $: any;
$(document).on('wheel', 'input[type=number]', function (e) {
  $(this).blur();
});

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-schedule-al',
  templateUrl: './schedule-al.component.html',
  styleUrls: ['./schedule-al.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class ScheduleALComponent extends WizardNavigation implements OnInit, OnChanges {
  step = 1;
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() onSave = new EventEmitter();
  Copy_ITR_JSON: ITR_JSON;
  ITR_JSON: ITR_JSON;
  loading: boolean = false;
  config: any;
  editConfig: any;
  immovableAssetForm: FormGroup;
  movableAssetsForm: FormGroup;

  countryDropdown = AppConstants.countriesDropdown;
  stateDropdown = [];
  stateDropdownMaster = AppConstants.stateDropdown;

  immovableAssets: any;
  searchParam: any = {
    page: 0,
    pageSize: 20,
  };
  immovableAssetGridOptions: GridOptions;
  immovableAssetGridApi: GridApi;
  public groupDisplayType: RowGroupingDisplayType = 'groupRows';

  constructor(
    public fb: FormBuilder,
    private utilsService: UtilsService,
    private itrMsService: ItrMsService,
    private matDialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cdRef: ChangeDetectorRef
  ) {
    super();
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(
      sessionStorage.getItem(AppConstants.ITR_JSON)
    );

    let asset = this.Copy_ITR_JSON.immovableAsset;
    console.log('assets',asset)
    if(asset){
      this.immovableAssets = asset
    }else{
      this.immovableAssets =[];
    }


    this.immovableAssetGridOptions = <GridOptions>{
      rowData: this.immovableAssets,
      columnDefs: this.reportsCodeColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      rowSelection: 'multiple',
      isRowSelectable: (params) => {
        return !params.data.isFullWidth;
      },
      onGridReady: (params) => {
        this.immovableAssetGridApi = params.api;
        params.api.setRowData(this.immovableAssets);
      },
      isFullWidthRow: (params) => {
        // return isFullWidth(params.rowNode.data);
        return params.rowNode.data.isFullWidth;
      },
      fullWidthCellRenderer: TdsTypeCellRenderer,
      onSelectionChanged: (event) => {
        event.api.getSelectedRows().forEach((row) => {
          row.hasEdit = true;
        });
      },
      sortable: true,
      pagination: true,
      paginationPageSize: 20,
      filter: true,

    };

    this.immovableAssetGridOptions.api?.setRowData(this.immovableAssets);

    this.config = {
      itemsPerPage: this.searchParam.pageSize,
      currentPage: 1,
      totalItems: null,
    };
    this.editConfig = {
      // id: 'schALPagination',
      itemsPerPage: 1,
      currentPage: 1,
      // totalItems: this.immovableAssets.length
    };
  }

  ngOnInit() {
    // this.immovableAssetForm = this.createImmovableAssetForm(0);
    this.stateDropdown = this.stateDropdownMaster;

     this.immovableAssetForm = this.initForm();

    if (this.Copy_ITR_JSON.immovableAsset) {
      this.Copy_ITR_JSON.immovableAsset.forEach((obj) => {
        this.addMoreAssetsData(obj);
      });
    } else {
      this.addMoreAssetsData();
    }
    if (
      this.Copy_ITR_JSON.movableAsset &&
      this.Copy_ITR_JSON.movableAsset.length > 0
    ) {
      this.Copy_ITR_JSON.movableAsset.forEach((obj) => {
        this.createMovableAssetsForm(obj);
      });
    } else {
      this.createMovableAssetsForm();
    }

    // this.immovableAssetForm?.disable();
    //  this.movableAssetsForm?.disable();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('changed')
  }

  initForm() {
    return this.fb.group({
      immovableAssetArray: this.fb.array([]),
    });
  }

  createImmovableAssetForm(srn, item?): FormGroup {
    return this.fb.group({
      hasEdit: [item ? item.hasEdit : false],
      srn: [item ? item.srn : srn],
      description: [item ? item.description : ''],
      amount: [item ? item.amount : null, Validators.required],
      flatNo: [item ? item.flatNo : '', Validators.required],
      premisesName: [item ? item.premisesName : ''],
      road: [item ? item.road : ''],
      area: [item ? item.area : '', Validators.required],
      state: [item ? item.state : '', Validators.required],
      country: [item ? item.country : '91', Validators.required],
      city: [item ? item.city : '', Validators.required],
      pinCode: [
        item ? item.pinCode : '',
        Validators.compose([
          Validators.minLength(6),
          Validators.maxLength(6),
          Validators.required,
          Validators.pattern(AppConstants.PINCode),
        ]),
      ],
    });
  }

  createMovableAssetsForm(item?) {
    this.movableAssetsForm = this.fb.group({
      hasEdit: [item ? item.hasEdit : false],
      jwelleryAmount: [item ? item?.jwelleryAmount : 0],
      artWorkAmount: [item ? item.artWorkAmount : 0],
      vehicleAmount: [item ? item.vehicleAmount : 0],
      bankAmount: [item ? item.bankAmount : 0],
      shareAmount: [item ? item.shareAmount : 0],
      insuranceAmount: [item ? item.insuranceAmount : 0],
      loanAmount: [item ? item.loanAmount : 0],
      cashInHand: [item ? item.cashInHand : 0],
      assetLiability: [item ? item.assetLiability : 0],
    });
  }

  async updateDataByPincode(immovableAssets) {
    let pincode = immovableAssets.controls['pinCode'];
    await this.utilsService.getPincodeData(pincode).then((result) => {
      immovableAssets.controls['city'].setValue(result.city);
      immovableAssets.controls['country'].setValue(result.countryCode);
      immovableAssets.controls['state'].setValue(result.stateCode);
    });
  }

  mode = 'VIEW';

  addMore() {
    this.mode = 'EDIT';
    const immovableAssetArray = <FormArray>(
      this.immovableAssetForm.get('immovableAssetArray')
    );
    if (immovableAssetArray.valid || immovableAssetArray === null) {
      this.addMoreAssetsData();
    } else {
      immovableAssetArray.controls.forEach((element) => {
        if ((element as FormGroup).invalid) {
          element.markAsDirty();
          element.markAllAsTouched();
        }
      });
    }

    // const dialogRefSelect = this.matDialog.open(AddAssetsComponent, {
    //   closeOnNavigation: true,
    //   disableClose: false,
    //   width: '800px',
    // });
    //
    // dialogRefSelect.afterClosed().subscribe((result) => {
    //   if (result !== undefined) {
    //     this.immovableAssets.push(result.data);
    //     this.immovableAssetGridOptions.api?.setRowData(this.immovableAssets);
    //   }
    // });
  }


  activeIndex = 0;
  markActive(index){
    this.activeIndex = index;
    setTimeout(()=>{
      let assetsArray = this.immovableAssetForm.get('immovableAssetArray') as FormArray;
      let value = assetsArray.controls[index].value;
      assetsArray.controls[index].reset();
      assetsArray.controls[index].setValue(value);
      (assetsArray.controls[index] as FormGroup).controls['amount'].setValue(value.amount);
      assetsArray.controls[index].markAsDirty();
      assetsArray.controls[index].updateValueAndValidity();
      this.immovableAssetForm.markAsTouched();
      this.immovableAssetForm.updateValueAndValidity();
      this.cdRef.detectChanges();
    }, 100);
    this.editConfig.currentPage = this.activeIndex;

  }

  @ViewChild('paginator') paginator: MatPaginator;
  getTotalCount(){
    return (<FormArray>this.immovableAssetForm.get('immovableAssetArray')).controls.length;
  }

  editAssetForm(i, type) {
    if (type === 'immovable') {
      (
        (this.immovableAssetForm?.controls['immovableAssetArray'] as FormGroup)
          .controls[i] as FormGroup
      ).enable();
    }
  }

  get immovableAssetArray() {
    return <FormArray>this.immovableAssetForm?.get('immovableAssetArray');
  }

  addMoreAssetsData(item?) {
    const immovableAssetArray = <FormArray>(
      this.immovableAssetForm?.get('immovableAssetArray')
    );

    immovableAssetArray.push(
      this.createImmovableAssetForm(immovableAssetArray.length, item)
    );
    this.activeIndex = immovableAssetArray.length -1;
    this.immovableAssetForm.markAsTouched();
    this.immovableAssetForm.updateValueAndValidity();

  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  fieldGlobalIndex(index) {
    return this.config.itemsPerPage * (this.config.currentPage - 1) + index;
  }

  saveImmovableAssets() {
    if (this.immovableAssetForm.valid) {
      console.log(this.immovableAssetForm, 'Immovable asset form');
      this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      const immovableAssetArray = <FormArray>(
        this.immovableAssetForm.get('immovableAssetArray')
      );

      this.Copy_ITR_JSON.immovableAsset = [];
      this.Copy_ITR_JSON.immovableAsset = immovableAssetArray.getRawValue();
      sessionStorage.setItem(
        AppConstants.ITR_JSON,
        JSON.stringify(this.Copy_ITR_JSON)
      );
      this.loading = true;
      this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
        (result: any) => {
          this.ITR_JSON = result;
          sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
          this.utilsService.showSnackBar(
            'Immovable Properties Saved Successfully'
          );
          this.loading = false;
          this.utilsService.smoothScrollToTop();
          this.mode = 'VIEW';
          this.immovableAssets = this.Copy_ITR_JSON.immovableAsset;
          this.immovableAssetGridApi?.setRowData(this.immovableAssets);
        },
        (error) => {
          this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
          this.utilsService.showSnackBar('Failed to Save Immovable Properties');
          this.loading = false;
          this.utilsService.smoothScrollToTop();
        }
      );
    }
  }

  saveMovableAssets() {
    if (this.movableAssetsForm) {
      console.log(this.movableAssetsForm, 'movable asset form');
      this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

      this.Copy_ITR_JSON.movableAsset = [];
      this.Copy_ITR_JSON.movableAsset.push(
        this.movableAssetsForm.getRawValue()
      );
      sessionStorage.setItem(
        AppConstants.ITR_JSON,
        JSON.stringify(this.Copy_ITR_JSON)
      );

      this.loading = true;
      this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
        (result: any) => {
          this.ITR_JSON = result;
          sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
          this.utilsService.showSnackBar(
            'Movable Properties Saved Successfully'
          );
          this.loading = false;
          this.utilsService.smoothScrollToTop();
        },
        (error) => {
          this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
          this.utilsService.showSnackBar('Failed to Save Movable Properties');
          this.loading = false;
          this.utilsService.smoothScrollToTop();
        }
      );
    }
  }

  changeMode(){
    this.mode = 'VIEW';
  }

  goBack() {
    this.saveAndNext.emit(false);
  }

  reportsCodeColumnDef() {
    return [
      {
        headerName: 'Sr. No.',
        width: 50,
        pinned: 'left',
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        valueGetter: function (params) {
          return params.node.rowIndex + 1;
        }
      },
      {
        headerName: 'Description',
        field: 'description',
        sortable: true,
        width: 240,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        valueGetter: function nameFromCode(params) {
          return params.data.description;
        },
      },
      {
        headerName: 'Address',
        field: 'address',
        sortable: true,
        width: 440,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        valueGetter: function nameFromCode(params) {
          return params.data.flatNo +','+params.data.premisesName +','+params.data.road+','+params.data.area
          +','+params.data.city+','+params.data.state+'('+params.data.pinCode+')';
        },
      },
      {
        headerName: 'Amount',
        field: 'amount',
        sortable: true,
        width: 200,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        valueGetter: (params) => params.data.amount,
        valueFormatter: (params) => this.formatAmount(params.value),
      },
      {
        headerName: 'Edit',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Edit"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;color:#04a4bc;">
          <i class="fa-solid fa-pencil" data-action-type="edit"></i>
           </button>`;
        },
        width: 90,
        pinned: 'right',
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
        headerName: 'Delete',
        field: '',
        width: 90,
        pinned: 'right',
        lockPosition: true,
        suppressMovable: false,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Click to delete/cancel Subscription" data-action-type="remove"
            style="border: none; background: transparent; font-size: 14px; cursor:pointer; color:red; ">
            <i class="fa fa-trash fa-xs" aria-hidden="true" data-action-type="remove"></i>
             </button>`;
        },
      },
    ]
  }

  formatAmount(amount: number): string {
    return `₹ ${amount.toLocaleString()}`;
  }

  onAssetsRowClicked(params:any){
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          console.log('DATA FOR DELETE Asset:', params.data);
          this.deleteAsset(params.data);
          break;
        }
        case 'edit': {
          this.editAsset(params.data);
          break;
        }
      }
    }
  }

  editAsset(data){
    this.mode = 'EDIT';
    this.activeIndex = this.immovableAssets.indexOf(data);
  }

  deleteIndex(index) {
    const immovableAssetArray = <FormArray>(
      this.immovableAssetForm?.get('immovableAssetArray')
    );
    immovableAssetArray.removeAt(index);
  }
  deleteAsset(data) {
    const dialogRef = this.matDialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirm Deletion',
        message: 'Are you sure you want to delete this asset?',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        const index = this.immovableAssets.indexOf(data);
        if (index !== -1) {
          this.immovableAssets.splice(index, 1);
          this.immovableAssetGridApi?.setRowData(this.immovableAssets);
        }
      }
    });
  }

  saveAll() {
    this.saveImmovableAssets();
    this.saveMovableAssets();
    this.saveAndNext.emit(true);
  }
}
