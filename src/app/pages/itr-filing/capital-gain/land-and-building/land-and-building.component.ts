import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ITR_JSON, NewCapitalGain } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-land-and-building',
  templateUrl: './land-and-building.component.html',
  styleUrls: ['./land-and-building.component.scss']
})
export class LandAndBuildingComponent implements OnInit, OnChanges {
  loading = false;
  ITR_JSON: ITR_JSON;
  labData: NewCapitalGain[] = [];
  Copy_ITR_JSON: ITR_JSON;
  isExmptAvail = false;
  assestTypesDropdown = [];
  labView: string = "FORM";

  public capitalGainGridOptions: GridOptions;
  public investmentGridOptions: GridOptions;
  showInvestmentTable = false;

  data: any
  constructor(private itrMsService: ItrMsService,
    public utilsService: UtilsService,
    public matDialog: MatDialog) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
    this.cgCallInConstructor([]);
    this.getAssetDetails();
    

    // TODO Add this in edit or add section
    this.data = {
      assestDetails: [],
      ITR_JSON: this.ITR_JSON,
      mode: 'ADD',
      // assetSelected: assetSelected,
    };

  }
  ngOnChanges(changes: SimpleChanges) {
    console.log('+++++++++', changes)
  }



  ngOnInit() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    let labData = this.ITR_JSON.capitalGain.filter(item => item.assetType === 'PLOT_OF_LAND');
    if (labData.length > 0) {
      this.labView = 'TABLE'
    }
  }

  addCapitalGain(mode, assetSelected) {
    // this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    console.log('Edit CG:', assetSelected);
    this.labView = 'FORM';
    this.data = {
      assetDetails: [],
      ITR_JSON: this.ITR_JSON,
      mode: mode,
      assetSelected: assetSelected,
    };
  }

  cgCreateRowData() {
    // this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.isExmptAvail = false;
    const data = [];
    const dataToReturn = [];
    for (let i = 0; i < this.ITR_JSON.capitalGain.length; i++) {
      let cgIncome = [];
      // if (this.utilsService.isNonEmpty(this.ITR_JSON.capitalGain[i].cgOutput)) {
      //   cgIncome = this.ITR_JSON.capitalGain[i].cgOutput.filter(item => item.assetType === this.ITR_JSON.capitalGain[i].assetType);
      // }

      let costOfImprovement = 0;
      for (let j = 0; j < this.ITR_JSON.capitalGain[i].improvement.length; j++) {
        costOfImprovement = costOfImprovement + this.ITR_JSON.capitalGain[i].improvement[j].costOfImprovement;
      }

      //By Ashwini: need to be updated for new structure
      
      let assetDetails = this.ITR_JSON.capitalGain[i].assetDetails[0];
      let cgObject:NewCapitalGain = {
        assetType: this.ITR_JSON.capitalGain[i].assetType,
        assetDetails: this.ITR_JSON.capitalGain[i].assetDetails,
        buyersDetails: this.ITR_JSON.capitalGain[i].buyersDetails,
        improvement: this.ITR_JSON.capitalGain[i].improvement,
        deduction: this.ITR_JSON.capitalGain[i].deduction
      }
      // Object.assign(cgObject, this.ITR_JSON.capitalGain[i]);
      // {
      //   srn: i,
      //   id: i+1,
      //   description: string;
      //   gainType: string;
      //   sellDate: string;
      //   sellValue: number;
      //   stampDutyValue: number;
      //   valueInConsideration: number;
      //   sellExpense: number;
      //   purchaseDate: string;
      //   purchaseCost: number;
      //   isinCode: string;
      //   nameOfTheUnits: string;
      //   sellOrBuyQuantity: number;
      //   sellValuePerUnit: number;
      //   purchaseValuePerUnit: number;
      //   isUploaded: boolean;
      //   hasIndexation: boolean;
      //   algorithm: string;
      //   fmvAsOn31Jan2018: string;
      //   indexCostOfAcquisition: number;
      // }
      data.push({
        id: i + 1,
        assetType: this.ITR_JSON.capitalGain[i].assetType,
        description: assetDetails.description,
        sellDate: assetDetails.sellDate,
        valueInConsideration: /* value */assetDetails.valueInConsideration,
        // totalCost: tCost,
        gainType: assetDetails.gainType,
        cgIncome: cgIncome.length > 0 ? cgIncome[0].cgIncome : 0,
        deductions: 0,//TODO
        sellExpense: assetDetails.sellExpense,
        improvements: costOfImprovement,
        address: this.ITR_JSON.capitalGain[i].buyersDetails[0]?.address,
        pin: this.ITR_JSON.capitalGain[i].buyersDetails[0]?.pin,
        // isExemptionApplied: cgIncome.length > 0 ? cgIncome[0].isExemptionApplied : false,
        isShow: true,
        rowSpan: 1,
        cgObject: JSON.stringify(cgObject)
      });
      console.log('row', cgObject);
    }

    // for (let i = 0; i < data.length; i++) {
    //   const a = dataToReturn.filter(item => item.assetType === data[i].assetType && item.description === data[i].description);
    //   if (a.length === 0) {
    //     const aa = data.filter(item => item.assetType === data[i].assetType && item.description === data[i].description);
    //     let index = 0;
    //     aa.forEach(item => {
    //       if (index === 0) {
    //         item.isShow = true;
    //         item.rowSpan = aa.length;
    //         index = index + 1;
    //       } else {
    //         item.isShow = false;
    //         item.rowSpan = 1;

    //       }
    //       dataToReturn.push(item);
    //     });
    //   }
    // }
    console.log('dataToReturn==========', dataToReturn);
    return data;
  }


  getAssetDetails() {
    // todo
    const param = '/assetDetails';
    this.itrMsService.getMethod(param).subscribe((result: any) => {
      console.log('Asset Details =', result);
      this.assestTypesDropdown = result;
      this.capitalGainGridOptions.api?.setRowData(this.cgCreateRowData());
      this.capitalGainGridOptions.api?.setColumnDefs(this.cgCreateColoumnDef(this.assestTypesDropdown));
      if (this.ITR_JSON.capitalGain.length > 0) {
        //TODO   // this.investmentGridOptions.api.setColumnDefs(this.investmentsCreateColoumnDef(this.assestTypesDropdown));
        // this.investmentGridOptions.api.setRowData(this.investmentsCreateRowData(this.assestTypesDropdown))
      }
    }, error => {
      this.getAssetDetails();
    });

  }

  cgCreateColoumnDef(assestTypesDropdown) {
    return [
      {
        headerName: 'Sr. No.',
        field: 'id',
        suppressMovable: true,
        width: 70,
        pinned: 'left',
      },
      {
        headerName: 'Address Of property',
        field: 'address',
        editable: false,
        suppressMovable: true,
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center'
        },
        rowSpan: function (params) {
          if (params.data.isShow) {
            return params.data.rowSpan;
          } else {
            return 1;
          }
        },
        cellClassRules: {
          'cell-span': function (params) {
            return (params.data.rowSpan > 1);
          },
        },
      },
      {
        headerName: 'Pin Code',
        field: 'pin',
        editable: false,
        suppressMovable: true,
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center'
        },
        rowSpan: function (params) {
          if (params.data.isShow) {
            return params.data.rowSpan;
          } else {
            return 1;
          }
        },
        cellClassRules: {
          'cell-span': function (params) {
            return (params.data.rowSpan > 1);
          },
        },
      },
      // {
      //   headerName: 'Date of Sale',
      //   field: 'sellDate',
      //   editable: false,
      //   suppressMovable: true,
      //   cellRenderer: (params) => {
      //     return params.data.sellDate ? (new Date(params.data.sellDate)).toLocaleDateString('en-IN') : '';
      //   }
      // },
      {
        headerName: 'Type of Gain',
        field: 'gainType',
        editable: false,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.gainType === 'LONG' ? 'Long Term' : 'Short Term';
          if (params.data.isExemptionApplied) {
            return params.data.gainType === 'LONG' ? 'Long Term **' : 'Short Term';
          } else {
            return params.data.gainType === 'LONG' ? 'Long Term' : 'Short Term';
          }
        },
      },
      {
        headerName: 'Full Value Consideration',
        field: 'valueInConsideration',
        editable: false,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.valueInConsideration ? params.data.valueInConsideration.toLocaleString('en-IN') : params.data.valueInConsideration;
        },
      },
      {
        headerName: 'Cost Of Improvements',
        field: 'improvements',
        editable: false,
        suppressMovable: true,
      },
      {
        headerName: 'Expenses',
        field: 'sellExpense',
        editable: false,
        suppressMovable: true,
        // valueGetter: function nameFromCode(params) {
        //   return params.data.totalCost ? params.data.totalCost.toLocaleString('en-IN') : params.data.totalCost;
        // },
      },
      {
        headerName: 'Deductions',
        field: 'deductions',
        editable: false,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.totalCost ? params.data.totalCost.toLocaleString('en-IN') : params.data.totalCost;
        },
      },
      // {
      //   headerName: 'Total Cost',
      //   field: 'totalCost',
      //   editable: false,
      //   suppressMovable: true,
      //   valueGetter: function nameFromCode(params) {
      //     return params.data.totalCost ? params.data.totalCost.toLocaleString('en-IN') : params.data.totalCost;
      //   },
      // },

      {
        headerName: 'Gain Amount',
        field: 'cgIncome',
        editable: false,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.cgIncome ? params.data.cgIncome.toLocaleString('en-IN') : params.data.cgIncome;
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
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center'
        },
        rowSpan: function (params) {
          if (params.data.isShow) {
            return params.data.rowSpan;
          } else {
            return 1;
          }
        },
        cellClassRules: {
          'cell-span': function (params) {
            return (params.data.rowSpan > 1);
          },
        },
      },
      {
        headerName: 'Delete',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        width: 70,
        pinned: 'right',
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Delete">
          <i class="fa fa-trash" aria-hidden="true" data-action-type="remove"></i>
         </button>`;

        },
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center'
        },
        rowSpan: function (params) {
          if (params.data.isShow) {
            return params.data.rowSpan;
          } else {
            return 1;
          }
        },
        cellClassRules: {
          'cell-span': function (params) {
            return (params.data.rowSpan > 1);
          },
        },
      }
    ];
  }

  public onCgRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          this.deleteCapitalGain(params.data);
          break;
        }
        case 'edit': {
          //let cgObject = this.ITR_JSON.capitalGain[params.data.id-1];
          console.log('dtaa', params.data);
          this.addCapitalGain('EDIT', JSON.parse(params.data.cgObject));
          break;
        }
      }
    }
  }

  cgCallInConstructor(assestTypesDropdown) {
    this.capitalGainGridOptions = <GridOptions>{
      rowData: this.cgCreateRowData(),
      columnDefs: this.cgCreateColoumnDef(assestTypesDropdown),
      onGridReady: () => {
        this.capitalGainGridOptions.api.sizeColumnsToFit();
      },
      suppressDragLeaveHidesColumns: true,
      enableCellChangeFlash: true,
      defaultColDef: {
        resizable: true
      },
      suppressRowTransform: true
    };
  }

  cancelForm(event) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
    this.cgCallInConstructor([]);
    this.capitalGainGridOptions.api?.setRowData(this.cgCreateRowData());
    this.labView = event.view;
  }

  deleteCapitalGain(assetSelected) {
    this.loading = true;
    this.Copy_ITR_JSON.capitalGain = this.Copy_ITR_JSON.capitalGain.filter(item =>
      !((item.assetDetails[0].description === assetSelected.description) && (item.assetType === assetSelected.assetType))
    );

    const param = '/itr/' + this.ITR_JSON.userId + '/' + this.ITR_JSON.itrId + '/' + this.ITR_JSON.assessmentYear;
    this.itrMsService.putMethod(param, this.Copy_ITR_JSON).subscribe((result: any) => {
      this.ITR_JSON = result;
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
      this.loading = false;
      this.utilsService.showSnackBar('Capital gain deleted successfully');
      console.log('Capital gain save result=', result);
      this.utilsService.smoothScrollToTop();

      this.capitalGainGridOptions.api.setRowData(this.cgCreateRowData());
    }, error => {
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      this.loading = false;
      this.utilsService.showSnackBar('Failed to delete capital gain data');
      this.utilsService.smoothScrollToTop();
    });

  }
}
