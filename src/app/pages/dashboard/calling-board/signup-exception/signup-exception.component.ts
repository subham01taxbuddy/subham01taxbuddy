import { DatePipe, formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MatDialog, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';
import { UserNotesComponent } from 'app/shared/components/user-notes/user-notes.component';

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
  selector: 'app-signup-exception',
  templateUrl: './signup-exception.component.html',
  styleUrls: ['./signup-exception.component.css'],
  providers: [DatePipe,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class SignupExceptionComponent implements OnInit {

  loading: boolean;
  signupExceptionGridOptions: GridOptions;
  signUpExceptionForm: FormGroup;
  maxDate: any = new Date();
  minToDate: any;

  constructor(private userService: UserMsService, @Inject(LOCALE_ID) private locale: string, private toastMsgService: ToastMessageService, private utilsService: UtilsService,
              private route: Router, private dialog: MatDialog, private fb: FormBuilder, private datePipe: DatePipe) { 
    this.signupExceptionGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.createColoumnDef(),
      enableCellChangeFlash: true,
      onGridReady: params => {
      },
      sortable: true,
    };
  }

  ngOnInit() {
    this.signUpExceptionForm = this.fb.group({
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required]
    })
    
    this.getSignUpExceptionList()
  }

  getSignUpExceptionList(){
    this.loading = true;
    var fromDate = '';
    var toDate = '';
    var param = ''; 
    if(this.signUpExceptionForm.valid){
      fromDate = this.datePipe.transform(this.signUpExceptionForm.value.fromDate, 'yyyy-MM-dd');
      toDate = this.datePipe.transform(this.signUpExceptionForm.value.toDate, 'yyyy-MM-dd');
      param = `/sign-up-exceptions?fromDate=${fromDate}&toDate=${toDate}`; 
    }
    else{
      param = `/sign-up-exceptions`;
    }
    this.userService.getMethod(param).subscribe((result: any)=>{
      console.log('sign-up-exceptions responce: ',result);
      this.loading = false;
      if(result instanceof Array && result.length > 0){
        this.signupExceptionGridOptions.api.setRowData(this.createRowData(result))
      }
      else{
        this.signupExceptionGridOptions.api.setRowData(this.createRowData([]))
      }
      
    },
    error=>{
      console.log('Error during getting sign-up-exceptions: ',error);
      this.toastMsgService.alert('error', this.utilsService.showErrorMsg(error.error.status))
      this.loading = false;
    })
  }

  setToDateValidation(fromDate){
    this.minToDate = fromDate;
  }

  createRowData(signUpExceptionList){
    console.log('scheduleCalls -> ', signUpExceptionList);
    var signUpExceptionListArray = [];
    for (let i = 0; i < signUpExceptionList.length; i++) {
      let sceduleCallsInfo = Object.assign({}, signUpExceptionListArray[i], {
        userId: signUpExceptionList[i]['userId'],
        name: signUpExceptionList[i]['name'],
        mobile: signUpExceptionList[i]['mobile'],
        callerAgentName:  signUpExceptionList[i]['callerAgentName'],
        createdDate: signUpExceptionList[i]['createdDate'],
        serviceType: signUpExceptionList[i]['serviceType'],
        // status: signUpExceptionList[i]['status'],
        platform: signUpExceptionList[i]['platform'],
        callerAgentNumber: signUpExceptionList[i]['callerAgentNumber']
      })
      signUpExceptionListArray.push(sceduleCallsInfo);
    }
    console.log('signUpExceptionListArray-> ', signUpExceptionListArray)
    return signUpExceptionListArray;
  }

  createColoumnDef(){
    return [
      {
        headerName: 'User Id',
        field: 'userId',
        width: 80,
        suppressMovable: true,
        sortable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Name',
        field: 'name',
        width: 150,
        suppressMovable: true,
        sortable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Mobile No',
        field: 'mobile',
        width: 120,
        suppressMovable: true,
        sortable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Created Date',
        field: 'createdDate',
        width: 130,
        suppressMovable: true,
        sortable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        cellRenderer: (data) => {
          return formatDate(data.value, 'dd/MM/yyyy', this.locale)
        },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Serice Type',
        field: 'serviceType',
        width: 100,
        suppressMovable: true,
        sortable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      // {
      //   headerName: 'Status',
      //   field: 'status',
      //   width: 150,
      //   suppressMovable: true,
      //   cellStyle: { textAlign: 'center' },
      //   filter: "agTextColumnFilter",
      //   filterParams: {
      //     filterOptions: ["contains", "notContains"],
      //     debounceMs: 0
      //   }
      // },
      {
        headerName: 'Platform',
        field: 'platform',
        width: 100,
        suppressMovable: true,
        sortable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Caller Agent Name',
        field: 'callerAgentName',
        width: 150,
        suppressMovable: true,
        sortable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'User Info',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="User Information"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-mobile" style="font-size:26px" aria-hidden="true" data-action-type="userInfo"></i>
           </button>`;
        },
        width: 60,
        pinned: 'right',
        cellStyle: function (params) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
      {
        headerName: 'Call',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Call to user"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-phone" aria-hidden="true" data-action-type="call"></i>
           </button>`;
        },
        width: 50,
        pinned: 'right',
        cellStyle: function (params) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
      {
        headerName: 'See/Add Notes',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Click see/add notes"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-book" aria-hidden="true" data-action-type="addNotes"></i>
           </button>`;
        },
        width: 60,
        pinned: 'right',
        cellStyle: function (params) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
      {
        headerName: 'Call Status',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Update Call Status"
          style="font-size: 12px; cursor:pointer;" data-action-type="call-done">Done</button>`;
        },
        width: 80,
        pinned: 'right',
        cellStyle: function (params) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      }
    ]
  }

  onSignupExceptionClicked(params){
    console.log(params)
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'call': {
          this.startCalling(params.data)
          break;
        }
        case 'userInfo': {
          this.showUserInformation(params.data)
          break;
        }
        case 'call-done': {
          this.callStatusChange(params.data)
          break;
        }
        case 'addNotes': {
          this.showNotes(params.data)
          break;
        }
      }
    }
  }

  startCalling(user){
    console.log('user: ', user)
    this.loading = true;
    const param = `/call-management/make-call`;
    const reqBody = {
      "agent_number": user.callerAgentNumber,
      "customer_number": user.mobile
    }
    this.userService.postMethod(param, reqBody).subscribe((result: any) => {
      console.log('Call Result: ', result);
      this.loading = false;
      if (result.success.status) {
        this.toastMsgService.alert("success", result.success.message)
      }
    }, error => {
     // this.utilsService.showSnackBar('Error while making call, Please try again.');
      this.toastMsgService.alert("error", 'Error while making call, Please try again')
      this.loading = false;
    })
  }

  showUserInformation(user){
    if (this.utilsService.isNonEmpty(user.mobile)) {
      this.route.navigate(['/pages/dashboard/quick-search'], { queryParams: { mobileNo: user.mobile } });
    } else {
      this.toastMsgService.alert("error", "Mobile number is not valid")
    }
  }

  callStatusChange(callInfo){
    console.log('callInfo: ', callInfo)
      this.loading = true;
   //https://uat-api.taxbuddy.com/user/sign-up-exceptions/{customerNumber}
      let param = `/sign-up-exceptions/${callInfo.mobile}`;
      this.userService.putMethod(param).subscribe((responce: any) => {
        console.log('call Done responce: ', responce);
        this.loading = false;
        this.toastMsgService.alert('success', 'Call status update successfully.');
          setTimeout(()=>{
            this.getSignUpExceptionList();
          },3000)
      },
        error => {
          console.log('Error during schedule-call status change: ', error);
          this.toastMsgService.alert('error', 'Error during schedule-call status change.')
          this.loading = false;
        })
        
  }

  showNotes(client) {
    let disposable = this.dialog.open(UserNotesComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.name
      }
    })

    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

}
