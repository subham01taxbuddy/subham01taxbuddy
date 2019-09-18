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
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastMessageService } from '../../services/toast-message.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})

export class ListComponent implements OnInit {  
  mlist = [{"name":"Ashish","mobile_number":"1234123412","document_type":"sales","upload_date":"2019-01-01","previous_return_field_status":"FILED","gst_filing_status":"FILED","status_of_invoice":"FILED","owner":"Test User"},
  {"name":"Ashish","mobile_number":"1234123412","document_type":"sales","upload_date":"2019-01-01","previous_return_field_status":"FILED","gst_filing_status":"FILED","status_of_invoice":"FILED","owner":"Test User"}]
  
  record_select_for_update: boolean = false;
  group_selected_assign_to: any = "";
  prods_check: boolean[] = [false];
  filterData:any = [];      
  filters_list: any = [ 
    {'in_prod_name':'Name'},
    {'in_prod_name':'Mobile Number'}
  ];
  constructor(navbarService: NavbarService,public router: Router, public http: HttpClient,
    public _toastMessageService:ToastMessageService) { 
    NavbarService.getInstance(null).component_link_2 = 'list';
    NavbarService.getInstance(null).component_link_3 = '';
  	NavbarService.getInstance(null).showBtns = 'list';
  }

  ngOnInit() {
    if (!NavbarService.getInstance(null).isSessionValid()) {
      this.router.navigate(['']);
      return;
    }

    this.filterData = this.mlist;
  }

  onChangeAttrFilter(event) {
    var tempReportD = this.mlist.filter(rd => {
        var is_match = true;
        for(var i=0;i<event.length;i++) {
          var it = event[i];      
          if(it.attr == 'Mobile Number' && it.value && rd.mobile_number.toLowerCase().indexOf(it.value.toLowerCase()) == -1 || 
            it.attr == 'Name' && it.value && rd.name.toLowerCase().indexOf(it.value.toLowerCase()) == -1) {
              is_match = false;
              break;
          }        
      }

      return is_match;
    })

    this.filterData = JSON.parse(JSON.stringify(tempReportD));    
  }

  showMerchantDetail(merchant) {
    
  }

  updateListItem(list) {
    alert("update list call for "+list.name)
  }

  onSelectRecord(index) {
    this.prods_check[index] = !this.prods_check[index];

    let isSelected = false;
    for(var i=0,llen=this.prods_check.length;i<llen;i++) {
      if(this.prods_check[i]) { isSelected=true; break; }
    }

    this.record_select_for_update = isSelected;
  }

  saveGroupSelectedData() {
    
  }
}
