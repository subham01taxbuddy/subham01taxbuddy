import { Component, OnInit } from '@angular/core';
import { NavbarService } from 'app/services/navbar.service';
import { ToastMessageService } from 'app/services/toast-message.service';
import { Router, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { GstMsService } from 'app/services/gst-ms.service';
import { DatePipe } from '@angular/common';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-gstr1',
  templateUrl: './gstr1.component.html',
  styleUrls: ['./gstr1.component.css'],
  providers: [DatePipe]
})
export class Gstr1Component implements OnInit {

  constructor(private navbarService: NavbarService, private router: Router,
    private _toastMessageService: ToastMessageService,
    private http: HttpClient, private gstMsService: GstMsService, public datepipe: DatePipe, ) { }
  selected_merchant: any;
  available_merchant_list: any = [];
  merchantData: any;
  selected_invoice_type: any;
  invoice_types_list: any = [{ invoiceTypeId: 1, name: "Sales B2B" },
  { invoiceTypeId: 2, name: "Sales B2C" },
  { invoiceTypeId: 3, name: "Purchase" },
  { invoiceTypeId: 4, name: "Credit Note" },
  { invoiceTypeId: 5, name: "Debit Note" }];
  invoiceTypeData: any;
  selected_dates: any = {
    from_date: new Date(),
    to_date: new Date()
  }
  currentUrl: any = "";
  loading: boolean = true;
  invoice_party_roles: any = [];
  selected_party_role: any;

  gst_return_calendars_data: any = [];
  selected_gst_return_calendars_data: any;
  ngOnInit() {
    this.currentUrl = this.router.url;
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.urlAfterRedirects;
      }
    });
    this.loading = true;
    this.gstGSTReturnCalendarsData().then(igr => {
      this.getInvoicePartyRoles().then(ipr => {
        this.getMerchantList().then(mr => {
          this.loading = false;
        })
      });
    });
  }
  getMerchantList() {
    return new Promise((resolve, reject) => {
      this.available_merchant_list = [];
      NavbarService.getInstance(this.http).getGSTDetailList().subscribe(res => {
        if (Array.isArray(res)) {
          res.forEach(bData => {
            let tName = bData.fName + " " + bData.lName;
            if (bData.mobileNumber) {
              tName += " (" + bData.mobileNumber + ")"
            } else if (bData.emailAddress) {
              tName += " (" + bData.emailAddress + ")"
            }
            this.available_merchant_list.push({ userId: bData.userId, name: tName })
          });
        }
        return resolve(true);
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "business list - " + errorMessage);
        return resolve(false);
      });
    });
  }
  gstGSTReturnCalendarsData() {
    return new Promise((resolve, reject) => {
      this.gst_return_calendars_data = [];
      NavbarService.getInstance(this.http).gstGSTReturnCalendarsData().subscribe(res => {
        if (Array.isArray(res)) {
          let month_names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
          res.forEach(p => {
            let monthName = month_names[p.gstReturnMonth - 1] || p.gstReturnMonth;
            p.name = monthName + " - " + p.gstReturnYear;
          });
          this.gst_return_calendars_data = res;
        }
        resolve(true);
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", " gst return calendar data - " + errorMessage);
        resolve(false);
      });
    })
  }
  getInvoicePartyRoles() {
    return new Promise((resolve, reject) => {
      this.invoice_party_roles = [];
      NavbarService.getInstance(this.http).getInvoicePartyRoles().subscribe(res => {
        if (Array.isArray(res)) {
          res.forEach(p => { p.name = p.partyRoleName });
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
  onSelectGSTReturnCalendar(event) {
    if (event && event.id) {
      this.selected_gst_return_calendars_data = event;
      NavbarService.getInstance(null).selected_gst_return_calendars_data = this.selected_gst_return_calendars_data;
      NavbarService.getInstance(null).isGSTReturnCalendarChanged = true;
    }
  }
  onSelectMerchant(event) {
    if (event && event.userId) {
      this.selected_merchant = event;
      this.merchantData = event;
      NavbarService.getInstance(null).merchantData = this.merchantData;
      NavbarService.getInstance(null).isMerchantChanged = true;
    }
  }
  onSelectInvoiceType(event) {
    if (event && event.invoiceTypeId) {
      this.selected_invoice_type = event;
      this.invoiceTypeData = event;
      console.log("invoiceTypeData:", this.invoiceTypeData)
      /* NavbarService.getInstance(null).invoiceTypeData = this.invoiceTypeData;
      NavbarService.getInstance(null).isMerchantChanged = true; */
    }
  }
  onSeletedDateChange() {
    NavbarService.getInstance(null).selected_dates = this.selected_dates;
    NavbarService.getInstance(null).isDateRangeChanged = true;
  }
  onApply() {
    NavbarService.getInstance(null).isApplyBtnClicked = true;
    const from_date = this.datepipe.transform(this.selected_dates.from_date, 'yyyy-MM-dd HH:mm:ss');
    const to_date = this.datepipe.transform(this.selected_dates.to_date, 'yyyy-MM-dd HH:mm:ss');
    const param = `${environment.url}${this.gstMsService.microService}/invoice-types-Reports?businessId=${this.merchantData.userId}&fromInvoiceDate=` + from_date + `&toInvoiceDate=` + to_date + `&invoiceType=${this.invoiceTypeData.invoiceTypeId}&sendMail=false`;
    window.open(param, '_blank');
  }
}
