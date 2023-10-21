import {
  Component,
  Inject,
  LOCALE_ID,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AppConstants } from 'src/app/modules/shared/constants';
import {
  ITR_JSON,
  NewCapitalGain,
} from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UtilsService } from 'src/app/services/utils.service';
import { WizardNavigation } from '../../../../itr-shared/WizardNavigation';
import { GridOptions } from 'ag-grid-community';
import { formatDate } from '@angular/common';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmationModalComponent } from '../../../../../additional-components/confirmation-popup/confirmation-popup.component';
import { TotalCg } from 'src/app/services/itr-json-helper-service';

@Component({
  selector: 'app-shares-and-equity',
  templateUrl: './shares-and-equity.component.html',
  styleUrls: ['./shares-and-equity.component.scss'],
})
export class SharesAndEquityComponent
  extends WizardNavigation
  implements OnInit
{
  step = 1;
  securitiesForm: FormGroup;
  deductionForm: FormGroup;
  Copy_ITR_JSON: ITR_JSON;
  ITR_JSON: ITR_JSON;
  loading: boolean = false;
  config: any;
  deduction = false;

  minDate: Date;
  maxDate: Date;
  maxPurchaseDate: Date;
  maximumDate = new Date();

  gainTypeList = [
    { name: 'STCG', value: 'SHORT' },
    { name: 'LTCG', value: 'LONG' },
  ];
  isDisable: boolean;
  bondType: any;
  title: string;
  buyDateBefore31stJan: boolean;

  selectedBroker = '';
  brokerList = [];
  brokerSelected = [];
  compactView = true;
  isAdd = false;
  equityGridOptions: GridOptions;

  constructor(
    private fb: FormBuilder,
    public utilsService: UtilsService,
    private itrMsService: ItrMsService,
    private toastMsgService: ToastMessageService,
    private activateRoute: ActivatedRoute,
    private dialog: MatDialog,
    @Inject(LOCALE_ID) private locale: string
  ) {
    super();
    // Set the minimum to January 1st 20 years in the past and December 31st a year in the future.
    const currentYear = new Date().getFullYear() - 1;
    const thisYearStartDate = new Date(currentYear, 3, 1); // April 1st of the current year
    const nextYearEndDate = new Date(currentYear + 1, 2, 31); // March 31st of the next year

    this.minDate = thisYearStartDate;
    this.maxDate = nextYearEndDate;

    this.equityGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.equityColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: (params) => {},
      sortable: true,
    };
  }

  ngOnInit(): void {
    if (this.activateRoute.snapshot.queryParams['bondType']) {
      this.bondType = this.activateRoute.snapshot.queryParams['bondType'];
      this.bondType === 'listed'
        ? (this.title =
            ' Listed Securities (Equity Shares/ Equity Mutual Funds)')
        : (this.title = 'Unlisted Securities (Shares not listed)');
      this.compactView = true;
    }
    this.config = {
      itemsPerPage: 2,
      currentPage: 1,
    };
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(
      sessionStorage.getItem(AppConstants.ITR_JSON)
    );

    this.securitiesForm = this.initForm();
    this.deductionForm = this.initDeductionForm();

    if (this.Copy_ITR_JSON.capitalGain) {
      this.initBrokerList(this.Copy_ITR_JSON);
    } else {
      this.addMoreData();
    }

    this.securitiesForm.disable();

    // setting deduction
    const equitySharesListed = this.ITR_JSON.capitalGain?.find(
      (assetType) => assetType.assetType === 'EQUITY_SHARES_LISTED'
    );

    if (equitySharesListed?.deduction?.length > 0) {
      const deductionStat: boolean = equitySharesListed?.deduction?.some(
        (element) => element?.purchaseDate
      );
      if (deductionStat) {
        this.deduction = true;
      } else {
        this.deduction = false;
      }
    } else {
      this.deduction = false;
    }
    this.maximumDate = new Date();
  }

  calMaxPurchaseDate(sellDate) {
    if (this.utilsService.isNonEmpty(sellDate)) {
      this.maxPurchaseDate = sellDate;
    }
  }

  initDetailedForm(itrObject: ITR_JSON) {
    let assetDetails;
    let data;
    const securitiesArray = <FormArray>(
      this.securitiesForm.get('securitiesArray')
    );
    securitiesArray.clear();
    if (this.bondType === 'listed') {
      data = itrObject.capitalGain.filter(
        (item: any) => item.assetType === 'EQUITY_SHARES_LISTED'
      );
    } else if (this.bondType === 'unlisted') {
      data = itrObject.capitalGain.filter(
        (item: any) => item.assetType === 'EQUITY_SHARES_UNLISTED'
      );
    }
    let ltcg = 0;
    if (data.length > 0) {
      data.forEach((obj: any) => {
        assetDetails = obj.assetDetails;
        console.log(assetDetails);
        assetDetails.forEach((element: any) => {
          if (element.brokerName == this.selectedBroker) {
            const filterImp = obj.improvement?.filter(
              (data) => data.srn == element.srn
            );
            if (element.gainType === 'LONG') {
              ltcg += element.capitalGain;
            }
            if (filterImp?.length > 0) {
              element['costOfImprovement'] = filterImp[0].costOfImprovement;
            }
            this.addMoreData(element);
          }
        });
        if (obj.deduction) {
          obj.deduction.forEach((element: any) => {
            this.deductionForm = this.initDeductionForm(element);
          });
        } else {
          this.deductionForm = this.initDeductionForm();
        }

        this.updateDeductionUI();
      });
    } else {
      this.addMoreData();
    }
  }

  updateDeductionUI() {
    this.getSecuritiesCg();
    if (this.totalCg.ltcg + this.totalCg.stcg <= 0) {
      this.deduction = false;
      this.isDisable = true;
    } else {
      this.isDisable = this.totalCg.ltcg <= 0;
    }
  }
  valueGetter(controls, name) {
    return controls[name].value;
  }

  equityColumnDef() {
    return [
      {
        field: '',
        headerCheckboxSelection: true,
        width: 80,
        pinned: 'left',
        checkboxSelection: (params) => {
          return true;
        },
        // valueGetter: function nameFromCode(params) {
        //   return params.data.controls['hasEdit'].value;
        // },
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
        headerName: 'Scrip Name',
        field: 'nameOfTheUnits',
        width: 100,
        cellStyle: { textAlign: 'center' },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['nameOfTheUnits'].value;
        },
      },
      {
        headerName: 'Buy/Sell Quantity',
        field: 'sellOrBuyQuantity',
        width: 100,
        cellStyle: { textAlign: 'center' },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['sellOrBuyQuantity'].value;
        },
      },
      {
        headerName: 'Sale Date',
        field: 'sellDate',
        width: 100,
        cellStyle: { textAlign: 'center' },
        cellRenderer: (data: any) => {
          if (data.value) {
            return formatDate(data.value, 'dd/MM/yyyy', this.locale);
          } else {
            return '-';
          }
        },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['sellDate'].value;
        },
      },
      {
        headerName: 'Sale Price',
        field: 'sellValuePerUnit',
        width: 100,
        textAlign: 'center',
        cellStyle: { textAlign: 'center' },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['sellValuePerUnit'].value;
        },
      },
      {
        headerName: 'Sale Value',
        field: 'sellValue',
        width: 100,
        cellStyle: { textAlign: 'center' },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['sellValue'].value;
        },
      },
      {
        headerName: 'Buy Date',
        field: 'purchaseDate',
        width: 100,
        cellStyle: { textAlign: 'center' },
        cellRenderer: (data: any) => {
          if (data.value) {
            return formatDate(data.value, 'dd/MM/yyyy', this.locale);
          } else {
            return '-';
          }
        },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['purchaseDate'].value;
        },
      },
      {
        headerName: 'Buy Price',
        field: 'purchaseValuePerUnit',
        width: 100,
        textAlign: 'center',
        cellStyle: { textAlign: 'center' },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['purchaseValuePerUnit'].value;
        },
      },
      {
        headerName: 'Buy Value',
        field: 'purchaseCost',
        width: 100,
        cellStyle: { textAlign: 'center' },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['purchaseCost'].value;
        },
      },
      {
        headerName: 'Expenses',
        field: 'sellExpense',
        width: 100,
        cellStyle: { textAlign: 'center' },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['sellExpense'].value;
        },
      },
      {
        headerName: 'Type of Capital Gain*',
        field: 'gainType',
        width: 100,
        cellStyle: { textAlign: 'center' },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['gainType'].value;
        },
      },
      {
        headerName: 'Gain Amount*',
        field: 'capitalGain',
        width: 100,
        cellStyle: { textAlign: 'center' },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['capitalGain'].value;
        },
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
        width: 60,
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
    ];
  }

  initBrokerList(itrObject: ITR_JSON) {
    let data;

    this.brokerList = [];
    this.brokerSelected = [];
    if (this.bondType === 'listed') {
      data = itrObject.capitalGain.filter(
        (item: any) => item.assetType === 'EQUITY_SHARES_LISTED'
      );
    } else if (this.bondType === 'unlisted') {
      data = itrObject.capitalGain.filter(
        (item: any) => item.assetType === 'EQUITY_SHARES_UNLISTED'
      );
    }
    if (data.length > 0) {
      data.forEach((obj) => {
        obj.assetDetails.forEach((security: any) => {
          let broker = security.brokerName;
          let gainType = security.gainType;
          let capitalGain = security.capitalGain;
          let filtered = this.brokerList.filter(
            (item) => item.brokerName === broker
          );
          if (filtered && filtered.length > 0) {
            //update existing item
            if (gainType === 'LONG') {
              filtered[0].LTCG = filtered[0].LTCG + capitalGain;
            } else {
              filtered[0].STCG = filtered[0].STCG + capitalGain;
            }
            // brokerList.splice(brokerList.indexOf(filtered[0], ))
          } else {
            this.brokerList.push({
              brokerName: broker,
              LTCG: gainType === 'LONG' ? capitalGain : 0,
              STCG: gainType === 'SHORT' ? capitalGain : 0,
            });
            this.brokerSelected.push(false);
          }
        });
        if (obj.deduction) {
          obj.deduction.forEach((element: any) => {
            this.deductionForm = this.initDeductionForm(element);
          });
        } else {
          this.deductionForm = this.initDeductionForm();
        }
        this.updateDeductionUI();
      });
    } else {
      if (!this.compactView) {
        this.compactView = false;
        this.addMoreData();
      }
    }
    this.updateDeductionUI();
  }

  isBrokerSelected() {
    return this.brokerSelected.filter((value) => value === true).length > 0;
  }

  changeSelection(i) {
    this.brokerSelected[i] = !this.brokerSelected[i];
  }

  showBroker(brokerName) {
    this.selectedBroker = brokerName;
    this.compactView = false;
    this.isAdd = false;
    this.initDetailedForm(this.Copy_ITR_JSON);
    this.equityGridOptions = <GridOptions>{
      rowData: this.getSecuritiesArray.controls,
      columnDefs: this.equityColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      rowSelection: 'multiple',
      onGridReady: (params) => {},
      onSelectionChanged: (event) => {
        event.api.getSelectedRows().forEach((row) => {
          row.controls['hasEdit'].setValue(true);
        });
        if (event.api.getSelectedRows().length === 0) {
          this.getSecuritiesArray.controls.forEach((formGroup: FormGroup) => {
            formGroup.controls['hasEdit'].setValue(false);
          });
        }
        this.equitySelected();
      },
      sortable: true,
      pagination: true,
      paginationPageSize: 20,
    };
    this.equityGridOptions.api?.setRowData(this.getSecuritiesArray.controls);
  }

  showCompactView() {
    this.compactView = true;
    this.initBrokerList(this.Copy_ITR_JSON);
  }

  getFileParserData() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(
      sessionStorage.getItem(AppConstants.ITR_JSON)
    );

    this.securitiesForm = this.initForm();
    this.deductionForm = this.initDeductionForm();
    if (this.Copy_ITR_JSON.capitalGain) {
      this.showCompactView();
      //this.initDetailedForm(this.Copy_ITR_JSON);
    } else {
      this.addMoreData();
    }
  }

  addDialogRef: MatDialogRef<any>;
  addMore() {
    this.compactView = false;
    this.isAdd = true;
    const securitiesArray = <FormArray>(
      this.securitiesForm.get('securitiesArray')
    );
    this.selectedFormGroup = this.createForm(securitiesArray.length);
    this.addDialogRef = this.dialog.open(this.editEquity);
    this.addDialogRef.afterClosed().subscribe((result) => {
      if (result) {
        let data;
        let itrObject = this.Copy_ITR_JSON;
        if (!itrObject.capitalGain) {
          itrObject.capitalGain = [];
        }
        if (this.bondType === 'listed') {
          data = itrObject.capitalGain?.filter(
            (item: any) => item.assetType === 'EQUITY_SHARES_LISTED'
          );
        } else if (this.bondType === 'unlisted') {
          data = itrObject.capitalGain?.filter(
            (item: any) => item.assetType === 'EQUITY_SHARES_UNLISTED'
          );
        }
        if (data.length > 0) {
          data.forEach((obj) => {
            obj.assetDetails.push(result);
          });
        } else {
          let cg: NewCapitalGain = {
            assesseeType: this.Copy_ITR_JSON.assesseeType,
            assessmentYear: this.Copy_ITR_JSON.assessmentYear,
            assetType:
              this.bondType === 'listed'
                ? 'EQUITY_SHARES_LISTED'
                : 'EQUITY_SHARES_UNLISTED',
            buyersDetails: [],
            improvement: [],
            residentialStatus: this.Copy_ITR_JSON.residentialStatus,
          };
          cg.assetDetails = [];
          cg.assetDetails.push(result);
          data.push(cg);
        }
        //append data to rest cg data
        let otherData: any;
        if (this.bondType === 'listed') {
          otherData = itrObject.capitalGain?.filter(
            (item: any) => item.assetType !== 'EQUITY_SHARES_LISTED'
          );
        } else if (this.bondType === 'unlisted') {
          otherData = itrObject.capitalGain?.filter(
            (item: any) => item.assetType !== 'EQUITY_SHARES_UNLISTED'
          );
        }
        let completeData = [];
        completeData = otherData.concat(data);
        this.Copy_ITR_JSON.capitalGain = completeData;
        this.initBrokerList(this.Copy_ITR_JSON);
        this.selectedFormGroup.controls['hasEdit'].setValue(null);
        if (!this.compactView) {
          this.initDetailedForm(this.Copy_ITR_JSON);
          this.equityGridOptions.api?.setRowData(
            this.getSecuritiesArray.controls
          );
        } else {
          this.initDetailedForm(this.Copy_ITR_JSON);
        }
        // this.compactView = true;
      }
    });
  }

  initForm() {
    return this.fb.group({
      securitiesArray: this.fb.array([]),
    });
  }

  createForm(srn, item?): FormGroup {
    let validators =
      this.bondType === 'listed'
        ? [
            Validators.required,
            Validators.pattern(AppConstants.amountWithDecimal),
          ]
        : [
            Validators.required,
            Validators.pattern(AppConstants.amountWithoutDecimal),
          ];
    return this.fb.group({
      hasEdit: [item ? item.hasEdit : false],
      brokerName: [item ? item.brokerName : ''],
      srn: [item ? item.srn : srn],
      sellOrBuyQuantity: [item ? item.sellOrBuyQuantity : null, validators],
      sellDate: [item ? item.sellDate : null, [Validators.required]],
      sellValuePerUnit: [item ? item.sellValuePerUnit : null, validators],
      sellValue: [item ? item.sellValue : null, validators],
      purchaseDate: [item ? item.purchaseDate : null, [Validators.required]],
      purchaseValuePerUnit: [
        item ? item.purchaseValuePerUnit : null,
        validators,
      ],
      purchaseCost: [item ? item.purchaseCost : null, validators],
      sellExpense: [item ? item.sellExpense : null],
      isinCode: [item ? item.isinCode : ''],
      nameOfTheUnits: [item ? item.nameOfTheUnits : ''],
      fmvAsOn31Jan2018: [item ? item.fmvAsOn31Jan2018 : null],
      gainType: [item ? item.gainType : null],
      grandFatheredValue: [
        item ? item.grandFatheredValue || item.purchaseCost : null,
      ],
      indexCostOfAcquisition: [item ? item.indexCostOfAcquisition : null],
      algorithm: ['cgSharesMF'],
      stampDutyValue: [item ? item.stampDutyValue : null],
      valueInConsideration: [item ? item.valueInConsideration : null],
      capitalGain: [item ? item.capitalGain : null],
      totalFairMarketValueOfCapitalAsset: [
        item ? item.totalFairMarketValueOfCapitalAsset : null,
      ],
    });
  }

  @ViewChild('editEquity', { static: true }) editEquity: TemplateRef<any>;
  selectedFormGroup: FormGroup;
  confirmDialog: MatDialogRef<ConfirmDialogComponent>;

  deductionChanged(event) {
    if (event.value === false) {
      this.confirmDialog = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Warning',
          message:
            'Selecting "No" for deduction will erase existing data. Do you wish to continue?',
          isHide: true,
          showActions: true,
        },
        disableClose: false,
      });
      this.confirmDialog.afterClosed().subscribe((result) => {
        if (result === 'NO') {
          this.deduction = !event.value;
        }
      });
    }
  }

  editSecuritiesForm(params: any) {
    console.log(event);
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'edit':
          this.selectedFormGroup = params.data;
          this.addDialogRef = this.dialog.open(this.editEquity);
          this.addDialogRef.afterClosed().subscribe((result) => {
            if (result) {
              result.hasEdit = false;
              let data;
              let securitiesIndex;
              let itrObject = this.Copy_ITR_JSON;
              if (!itrObject.capitalGain) {
                itrObject.capitalGain = [];
              }
              if (this.bondType === 'listed') {
                securitiesIndex = this.Copy_ITR_JSON.capitalGain?.findIndex(
                  (element) => element.assetType === 'EQUITY_SHARES_LISTED'
                );
                data = this.Copy_ITR_JSON.capitalGain.filter(
                  (item: any) => item.assetType === 'EQUITY_SHARES_LISTED'
                );
              } else if (this.bondType === 'unlisted') {
                securitiesIndex = this.Copy_ITR_JSON.capitalGain?.findIndex(
                  (element) => element.assetType === 'EQUITY_SHARES_UNLISTED'
                );
                data = this.Copy_ITR_JSON.capitalGain.filter(
                  (item: any) => item.assetType === 'EQUITY_SHARES_UNLISTED'
                );
              }
              let filtered = data[0].assetDetails.filter(
                (element) => element.srn !== result.srn
              );
              if (!filtered) {
                filtered = [];
              }
              filtered.push(result);
              this.Copy_ITR_JSON.capitalGain[securitiesIndex].assetDetails =
                filtered;
              this.initBrokerList(this.Copy_ITR_JSON);
              this.initDetailedForm(this.Copy_ITR_JSON);
              this.selectedFormGroup.controls['hasEdit'].setValue(null);
              this.equityGridOptions.api?.setRowData(
                this.getSecuritiesArray.controls
              );
            }
          });
          break;
      }
    }
  }

  openDialogWithTemplateRef(templateRef: TemplateRef<any>) {
    this.dialog.open(templateRef);
  }

  get getSecuritiesArray() {
    return <FormArray>this.securitiesForm.get('securitiesArray');
  }

  addMoreData(item?) {
    const securitiesArray = <FormArray>(
      this.securitiesForm.get('securitiesArray')
    );
    securitiesArray.insert(0, this.createForm(securitiesArray.length, item));
  }

  equitySelected() {
    const securitiesArray = <FormArray>(
      this.securitiesForm.controls['securitiesArray']
    );
    return (
      securitiesArray.controls.filter(
        (item: FormGroup) => item.controls['hasEdit'].value === true
      ).length > 0
    );
  }

  deleteBroker() {
    let brokerNames = [];
    for (let i = 0; i < this.brokerSelected.length; i++) {
      if (this.brokerSelected[i] === false) {
        brokerNames.push(this.brokerList[i].brokerName);
      }
      this.brokerSelected[i] = false;
    }
    this.brokerList = this.brokerList.filter((value) =>
      brokerNames.includes(value.brokerName)
    );
    let itrObject = this.Copy_ITR_JSON;
    let data;
    if (this.bondType === 'listed') {
      data = itrObject.capitalGain.filter(
        (item: any) => item.assetType === 'EQUITY_SHARES_LISTED'
      );
    } else if (this.bondType === 'unlisted') {
      data = itrObject.capitalGain.filter(
        (item: any) => item.assetType === 'EQUITY_SHARES_UNLISTED'
      );
    }
    if (data.length > 0) {
      data.forEach((obj) => {
        let assetDetails = obj.assetDetails.filter((security: any) =>
          brokerNames.includes(security.brokerName)
        );
        obj.assetDetails = assetDetails;
      });
      this.initBrokerList(itrObject);
    }
    console.log('ITR json', this.Copy_ITR_JSON);
  }

  deleteArray() {
    const securitiesArray = <FormArray>(
      this.securitiesForm.get('securitiesArray')
    );

    securitiesArray.controls = securitiesArray.controls.filter(
      (item: FormGroup) => item.controls['hasEdit'].value !== true
    );
    this.equityGridOptions.api?.setRowData(this.getSecuritiesArray.controls);
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  fieldGlobalIndex(index) {
    return this.config.itemsPerPage * (this.config.currentPage - 1) + index;
  }

  checkBuyDateBefore31stJan(securities) {
    return (
      new Date(securities.controls['purchaseDate'].value) <
      new Date('02/01/2018')
    );
  }

  calculateGainType(securities) {
    if (securities.controls['purchaseDate'].valid) {
      this.buyDateBefore31stJan =
        new Date(securities.controls['purchaseDate'].value) <
        new Date('02/01/2018');
      if (!this.buyDateBefore31stJan) {
        securities.controls['isinCode'].setValue('');
        securities.controls['nameOfTheUnits'].setValue('');
        securities.controls['fmvAsOn31Jan2018'].setValue('');
      } else {
        securities.controls['isinCode'].setValidators([Validators.required]);
        securities.controls['isinCode'].updateValueAndValidity();
      }
    }
    if (
      securities.controls['purchaseDate'].value &&
      securities.controls['sellDate'].value
    ) {
      let req = {
        assetType:
          this.bondType === 'listed'
            ? 'EQUITY_SHARES_LISTED'
            : 'EQUITY_SHARES_UNLISTED',
        buyDate: securities.controls['purchaseDate'].value,
        sellDate: securities.controls['sellDate'].value,
      };
      const param = `/calculate/indexed-cost`;
      this.itrMsService.postMethod(param, req).subscribe((res: any) => {
        securities.controls['gainType'].setValue(res.data.capitalGainType);
        if (res.data.capitalGainType === 'SHORT') {
          securities.controls['isinCode'].setValue('');
          securities.controls['nameOfTheUnits'].setValue('');
          securities.controls['fmvAsOn31Jan2018'].setValue('');
        }
      });
    }
  }

  calculateFMV(securities) {
    if (
      securities.controls['isinCode'].valid &&
      securities.controls['isinCode'].value &&
      securities.controls['purchaseDate'].value &&
      securities.controls['sellDate'].value
    ) {
      let req = {
        assetType:
          this.bondType === 'listed'
            ? 'EQUITY_SHARES_LISTED'
            : 'EQUITY_SHARES_UNLISTED',
        buyDate: securities.controls['purchaseDate'].value,
        sellDate: securities.controls['sellDate'].value,
      };
      const param = `/capital-gain/fmv?isinCode=${securities.controls['isinCode'].value}`;
      this.itrMsService.getMethod(param, req).subscribe((res: any) => {
        console.log('FMV : ', res);
        if (res.success) {
          securities.controls['nameOfTheUnits'].setValue(res.data.name);
          securities.controls['fmvAsOn31Jan2018'].setValue(
            res.data.fmvAsOn31stJan2018
          );
        }
      });
    }
    this.calculateTotalCG(securities);
  }

  calculateTotalCG(securities) {
    this.updateDeductionUI();
    if (securities.valid) {
      const param = '/singleCgCalculate';
      let request = {
        assessmentYear: '2022-2023',
        assesseeType: 'INDIVIDUAL',
        residentialStatus: 'RESIDENT',
        assetType:
          this.bondType === 'listed'
            ? 'EQUITY_SHARES_LISTED'
            : 'EQUITY_SHARES_UNLISTED',
        assetDetails: [securities.getRawValue()],

        improvement: [
          {
            srn: securities.controls['srn'].value,
            dateOfImprovement: '',
            costOfImprovement: 0,
          },
        ],

        deduction:
          this.deductionForm.invalid || !this.deduction
            ? []
            : [this.deductionForm.getRawValue()],
      };
      this.itrMsService.postMethod(param, request).subscribe(
        (res: any) => {
          this.loading = false;
          if (res.assetDetails[0].capitalGain) {
            securities.controls['capitalGain'].setValue(
              res.assetDetails[0].capitalGain
            );
          } else {
            this.loading = false;
            securities.controls['capitalGain'].setValue(0);
          }

          if (res.assetDetails[0].grandFatheredValue) {
            securities.controls['grandFatheredValue'].setValue(
              res.assetDetails[0].grandFatheredValue
            );
          } else {
            securities.controls['grandFatheredValue'].setValue(
              res.assetDetails[0].purchaseCost
            );
          }
          if (res.assetDetails[0].totalFairMarketValueOfCapitalAsset) {
            securities.controls['totalFairMarketValueOfCapitalAsset'].setValue(
              res.assetDetails[0].totalFairMarketValueOfCapitalAsset
            );
          } else {
            securities.controls['grandFatheredValue'].setValue(0);
          }
        },
        (error) => {
          this.loading = false;
          this.toastMsgService.alert(
            'error',
            'failed to calculate total capital gain.'
          );
        }
      );
    }
  }

  totalCg: TotalCg = {
    ltcg: 0,
    stcg: 0,
  };
  getSecuritiesCg() {
    let ltcg = 0;
    let stcg = 0;
    this.brokerList.forEach((broker) => {
      ltcg += broker.LTCG;
      stcg += broker.STCG;
    });

    this.totalCg.ltcg = ltcg;
    this.totalCg.stcg = stcg;
    return this.totalCg;
  }

  getSaleValue() {
    let saleValue =
      parseFloat(this.selectedFormGroup.controls['sellValuePerUnit'].value) *
      parseFloat(this.selectedFormGroup.controls['sellOrBuyQuantity'].value);
    this.selectedFormGroup.controls['sellValue'].setValue(saleValue.toFixed());
    // if(this.bondType === 'listed') {
    //   fg.controls['sellValue'].setValue(saleValue.toFixed(2));
    // } else {
    //   fg.controls['sellValue'].setValue(saleValue.toFixed());
    // }
    this.calculateTotalCG(this.selectedFormGroup);
  }

  getPurchaseValue() {
    let purchaseValue =
      parseFloat(
        this.selectedFormGroup.controls['purchaseValuePerUnit'].value
      ) *
      parseFloat(this.selectedFormGroup.controls['sellOrBuyQuantity'].value);
    this.selectedFormGroup.controls['purchaseCost'].setValue(
      purchaseValue.toFixed()
    );
    this.calculateTotalCG(this.selectedFormGroup);
  }

  save(type?) {
    this.loading = true;
    if (type === 'securities') {
      this.updateDeductionUI();
    }

    if (this.compactView) {
      this.loading = true;
      if (!this.Copy_ITR_JSON.capitalGain) {
        this.Copy_ITR_JSON.capitalGain = [];
      }
      let securitiesIndex;
      let data;
      if (this.bondType === 'listed') {
        securitiesIndex = this.Copy_ITR_JSON.capitalGain?.findIndex(
          (element) => element.assetType === 'EQUITY_SHARES_LISTED'
        );
        data = this.Copy_ITR_JSON.capitalGain.filter(
          (item: any) => item.assetType === 'EQUITY_SHARES_LISTED'
        );
      } else if (this.bondType === 'unlisted') {
        securitiesIndex = this.Copy_ITR_JSON.capitalGain?.findIndex(
          (element) => element.assetType === 'EQUITY_SHARES_UNLISTED'
        );
        data = this.Copy_ITR_JSON.capitalGain.filter(
          (item: any) => item.assetType === 'EQUITY_SHARES_UNLISTED'
        );
      }

      let assetDetails = [];
      if (data.length > 0) {
        data.forEach((obj: any) => {
          assetDetails = assetDetails.concat(obj.assetDetails);
        });
      }
      const securitiesImprovement = [];
      // if (assetDetails.length > 0) {
      //   this.deductionForm.reset();
      // }
      const securitiesData = {
        assessmentYear: this.ITR_JSON.assessmentYear,
        assesseeType: this.ITR_JSON.assesseeType,
        residentialStatus: this.ITR_JSON.residentialStatus,
        assetType:
          this.bondType === 'listed'
            ? 'EQUITY_SHARES_LISTED'
            : 'EQUITY_SHARES_UNLISTED',
        deduction: !this.deduction ? [] : [this.deductionForm.getRawValue()],
        improvement: securitiesImprovement,
        buyersDetails: [],
        assetDetails: assetDetails,
      };
      console.log('securitiesData', securitiesData);

      if (securitiesIndex >= 0) {
        if (securitiesData.assetDetails.length > 0) {
          this.Copy_ITR_JSON.capitalGain[securitiesIndex].deduction =
            securitiesData.deduction;
          // this.Copy_ITR_JSON.capitalGain[securitiesIndex].improvement.concat(securitiesData.improvement);
          this.Copy_ITR_JSON.capitalGain[securitiesIndex].assetDetails =
            securitiesData.assetDetails;
        } else {
          this.Copy_ITR_JSON.capitalGain.splice(securitiesIndex, 1);
        }
      } else {
        if (securitiesData.assetDetails.length > 0) {
          this.Copy_ITR_JSON.capitalGain?.push(securitiesData);
        }
      }
      this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
        (result: any) => {
          this.ITR_JSON = result;
          this.loading = false;
          sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
          this.utilsService.showSnackBar(
            'Securities data updated successfully'
          );
          this.utilsService.smoothScrollToTop();
        },
        (error) => {
          this.loading = false;
          this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
          this.utilsService.showSnackBar(
            'Failed to add Securities data, please try again.'
          );
          this.utilsService.smoothScrollToTop();
        }
      );
    } else if (
      (this.securitiesForm.valid &&
        this.deduction &&
        this.deductionForm.valid) ||
      (this.securitiesForm.valid && !this.deduction)
    ) {
      this.loading = true;
      if (!this.Copy_ITR_JSON.capitalGain) {
        this.Copy_ITR_JSON.capitalGain = [];
      }
      let securitiesIndex;
      if (this.bondType === 'listed') {
        securitiesIndex = this.Copy_ITR_JSON.capitalGain?.findIndex(
          (element) => element.assetType === 'EQUITY_SHARES_LISTED'
        );
      } else if (this.bondType === 'unlisted') {
        securitiesIndex = this.Copy_ITR_JSON.capitalGain?.findIndex(
          (element) => element.assetType === 'EQUITY_SHARES_UNLISTED'
        );
      }
      const securitiesImprovement = [];

      const securitiesArray = <FormArray>(
        this.securitiesForm.get('securitiesArray')
      );
      securitiesArray.controls.forEach((element) => {
        securitiesImprovement.push({
          srn: (element as FormGroup).controls['srn'].value,
          dateOfImprovement: null,
          costOfImprovement: 0,
        });
      });

      if (!securitiesArray.value) {
        this.deductionForm.reset();
      }
      const securitiesData = {
        assessmentYear: this.ITR_JSON.assessmentYear,
        assesseeType: this.ITR_JSON.assesseeType,
        residentialStatus: this.ITR_JSON.residentialStatus,
        assetType:
          this.bondType === 'listed'
            ? 'EQUITY_SHARES_LISTED'
            : 'EQUITY_SHARES_UNLISTED',
        deduction: !this.deduction ? [] : [this.deductionForm.getRawValue()],
        improvement: securitiesImprovement,
        buyersDetails: [],
        assetDetails: securitiesArray.getRawValue(),
      };
      console.log('securitiesData', securitiesData);

      if (securitiesIndex >= 0) {
        if (securitiesData.assetDetails.length > 0) {
          this.Copy_ITR_JSON.capitalGain[securitiesIndex].deduction =
            securitiesData.deduction;
          // this.Copy_ITR_JSON.capitalGain[securitiesIndex].improvement.concat(securitiesData.improvement);

          //single broker edit view is displayed here
          //get all other brokers from existing list, append current broker list and then save
          let otherData = this.Copy_ITR_JSON.capitalGain[
            securitiesIndex
          ].assetDetails.filter(
            (item) => item.brokerName !== this.selectedBroker
          );
          let sameData = this.Copy_ITR_JSON.capitalGain[
            securitiesIndex
          ].assetDetails.filter(
            (item) => item.brokerName === this.selectedBroker
          );
          if (!sameData) {
            sameData = [];
          }
          if (this.selectedBroker === '') {
            sameData = securitiesData.assetDetails;
          } else {
            if (this.isAdd) {
              sameData = sameData.concat(securitiesData.assetDetails);
            } else {
              sameData = securitiesData.assetDetails;
            }
          }
          this.Copy_ITR_JSON.capitalGain[securitiesIndex].assetDetails =
            otherData.concat(sameData);
          // this.Copy_ITR_JSON.capitalGain[securitiesIndex].assetDetails = this.Copy_ITR_JSON.capitalGain[securitiesIndex].assetDetails.concat(securitiesData.assetDetails);
        } else {
          let otherData = this.Copy_ITR_JSON.capitalGain[
            securitiesIndex
          ].assetDetails.filter(
            (item) => item.brokerName !== this.selectedBroker
          );
          this.Copy_ITR_JSON.capitalGain[securitiesIndex].assetDetails =
            otherData;
        }
      } else {
        if (securitiesData.assetDetails.length > 0) {
          this.Copy_ITR_JSON.capitalGain?.push(securitiesData);
        }
      }
      this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
        (result: any) => {
          this.ITR_JSON = result;
          this.loading = false;
          sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
          this.utilsService.showSnackBar(
            'Securities data updated successfully'
          );
          this.utilsService.smoothScrollToTop();

          //close dialog and update UI
          this.dialog.closeAll();
        },
        (error) => {
          this.loading = false;
          this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
          this.utilsService.showSnackBar(
            'Failed to add Securities data, please try again.'
          );
          this.utilsService.smoothScrollToTop();
        }
      );
    } else if (!this.securitiesForm.valid) {
      this.loading = false;
      $('input.ng-invalid').first().focus();
      this.utilsService.showSnackBar(
        'Please verify securities data and try again.'
      );
    } else {
      this.loading = false;
      this.utilsService.showSnackBar(
        'Please verify deduction form and try again'
      );
    }
  }

  initDeductionForm(obj?): FormGroup {
    return this.fb.group({
      hasEdit: [obj ? obj.hasEdit : false],
      srn: [obj ? obj.srn : 0],
      underSection: ['Deduction 54F'],
      orgAssestTransferDate: [obj ? obj.orgAssestTransferDate : null],
      panOfEligibleCompany: [obj ? obj.panOfEligibleCompany : null],
      purchaseDatePlantMachine: [obj ? obj.purchaseDatePlantMachine : null],
      purchaseDate: [obj ? obj.purchaseDate : null, Validators.required],
      costOfNewAssets: [obj ? obj.costOfNewAssets : null, Validators.required],
      investmentInCGAccount: [
        obj ? obj.investmentInCGAccount : null,
        Validators.required,
      ],
      totalDeductionClaimed: [obj ? obj.totalDeductionClaimed : null],
      costOfPlantMachinary: [obj ? obj.costOfPlantMachinary : null],
    });
  }

  calculateDeductionGain() {
    if (this.deductionForm.valid) {
      this.loading = true;
      let capitalGain = 0;
      let saleValue = 0;
      let expenses = 0;
      const securitiesArray = <FormArray>(
        this.securitiesForm.get('securitiesArray')
      );
      securitiesArray.controls.forEach((element) => {
        capitalGain += parseInt(
          (element as FormGroup).controls['capitalGain'].value
        );
        saleValue += parseInt(
          (element as FormGroup).controls['sellValue'].value
        );
        expenses += parseInt(
          (element as FormGroup).controls['sellExpense'].value
        );
      });

      let param = '/calculate/capital-gain/deduction';
      let request = {
        capitalGain: capitalGain,
        capitalGainDeductions: [
          {
            deductionSection: 'SECTION_54F',
            costOfNewAsset: parseInt(
              this.deductionForm.controls['costOfNewAssets'].value
            ),
            cgasDepositedAmount: parseInt(
              this.deductionForm.controls['investmentInCGAccount'].value
            ),
            saleValue: saleValue,
            expenses: expenses,
          },
        ],
      };
      this.itrMsService.postMethod(param, request).subscribe(
        (result: any) => {
          this.loading = false;
          if (result.success) {
            if (result.data.length > 0) {
              this.deductionForm.controls['totalDeductionClaimed'].setValue(
                result.data[0].deductionAmount
              );
            } else {
              this.deductionForm.controls['totalDeductionClaimed'].setValue(0);
            }
          }
        },
        (error) => {
          this.loading = false;
          this.toastMsgService.alert(
            'error',
            'failed to calculate Deduction Gain.'
          );
        }
      );
    }
  }

  goBack() {
    this.saveAndNext.emit(false);
  }

  saveAll() {
    this.save();
    this.saveAndNext.emit(false);
  }
}
