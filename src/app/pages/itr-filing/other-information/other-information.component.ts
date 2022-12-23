import { ItrMsService } from './../../../services/itr-ms.service';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { DirectorInCompanyComponent } from './director-in-company/director-in-company.component';
import { UnlistedSharesComponent } from './unlisted-shares/unlisted-shares.component';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-other-information',
  templateUrl: './other-information.component.html',
  styleUrls: ['./other-information.component.scss']
})
export class OtherInformationComponent implements OnInit {
  @Output() saveAndNext = new EventEmitter<any>();

  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  loading = false;
  public sharesGridOptions: GridOptions;
  public directorGridOptions: GridOptions;

  constructor(public matDialog: MatDialog,
    private itrMsService: ItrMsService,
    public utilsService: UtilsService) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    if (this.ITR_JSON.unlistedSharesDetails === null || this.ITR_JSON.unlistedSharesDetails === undefined) {
      this.ITR_JSON.unlistedSharesDetails = [];
    }
    if (this.ITR_JSON?.directorInCompany === null || this.ITR_JSON?.directorInCompany === undefined) {
      this.ITR_JSON.directorInCompany = [];
    }
    if(!this.ITR_JSON.systemFlags?.directorInCompany) {
      if(this.ITR_JSON.systemFlags) {
        this.ITR_JSON.systemFlags.directorInCompany = false;
      } else {
        this.ITR_JSON.systemFlags = {
          hasSalary: false,
          hasHouseProperty: false,
          hasMultipleProperties: false,
          hasForeignAssets: false,
          hasCapitalGain: false,
          hasBroughtForwardLosses: false,
          hasAgricultureIncome: false,
          hasOtherIncome: false,
          hasParentOverSixty: false,
          hasBusinessProfessionIncome: false,
          hasFutureOptionsIncome: false,
          hasNRIIncome: false,
          hraAvailed: false,
          directorInCompany: false,
          haveUnlistedShares: false
        }
      }
    }
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON))
    this.sharesCallInConstructor();
    this.directorCallInConstructor();
  }

  ngOnInit() {

  }

  ChangeSharesStatus() {

    if (this.ITR_JSON.systemFlags.haveUnlistedShares) {
      this.addSharesDetails('Add unlisted shares details', 'ADD', null);
    } else {
      if (this.ITR_JSON.unlistedSharesDetails.length > 0) {
        this.Copy_ITR_JSON.unlistedSharesDetails = [];
        this.Copy_ITR_JSON.systemFlags.haveUnlistedShares = false;
        this.serviceCall('Unlisted shares')
      }
    }
  }

  addSharesDetails(title, mode, i) {
    const data = {
      title: title,
      mode: mode,
      ITR_JSON: this.ITR_JSON,
      index: i,
    };
    const dialogRef = this.matDialog.open(UnlistedSharesComponent, {
      data: data,
      closeOnNavigation: true,
      // width: '700px'
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('Result add bank =', result);
      if (result !== undefined) {
        this.ITR_JSON = result;
        sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
        this.sharesGridOptions.api.setRowData(this.sharesCreateRowData());
        this.sharesGridOptions.api.setColumnDefs(this.sharesCreateColumnDef());
      } else {
        if (this.ITR_JSON.unlistedSharesDetails.length === 0) {
          this.ITR_JSON.systemFlags.haveUnlistedShares = false;
        }
      }
    });
  }

  sharesCallInConstructor() {
    this.sharesGridOptions = <GridOptions>{
      rowData: this.sharesCreateRowData(),
      columnDefs: this.sharesCreateColumnDef(),
      onGridReady: () => {
        // this.sharesGridOptions.api.sizeColumnsToFit();
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

  sharesCreateRowData() {
    const dataToReturn = [];
    for (let i = 0; i < this.ITR_JSON?.unlistedSharesDetails.length; i++) {
      const val = this.ITR_JSON.unlistedSharesDetails[i];
      const temp = {
        id: i + 1,
        companyName: val.companyName,
        typeOfCompany: val.typeOfCompany,
        companyPAN: val.companyPAN,
        openingShares: val.openingShares,
        openingCOA: val.openingCOA,
        acquiredShares: val.acquiredShares,
        purchaseDate: val.purchaseDate,
        faceValuePerShare: val.faceValuePerShare,
        issuePricePerShare: val.issuePricePerShare,
        purchasePricePerShare: val.purchasePricePerShare,
        transferredShares: val.transferredShares,
        saleConsideration: val.saleConsideration,
        closingShares: val.closingShares,
        closingCOA: val.closingCOA
      };
      dataToReturn.push(temp);
    }

    return dataToReturn;
  }

  sharesCreateColumnDef() {
    return [
      {
        headerName: 'No.',
        field: 'id',
        width: 70,
        suppressMovable: true,
        pinned: 'left',
      },
      {
        headerName: 'Name of company',
        field: 'companyName',
        suppressMovable: true,
      },
      {
        headerName: 'Type of company',
        field: 'typeOfCompany',
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.typeOfCompany === 'D' ? 'Domestic' : 'Foreign';
        }
      },
      {
        headerName: 'PAN of company',
        field: 'companyPAN',
        suppressMovable: true,
      },
      {
        headerName: 'Opening no of shares',
        field: 'openingShares',
        suppressMovable: true,
      },
      {
        headerName: 'Opening cost of acquisition',
        field: 'openingCOA',
        suppressMovable: true,
        cellRenderer: (params) => {
          return params.data.openingCOA ? params.data.openingCOA.toLocaleString('en-IN') : params.data.openingCOA;
        },
      },
      {
        headerName: 'No. of shares acquired',
        field: 'acquiredShares',
        suppressMovable: true,
      },
      {
        headerName: 'Date of purchase',
        field: 'purchaseDate',
        suppressMovable: true,
        cellRenderer: (params) => {
          return params.data.purchaseDate ? (new Date(params.data.purchaseDate)).toLocaleDateString('en-IN') : '';
        }
      },
      {
        headerName: 'Face value per share',
        field: 'faceValuePerShare',
        suppressMovable: true,
        cellRenderer: (params) => {
          return params.data.faceValuePerShare ? params.data.faceValuePerShare.toLocaleString('en-IN') : params.data.faceValuePerShare;
        },
      },
      {
        headerName: 'Issue price per share',
        field: 'issuePricePerShare',
        suppressMovable: true,
        cellRenderer: (params) => {
          return params.data.issuePricePerShare ? params.data.issuePricePerShare.toLocaleString('en-IN') : params.data.issuePricePerShare;
        },
      },
      {
        headerName: 'Purchase price per share',
        field: 'purchasePricePerShare',
        suppressMovable: true,
        cellRenderer: (params) => {
          return params.data.purchasePricePerShare ? params.data.purchasePricePerShare.toLocaleString('en-IN') : params.data.purchasePricePerShare;
        },
      },
      {
        headerName: 'No. of shares transferred',
        field: 'transferredShares',
        suppressMovable: true,
      },
      {
        headerName: 'Sale consideration',
        field: 'saleConsideration',
        suppressMovable: true,
        cellRenderer: (params) => {
          return params.data.saleConsideration ? params.data.saleConsideration.toLocaleString('en-IN') : params.data.saleConsideration;
        },
      },
      {
        headerName: 'Closing no of shares',
        field: 'closingShares',
        suppressMovable: true,
      },
      {
        headerName: 'Closing cost of acquisition',
        field: 'closingCOA',
        suppressMovable: true,
        cellRenderer: (params) => {
          return params.data.closingCOA ? params.data.closingCOA.toLocaleString('en-IN') : params.data.closingCOA;
        },
      },
      {
        headerName: 'Edit',
        editable: false,
        suppressMovable: true,
        suppressMenu: true,
        width: 100,
        pinned: 'right',
        cellRenderer: function (params) {
          return ` <button type="button" class="action_icon add_button"  title="Edit" style="border: none;
          background: transparent; font-size: 16px; cursor:pointer;color: green">
          <i class="fa fa-pencil" aria-hidden="true" data-action-type="edit"></i>
         </button>`;
        },
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center'
        },
      },
      {
        headerName: 'Delete',
        editable: false,
        suppressMovable: true,
        suppressMenu: true,
        width: 100,
        pinned: 'right',
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Delete" style="border: none;
          background: transparent; font-size: 16px; cursor:pointer;color: red">
          <i class="fa fa-trash" aria-hidden="true" data-action-type="remove"></i>
         </button>`;

        },
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center'
        },
      }
    ];
  }

  public onSharesRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'edit': {
          this.addSharesDetails('Edit unlisted shares details', 'EDIT', (params.data.id - 1));
          break;
        }
        case 'remove': {
          //re-intialise the ITR objects
          this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
          this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

          this.Copy_ITR_JSON.unlistedSharesDetails.splice(params.data.id - 1, 1);
          if (this.Copy_ITR_JSON.unlistedSharesDetails.length === 0) {
            this.Copy_ITR_JSON.systemFlags.haveUnlistedShares = false;
          }
          this.serviceCall('Unlisted shares')
          break;
        }
      }
    }
  }

  //
  ChangeDirectorStatus() {
    
    if (this.ITR_JSON.systemFlags?.directorInCompany) {
      this.addDirectorDetails('Add director details', 'ADD', null);
    } else {
      if (this.ITR_JSON?.directorInCompany.length > 0) {
        this.Copy_ITR_JSON.directorInCompany = [];
        this.Copy_ITR_JSON.systemFlags.directorInCompany = false;
        this.serviceCall('Director in company')
      }
    }
    console.log('Remove shares data here');
  }

  addDirectorDetails(title, mode, i) {
    const data = {
      title: title,
      mode: mode,
      ITR_JSON: this.ITR_JSON,
      index: i,
    };
    const dialogRef = this.matDialog.open(DirectorInCompanyComponent, {
      data: data,
      closeOnNavigation: true,
      // width: '700px'
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('Result add directors =', result);
      if (result !== undefined) {
        this.ITR_JSON = result;
        this.Copy_ITR_JSON = result;
        sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
        this.directorGridOptions?.api.setRowData(this.directorCreateRowData());
        this.directorGridOptions?.api.setColumnDefs(this.directorCreateColumnDef());
      } else {
        if (this.ITR_JSON?.directorInCompany.length === 0) {
          this.ITR_JSON.systemFlags.directorInCompany = false;
        }
      }
    });
  }

  directorCallInConstructor() {
    this.directorGridOptions = <GridOptions>{
      rowData: this.directorCreateRowData(),
      columnDefs: this.directorCreateColumnDef(),
      onGridReady: () => {
        // this.sharesGridOptions.api.sizeColumnsToFit();
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


  directorCreateColumnDef() {
    return [
      {
        headerName: 'No.',
        field: 'id',
        width: 70,
        suppressMovable: true,
        pinned: 'left',
      },
      {
        headerName: 'Name of company',
        field: 'companyName',
        suppressMovable: true,
      },
      {
        headerName: 'Type of company',
        field: 'typeOfCompany',
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.typeOfCompany === 'D' ? 'Domestic' : 'Foreign';
        }
      },
      {
        headerName: 'PAN of company',
        field: 'companyPAN',
        suppressMovable: true,
      },
      {
        headerName: 'Type of Shares',
        field: 'sharesType',
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.sharesType === 'UN_LISTED' ? 'Unlisted' : 'Listed';
        }
      },
      {
        headerName: 'DIN',
        field: 'din',
        suppressMovable: true,
      },
      {
        headerName: 'Edit',
        editable: false,
        suppressMenu: true,
        suppressMovable: true,
        width: 100,
        pinned: 'right',
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button"  title="Edit" style="border: none;
          background: transparent; font-size: 16px; cursor:pointer;color: green">
          <i class="fa fa-pencil" aria-hidden="true" data-action-type="edit"></i>
         </button>`;
        },
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center'
        },
      },
      {
        headerName: 'Delete',
        editable: false,
        suppressMenu: true,
        suppressMovable: true,
        width: 100,
        pinned: 'right',
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Delete" style="border: none;
          background: transparent; font-size: 16px; cursor:pointer;color: red">
          <i class="fa fa-trash" aria-hidden="true" data-action-type="remove"></i>
         </button>`;

        },
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center'
        },
      }
    ];
  }

  public onDirectorRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'edit': {
          this.addDirectorDetails('Edit director details', 'EDIT', (params.data.id - 1));
          break;
        }
        case 'remove': {
          //re-intialise the ITR objects
          this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
          this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

          this.Copy_ITR_JSON.directorInCompany.splice(params.data.id - 1, 1);
          if (this.Copy_ITR_JSON.directorInCompany.length === 0) {
            this.Copy_ITR_JSON.systemFlags.directorInCompany = false;
          }
          this.serviceCall('Director in company')
          // this.deleteDetails('DIRECTOR', (params.data.id - 1));
          break;
        }
      }
    }
  }

  directorCreateRowData() {
    const dataToReturn = [];
    for (let i = 0; i < this.ITR_JSON?.directorInCompany.length; i++) {
      const val = this.ITR_JSON.directorInCompany[i];
      const temp = {
        id: i + 1,
        companyName: val.companyName,
        typeOfCompany: val.typeOfCompany,
        companyPAN: val.companyPAN,
        sharesType: val.sharesType,
        din: val.din,
      };
      dataToReturn.push(temp);
    }

    return dataToReturn;
  }

  serviceCall(msg) {
    this.loading = true;
    this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(result => {
      sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(result));
      this.ITR_JSON = JSON.parse(JSON.stringify(result));
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(result));
      this.loading = false;
      this.utilsService.showSnackBar(msg + ' details removed successfully');
      if (this.ITR_JSON.systemFlags?.directorInCompany)
        this.directorGridOptions?.api.setRowData(this.directorCreateRowData());
      if (this.ITR_JSON.systemFlags.haveUnlistedShares)
        this.sharesGridOptions.api.setRowData(this.sharesCreateRowData());
      // this.saveAndNext.emit(true);
    }, error => {
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      this.loading = false;
    });
  }
  saveAndContinue() {
    this.saveAndNext.emit(true);
  }

}
