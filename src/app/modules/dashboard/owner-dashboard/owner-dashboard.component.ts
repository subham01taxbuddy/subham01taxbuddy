import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { User } from '../../subscription/components/performa-invoice/performa-invoice.component';
import { Observable, map, startWith } from 'rxjs';
import { DatePipe } from '@angular/common';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-owner-dashboard',
  templateUrl: './owner-dashboard.component.html',
  styleUrls: ['./owner-dashboard.component.scss'],
  providers: [
    DatePipe,
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class OwnerDashboardComponent implements OnInit {
  loading = false;
  loggedInSmeUserId:any;
  roles:any;
  minDate: string = '2023-04-01';
  maxDate: string = '2024-03-31';
  toDateMin: any;
  startDate = new FormControl('');
  endDate = new FormControl('');
  searchFiler = new FormControl('');
  filerId:any;
  filerUserId:any;
  options1: User[] = [];
  filerList: any;
  filerNames: User[];
  filteredFilers: Observable<any[]>;
  invoiceData:any;

  constructor(
    private utilsService: UtilsService,
    private userMsService: UserMsService,
    public datePipe: DatePipe,
    private _toastMessageService: ToastMessageService,
  ) {
    this.startDate.setValue('2023-04-01');
    this.endDate.setValue(new Date().toISOString().slice(0, 10));
   }

  ngOnInit(): void {
    this.loggedInSmeUserId = this.utilsService.getLoggedInUserID();
    this.roles = this.utilsService.getUserRoles();
    this.getFilers();
    this.getFilerNameId(this.loggedInSmeUserId)
    this.getInvoiceReports();
  }

  getFilers() {
    // API to get filers under owner-
    // https://dev-api.taxbuddy.com/user/sme-details-new/8078?owner=true&assigned=true

    let param = `/sme-details-new/${this.loggedInSmeUserId}?filer=true`;

    this.userMsService.getMethod(param).subscribe((result: any) => {
      this.options1 = [];
      console.log('filer list result -> ', result);
      this.filerList = result.data;
      this.options1 = this.filerList;//this.filerNames;
      this.setFiletedOptions2();
    });
  }

  setFiletedOptions2(){
    this.filteredFilers = this.searchFiler.valueChanges.pipe(
      startWith(''),
      map((value) => {
        const name = typeof value === 'string' ? value : value?.name;
        return name
          ? this._filter(name as string, this.options1)
          : this.options1.slice();
      })
    );
  }
  private _filter(name: string, options): User[] {
    const filterValue = name.toLowerCase();

    return options.filter((option) =>
      option.name.toLowerCase().includes(filterValue)
    );
  }
  getFilerNameId(option) {
    console.log(option);
     this.filerId = option?.userId;
     if(this.filerId){
      this.filerUserId=this.filerId;
    }else{
      this.filerUserId=this.loggedInSmeUserId;
    }
  }

  getInvoiceReports(){
    // https://uat-api.taxbuddy.com/user/dashboard/invoice-report?filerUserId=2132&fromDate=2023-05-05&toDate=2023-05-05&serviceType=ITR
    this.loading = true;
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
    let filerUserId = this.filerUserId;
    let serviceType = 'ITR';

    let param = `/dashboard/invoice-report?filerUserId=${filerUserId}&fromDate=${fromDate}&toDate=${toDate}&serviceType=ITR`

    this.userMsService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      if (response.success) {
         this.invoiceData = response.data;

      }else{
        this.loading = false;
        this. _toastMessageService.alert("error",response.message);
      }
    },(error) => {
      this.loading = false;
      this. _toastMessageService.alert("error","Error");
    })
  }

  search(){
    this.getInvoiceReports();
  }
}
