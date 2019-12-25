import { NumericEditor } from './../../../shared/numeric-editor.component';
/**
 * (c) OneGreenDiary Software Pvt. Ltd. 
 * This file is a part of OneGreenDiary platform code base.
 *
 * This file is distributed under following terms:
 * 1) OneGreenDiary owns the OneGreenDiary platform, of which this file is a part.
 * 2) Any modifications to the base platform by OneGreenDiary is owned by OneGreenDiary and will be 
 *    non-exclusively used by OneGreenDiary Software Pvt. Ltd. for its clients and partners.
 * 3) Rights of any third-party customizations that do not alter the base platform, 
 *    solely reside with the third-party.  
 * 4) OneGreenDiary Software Pvt. Ltd. is free to  change the licences of the base platform to permissive 
 *    opensource licences (e.g. Apache/EPL/MIT/BSD) in future.
 * 5) Onces OneGreenDiary platform is delivered to third party, they are free to modify the code for their internal use.
 *    Any such modifications will be solely owned by the third party.
 * 6) The third party may not redistribute the OneGreenDiary platform code base in any form without 
 *    prior agreement with OneGreenDiary Software Pvt. Ltd. 
 * 7) Third party agrees to preserve the above notice for all the OneGreenDiary platform files.
 */


import { Component, OnInit } from '@angular/core';
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
export class GST3BComputationComponent implements OnInit {
  selected_merchant: any;
  loading: boolean = false;
  merchantData: any;
  currentMerchantData: any;

  selected_gst_return_calendars_data: any;
  gst3bComputation: any = {};

  is_applied_clicked: boolean = false;

  computationGridOptions: GridOptions;
  private gridApi;
  private gridColumnApi;
  // workingGridOptions: GridOptions;
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
        // gridOptions.api.setHeaderHeight(value);
        // let pinnedBottomData = this.generatePinnedBottomData();
        // params.api.setPinnedBottomRowData([pinnedBottomData])

      },
      headerHeight: 50,
      getRowNodeId: function (data) { return data.taxId; },
    };
    // let pinnedBottomData = this.generatePinnedBottomData();
    // this.gridApi.setPinnedBottomRowData([pinnedBottomData]);
    /* this.workingGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.workingCreateColoumnDef(),
      enableCellChangeFlash: true,
      onGridReady: params => {
        params.api.sizeColumnsToFit();
      },
      headerHeight: 50
    }; */

  }

  onCellValueChanged(event) {
    console.log("On Cell value changed:", event)
    var rowData = this.computationGridOptions.api.getRenderedNodes();
    var totalRowData = this.computationGridOptions.api.getRowNode('Total');
    console.log("ROw NOde:", rowData)
    //   var newData = {
    //     taxId: 'Total',
    //     gstCollectedOnSales: gst3bComputation['salesTotal'],
    //     gstPaidOnPurchases: gst3bComputation['creditTotal'],
    //     opBalOfCredit: gst3bComputation['creditIgst'],
    //     gstPayable: gst3bComputation['liabilityTotal']
    // };
    let gstCollectedOnSales = 0;
    let gstPaidOnPurchases = 0;
    let opBalOfCredit = 0;
    for (let i = 0; i < rowData.length; i++) {
      gstCollectedOnSales = gstCollectedOnSales + (rowData[i].data.gstCollectedOnSales === 'NA' ? 0 : rowData[i].data.gstCollectedOnSales);
      gstPaidOnPurchases = gstPaidOnPurchases + (rowData[i].data.gstPaidOnPurchases === 'NA' ? 0 : rowData[i].data.gstPaidOnPurchases);
      opBalOfCredit = opBalOfCredit + (rowData[i].data.opBalOfCredit === 'NA' ? 0 : rowData[i].data.opBalOfCredit);
    }
    totalRowData.setDataValue('gstCollectedOnSales', event.data.gstCollectedOnSales);
    totalRowData.setDataValue('gstPaidOnPurchases', event.data.gstPaidOnPurchases);
    totalRowData.setDataValue('opBalOfCredit', event.data.opBalOfCredit);
  }

  generatePinnedBottomData() {
    // generate a row-data with null values
    let result = {};
    this.gridColumnApi.getAllGridColumns().forEach(item => {
      result[item.colId] = null;
    });
    console.log("generatePinnedBottomData:", result)
    return this.calculatePinnedBottomData(result);
  }

  calculatePinnedBottomData(target: any) {
    console.log("calculatePinnedBottomData start:", target)
    //list of columns for aggregation
    let columnsWithAggregation = ['age']
    columnsWithAggregation.forEach(element => {
      this.gridApi.forEachNodeAfterFilter((rowNode: RowNode) => {
        if (rowNode.data[element])
          target[element] += Number(rowNode.data[element].toFixed(2));
      });
      if (target[element])
        target[element] = `Age Sum: ${target[element].toFixed(2)}`;
    })
    console.log("calculatePinnedBottomData updated:", target)
    return target;
  }

  ngOnInit() {
    if (!NavbarService.getInstance(null).isSessionValid()) {
      this.router.navigate(['']);
      return;
    }

    this.resetGst3bComputation();
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
      this.getGST3BDetail();
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

  //NEEDED
  getGSTSalesSummary() {
    return new Promise((resolve, reject) => {
      if (!this.merchantData || !this.merchantData.userId) {
        this._toastMessageService.alert("error", "Please select user");
        return resolve(false);
      } else if (!this.selected_gst_return_calendars_data || !this.selected_gst_return_calendars_data.id) {
        this._toastMessageService.alert("error", "Please select return date");
        return resolve(false);
      }

      let params = {
        businessId: this.merchantData.userId,
        month: this.selected_gst_return_calendars_data.gstReturnMonth,
        year: this.selected_gst_return_calendars_data.gstReturnYear
      }
      NavbarService.getInstance(this.http).getGSTSalesSummary(params).subscribe(res => {
        if (res) {
          return resolve(res);
        } else {
          return resolve(false);
        }
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "get gst sales summary - " + errorMessage);
        return resolve(false);
      });
    })
  }

  //NEEDED
  getGSTBalance() {
    return new Promise((resolve, reject) => {
      if (!this.merchantData || !this.merchantData.userId) {
        this._toastMessageService.alert("error", "Please select user");
        return resolve(false);
      } else if (!this.selected_gst_return_calendars_data || !this.selected_gst_return_calendars_data.id) {
        this._toastMessageService.alert("error", "Please select return date");
        return resolve(false);
      }

      let params = {
        businessId: this.merchantData.userId,
        month: this.selected_gst_return_calendars_data.gstReturnMonth,
        year: this.selected_gst_return_calendars_data.gstReturnYear
      }
      NavbarService.getInstance(this.http).getGSTBalanceOfBusiness(params).subscribe(res => {
        if (res) {
          return resolve(res);
        } else {
          return resolve(false);
        }
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "get gst gst balance of business - " + errorMessage);
        return resolve(false);
      });
    });
  }

  getGSTComputationStatuses() {
    return new Promise((resolve, reject) => {
      NavbarService.getInstance(this.http).getGST3BComputationStatuses().subscribe(res => {
        if (res) {
          return resolve(res);
        } else {
          return resolve(false);
        }
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "get gst gst balance of business - " + errorMessage);
        return resolve(false);
      });
    });
  }

  //NEEDED
  getGST3BDetail() {
    if (!this.merchantData || !this.merchantData.userId) {
      this._toastMessageService.alert("error", "Please select user");
      return;
    }

    if (!this.selected_gst_return_calendars_data || !this.selected_gst_return_calendars_data.id) {
      this._toastMessageService.alert("error", "Please select return date");
      return;
    }


    this.is_applied_clicked = true;
    this.currentMerchantData = JSON.parse(JSON.stringify(this.merchantData));
    this.resetGst3bComputation();
    let params = {
      'businessId.equals': this.currentMerchantData.userId,
      'gstReturnCalendarId.equals': this.selected_gst_return_calendars_data.id
    }

    this.loading = true;
    NavbarService.getInstance(this.http).getGST3BComputation(params).subscribe(res => {
      if (res && res.length > 0) {
        this.gst3bComputation["id"] = res[0]["id"] || null;
        this.gst3bComputation["salesTotal"] = res[0]["salesTotal"] || 0;
        this.gst3bComputation["salesIgst"] = res[0]["salesIgst"] || 0;
        this.gst3bComputation["salesCgst"] = res[0]["salesCgst"] || 0;
        this.gst3bComputation["salesSgst"] = res[0]["salesSgst"] || 0;
        this.gst3bComputation["salesCess"] = res[0]["salesCess"] || 0;
        this.gst3bComputation["creditIgst"] = res[0]["creditIgst"] || 0;
        this.gst3bComputation["creditCgst"] = res[0]["creditCgst"] || 0;
        this.gst3bComputation["creditSgst"] = res[0]["creditSgst"] || 0;
        this.gst3bComputation["creditCess"] = res[0]["creditCess"] || 0;
        this.gst3bComputation["creditTotal"] = res[0]["creditTotal"] || 0;
        this.gst3bComputation["liabilityIgst"] = res[0]["liabilityIgst"] || 0;
        this.gst3bComputation["liabilityCgst"] = res[0]["liabilityCgst"] || 0;
        this.gst3bComputation["liabilitySgst"] = res[0]["liabilitySgst"] || 0;
        this.gst3bComputation["liabilityCess"] = res[0]["liabilityCess"] || 0;
        this.gst3bComputation["liabilityTotal"] = res[0]["liabilityTotal"] || 0;
        this.gst3bComputation["lateFee"] = res[0]["lateFee"] || 0;
        this.gst3bComputation["interest"] = res[0]["interest"] || 0;
        this.gst3bComputation["computationTotal"] = res[0]["computationTotal"] || 0;
        this.gst3bComputation["computationStatusId"] = res[0]["computationStatusId"] || 1; // 1 means pending status
        this.gst3bComputation["updatedAt"] = res[0]["updatedAt"] || null;
      }

      if (this.gst3bComputation["computationStatusId"] == 1) {
        this.gst3bComputation["salesIgst"] = 0;
        this.gst3bComputation["salesCgst"] = 0;
        this.gst3bComputation["salesSgst"] = 0;
        this.gst3bComputation["salesCess"] = 0;
      }

      this.gst3bComputation["purchaseIgst"] = 0;
      this.gst3bComputation["purchaseCgst"] = 0;
      this.gst3bComputation["purchaseSgst"] = 0;
      this.gst3bComputation["purchaseCess"] = 0;

      this.gst3bComputation["opBalCreditLateFee"] = 0;
      this.gst3bComputation["opBalCreditIgst"] = 0;
      this.gst3bComputation["opBalCreditCgst"] = 0;
      this.gst3bComputation["opBalCreditSgst"] = 0;
      this.gst3bComputation["opBalCreditCess"] = 0;

      this.gst3bComputation.businessId = this.currentMerchantData.userId;

      if (this.gst3bComputation["computationStatusId"] == 1) {
        this.getAndSetGst3BData().then(result => {
          this.calculateLiabilityTotal();
          this.calculateComputationTotal('sales', "ALL");
          this.calculateCreditTotal('purchase', "ALL");
          this.loading = false;
          this.computationGridOptions.api.setRowData(this.createRowData(this.gst3bComputation))

        });
      } else {
        this.calculateLiabilityTotal();
        this.calculateComputationTotal('sales', "ALL");
        if (this.gst3bComputation["computationStatusId"] == 1) {
          this.calculateCreditTotal('purchase', "ALL");
        }
        this.computationGridOptions.api.setRowData(this.createRowData(this.gst3bComputation))

        this.loading = false;
      }
    }, err => {
      let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
      this._toastMessageService.alert("error", "get gst 3b - " + errorMessage);
      this.loading = false;
    });
  }

  getAndSetGst3BData() {
    return new Promise((resolve, reject) => {
      if (this.gst3bComputation.computationStatusId != 1) {
        return resolve(true);
      }
      this.getGSTSalesSummary().then((summaryReportData: any) => {
        this.getGSTBalance().then((gstBalance: any) => {
          if (summaryReportData) {
            this.gst3bComputation["salesIgst"] = (summaryReportData.salesIgst) ? summaryReportData.salesIgst : 0;
            this.gst3bComputation["salesCgst"] = (summaryReportData.salesCgst) ? summaryReportData.salesCgst : 0;
            this.gst3bComputation["salesSgst"] = (summaryReportData.salesSgst) ? summaryReportData.salesSgst : 0;
            this.gst3bComputation["salesCess"] = (summaryReportData.salesCess) ? summaryReportData.salesCess : 0;

            this.gst3bComputation["purchaseIgst"] = (summaryReportData.purchaseIgst) ? summaryReportData.purchaseIgst : 0;
            this.gst3bComputation["purchaseCgst"] = (summaryReportData.purchaseCgst) ? summaryReportData.purchaseCgst : 0;
            this.gst3bComputation["purchaseSgst"] = (summaryReportData.purchaseSgst) ? summaryReportData.purchaseSgst : 0;
            this.gst3bComputation["purchaseCess"] = (summaryReportData.purchaseCess) ? summaryReportData.purchaseCess : 0;
          }

          if (gstBalance) {
            this.gst3bComputation["opBalId"] = (gstBalance.id);
            this.gst3bComputation["opBalCreditIgst"] = (gstBalance.igst) ? gstBalance.igst : 0;
            this.gst3bComputation["opBalCreditCgst"] = (gstBalance.cgst) ? gstBalance.cgst : 0;
            this.gst3bComputation["opBalCreditSgst"] = (gstBalance.sgst) ? gstBalance.sgst : 0;
            this.gst3bComputation["opBalCreditCess"] = (gstBalance.cess) ? gstBalance.cess : 0;
            this.gst3bComputation["opBalGstReturnCalendarId"] = (gstBalance.gstReturnCalendarId) ? gstBalance.gstReturnCalendarId : 0;
          }

          return resolve(true);
        });
      });
    });
  }

  resetGst3bComputation() {
    this.gst3bComputation = {
      "salesIgst": 0.0,
      "salesCgst": 0.0,
      "salesSgst": 0.0,
      "salesCess": 0.0,
      "salesTotal": 0.0,
      "purchaseIgst": 0.0,
      "purchaseCgst": 0.0,
      "purchaseSgst": 0.0,
      "purchaseCess": 0.0,
      "purchaseLateFee": 0.0,
      "purchaseTotal": 0.0,
      "creditIgst": 0.0,
      "creditCgst": 0.0,
      "creditSgst": 0.0,
      "creditCess": 0.0,
      "creditTotal": 0.0,
      "liabilityIgst": 0.0,
      "liabilityCgst": 0.0,
      "liabilitySgst": 0.0,
      "liabilityCess": 0.0,
      "liabilityTotal": 0.0,
      "lateFee": 0.0,
      "interest": 0.0,
      "computationTotal": 0.0,
      "businessId": 0,
      "gstReturnCalendarId": 2,
      "computationStatusId": 1 // 1 means pending
    };
  }

  onSelectGSTReturnData(event) {
    if (event && event.id) {
      this.selected_gst_return_calendars_data = event;
      this.gst3bComputation.gstReturnCalendarId = event.id;
    }
  }

  calculateCreditTotal(type, subtype) {
    if (!this.gst3bComputation.opBalCreditIgst) {
      this.gst3bComputation.opBalCreditIgst = 0;
    }

    if (!this.gst3bComputation.opBalCreditCgst) {
      this.gst3bComputation.opBalCreditCgst = 0;
    }

    if (!this.gst3bComputation.opBalCreditSgst) {
      this.gst3bComputation.opBalCreditSgst = 0;
    }

    if (!this.gst3bComputation.opBalCreditCess) {
      this.gst3bComputation.opBalCreditCess = 0;
    }

    if (!this.gst3bComputation.creditLateFee) {
      this.gst3bComputation.creditLateFee = 0;
    }

    if (!this.gst3bComputation.opBalCreditLateFee) {
      this.gst3bComputation.opBalCreditLateFee = 0;
    }

    if (subtype == "IGST" || subtype == "ALL") {
      this.gst3bComputation.creditIgst = this.gst3bComputation.opBalCreditIgst + this.gst3bComputation.purchaseIgst;
    }

    if (subtype == "CGST" || subtype == "ALL") {
      this.gst3bComputation.creditCgst = this.gst3bComputation.opBalCreditCgst + this.gst3bComputation.purchaseCgst;
    }

    if (subtype == "SGST" || subtype == "ALL") {
      this.gst3bComputation.creditSgst = this.gst3bComputation.opBalCreditSgst + this.gst3bComputation.purchaseSgst;
    }

    if (subtype == "CESS" || subtype == "ALL") {
      this.gst3bComputation.creditCess = this.gst3bComputation.opBalCreditCess + this.gst3bComputation.purchaseCess;
    }

    if (subtype == "OP_LATE_FEE" || subtype == "ALL") {
      this.gst3bComputation.creditLateFee = this.gst3bComputation.opBalCreditLateFee;
    }


    this.gst3bComputation.purchaseTotal = this.gst3bComputation.purchaseIgst + this.gst3bComputation.purchaseCgst + this.gst3bComputation.purchaseSgst + this.gst3bComputation.purchaseCess
    this.gst3bComputation.opBalCreditTotal = this.gst3bComputation.opBalCreditIgst + this.gst3bComputation.opBalCreditCgst + this.gst3bComputation.opBalCreditSgst + this.gst3bComputation.opBalCreditCess + this.gst3bComputation.opBalCreditLateFee;
    this.gst3bComputation.creditTotal = this.gst3bComputation.purchaseTotal + this.gst3bComputation.opBalCreditTotal;
    this.calculateLiabilityTotal();
  }

  calculateComputationTotal(type, subtype) {
    if (type == 'sales') {
      this.gst3bComputation.salesTotal = this.gst3bComputation.salesIgst + this.gst3bComputation.salesCgst + this.gst3bComputation.salesSgst + this.gst3bComputation.salesCess;
      this.gst3bComputation.computationTotal = this.gst3bComputation.salesTotal + this.gst3bComputation.lateFee + this.gst3bComputation.interest;
    } else if (type == 'credit') {
      this.gst3bComputation.creditTotal = this.gst3bComputation.creditIgst + this.gst3bComputation.creditCgst + this.gst3bComputation.creditSgst + this.gst3bComputation.creditCess;
    }

    if (subtype == "IGST" || subtype == "ALL") {
      this.gst3bComputation.liabilityIgst = this.gst3bComputation.salesIgst - this.gst3bComputation.creditIgst;
    }


    if (subtype == "CGST" || subtype == "ALL") {
      this.gst3bComputation.liabilityCgst = this.gst3bComputation.salesCgst - this.gst3bComputation.creditCgst;
    }

    if (subtype == "SGST" || subtype == "ALL") {
      this.gst3bComputation.liabilitySgst = this.gst3bComputation.salesSgst - this.gst3bComputation.creditSgst;
    }

    if (subtype == "CESS" || subtype == "ALL") {
      this.gst3bComputation.liabilityCess = this.gst3bComputation.salesCess - this.gst3bComputation.creditCess;
    }

    if (subtype) {
      this.gst3bComputation.liabilityTotal = ((this.gst3bComputation.computationTotal || 0) - (this.gst3bComputation.creditTotal || 0));
    }
  }

  calculateLiabilityTotal() {
    this.gst3bComputation.liabilityIgst = this.gst3bComputation.salesIgst - this.gst3bComputation.creditIgst;
    this.gst3bComputation.liabilityCgst = this.gst3bComputation.salesCgst - this.gst3bComputation.creditCgst;
    this.gst3bComputation.liabilitySgst = this.gst3bComputation.salesSgst - this.gst3bComputation.creditSgst;
    this.gst3bComputation.liabilityCess = this.gst3bComputation.salesCess - this.gst3bComputation.creditCess;
    this.gst3bComputation.liabilityTotal = ((this.gst3bComputation.computationTotal || 0) - (this.gst3bComputation.creditTotal || 0));
  }


  saveGST3BData(type) {
    if (!this.gst3bComputation.businessId) {
      this._toastMessageService.alert("error", "Please select a user.");
      return;
    }

    let params = JSON.parse(JSON.stringify(this.gst3bComputation));
    params.updatedAt = new Date();
    this.loading = true;
    if (type == "save & send") {
      params.computationStatusId = 3;  //3 means Sent For Approval // 2 means approved //  1 means pending
      this.gst3bComputation.computationStatusId = 3;
    }
    if (params.id) {
      NavbarService.getInstance(this.http).updateGST3BComputation(params).subscribe(res => {
        this.updateGstBalance().then(ugb => {
          if (type == "save & send") {
            this.freezeGST3BComputationCopy().then(rd => {
              this._toastMessageService.alert("success", "GST 3B Computation saved successfully.");
              this.loading = false;
            });
          } else {
            this._toastMessageService.alert("success", "GST 3B Computation saved successfully.");
            this.loading = false;
          }
        })
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "save gst 3b - " + errorMessage);
        this.loading = false;
      });
    } else {
      NavbarService.getInstance(this.http).addGST3BComputation(params).subscribe(res => {
        this.updateGstBalance().then(ugb => {
          if (type == "save & send") {
            this.freezeGST3BComputationCopy().then(rd => {
              this._toastMessageService.alert("success", "GST 3B Computation saved successfully.");
              this.loading = false;
            });
          } else {
            this._toastMessageService.alert("success", "GST 3B Computation saved successfully.");
            this.loading = false;
          }
        });
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "save gst 3b - " + errorMessage);
        this.loading = false;
      });
    }
  }

  freezeGST3BComputationCopy() {
    return new Promise((resolve, reject) => {
      let params = {
        businessId: this.merchantData.userId,
        month: this.selected_gst_return_calendars_data.gstReturnMonth,
        year: this.selected_gst_return_calendars_data.gstReturnYear
      }

      NavbarService.getInstance(this.http).freezeGST3BComputationCopy(params).subscribe(res => {
        resolve(true);
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "freeze gst 3b - " + errorMessage);
        resolve(false);
      });
    });
  }

  updateGstBalance() {
    return new Promise((resolve, reject) => {
      if (!this.gst3bComputation.opBalId) {
        return resolve(false);
      } else {
        let balanceUpdate = {
          "id": this.gst3bComputation.opBalId,
          "cgst": this.gst3bComputation.opBalCreditCgst,
          "sgst": this.gst3bComputation.opBalCreditSgst,
          "igst": this.gst3bComputation.opBalCreditIgst,
          "cess": this.gst3bComputation.opBalCreditCess,
          "businessId": this.gst3bComputation.businessId,
          "gstReturnCalendarId": this.gst3bComputation.opBalGstReturnCalendarId
        }
        NavbarService.getInstance(this.http).updateGSTBalanceOfBusiness(balanceUpdate).subscribe(res => {
          return resolve(true);
        }, err => {
          let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
          this._toastMessageService.alert("error", "save gst 3b - " + errorMessage);
          return resolve(false);
        });
      }
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
        field: 'gstCollectedOnSales',
        suppressMovable: true,
        cellEditor: 'numericEditor',
        editable: function (params) {
          return (params.data.taxId === 'Late Fees' || params.data.taxId === 'Interest') ? true : false;
        },
        valueGetter: function valueFormatter(params) {
          return params.data.gstCollectedOnSales ? params.data.gstCollectedOnSales.toLocaleString('en-IN') : params.data.gstCollectedOnSales;
        },
        cellStyle: { 'text-align': "right" }
      },
      {
        headerName: 'GST paid on purchases during the month',
        field: 'gstPaidOnPurchases',
        suppressMovable: true,
        valueGetter: function valueFormatter(params) {
          return params.data.gstPaidOnPurchases ? params.data.gstPaidOnPurchases.toLocaleString('en-IN') : params.data.gstPaidOnPurchases;
        },
        cellStyle: { 'text-align': "right" }
      },
      {
        headerName: 'Op. Bal. of Credit',
        field: 'opBalOfCredit',
        suppressMovable: true,
        editable: function (params) {
          return params.data.opBalOfCredit === 'NA' ? false : true;
        },
        cellEditor: 'numericEditor',
        valueGetter: function valueFormatter(params) {
          return params.data.opBalOfCredit ? params.data.opBalOfCredit.toLocaleString('en-IN') : params.data.opBalOfCredit;
        },
        cellStyle: { 'text-align': "right" }
      },
      {
        headerName: 'Net GST Payable',
        field: 'gstPayable',
        suppressMovable: true,
        valueGetter: function calculatePayable(params) {
          const gstPaidOnPurchases = params.data.gstPaidOnPurchases === 'NA' ? 0 : params.data.gstPaidOnPurchases;
          const opBalOfCredit = params.data.opBalOfCredit === 'NA' ? 0 : params.data.opBalOfCredit;
          const inc = (params.data.gstCollectedOnSales - (gstPaidOnPurchases + opBalOfCredit));
          params.data.gstPayable = inc;
          return params.data.gstPayable.toLocaleString('en-IN');
        },
        cellStyle: { 'text-align': "right" }
      }
    ];
  }

  createRowData(gst3bComputation) {
    return [{
      taxId: 'IGST',
      gstCollectedOnSales: gst3bComputation['salesIgst'],
      gstPaidOnPurchases: gst3bComputation['creditIgst'],
      opBalOfCredit: gst3bComputation['creditIgst'],
      gstPayable: gst3bComputation['liabilityIgst']
    }, {
      taxId: 'CGST',
      gstCollectedOnSales: gst3bComputation['salesCgst'],
      gstPaidOnPurchases: gst3bComputation['creditCgst'],
      opBalOfCredit: gst3bComputation['creditIgst'],
      gstPayable: gst3bComputation['liabilityCgst']
    }, {
      taxId: 'SGST/UTGST',
      gstCollectedOnSales: gst3bComputation['salesSgst'],
      gstPaidOnPurchases: gst3bComputation['creditSgst'],
      opBalOfCredit: gst3bComputation['creditIgst'],
      gstPayable: gst3bComputation['liabilitySgst']
    }, {
      taxId: 'CESS',
      gstCollectedOnSales: gst3bComputation['salesCess'],
      gstPaidOnPurchases: gst3bComputation['creditCess'],
      opBalOfCredit: gst3bComputation['creditIgst'],
      gstPayable: gst3bComputation['liabilityCess']
    }, {
      taxId: 'Late Fees',
      gstCollectedOnSales: gst3bComputation['salesCess'],
      gstPaidOnPurchases: 'NA',
      opBalOfCredit: gst3bComputation['creditIgst'],
      gstPayable: gst3bComputation['liabilityCess']
    }, {
      taxId: 'Interest',
      gstCollectedOnSales: gst3bComputation['salesCess'],
      gstPaidOnPurchases: 'NA',
      opBalOfCredit: 'NA',
      gstPayable: gst3bComputation['liabilityCess']
    }, {
      taxId: 'Total',
      gstCollectedOnSales: gst3bComputation['salesTotal'],
      gstPaidOnPurchases: gst3bComputation['creditTotal'],
      opBalOfCredit: gst3bComputation['creditIgst'],
      gstPayable: gst3bComputation['liabilityTotal']
    }]
  }

  /* workingCreateColoumnDef() {
    return [
      {
        headerName: ' ',
        field: 'taxId',
        width: 100,
        pinned: 'left',
        suppressMovable: true,
      },
      {
        headerName: 'Op. Bal. of Credit',
        field: 'opBalOfCredit',
        suppressMovable: true,
        valueGetter: function valueFormatter(params) {
          return params.data.opBalOfCredit ? params.data.opBalOfCredit.toLocaleString('en-IN') : params.data.opBalOfCredit;
        },
        cellStyle: { 'text-align': "right" }
      },
      {
        headerName: 'GST paid on purchases during the month',
        field: 'gstPaidOnPurchases',
        suppressMovable: true,
        valueGetter: function valueFormatter(params) {
          return params.data.gstPaidOnPurchases ? params.data.gstPaidOnPurchases.toLocaleString('en-IN') : params.data.gstPaidOnPurchases;
        },
        cellStyle: { 'text-align': "right" }
      },
      {
        headerName: 'Total GST Paid on Purchases',
        field: 'totalGSTPaidOnPurchases',
        suppressMovable: true,
        valueGetter: function valueFormatter(params) {
          return params.data.totalGSTPaidOnPurchases ? params.data.totalGSTPaidOnPurchases.toLocaleString('en-IN') : params.data.totalGSTPaidOnPurchases;
        },
        cellStyle: { 'text-align': "right" }
      }
    ];
  } */
}