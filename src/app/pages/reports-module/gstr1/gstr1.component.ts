import { UtilsService } from './../../../services/utils.service';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { UpdateEmailDialogComponent } from '../update-email-dialog/update-email-dialog.component';
import { Subscription } from 'rxjs';
import { NavbarService } from 'src/app/services/navbar.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { GstMsService } from 'src/app/services/gst-ms.service';
import { UserMsService } from 'src/app/services/user-ms.service';

@Component({
  selector: 'app-gstr1',
  templateUrl: './gstr1.component.html',
  styleUrls: ['./gstr1.component.css'],
  providers: [DatePipe]
})
export class Gstr1Component implements OnInit {

  constructor(private navbarService: NavbarService, private router: Router,
    private _toastMessageService: ToastMessageService,
    private http: HttpClient, private gstMsService: GstMsService, public datepipe: DatePipe,
    private userMsService: UserMsService, private utilsService: UtilsService, private modalService: BsModalService,/* private simpleModalService: SimpleModalService,  */) { }
  selected_merchant: any;
  selected_calender: any;
  available_merchant_list: any = [];
  available_calender_list: any = [];
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
  modalRef!: BsModalRef;

  ngOnInit() {
    this.currentUrl = this.router.url;
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.urlAfterRedirects;
      }
    });
    this.loading = true;
    this.gstGSTReturnCalendarsData().then(igr => {
      this.getInvoicePartyRoles().then((ipr:any) => {
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
      this.getReturnCalenderList().then(response => {
        console.log("Calender Response in then: ", response);
      }).catch(error => {
        console.log("Calender Response in catch: ", error);
      })
    }
  }
  onSelectCalender(event) {
    if (event) {
      this.selected_calender = event;
      console.log("selected_calender: ", this.selected_calender);
    }
  }
  onSelectInvoiceType(event) {
    if (event && event.invoiceTypeId) {
      this.selected_invoice_type = event;
      this.invoiceTypeData = event;
      console.log("invoiceTypeData:", this.invoiceTypeData)
    }
  }
  onSeletedDateChange() {
    NavbarService.getInstance(null).selected_dates = this.selected_dates;
    NavbarService.getInstance(null).isDateRangeChanged = true;
  }

  downloadReport() {
    NavbarService.getInstance(null).isApplyBtnClicked = true;
    const from_date = this.datepipe.transform(this.selected_dates.from_date, 'yyyy-MM-dd HH:mm:ss');
    const to_date = this.datepipe.transform(this.selected_dates.to_date, 'yyyy-MM-dd HH:mm:ss');
    const param = `${environment.url}${this.gstMsService.microService}/invoice-types-Reports?businessId=${this.merchantData.userId}&gstReturnCalendarId=${this.selected_calender.id}&invoiceType=${this.invoiceTypeData.invoiceTypeId}&sendMail=false`;/* fromInvoiceDate=` + from_date + `&toInvoiceDate=` + to_date +  */
    window.open(param, '_blank');
  }

  sendReport() {
    if (this.merchantData && this.selected_dates && this.invoiceTypeData) {
      this.loading = true
      const userParam = `/profile/${this.merchantData.userId}`;
      this.userMsService.getMethod(userParam).subscribe((res: any) => {
        console.log('User profile success:', res);
        if (res && this.utilsService.isNonEmpty(res.emailAddress)) {
          const from_date = this.datepipe.transform(this.selected_dates.from_date, 'yyyy-MM-dd HH:mm:ss');
          const to_date = this.datepipe.transform(this.selected_dates.to_date, 'yyyy-MM-dd HH:mm:ss');
          const param = `/invoice-types-Reports?businessId=${this.merchantData.userId}&gstReturnCalendarId=${this.selected_calender.id}&invoiceType=${this.invoiceTypeData.invoiceTypeId}&sendMail=true`;
          this.gstMsService.getMethod(param).subscribe((data: any) => {
            this.loading = false;
            this._toastMessageService.alert('success', 'Email sent successfully.');
            console.log('Email sent success:', data);
          }, err => {
            this.loading = false;
            // this._toastMessageService.alert('error', 'Error while sending email.');
            // I am not getting proper success and error response thats why i chacked in error condition
            if (err.status === 200) {
              this._toastMessageService.alert('success', 'Email sent successfully.');
            } else {
              this._toastMessageService.alert('error', 'Error while sending email.');
            }
            console.log('Email sent error:', err);
          })
        } else {
          this.loading = false;
          this.updateEmail(res).then(result => {
            if (result)
              this._toastMessageService.alert('success', 'Email address updated successfully.');
          }).catch(err => {
            this._toastMessageService.alert('error', 'Failed to update email address.');
          })
        }
      }, error => {
        console.log('get profile failure:', error);
      })
    } else {
      this._toastMessageService.alert('error', 'Please select all parameters');
    }

  }

  updateEmail(res) {
    return new Promise((resolve, reject) => {
      this.modalRef = this.modalService.show(UpdateEmailDialogComponent, {});
      this.modalRef.content.isUpdated = false;
      this.modalRef.content.confirmation_text = "Please update customer email address.";
      this.modalRef.content.confirmation_popup_type = 'update_email';
      this.modalRef.content.userData = res;
      var tempSubObj: Subscription = this.modalService.onHide.subscribe(() => {
        if (this.modalRef.content.isUpdated) {
          return resolve(true);
        } else {
          return resolve(false);
        }
        tempSubObj.unsubscribe();
      });
    });
  }

  getReturnCalenderList() {
    return new Promise((resolve, reject) => {
      this.available_calender_list = [];
      this.loading = true
      // TODO: For GSTR1 report get master(gstr_filling_type_master) values from db
      // Here one is hard coded value because of the values are stored in master data
      // Table name: gstr_filling_type_master
      // 1: GSTR1
      // 2: GSTR3B
      const param = `/gst-return-calendars/?businessId=${this.merchantData.userId}&gstrType=${1}`;
      this.gstMsService.getMethod(param).subscribe((res: any) => {
        console.log('Calender list success:', res);
        if (Array.isArray(res)) {
          res.forEach((cData: any) => {
            let tName = cData.gstReturnMonthDisplay + "-" + cData.gstReturnYear;
            this.available_calender_list.push({ id: cData.id, name: tName })
          });
        }
        this.loading = false;
        return resolve(true);
      }, error => {
        this.loading = false;
        console.log('get profile failure:', error);
        return resolve(error);
      })
    })
  }
}
