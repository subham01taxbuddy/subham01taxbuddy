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
import { NavbarService } from '../../services/navbar.service';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastMessageService } from '../../services/toast-message.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})

export class ListComponent implements OnInit {
  loading: boolean = false;
  page_query_type: any = "";
  merchantList: any = [];
  merchantFullDetail: any = {};
  selected_invoice_merchant_data: any;
  invoices_list: any = [];
  state_list: any = [];
  invoice_status_list: any = [];
  all_invoice_types: any = [];
  selected_invoice_types: any = [];
  invoice_party_roles: any = [];
  invoice_main_type: any = "";

  invoiceToUpdate: any;
  isGSTBillViewShown: boolean = false;

  /*{"name":"Ashish","mobile_number":"1234123412","document_type":"sales","upload_date":"2019-01-01","previous_return_field_status":"FILED","gst_filing_status":"FILED","status_of_invoice":"FILED","owner":"Test User"},
  {"name":"Ashish","mobile_number":"1234123412","document_type":"sales","upload_date":"2019-01-01","previous_return_field_status":"FILED","gst_filing_status":"FILED","status_of_invoice":"FILED","owner":"Test User"}*/

  record_select_for_update: boolean = false;
  group_selected_assign_to: any = "";
  prods_check: boolean[] = [false];
  admin_list: any = [];
  filterData: any = [];
  filters_list: any = [
    { 'in_prod_name': 'User Name' },
    { 'in_prod_name': 'Mobile Number' },
    { 'in_prod_name': 'Document Type' },
    { 'in_prod_name': 'Status of Invoice' },
    { 'in_prod_name': 'Invoice Owner' },
    { 'in_prod_name': 'Merchant Owner' }
  ];

  bodyTag = document.getElementsByTagName("body")[0];

  constructor(navbarService: NavbarService, public router: Router, public http: HttpClient,
    public _toastMessageService: ToastMessageService, private route: ActivatedRoute) {
    NavbarService.getInstance(null).component_link_2 = 'list';
    NavbarService.getInstance(null).component_link_3 = '';
    NavbarService.getInstance(null).showBtns = 'list';
  }

  ngOnInit() {
    if (!NavbarService.getInstance(null).isSessionValid()) {
      this.router.navigate(['']);
      return;
    }

    this.route.queryParams.subscribe(params => {
      if (params && params.type) {
        this.page_query_type = params.type;
      }
    });

    this.loading = true;
    this.getGSTStateList().then(sR => {
      this.getGSTInvoiceTypes().then(itR => {
        this.getInvoicePartyRoles().then(rR => {
          this.getInvoiceStatusList().then(isRl => {
            this.getAdminList().then(aR => {
              this.getMerchantList().then(mR => {
                this.getInvoiceList().then(iR => {
                  this.loading = false
                });
              });
            });
          });
        });
      });
    });
  }

  onChangeAttrFilter(event) {
    var tempReportD = this.invoices_list.filter(rd => {
      var is_match = true;
      for (var i = 0; i < event.length; i++) {
        var it = event[i];
        if (it.attr == 'Mobile Number' && it.value && rd.merchantMobileNumber.toLowerCase().indexOf(it.value.toLowerCase()) == -1 ||
          it.attr == 'User Name' && it.value && rd.merchantName.toLowerCase().indexOf(it.value.toLowerCase()) == -1 ||
          it.attr == 'Document Type' && it.value && rd.invoiceDocumentType && rd.invoiceDocumentType.toLowerCase().indexOf(it.value.toLowerCase()) == -1 ||
          it.attr == 'Status of Invoice' && it.value && rd.invoiceStatus && rd.invoiceStatus.toLowerCase().indexOf(it.value.toLowerCase()) == -1 ||
          it.attr == 'Invoice Owner' && it.value && rd.processedBy && rd.processedBy.toLowerCase().indexOf(it.value.toLowerCase()) == -1 ||
          it.attr == 'Merchant Owner' && it.value && rd.merchantManagedBy && rd.merchantManagedBy.toLowerCase().indexOf(it.value.toLowerCase()) == -1

        ) {
          is_match = false;
          break;
        } else {
          // TODO: We can upgrade this invoice list filter
          // Note: for removing data who has invoice owner as N/A
          if (it.attr == 'Invoice Owner' && it.value && (!rd.hasOwnProperty("processedBy") || rd.processedBy === "" || rd.processedBy === undefined || rd.processedBy === null)) {
            is_match = false;
            break;
          }
        }
      }

      return is_match;
    })

    this.filterData = JSON.parse(JSON.stringify(tempReportD));
    console.log("onChangeAttrFilter = ", this.filterData)
  }

  getGSTStateList() {
    return new Promise((resolve, reject) => {
      this.state_list = [];
      NavbarService.getInstance(this.http).getGSTStateDetails().subscribe(res => {
        if (Array.isArray(res)) {
          res.forEach(sData => { sData.name = sData.stateMasterName });
          this.state_list = res;
        }
        resolve(true);
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "state list - " + errorMessage);
        resolve(false);
      });
    })
  }

  getInvoicePartyRoles() {
    return new Promise((resolve, reject) => {
      this.invoice_party_roles = [];
      NavbarService.getInstance(this.http).getInvoicePartyRoles().subscribe(res => {
        if (Array.isArray(res)) {
          this.invoice_party_roles = res;
        }
        resolve(true);
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "invoice party role list - " + errorMessage);
        resolve(false);
      });
    })
  }

  getAdminList() {
    return new Promise((resolve, reject) => {
      this.admin_list = [];
      NavbarService.getInstance(this.http).getAdminList().subscribe(res => {
        if (Array.isArray(res)) {
          res.forEach(admin_data => {
            this.admin_list.push({ userId: admin_data.userId, name: admin_data.fName + " " + admin_data.lName })
          });
        }
        return resolve(true)
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "admin list - " + errorMessage);
        return resolve(false)
      });
    });
  }

  getMerchantList() {
    return new Promise((resolve, reject) => {
      this.merchantList = [];
      NavbarService.getInstance(this.http).getGSTDetailList().subscribe(res => {
        this.merchantList = res;
        return resolve(true);
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", errorMessage);
        return resolve(false);
      });
    });
  }

  getInvoiceList() {
    return new Promise((resolve, reject) => {
      this.getSalesPurchaseInvoiceList().then((spInv: any) => {
        this.getCreditDebitNoteInvoiceList().then((cdnInv: any) => {
          if (this.page_query_type == "my_pending_processing") {
            this.invoices_list = spInv.concat(cdnInv).filter(inv => { return inv.invoiceStatusMasterInvoiceStatusMasterId != 3 });
          } else {
            this.invoices_list = spInv.concat(cdnInv)
          }
          this.invoices_list = this.invoices_list.sort((a, b) => {
            let aD: any = new Date(a.invoiceCreatedAt);
            let bD: any = new Date(b.invoiceCreatedAt);
            return bD - aD;
          });
          this.filterData = this.invoices_list;
          return resolve(true);
        });
      });
    });
  }

  getSalesPurchaseInvoiceList() {
    return new Promise((resolve, reject) => {
      let iParams = { page: 0, size: 1000 };
      if (this.page_query_type == "unassigned") {
        iParams["invoiceAssignedTo.specified"] = false;
        iParams["invoiceStatusMasterInvoiceStatusMasterId.in"] = [1, 2];
      } else if (this.page_query_type == "pending_processing") {
        iParams["invoiceStatusMasterInvoiceStatusMasterId.in"] = [2, 4];
      } else if (this.page_query_type == "my_pending_processing") {
        let loggedInUserData: any = JSON.parse(localStorage.getItem("UMD")) || {};
        /*iParams["invoiceStatusMasterInvoiceStatusMasterId.in"]=[2,4];  */
        iParams["invoiceAssignedTo.equals"] = loggedInUserData.USER_UNIQUE_ID;
      }
      NavbarService.getInstance(this.http).getInvoiceList(iParams).subscribe(res => {
        if (Array.isArray(res)) {
          let invoice_types_obj = {};
          let invoice_status_obj = {};
          this.all_invoice_types.forEach(invT => {
            invoice_types_obj[invT.id] = invT["invoiceTypesName"];
          });

          this.invoice_status_list.forEach(invSL => {
            invoice_status_obj[invSL.id] = invSL["invoiceStatusMasterName"]
          })
          res.forEach(inv => {
            inv.merchantName = "";
            inv.merchantMobileNumber = "";
            inv.invoiceStatus = invoice_status_obj[inv.invoiceStatusMasterInvoiceStatusMasterId] || "";
            inv.invoiceDocumentType = invoice_types_obj[inv.invoiceTypesInvoiceTypesId] || "";
            let mData = this.merchantList.filter(ml => { return ml.userId == inv.businessId });
            if (mData && mData[0]) {
              inv.merchantName = mData[0].fName + " " + mData[0].lName;
              inv.merchantManagedBy = mData[0].managedBy ? mData[0].managedBy.fName + " " + mData[0].managedBy.lName : "";
              inv.merchantMobileNumber = mData[0].mobileNumber;
            }
            inv.processedBy = this.getAdminName(inv.invoiceAssignedTo);
          })
          return resolve(res);
        } else {
          return resolve([]);
        }
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "invoice list - " + errorMessage);
        return resolve([]);
      });
    });
  }

  getCreditDebitNoteInvoiceList() {
    return new Promise((resolve, reject) => {
      let iParams = { page: 0, size: 1000 };
      if (this.page_query_type == "unassigned") {
        iParams["creditDebitNoteAssignedTo.specified"] = false;
        iParams["invoiceStatusMasterInvoiceStatusMasterId.in"] = [1, 2];
      } else if (this.page_query_type == "pending_processing") {
        iParams["invoiceStatusMasterInvoiceStatusMasterId.in"] = [1, 2, 4];
      } else if (this.page_query_type == "my_pending_processing") {
        let loggedInUserData: any = JSON.parse(localStorage.getItem("UMD")) || {};
        /*iParams["invoiceStatusMasterInvoiceStatusMasterId.in"]=[2,4];  */
        iParams["creditDebitNoteAssignedTo.equals"] = loggedInUserData.USER_UNIQUE_ID;
      }

      NavbarService.getInstance(this.http).getCreditDebitNoteInvoiceList(iParams).subscribe(res => {
        if (Array.isArray(res)) {
          let invoice_types_obj = {};
          let invoice_status_obj = {};
          this.all_invoice_types.forEach(invT => {
            invoice_types_obj[invT.id] = invT["invoiceTypesName"];
          });

          this.invoice_status_list.forEach(invSL => {
            invoice_status_obj[invSL.id] = invSL["invoiceStatusMasterName"]
          })
          res.forEach(inv => {
            inv.merchantName = "";
            inv.merchantMobileNumber = "";
            inv.invoiceCreatedAt = inv.noteCreatedAt;
            inv.invoiceStatus = invoice_status_obj[inv.invoiceStatusMasterInvoiceStatusMasterId] || "";
            inv.invoiceDocumentType = invoice_types_obj[inv.invoiceTypesInvoiceTypesId] || "";
            let mData = this.merchantList.filter(ml => { return ml.userId == inv.businessId });
            if (mData && mData[0]) {
              inv.merchantName = mData[0].fName + " " + mData[0].lName;
              inv.merchantMobileNumber = mData[0].mobileNumber;
            }
            inv.processedBy = this.getAdminName(inv.creditDebitNoteAssignedTo);
          })

          return resolve(res);
        } else {
          return resolve([]);
        }

      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "invoice list - " + errorMessage);
        return resolve([]);
      });
    });
  }

  getGSTInvoiceTypes() {
    return new Promise((resolve, reject) => {
      this.all_invoice_types = [];
      NavbarService.getInstance(this.http).getGSTInvoiceTypes().subscribe(res => {
        if (Array.isArray(res)) {
          this.all_invoice_types = res;
        }
        resolve(true);
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "invoice type list - " + errorMessage);
        resolve(false);
      });
    })
  }

  getInvoiceStatusList() {
    return new Promise((resolve, reject) => {
      this.invoice_status_list = [];
      NavbarService.getInstance(this.http).getInvoiceStatusList().subscribe(res => {
        if (Array.isArray(res)) {
          res.forEach(sData => { sData.name = sData.invoiceStatusMasterName });
          this.invoice_status_list = res;
        }
        resolve(true);
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "invoice status list - " + errorMessage);
        resolve(false);
      });
    })
  }

  onSelectInvoiceStatus(event, item) {
    if (event && event.id) {
      item.selected_invoice_status = event;
    }
  }

  onSelectInvoiceAssignedToUser(event, item) {
    if (event && event.userId) {
      item.selected_invoice_assigned_to_user = event;
    }
  }

  getMerchantDetails(businessId) {
    return new Promise((resolve, reject) => {
      if (this.merchantFullDetail[businessId]) {
        return resolve(this.merchantFullDetail[businessId]);
      }
      NavbarService.getInstance(this.http).getGetGSTMerchantDetail(businessId).subscribe(res => {
        if (res) {
          if (!res.gstDetails) { res.gstDetails = {}; };

          if (!res.gstDetails.bankInformation) {
            res.gstDetails.bankInformation = { bankName: "", accountNumber: "", ifscCode: "" };
          }
          if (!res.gstDetails.businessAddress) {
            res.gstDetails.businessAddress = { address: "", stateMasterCode: "", pincode: "" };
          }
          this.merchantFullDetail[businessId] = res;
          return resolve(res);
        } else {
          return resolve(null);
        }
        this.loading = false;
      }, err => {
        let errorMessage = (err.error && err.error.message) ? err.error.message : "Internal server error.";
        this._toastMessageService.alert("error", "merchant detail - " + errorMessage);
        return resolve(null);
      });
    })
  }

  onClickEditInvoice(invoice) {
    this.loading = true;
    this.getMerchantDetails(invoice.businessId).then(merchantDetail => {
      if (!merchantDetail) {
        this.loading = false;
        return;
      }

      this.selected_invoice_merchant_data = merchantDetail;
      this.setInvoicesByBillType(invoice.invoiceTypesInvoiceTypesId);

      this.getInvoiceByInvoiceId(invoice).then(invoiceData => {
        if (invoiceData) {
          this.invoiceToUpdate = invoiceData;
          this.isGSTBillViewShown = true;
          this.bodyTag.setAttribute("class", "overflow-hidden");
        }
        this.loading = false;
      });
    });
  }

  getInvoiceByInvoiceId(invoice) {
    return new Promise((resolve, reject) => {
      if ([4, 5].indexOf(invoice.invoiceTypesInvoiceTypesId) != -1) {
        this.getCreditDebitNoteInvoiceByInvoiceId(invoice.id).then(result => {
          return resolve(result);
        });
      } else {
        this.getSalesPurchaseInvoiceByInvoiceId(invoice.id).then(result => {
          return resolve(result);
        });
      }
    })
  }

  getSalesPurchaseInvoiceByInvoiceId(inv_id) {
    return new Promise((resolve, reject) => {
      NavbarService.getInstance(this.http).getInvoiceWithItemsByInvoiceId(inv_id).subscribe(res => {
        return resolve((Array.isArray(res)) ? res[0] : null);
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "invoice - " + errorMessage);
        return resolve(null);
      });
    });
  }

  getCreditDebitNoteInvoiceByInvoiceId(inv_id) {
    return new Promise((resolve, reject) => {
      NavbarService.getInstance(this.http).getCreditDebitNoteInvoiceWithItemsByInvoiceId(inv_id).subscribe(res => {
        return resolve((Array.isArray(res)) ? res[0] : null);
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "invoice - " + errorMessage);
        return resolve(null);
      });
    })
  }

  setInvoicesByBillType(bill_type) {
    this.selected_invoice_types = [];
    this.invoice_main_type = "";
    if (bill_type == 1 || bill_type == 2) {
      let tInvT = this.all_invoice_types.filter(ait => { return ait.invoiceTypesName == "Sales" })
      this.selected_invoice_types = tInvT.map(t => { return { id: t.id, name: t.invoiceTypesSubtype } });
      this.invoice_main_type = "sales-invoice";
    } else if (bill_type == 3 || bill_type == 6) {
      let tInvT = this.all_invoice_types.filter(ait => { return (ait.invoiceTypesName == "Purchase" || ait.invoiceTypesName == "Expense") })
      this.selected_invoice_types = tInvT.map(t => { return { id: t.id, name: t.invoiceTypesName } });
      this.invoice_main_type = "purchase-invoice";
    } else if (bill_type == 4) {
      let tInvT = this.all_invoice_types.filter(ait => { return (ait.invoiceTypesName == "Credit Note") })
      this.selected_invoice_types = tInvT.map(t => { return { id: t.id, name: t.invoiceTypesName } });
      this.invoice_main_type = "credit-note";
    } else if (bill_type == 5) {
      let tInvT = this.all_invoice_types.filter(ait => { return (ait.invoiceTypesName == "Debit Note") })
      this.selected_invoice_types = tInvT.map(t => { return { id: t.id, name: t.invoiceTypesName } });
      this.invoice_main_type = "debit-note";
    }
  }

  onUpdateInvoice(event) {
    if (event && event.id) {
      let invlen = this.invoices_list.length;
      for (var i = 0; i < invlen; i++) {
        if (this.invoices_list[i].id == event.id) {
          Object.assign(this.invoices_list[i], JSON.parse(JSON.stringify(event)));
          let fData = this.invoice_status_list.filter(invSL => {
            return invSL.id == event.invoiceStatusMasterInvoiceStatusMasterId
          });
          this.invoices_list[i].invoiceStatus = (fData && fData[0]) ? fData[0].invoiceStatusMasterName : "";
          break;
        }
      }
    }

    if (this.page_query_type == "my_pending_processing") {
      this.filterData = this.invoices_list.filter(inv => { return inv.invoiceStatusMasterInvoiceStatusMasterId != 3 });
    } else {
      this.filterData = this.invoices_list;
    }
    console.log("my_pending_processing = ", this.filterData)
    this.onCancelInvoiceBtnClicked();
  }

  onCancelInvoiceBtnClicked() {
    this.isGSTBillViewShown = false;
    this.bodyTag.setAttribute("class", "");
  }

  onCancelInvoice(event) {
    this.isGSTBillViewShown = false;
    this.bodyTag.setAttribute("class", "");
  }
  onSaveGSTBillInvoice() {
    NavbarService.getInstance(null).saveGSTBillInvoice = true;
  }

  getAdminName(id) {
    if (!id) {
      return "N/A";
    } else {
      let fData = this.admin_list.filter(al => { return al.userId == id });
      if (fData && fData[0]) {
        return fData[0].name;
      }
    }
  }

  updateCreditDebitNoteInvoice(item, itemIndex) {
    let params: any = JSON.parse(JSON.stringify(item));

    params.invoiceUpdatedAt = new Date();
    if (item.selected_invoice_status && item.selected_invoice_status.id) {
      params.invoiceStatusMasterInvoiceStatusMasterId = item.selected_invoice_status.id;
    }

    if (item.selected_invoice_assigned_to_user && item.selected_invoice_assigned_to_user.userId) {
      params.creditDebitNoteAssignedTo = item.selected_invoice_assigned_to_user.userId;
    }

    if ((!params.creditDebitNoteAssignedTo || params.creditDebitNoteAssignedTo == item.creditDebitNoteAssignedTo) &&
      (!params.invoiceStatusMasterInvoiceStatusMasterId || item.invoiceStatusMasterInvoiceStatusMasterId == params.invoiceStatusMasterInvoiceStatusMasterId)) {
      this._toastMessageService.alert("error", "No data for update");
      return;
    }

    this.loading = true;
    NavbarService.getInstance(this.http).updateCreditDebitNoteInvoice(params).subscribe(res => {
      if (item.selected_invoice_assigned_to_user && item.selected_invoice_assigned_to_user.userId) {
        item.processedBy = item.selected_invoice_assigned_to_user.name;
      }

      if (item.selected_invoice_status && item.selected_invoice_status.id) {
        item.invoiceStatus = item.selected_invoice_status.name;
      }

      this.onSelectRecord(item, itemIndex)
      this.loading = false;
      this._toastMessageService.alert("success", "Invoice updated successfully.");
    }, err => {
      let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
      this._toastMessageService.alert("error", "update invoice item - " + errorMessage);
      this.loading = false;
    });
  }

  updateSalesPurchaseInvoice(item, itemIndex) {
    let params: any = JSON.parse(JSON.stringify(item));

    params.invoiceUpdatedAt = new Date();
    if (item.selected_invoice_status && item.selected_invoice_status.id) {
      params.invoiceStatusMasterInvoiceStatusMasterId = item.selected_invoice_status.id;
    }

    if (item.selected_invoice_assigned_to_user && item.selected_invoice_assigned_to_user.userId) {
      params.invoiceAssignedTo = item.selected_invoice_assigned_to_user.userId;
    }

    if ((!params.invoiceAssignedTo || params.invoiceAssignedTo == item.invoiceAssignedTo) &&
      (!params.invoiceStatusMasterInvoiceStatusMasterId || item.invoiceStatusMasterInvoiceStatusMasterId == params.invoiceStatusMasterInvoiceStatusMasterId)) {
      this._toastMessageService.alert("error", "No data for update");
      return;
    }

    this.loading = true;
    NavbarService.getInstance(this.http).updateInvoice(params).subscribe(res => {
      if (item.selected_invoice_assigned_to_user && item.selected_invoice_assigned_to_user.userId) {
        item.processedBy = item.selected_invoice_assigned_to_user.name;
      }

      if (item.selected_invoice_status && item.selected_invoice_status.id) {
        item.invoiceStatus = item.selected_invoice_status.name;
      }

      this.onSelectRecord(item, itemIndex)
      this.loading = false;
      this._toastMessageService.alert("success", "Invoice updated successfully.");
    }, err => {
      let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
      this._toastMessageService.alert("error", "update invoice item - " + errorMessage);
      this.loading = false;
    });
  }

  updateListItem(item, itemIndex) {
    if ([1, 2, 3, 6].indexOf(item.invoiceTypesInvoiceTypesId) != -1) {
      this.updateSalesPurchaseInvoice(item, itemIndex);
    } else if (item.invoiceTypesInvoiceTypesId == 4 || item.invoiceTypesInvoiceTypesId == 5) {
      this.updateCreditDebitNoteInvoice(item, itemIndex);
    }
  }

  onSelectRecord(item, index) {
    this.prods_check[index] = !this.prods_check[index];

    let isSelected = false;
    for (var i = 0, llen = this.prods_check.length; i < llen; i++) {
      if (this.prods_check[i]) { isSelected = true; break; }
    }

    this.record_select_for_update = isSelected;

    if (isSelected) {
      if (this.invoice_status_list.length > 0) {
        let fislData = this.invoice_status_list.filter(isl => { return isl.id == item.invoiceStatusMasterInvoiceStatusMasterId });
        if (fislData && fislData[0]) {
          item.selected_invoice_status = fislData[0];
        }
      }

      if (this.admin_list.length > 0) {
        let assignId = item.invoiceAssignedTo;
        if (item.invoiceTypesInvoiceTypesId == 4 || item.invoiceTypesInvoiceTypesId == 5) {
          assignId = item.creditDebitNoteAssignedTo;
        }

        let falData = this.admin_list.filter(isl => { return isl.userId == assignId });
        if (falData && falData[0]) {
          item.selected_invoice_assigned_to_user = falData[0];
        }
      }
    }
  }

  saveGroupSelectedData() {
    let selectedInvoiceIdList = [];
    let selectedCreditDebitNoteInvoiceIdList = [];
    this.prods_check.forEach((pc, index) => {
      if (pc && this.filterData[index]) {
        if ([1, 2, 3, 6].indexOf(this.filterData[index].invoiceTypesInvoiceTypesId) != -1) {
          selectedInvoiceIdList.push(this.filterData[index].id);
        } else if ([4, 5].indexOf(this.filterData[index].invoiceTypesInvoiceTypesId) != -1) {
          selectedCreditDebitNoteInvoiceIdList.push(this.filterData[index].id);
        }
      }
    });

    let params: any = {
      "invoiceAssignedTo": this.group_selected_assign_to.userId,
      "invoiceIdList": selectedInvoiceIdList,
      "creditDebitNoteIdList": selectedCreditDebitNoteInvoiceIdList
    }

    if (!params.invoiceAssignedTo) {
      this._toastMessageService.alert("error", "Select user first");
      return;
    } else if (params.invoiceIdList.length == 0) {
      this._toastMessageService.alert("error", "Select invoices first");
      return;
    }

    this.loading = true;
    NavbarService.getInstance(this.http).assignAdminUserToInvoice(params).subscribe(res => {
      this.loading = false;
      this.resetInvoiceList();
      this.getInvoiceList();
      this._toastMessageService.alert("success", params.invoiceIdList.length + " invoices are updated successfully.");
    }, err => {
      let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
      this._toastMessageService.alert("error", "assign user to invoice list - " + errorMessage);
      this.loading = false;
    });
    console.log("saveGroupSelectedData = ", this.filterData)
  }

  resetInvoiceList() {
    this.group_selected_assign_to = null;
    this.prods_check = [];
    this.record_select_for_update = false;
  }
}
