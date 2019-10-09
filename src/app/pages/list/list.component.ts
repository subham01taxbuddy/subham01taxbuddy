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
import { Router,ActivatedRoute } from '@angular/router';
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
  merchantList:any = [];
  invoices_list:any = [];
  invoice_status_list:any = []; 
  all_invoice_types: any = [];
  /*{"name":"Ashish","mobile_number":"1234123412","document_type":"sales","upload_date":"2019-01-01","previous_return_field_status":"FILED","gst_filing_status":"FILED","status_of_invoice":"FILED","owner":"Test User"},
  {"name":"Ashish","mobile_number":"1234123412","document_type":"sales","upload_date":"2019-01-01","previous_return_field_status":"FILED","gst_filing_status":"FILED","status_of_invoice":"FILED","owner":"Test User"}*/
  
  record_select_for_update: boolean = false;
  group_selected_assign_to: any = "";
  prods_check: boolean[] = [false];
  admin_list: any = [];
  filterData:any = [];
  filters_list: any = [ 
    {'in_prod_name':'Name'},
    {'in_prod_name':'Mobile Number'},
    {'in_prod_name':'Document Type'},
    {'in_prod_name':'Status of Invoice'},
    {'in_prod_name':'Owner'}
  ];
  constructor(navbarService: NavbarService,public router: Router, public http: HttpClient,
    public _toastMessageService:ToastMessageService,private route: ActivatedRoute) { 
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
        if(params && params.type) {
          this.page_query_type = params.type;
        }
    }); 

    this.loading = true;
    this.getGSTInvoiceTypes().then(itR => {
      this.getInvoiceStatusList().then(isRl =>{
        this.getAdminList().then(aR=>{
          this.getMerchantList().then(mR => {
            this.getInvoiceList().then(iR => {
              this.loading = false
            });
          });
        });
      })
    });
  }

  onChangeAttrFilter(event) {
    var tempReportD = this.invoices_list.filter(rd => {
        var is_match = true;
        for(var i=0;i<event.length;i++) {
          var it = event[i];      
          if(it.attr == 'Mobile Number' && it.value && rd.merchantMobileNumber.toLowerCase().indexOf(it.value.toLowerCase()) == -1 || 
            it.attr == 'Name' && it.value && rd.merchantName.toLowerCase().indexOf(it.value.toLowerCase()) == -1 || 
            it.attr == 'Document Type' && it.value && rd.invoiceDocumentType && rd.invoiceDocumentType.toLowerCase().indexOf(it.value.toLowerCase()) == -1  ||
            it.attr == 'Status of Invoice' && it.value && rd.invoiceStatus && rd.invoiceStatus.toLowerCase().indexOf(it.value.toLowerCase()) == -1 ||
            it.attr == 'Owner' && it.value && rd.processedBy && rd.processedBy.toLowerCase().indexOf(it.value.toLowerCase()) == -1

            ) {
              is_match = false;
              break;
          }        
      }
      
      return is_match;
    })

    this.filterData = JSON.parse(JSON.stringify(tempReportD));    
  }

  getAdminList() {    
    return new Promise((resolve,reject) => {
      this.admin_list = [];
      NavbarService.getInstance(this.http).getAdminList().subscribe(res => {
        if(Array.isArray(res)) {
          res.forEach(admin_data => {
            this.admin_list.push({userId:admin_data.userId,name:admin_data.fName+" "+admin_data.lName})
          });
        }
        return resolve(true)
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "admin list - " + errorMessage );
        return resolve(false)
      });
    });
  }

  getMerchantList() {
    return new Promise((resolve,reject) => {
      this.merchantList = [];
      NavbarService.getInstance(this.http).getGSTDetailList().subscribe(res => {
        this.merchantList = res;      
        return resolve(true);
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", errorMessage );
        return resolve(false);
      });
    });
  }

  getInvoiceList() {
    return new Promise((resolve,reject) => {
      this.getSalesPurchaseInvoiceList().then((spInv:any) => {
        this.getCreditDebitNoteInvoiceList().then((cdnInv:any) => {          
          this.invoices_list = spInv.concat(cdnInv);;
          this.filterData = this.invoices_list;
          return resolve(true);
        });
      });     
    });
  }

  getSalesPurchaseInvoiceList() {
    return new Promise((resolve,reject) => {
      let iParams = {page:0,size:1000};
      if(this.page_query_type == "unassigned") {
        iParams["invoiceAssignedTo.specified"]=false;
      } else if(this.page_query_type == "pending_processing") {
        iParams["invoiceStatusMasterInvoiceStatusMasterId.in"]=[2,4];        
      }
      NavbarService.getInstance(this.http).getInvoiceList(iParams).subscribe(res => {
        if(Array.isArray(res)) {
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
            let mData = this.merchantList.filter(ml =>  {return ml.userId == inv.businessId });            
            if(mData && mData[0]) {
              inv.merchantName = mData[0].fName + " " + mData[0].lName;
              inv.merchantMobileNumber = mData[0].mobileNumber;
            }
            inv.processedBy = this.getAdminName(inv.invoiceAssignedTo);
          })
          this.invoices_list = res;
          this.filterData = this.invoices_list;
          return resolve(res);
        } else {
          return resolve([]);
        }        
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "invoice list - " + errorMessage );
        return resolve([]);        
      });
    });
  }

  getCreditDebitNoteInvoiceList() {
    return new Promise((resolve,reject) => {
      let iParams = {page:0,size:1000};
      if(this.page_query_type == "unassigned") {
        iParams["creditDebitNoteAssignedTo.specified"]=false;
      } else if(this.page_query_type == "pending_processing") {
        iParams["invoiceStatusMasterInvoiceStatusMasterId.in"]=[1,2,4];        
      }
      NavbarService.getInstance(this.http).getCreditDebitNoteInvoiceList(iParams).subscribe(res => {
        if(Array.isArray(res)) {
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
            let mData = this.merchantList.filter(ml =>  {return ml.userId == inv.businessId });            
            if(mData && mData[0]) {
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
        this._toastMessageService.alert("error", "invoice list - " + errorMessage );
        return resolve([]);          
      });
    });
  }

  getGSTInvoiceTypes() {
    return new Promise((resolve,reject) => {
      this.all_invoice_types = [];
      NavbarService.getInstance(this.http).getGSTInvoiceTypes().subscribe(res => {
        if(Array.isArray(res)) {          
          this.all_invoice_types = res;
        }       
        resolve(true);
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "invoice type list - " + errorMessage );
        resolve(false);
      });
    })
  }

  getInvoiceStatusList() {
    return new Promise((resolve,reject) => {
      this.invoice_status_list = [];
      NavbarService.getInstance(this.http).getInvoiceStatusList().subscribe(res => {
        if(Array.isArray(res)) {    
          res.forEach(sData => { sData.name = sData.invoiceStatusMasterName });              
          this.invoice_status_list = res;
        }       
        resolve(true);
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "invoice status list - " + errorMessage );
        resolve(false);
      });
    })
  }

  onSelectInvoiceStatus(event,item) {
    if(event && event.id) {
      item.selected_invoice_status = event;
    }
  }

  onSelectInvoiceAssignedToUser(event,item) {
    if(event && event.userId) {
      item.selected_invoice_assigned_to_user = event;
    } 
  }

  getAdminName(id) {
    if(!id) { 
      return "N/A"; 
    } else {
      let fData = this.admin_list.filter(al => { return al.userId == id});
      if(fData && fData[0]) {
        return fData[0].name;
      }
    }
  }

  showMerchantDetail(merchant) {
    
  }

  updateCreditDebitNoteInvoice(item,itemIndex) {
    let params:any = JSON.parse(JSON.stringify(item));

    params.invoiceUpdatedAt = new Date();
    if(item.selected_invoice_status && item.selected_invoice_status.id) {
      params.invoiceStatusMasterInvoiceStatusMasterId = item.selected_invoice_status.id;
    }

    if(item.selected_invoice_assigned_to_user && item.selected_invoice_assigned_to_user.userId) {
      params.creditDebitNoteAssignedTo = item.selected_invoice_assigned_to_user.userId;
    }

    if((!params.creditDebitNoteAssignedTo || params.creditDebitNoteAssignedTo == item.creditDebitNoteAssignedTo) && 
      (!params.invoiceStatusMasterInvoiceStatusMasterId || item.invoiceStatusMasterInvoiceStatusMasterId == params.invoiceStatusMasterInvoiceStatusMasterId))  {
      this._toastMessageService.alert("error", "No data for update" );
      return;
    }

    this.loading = true;
    NavbarService.getInstance(this.http).updateCreditDebitNoteInvoice(params).subscribe(res => {
      if(item.selected_invoice_assigned_to_user && item.selected_invoice_assigned_to_user.userId) {
        item.processedBy = item.selected_invoice_assigned_to_user.name;
      }
      
      if(item.selected_invoice_status && item.selected_invoice_status.id) {
        item.invoiceStatus = item.selected_invoice_status.name;
      }
            
      this.onSelectRecord(item,itemIndex)
      this.loading = false;      
      this._toastMessageService.alert("success", "Invoice updated successfully." );      
    }, err => {
      let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
      this._toastMessageService.alert("error", "update invoice item - " + errorMessage );
      this.loading = false;
    });
  }

  updateSalesPurchaseInvoice(item,itemIndex) {
    let params:any = JSON.parse(JSON.stringify(item));

    params.invoiceUpdatedAt = new Date();
    if(item.selected_invoice_status && item.selected_invoice_status.id) {
      params.invoiceStatusMasterInvoiceStatusMasterId = item.selected_invoice_status.id;
    }

    if(item.selected_invoice_assigned_to_user && item.selected_invoice_assigned_to_user.userId) {
      params.invoiceAssignedTo = item.selected_invoice_assigned_to_user.userId;
    }

    if((!params.invoiceAssignedTo || params.invoiceAssignedTo == item.invoiceAssignedTo) && 
      (!params.invoiceStatusMasterInvoiceStatusMasterId || item.invoiceStatusMasterInvoiceStatusMasterId == params.invoiceStatusMasterInvoiceStatusMasterId))  {
      this._toastMessageService.alert("error", "No data for update" );
      return;
    }

    this.loading = true;
    NavbarService.getInstance(this.http).updateInvoice(params).subscribe(res => {
      if(item.selected_invoice_assigned_to_user && item.selected_invoice_assigned_to_user.userId) {
        item.processedBy = item.selected_invoice_assigned_to_user.name;
      }
      
      if(item.selected_invoice_status && item.selected_invoice_status.id) {
        item.invoiceStatus = item.selected_invoice_status.name;
      }
            
      this.onSelectRecord(item,itemIndex)
      this.loading = false;      
      this._toastMessageService.alert("success", "Invoice updated successfully." );      
    }, err => {
      let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
      this._toastMessageService.alert("error", "update invoice item - " + errorMessage );
      this.loading = false;
    });
  }
  updateListItem(item,itemIndex) {
    if(item.invoiceTypesInvoiceTypesId == 1 || item.invoiceTypesInvoiceTypesId == 2 || item.invoiceTypesInvoiceTypesId == 6) {
      this.updateSalesPurchaseInvoice(item,itemIndex);
    } else if(item.invoiceTypesInvoiceTypesId == 4 || item.invoiceTypesInvoiceTypesId == 5) {
      this.updateCreditDebitNoteInvoice(item,itemIndex);
    }    
  }

  onSelectRecord(item,index) {
    this.prods_check[index] = !this.prods_check[index];

    let isSelected = false;
    for(var i=0,llen=this.prods_check.length;i<llen;i++) {
      if(this.prods_check[i]) { isSelected=true; break; }
    }

    this.record_select_for_update = isSelected;

    if(isSelected) {
      if(this.invoice_status_list.length>0) {
        let fislData = this.invoice_status_list.filter(isl => { return isl.id == item.invoiceStatusMasterInvoiceStatusMasterId});
        if(fislData && fislData[0]) {
          item.selected_invoice_status = fislData[0];
        }
      }
      
      if(this.admin_list.length>0) {
        let assignId = item.invoiceAssignedTo;
        if(item.invoiceTypesInvoiceTypesId == 4 || item.invoiceTypesInvoiceTypesId == 5) {
          assignId = item.creditDebitNoteAssignedTo;
        }

        let falData = this.admin_list.filter(isl => { return isl.userId == assignId});
        if(falData && falData[0]) {
          item.selected_invoice_assigned_to_user = falData[0];
        }
      }
    }
  }

  saveGroupSelectedData() {
    let selectedInvoiceIdList = [];
    let selectedCreditDebitNoteInvoiceIdList = [];
    this.prods_check.forEach((pc,index) => {
      if(pc && this.filterData[index]) { 
        if([1,2,3,6].indexOf(this.filterData[index].invoiceTypesInvoiceTypesId) != -1) {
          selectedInvoiceIdList.push(this.filterData[index].id);
        } else if([4,5].indexOf(this.filterData[index].invoiceTypesInvoiceTypesId) != -1){
          selectedCreditDebitNoteInvoiceIdList.push(this.filterData[index].id);
        }
      }
    });

    let params:any = {
      "invoiceAssignedTo": this.group_selected_assign_to.userId,
      "invoiceIdList": selectedInvoiceIdList,
      "creditDebitNoteIdList": selectedCreditDebitNoteInvoiceIdList
    }

    if(!params.invoiceAssignedTo) {
      this._toastMessageService.alert("error", "Select user first");
      return;
    } else if(params.invoiceIdList.length == 0) {
      this._toastMessageService.alert("error", "Select invoices first");
      return;
    }

    this.loading = true;
    NavbarService.getInstance(this.http).assignAdminUserToInvoice(params).subscribe(res => {
      this.loading = false;
      this.resetInvoiceList();
      this.getInvoiceList();
      this._toastMessageService.alert("success", params.invoiceIdList.length +" invoices are updated successfully." );      
    }, err => {
      let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
      this._toastMessageService.alert("error", "assign user to invoice list - " + errorMessage );
      this.loading = false;
    });    
  }

  resetInvoiceList() {
    this.group_selected_assign_to = null;
    this.prods_check = [];
    this.record_select_for_update = false;
  }
}
