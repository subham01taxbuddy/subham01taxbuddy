
import { Component, DoCheck, OnInit } from '@angular/core';
import { NavbarService } from '../../../services/navbar.service';
import { Router } from '@angular/router';
import { ToastMessageService } from '../../../services/toast-message.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-party-list',
  templateUrl: './party-list.component.html',
  styleUrls: ['./party-list.component.css']
})
export class PartyListComponent implements OnInit, DoCheck {
  selected_merchant: any;
	selected_party_role: any;
  loading: boolean = false;  
  merchantData: any;

  party_list: any = [];
  prods_check: boolean[] = [false];  
  invoice_party_roles: any = [];
  is_applied_clicked: boolean = false;

  from_date: any = new Date();
  to_date: any = new Date();


  filterData:any = [];      
  filters_list: any = [ 
    {'in_prod_name':'Name'},
    {'in_prod_name':'GST Number'},
    {'in_prod_name':'Email'},
    {'in_prod_name':'Phone'}
  ];
  constructor(
  	private navbarService: NavbarService,
    public router: Router, public http: HttpClient,
    public _toastMessageService:ToastMessageService) { 
    NavbarService.getInstance().component_link_2 = 'party-list';
    NavbarService.getInstance().component_link_3 = '';
  	NavbarService.getInstance().showBtns = 'party-list';
  } 

  ngOnInit() {
    if (!NavbarService.getInstance().isSessionValid()) {
      this.router.navigate(['']);
      return;
    }

    this.onSelectMerchant(NavbarService.getInstance().merchantData);
    this.onSelectPartyRole(NavbarService.getInstance().selected_party_role);

  }

  ngDoCheck() {
    if (NavbarService.getInstance().isMerchantChanged && NavbarService.getInstance().merchantData) {
      this.onSelectMerchant(NavbarService.getInstance().merchantData);
      NavbarService.getInstance().isMerchantChanged = false;
    }

    if (NavbarService.getInstance().isPartyRoleChanged && NavbarService.getInstance().selected_party_role) {
      this.onSelectPartyRole(NavbarService.getInstance().selected_party_role);
      NavbarService.getInstance().isPartyRoleChanged = false;
    }

    if (NavbarService.getInstance().isApplyBtnClicked) {
      NavbarService.getInstance().isApplyBtnClicked = false;
      this.getPartyListByMerchant();
    }
    
  }

  onSelectMerchant(event:any) {    
    if(event && event.userId) {
      this.selected_merchant = event;
      this.merchantData = event;
    }    
  }

  onSelectPartyRole(event:any) {
    if(event && event.id) {
      this.selected_party_role = event;
    }
  }

  getMerchantDetails(merchant:any) {        
    this.merchantData = null;
    NavbarService.getInstance(this.http).getGetGSTMerchantDetail(merchant.userId).subscribe(res => {
      
    }, err => {
      let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
      this._toastMessageService.alert("error", "merchant detail - " + errorMessage );
    });      
  }

  getPartyListByMerchant() {
    if(!this.merchantData || !this.merchantData.userId) {
      this._toastMessageService.alert("error","Please select merchant");
      return;
    }

    if(!this.selected_party_role || !this.selected_party_role.id) {
      this._toastMessageService.alert("error","Please select party type");
      return;
    }

    this.party_list = [];
    this.is_applied_clicked = true;
    let params = {
      roleId:this.selected_party_role.id,
      page:0,
      size:1000
    }
    NavbarService.getInstance(this.http).getPartyInfoByPartyRole(this.merchantData.userId,params).subscribe(res => {
      if(Array.isArray(res)) {        
        this.party_list = res;
      }
      this.onChangeAttrFilter(this.party_list);      
    }, err => {
      let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
      this._toastMessageService.alert("error", "document list - " + errorMessage );
    });
    
  }

  onChangeAttrFilter(event:any) {
    var tempFD = this.party_list.filter((rd:any) => {
        var is_match = true;
        for(var i=0;i<event.length;i++) {
          var it = event[i];      
          if(it.attr === 'Name' && it.value && rd.partyName.toLowerCase().indexOf(it.value.toLowerCase()) === -1 ||
            it.attr === 'GST Number' && it.value && rd.partyGstin.toLowerCase().indexOf(it.value.toLowerCase()) === -1 ||
            it.attr === 'Email' && it.value && rd.partyEmail.toLowerCase().indexOf(it.value.toLowerCase()) === -1 ||
            it.attr === 'Phone' && it.value && rd.partyPhone.toLowerCase().indexOf(it.value.toLowerCase()) === -1
             ) {            
              is_match = false;
              break;
          }        
        }

      return is_match;
    })

    this.filterData = JSON.parse(JSON.stringify(tempFD));    
  }

  onSelectRecord(item:any,index:any) {
    if(!this.prods_check[index]) {
      item.upartyName = item.partyName;
      item.upartyPhone = item.partyPhone;
      item.upartyEmail = item.partyEmail;
    }
    this.prods_check[index] = !this.prods_check[index];
  }

  updatePartyDetail(item:any,index:any) {
    if(item.upartyPhone && !(/^\d{10}$/.test(item.upartyPhone))) {
      this._toastMessageService.alert("error","Please add valid 10 digit phone number");
      return;
    } else if(item.upartyEmail && !(/\S+@\S+\.\S+/.test(item.upartyEmail))) {
      this._toastMessageService.alert("error","Please add valid email address");
      return;
    }
    let params = {
      "id":item.id,
      "partyGstin": item.partyGstin,
      "partyName": item.upartyName,
      "partyPhone": item.upartyPhone,
      "partyEmail": item.upartyEmail,
      "partyUpdatedAt": new Date()
    }
    this.loading = true;
    NavbarService.getInstance(this.http).updatePartyInfo(params).subscribe(res => {
      this._toastMessageService.alert("success", "Party detail updated successfully.");
      item.partyName = item.upartyName;
      item.partyPhone = item.upartyPhone;
      item.partyEmail = item.upartyEmail;
      this.loading = false;
      this.prods_check[index] = false;
    }, err => {
      let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
      this._toastMessageService.alert("error", "update party - " + errorMessage );
      this.loading = false;
    });
  }
}
