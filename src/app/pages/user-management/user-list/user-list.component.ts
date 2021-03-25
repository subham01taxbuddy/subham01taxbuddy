import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  loading: boolean;
  usersGridOptions : GridOptions;
  config: any;
  userInfo : any =[];

  constructor(private userService: UserMsService, private _toastMessageService: ToastMessageService, private utileService: UtilsService, private router: Router) { 
    this.usersGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.usersCreateColoumnDef(),
      enableCellChangeFlash: true,
      onGridReady: params => {
        // params.api.sizeColumnsToFit();
      },

      sortable: true,
    };

    this.config = {
      itemsPerPage: 15,
      currentPage: 1,
      totalItems: 80
    };
  }

  ngOnInit() {
    this.getUserData(0);
  }

  pageChanged(event){
    this.config.currentPage = event;
    this.getUserData(event - 1);
  }

  getUserData(pageNo){
    this.loading = true;
    let param = '/profile?page='+pageNo+'&pageSize=15'
    this.userService.getMethod(param).subscribe((result: any)=>{
      console.log('result -> ',result);
      this.loading = false;
       this.usersGridOptions.api.setRowData(this.createRowData(result['content']));
       this.userInfo = result['content'];
       this.config.totalItems = result.totalElements;
      // this.leadInfo = result;
    }, 
    error=>{
      this.loading = false;
      this._toastMessageService.alert("error", "Fail to getting leads data, try after some time.");
      console.log('Error during getting Leads data. -> ', error)
    })
  }

  usersCreateColoumnDef(){
    return [
      {
        headerName: 'User Id',
        field: 'userId',
        width: 80,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Name',
        field: 'name',
        width: 180,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Gender',
        field: 'gender',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Marrital Status',
        field: 'maritalStatus',
        width: 140,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },

      {
        headerName: 'Mobile No',
        field: 'mobileNumber',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Email',
        field: 'emailAddress',
        width: 180,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }

      },
      {
        headerName: 'PAN Number',
        field: 'pan',
        width: 180,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'City',
        field: 'city',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Residential Status',
        field: 'resident',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      // {
      //   headerName: 'Created Date',
      //   field: 'createdDate',
      //   width: 120,
      //   suppressMovable: true,
      //   cellStyle: { textAlign: 'center' },
      //   cellRenderer: (data) => {
      //     return formatDate(data.value, 'dd/MM/yyyy', this.locale)
      //   },
      //   filter: "agTextColumnFilter",
      //   filterParams: {
      //     filterOptions: ["contains", "notContains"],
      //     debounceMs: 0
      //   }
      // },
      
      
      {
        headerName: 'Invoice',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
            return `<button type="button" class="action_icon add_button" title="Rediredt toward Invoice">
            <i class="fa fa-files-o" aria-hidden="true" data-action-type="invoice"></i>
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
        headerName: 'Subscription',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
            return `<button type="button" class="action_icon add_button" title="Redirect toward Subscription">
            <i class="fa fa-list-alt" aria-hidden="true" data-action-type="subscription"></i>
           </button>`;
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

  createRowData(userData){
    console.log('userData -> ',userData);
    var userArray = [];
    for(let i=0; i< userData.length; i++){
      let userInfo = Object.assign({}, userArray[i],{
            userId: userData[i].userId,
            name: userData[i].fName+' '+userData[i].lName,
            mobileNumber: this.utileService.isNonEmpty(userData[i].mobileNumber) ? userData[i].mobileNumber : '-' ,
            emailAddress: this.utileService.isNonEmpty(userData[i].emailAddress) ? userData[i].emailAddress : '-' ,
            city: this.utileService.isNonEmpty(userData[i].city) ? userData[i].city : '-',
            gender: this.utileService.isNonEmpty(userData[i].gender) ? userData[i].gender : '-',
            maritalStatus: this.utileService.isNonEmpty(userData[i].maritalStatus) ? userData[i].maritalStatus : '-',
            pan: this.utileService.isNonEmpty(userData[i].panNumber) ? userData[i].panNumber : '-',
            resident: this.utileService.isNonEmpty(userData[i].residentialStatus) ? userData[i].residentialStatus : '-'
      })
      userArray.push(userInfo);
    }
    console.log('userArray-> ',userArray)
    return userArray;
  }

  onUsersRowClicked(params){
    console.log(params)
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'invoice': {
         this.redirectTowardInvoice(params.data);
          break;
        }
        case 'subscription': {
          this.redirectTowardSubscription(params.data)
          break;
        }
      }
    }
  }

  redirectTowardInvoice(userInfo){
    console.log('userInfo for subscription -> ',userInfo);
    this.router.navigate(['/pages/subscription/invoices'], { queryParams: { userId : userInfo.userId }});
  }

  redirectTowardSubscription(userInfo){
    console.log('userInfo for subscription -> ',userInfo);
    this.router.navigate(['/pages/subscription/sub'], { queryParams: { userMobNo : userInfo.mobileNumber }});
  }


}
