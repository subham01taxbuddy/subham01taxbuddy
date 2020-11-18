import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';
import { ItrMsService } from 'app/services/itr-ms.service';
import { UserMsService } from 'app/services/user-ms.service';

@Component({
  selector: 'app-mail-exception',
  templateUrl: './mail-exception.component.html',
  styleUrls: ['./mail-exception.component.css']
})
export class MailExceptionComponent implements OnInit {

  loading: boolean;
  showExceptionUser: boolean;
  mailExceptionUser: any =[];
  exceptionListtGridOptions: GridOptions;
  
  constructor(private userService: UserMsService, private route: Router, private utilService: ItrMsService,  @Inject(LOCALE_ID) private locale: string) {

    this.exceptionListtGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.exceptionMailColoumnDef(),
      enableCellChangeFlash: true,
      onGridReady: params => {
        // params.api.sizeColumnsToFit();
      },

      sortable: true,
    };
   }

  ngOnInit() {
    this.getMailExceptionUserByAgentId();
  }

  exceptionMailColoumnDef(){
    return [
      {
        headerName: 'Id',
        field: '_id',
        //width: 80,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Group Id',
        field: 'groupId',
        //width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Email',
        field: 'email',
       // width: 80,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Date',
        field: 'createdDate',
       // width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        cellRenderer: (data) => {
          return formatDate(data.value, 'dd/MM/yyyy', this.locale)
        },
        // filterParams: {
        //   filterOptions: ["contains", "notContains"],
        //   debounceMs: 0
        // }
        filter: 'agDateColumnFilter',

        // add extra parameters for the date filter
        filterParams: {
            // provide comparator function
            comparator: function(filterLocalDateAtMidnight, cellValue) {
                var dateAsString = cellValue;
    
                if (dateAsString == null) {
                    return 0;
                }
    
                // In the example application, dates are stored as dd/mm/yyyy
                // We create a Date object for comparison against the filter date
                var dateParts = dateAsString.split('/');
                var day = Number(dateParts[2]);
                var month = Number(dateParts[1]) - 1;
                var year = Number(dateParts[0]);
                var cellDate = new Date(year, month, day);
    
                // Now that both parameters are Date objects, we can compare
                if (cellDate < filterLocalDateAtMidnight) {
                    return -1;
                } else if (cellDate > filterLocalDateAtMidnight) {
                    return 1;
                } else {
                    return 0;
                }
            }
        }
      },
      {
        headerName: 'Create User',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          `<button type="button" class="action_icon add_button" title="Edit" >
            <span><i class="fa fa-pencil-square" aria-hidden="true" data-action-type="edit"></i></span>
           </button>`;
        },
       // width: 55,
        pinned: 'right',
      //   cellStyle: function (params) {
      //       return {
      //         textAlign: 'center',
      //         display: 'flex',
      //         'align-items': 'center',
      //         'justify-content': 'center'
      //       }
      //   },
       }
    ];
  }

  getMailExceptionUserByAgentId(){
    this.showExceptionUser = true;
    this.loading = true;
    let param = '/email-channel/exception';
    this.userService.getUserDetail(param).subscribe(responce=>{
      this.loading = false;
       console.log('responce ==> ',responce);
       this.mailExceptionUser = responce;
       this.exceptionListtGridOptions.api.setRowData(this.createRowData(this.mailExceptionUser))

    },error=>{
      this.loading = false;
      console.log('Error while getting exception User data: ',error)
    })
  }

  createRowData(userData){
    var exceptionList = [];
    for (let i = 0; i < userData.length; i++) {
      let updateException = Object.assign({}, userData[i], { _id: userData[i]._id, groupId: userData[i].groupId, email: userData[i].email, createdDate: userData[i].createdDate})
      exceptionList.push(updateException)
    }
    console.log('user exceptionList: ', exceptionList);
    return exceptionList;
  }

  createNewUser(userInfo){
      console.log('userInfo: ',userInfo);
      sessionStorage.setItem('exceptionalUser', JSON.stringify(userInfo));
      this.route.navigate(['/pages/newUser/createUser']);
  }

  redirectToKommunicate(id){
    let path = 'https://dashboard.kommunicate.io/conversations/'+id;
    window.open(path)
  }

}
