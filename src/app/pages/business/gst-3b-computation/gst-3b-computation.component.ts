import { NumericEditor } from './../../../shared/numeric-editor.component';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { NavbarService } from '../../../services/navbar.service';
import { Router } from '@angular/router';
import { ToastMessageService } from '../../../services/toast-message.service';
import { HttpClient } from '@angular/common/http';
import { GridOptions, RowNode } from 'ag-grid-community';

@Component({
  selector: 'app-gst-3b-computation',
  templateUrl: './gst-3b-computation.component.html',
  styleUrls: ['./gst-3b-computation.component.css']
})

export class GST3BComputationComponent implements OnInit, AfterViewInit {
  selected_merchant: any;
  loading: boolean = false;
  merchantData: any;
  currentMerchantData: any;

  selected_gst_return_calendars_data: any;

  is_applied_clicked: boolean = false;

  computationGridOptions: GridOptions;
  gst3BCompData: any = {};
  openingBalanceData: any = {};
  constructor(
    private navbarService: NavbarService,
    public router: Router, public http: HttpClient,
    public _toastMessageService: ToastMessageService) {
    NavbarService.getInstance(null).component_link_2 = 'gst-3b-computation';
    NavbarService.getInstance(null).component_link_3 = '';
    NavbarService.getInstance(null).showBtns = 'gst-3b-computation';

    this.computationGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.computationCreateColoumnDef(),
      frameworkComponents: {
        numericEditor: NumericEditor,
      },
      enableCellChangeFlash: true,
      onGridReady: params => {
        params.api.sizeColumnsToFit();
      },
      headerHeight: 50,
      pinnedBottomRowData: this.getPinnedBottomData({
        sales: 0,
        purchases: 0,
        opBal: 0,
        liability: 0
      }),
    };
  }
  getPinnedBottomData(data) {
    return [
      {
        taxId: 'Total',
        sales: data.sales,
        purchases: data.purchases,
        opBal: data.opBal,
        liability: data.liability
      }
    ];
  }

  calTotalRowData() {
    var rowData = this.computationGridOptions.api.getRenderedNodes();
    let sales = 0;
    let purchases = 0;
    let opBal = 0;
    for (let i = 0; i < rowData.length; i++) {
      sales = sales + (rowData[i].data.sales === 'NA' ? 0 : rowData[i].data.sales);
      purchases = purchases + (rowData[i].data.purchases === 'NA' ? 0 : rowData[i].data.purchases);
      opBal = opBal + (rowData[i].data.opBal === 'NA' ? 0 : rowData[i].data.opBal);
    }
    return {
      taxId: 'Total',
      sales: sales,
      purchases: purchases,
      opBal: opBal,
      liability: sales - (purchases + opBal)
    }
  }
  onCellValueChanged(event) {
    this.computationGridOptions.api.setPinnedBottomRowData([this.calTotalRowData()])
  }

  ngAfterViewInit() {
    let body = document.body;
    body.addEventListener("mouseup", (e) => {
      if (this.computationGridOptions && this.computationGridOptions.api)
        this.computationGridOptions.api.stopEditing();
    })
  }
  ngOnInit() {
    if (!NavbarService.getInstance(null).isSessionValid()) {
      this.router.navigate(['']);
      return;
    }

    this.onSelectMerchant(NavbarService.getInstance(null).merchantData);
    this.onSelectGSTReturnData(NavbarService.getInstance(null).selected_gst_return_calendars_data);
  }

  ngDoCheck() {
    if (NavbarService.getInstance(null).isMerchantChanged && NavbarService.getInstance(null).merchantData) {
      this.onSelectMerchant(NavbarService.getInstance(null).merchantData);
      NavbarService.getInstance(null).isMerchantChanged = false;
    }

    if (NavbarService.getInstance(null).isGSTReturnCalendarChanged && NavbarService.getInstance(null).selected_gst_return_calendars_data) {
      this.onSelectGSTReturnData(NavbarService.getInstance(null).selected_gst_return_calendars_data);
      NavbarService.getInstance(null).isGSTReturnCalendarChanged = false;
    }

    if (NavbarService.getInstance(null).isApplyBtnClicked) {
      NavbarService.getInstance(null).isApplyBtnClicked = false;
      this.getGST3BGrid();
    }
  }

  onSelectMerchant(event) {
    if (event && event.userId) {
      this.selected_merchant = event;
      this.getMerchantDetails(event);
    }
  }

  getMerchantDetails(merchant) {
    this.loading = true;
    this.merchantData = null;
    NavbarService.getInstance(this.http).getGetGSTMerchantDetail(merchant.userId).subscribe(res => {
      if (res) {
        if (!res.gstDetails) { res.gstDetails = {}; };
        this.merchantData = res;
      }
      this.loading = false;
    }, err => {
      let errorMessage = (err.error && err.error.message) ? err.error.message : "Internal server error.";
      this._toastMessageService.alert("error", "merchant detail - " + errorMessage);
      this.loading = false;
    });
  }

  getGST3BGrid() {
    if (!this.merchantData || !this.merchantData.userId) {
      this._toastMessageService.alert("error", "Please select user");
      return;
    }

    if (!this.selected_gst_return_calendars_data || !this.selected_gst_return_calendars_data.id) {
      this._toastMessageService.alert("error", "Please select return date");
      return;
    }
    this.is_applied_clicked = true;
    this.loading = true;
    this.getGST3BComputation().then((gst3BCompData: any) => {
      if (gst3BCompData) {
        console.log("gst3BCompData:", gst3BCompData);
        this.gst3BCompData = gst3BCompData;
        this.getOpeningBalance().then(openingBalanceData => {
          if (openingBalanceData) {
            console.log("openingBalanceData:", openingBalanceData);
            this.openingBalanceData = openingBalanceData;
            this.createGST3BData(gst3BCompData, openingBalanceData);
          }
        })
      }
    })
  }

  createGST3BData(gst3BCompData, openingBalanceData) {
    // this.gst3bComputation["id"] = gst3BCompData["id"] || null;

    // this.gst3bComputation["salesIgst"] = gst3BCompData["salesIgst"] || 0;
    // this.gst3bComputation["salesCgst"] = gst3BCompData["salesCgst"] || 0;
    // this.gst3bComputation["salesSgst"] = gst3BCompData["salesSgst"] || 0;
    // this.gst3bComputation["salesCess"] = gst3BCompData["salesCess"] || 0;
    // this.gst3bComputation["salesLateFee"] = gst3BCompData["salesLateFee"] || 0;
    // this.gst3bComputation["salesInterest"] = gst3BCompData["salesInterest"] || 0;
    // this.gst3bComputation["salesTotal"] = gst3BCompData["salesTotal"] || 0;

    // this.gst3bComputation["purchaseIgst"] = gst3BCompData["purchaseIgst"] || 0;
    // this.gst3bComputation["purchaseCgst"] = gst3BCompData["purchaseCgst"] || 0;
    // this.gst3bComputation["purchaseSgst"] = gst3BCompData["purchaseSgst"] || 0;
    // this.gst3bComputation["purchaseCess"] = gst3BCompData["purchaseCess"] || 0;
    // this.gst3bComputation["purchaseTotal"] = gst3BCompData["purchaseTotal"] || 0;

    // this.gst3bComputation["liabilityIgst"] = gst3BCompData["liabilityIgst"] || 0;
    // this.gst3bComputation["liabilityCgst"] = gst3BCompData["liabilityCgst"] || 0;
    // this.gst3bComputation["liabilitySgst"] = gst3BCompData["liabilitySgst"] || 0;
    // this.gst3bComputation["liabilityCess"] = gst3BCompData["liabilityCess"] || 0;
    // this.gst3bComputation["liabilityLateFee"] = gst3BCompData["liabilityLateFee"] || 0;
    // this.gst3bComputation["liabilityInterest"] = gst3BCompData["liabilityInterest"] || 0;
    // this.gst3bComputation["liabilityTotal"] = gst3BCompData["liabilityTotal"] || 0;

    // this.gst3bComputation["computationStatusId"] = gst3BCompData["computationStatusId"] || 1; // 1 means pending status
    // this.gst3bComputation["updatedAt"] = gst3BCompData["updatedAt"] || new Date();

    // this.gst3bComputation.businessId = this.currentMerchantData.userId;

    // this.gst3bComputation["opBalId"] = openingBalanceData["id"] || null;
    // this.gst3bComputation["opBalIgst"] = openingBalanceData["igst"] || 0;
    // this.gst3bComputation["opBalCgst"] = openingBalanceData["cgst"] || 0;
    // this.gst3bComputation["opBalSgst"] = openingBalanceData["sgst"] || 0;
    // this.gst3bComputation["opBalCess"] = openingBalanceData["cess"] || 0;
    // this.gst3bComputation["opBalLateFee"] = openingBalanceData["lateFee"] || 0;
    // this.gst3bComputation["opBalTotal"] = openingBalanceData["opBalTotal"] || 0;

    this.computationGridOptions.api.setRowData(this.createRowData(gst3BCompData, openingBalanceData));
    this.computationGridOptions.api.setPinnedBottomRowData([this.calTotalRowData()])

    this.loading = false;
  }

  getGST3BComputation() {
    return new Promise((resolve, reject) => {
      this.currentMerchantData = JSON.parse(JSON.stringify(this.merchantData));
      let params = {
        businessId: this.currentMerchantData.userId,
        gstReturnCalendarId: this.selected_gst_return_calendars_data.id,
      }
      NavbarService.getInstance(this.http).getGST3BComputationByPost(params).subscribe(res => {
        if (res) {
          return resolve(res);
        } else {
          return resolve(false);
        }
      }, err => {
        this.loading = false;
        let errorMessage = (err.error && err.error.title) ? err.error.title : "Internal server error.";
        this._toastMessageService.alert("error", "GST 3B - " + errorMessage);
        return resolve(false);
      });
    });
  }

  getOpeningBalance() {
    return new Promise((resolve, reject) => {
      this.currentMerchantData = JSON.parse(JSON.stringify(this.merchantData));
      let params = {
        businessId: this.currentMerchantData.userId,
        gstReturnCalendarId: this.selected_gst_return_calendars_data.id,
      }
      NavbarService.getInstance(this.http).getOpeningBalance(params).subscribe(openingBal => {
        if (openingBal) {
          return resolve(openingBal);
        } else {
          return resolve(false);
        }
      }, err => {
        this.loading = false;
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "get gst gst balance of business - " + errorMessage);
        return resolve(false);
      });
    });
  }

  onSelectGSTReturnData(event) {
    if (event && event.id) {
      this.selected_gst_return_calendars_data = event;
      // this.gst3bComputation.gstReturnCalendarId = event.id;
    }
  }

  save3BDetails() {
    if (!this.gst3BCompData.businessId) {
      this._toastMessageService.alert("error", "Please select a user.");
      return;
    }
    this.loading = true;
    this.gst3BCompData = this.returnUpdated3BComputation();
    this.openingBalanceData = this.returnUpdatedOpeningBalance();
    this.updateGst3BComputation(this.gst3BCompData).then((res: any) => {
      console.log("Computation updated:", res);
      this.updateOpeningBalance(this.openingBalanceData).then((res: any) => {
        console.log("Opening Bal updated:", res);
        this._toastMessageService.alert("success", "GST 3B computation updated successfully");
        this.loading = false;
      })
    })
  }

  returnUpdated3BComputation() {
    const rowData3B = this.computationGridOptions.api.getRenderedNodes();
    const totalRowData = this.calTotalRowData();
    const gst3B = {
      id: this.gst3BCompData.id,
      salesIgst: rowData3B[0].data.sales,
      purchaseIgst: rowData3B[0].data.purchases,
      liabilityIgst: Math.round(rowData3B[0].data.liability * 100) / 100,

      salesCgst: rowData3B[1].data.sales,
      purchaseCgst: rowData3B[1].data.purchases,
      liabilityCgst: Math.round(rowData3B[1].data.liability * 100) / 100,

      salesSgst: rowData3B[2].data.sales,
      purchaseSgst: rowData3B[2].data.purchases,
      liabilitySgst: Math.round(rowData3B[2].data.liability * 100) / 100,

      salesCess: rowData3B[3].data.sales,
      purchaseCess: rowData3B[3].data.purchases,
      liabilityCess: Math.round(rowData3B[3].data.liability * 100) / 100,

      salesLateFee: rowData3B[4].data.sales,
      liabilityLateFee: rowData3B[4].data.liability,

      salesInterest: rowData3B[5].data.sales,
      liabilityInterest: rowData3B[5].data.liability,

      salesTotal: totalRowData.sales,
      purchaseTotal: totalRowData.purchases,
      liabilityTotal: totalRowData.liability,

      computationStatusId: this.gst3BCompData.computationStatusId,
      gstReturnCalendarId: this.gst3BCompData.gstReturnCalendarId,
      businessId: this.currentMerchantData.userId
    }

    return gst3B;

  }

  returnUpdatedOpeningBalance() {
    const rowData3B = this.computationGridOptions.api.getRenderedNodes();
    return {
      id: this.openingBalanceData.id,
      igst: rowData3B[0].data.opBal,
      cgst: rowData3B[1].data.opBal,
      sgst: rowData3B[2].data.opBal,
      cess: rowData3B[3].data.opBal,
      lateFee: rowData3B[4].data.opBal,
      businessId: this.openingBalanceData.businessId,
      gstReturnCalendarId: this.openingBalanceData.gstReturnCalendarId,
    }
  }

  updateGst3BComputation(gst3BCompData) {
    return new Promise((resolve, reject) => {
      NavbarService.getInstance(this.http).updateGST3BComputation(gst3BCompData).subscribe(res => {
        return resolve(res);
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "save gst 3b - " + errorMessage);
        this.loading = false;
        return resolve(false);
      });
    });
  }

  updateOpeningBalance(openingBal) {
    return new Promise((resolve, reject) => {
      NavbarService.getInstance(this.http).updateOpeningBalance(openingBal).subscribe(res => {
        return resolve(res);
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "save gst 3b - " + errorMessage);
        this.loading = false;
        return resolve(false);
      });
    });
  }

  computationCreateColoumnDef() {
    return [
      {
        headerName: ' ',
        field: 'taxId',
        width: 100,
        pinned: 'left',
        suppressMovable: true,
      },
      {
        headerName: 'GST Collected on Sales',
        field: 'sales',
        suppressMovable: true,
        cellEditor: 'numericEditor',
        editable: function (params) {
          return (params.data.taxId === 'Late Fees' || params.data.taxId === 'Interest') ? true : false;
        },
        valueFormatter: function valueFormatter(params) {
          return params.data.sales ? (Math.round(params.data.sales * 100) / 100).toLocaleString('en-IN') : params.data.sales;
        },
        cellStyle: function (params) {
          if (params.data.taxId === 'Late Fees' || params.data.taxId === 'Interest') {
            return { 'text-align': "right", 'cursor': 'pointer' }
          } else {
            return { 'text-align': "right", 'cursor': 'not-allowed' }
          }
        }
      },
      {
        headerName: 'GST paid on purchases during the month',
        field: 'purchases',
        suppressMovable: true,
        valueFormatter: function valueFormatter(params) {
          if (params.data.purchases && params.data.purchases !== 'NA') {
            return (Math.round(params.data.purchases * 100) / 100).toLocaleString('en-IN')
          } else {
            return params.data.purchases
          }
        },
        cellStyle: {
          'text-align': "right", 'cursor': 'not-allowed'
        }
      },
      {
        headerName: 'Op. Bal. of Credit',
        field: 'opBal',
        suppressMovable: true,
        editable: function (params) {
          return (params.data.opBal === 'NA' || params.data.taxId === 'Total') ? false : true;
        },
        cellEditor: 'numericEditor',
        valueFormatter: function valueFormatter(params) {
          if (params.data.opBal && params.data.opBal !== 'NA') {
            return (Math.round(params.data.opBal * 100) / 100).toLocaleString('en-IN')
          } else {
            return params.data.opBal
          }
        },
        cellStyle: function (params) {
          if (params.data.opBal === 'NA' || params.data.taxId === 'Total') {
            return { 'text-align': "right", 'cursor': 'not-allowed' }
          } else {
            return { 'text-align': "right", 'cursor': 'pointer' }
          }
        }
      },
      {
        headerName: 'Net GST Payable',
        field: 'liability',
        suppressMovable: true,
        valueFormatter: function calculatePayable(params) {
          const purchases = params.data.purchases === 'NA' ? 0 : params.data.purchases;
          const opBal = params.data.opBal === 'NA' ? 0 : params.data.opBal;
          const inc = (params.data.sales - (purchases + opBal));
          params.data.liability = Math.round(inc * 100) / 100;
          return params.data.liability.toLocaleString('en-IN');
        },
        cellStyle: { 'text-align': "right" }
      }
    ];
  }

  createRowData(gst3BCompData, openingBalanceData) {
    return [{
      taxId: 'IGST',
      sales: gst3BCompData['salesIgst'],
      purchases: gst3BCompData['purchaseIgst'],
      opBal: openingBalanceData['igst'],
      liability: gst3BCompData['liabilityIgst']
    }, {
      taxId: 'CGST',
      sales: gst3BCompData['salesCgst'],
      purchases: gst3BCompData['purchaseCgst'],
      opBal: openingBalanceData['cgst'],
      liability: gst3BCompData['liabilityCgst']
    }, {
      taxId: 'SGST/UTGST',
      sales: gst3BCompData['salesSgst'],
      purchases: gst3BCompData['purchaseSgst'],
      opBal: openingBalanceData['sgst'],
      liability: gst3BCompData['liabilitySgst']
    }, {
      taxId: 'CESS',
      sales: gst3BCompData['salesCess'],
      purchases: gst3BCompData['purchaseCess'],
      opBal: openingBalanceData['cess'],
      liability: gst3BCompData['liabilityCess']
    }, {
      taxId: 'Late Fees',
      sales: gst3BCompData['salesLateFee'],
      purchases: 'NA',
      opBal: openingBalanceData['lateFee'],
      liability: gst3BCompData['liabilityLateFee']
    }, {
      taxId: 'Interest',
      sales: gst3BCompData['salesInterest'],
      purchases: 'NA',
      opBal: 'NA',
      liability: gst3BCompData['liabilityInterest']
    }]
  }
}