import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';
import { ItrMsService } from 'app/services/itr-ms.service';
import { UserMsService } from 'app/services/user-ms.service';
import { UserHistryComponent } from '../user-histry/user-histry.component';

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
  
  constructor(private userService: UserMsService, private route: Router, private utilService: ItrMsService,  @Inject(LOCALE_ID) private locale: string,
              private dialog: MatDialog) {

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
        width: 230,
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
        width: 100,
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
        width: 270,
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
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        cellRenderer: (data) => {
          return formatDate(data.value, 'dd/MM/yyyy', this.locale)
        }
      },
      {
        headerName: 'Agent Id Chat',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button"  title="Open Agent Id Kommunicate chat">
                <i class="fa fa-comments-o" aria-hidden="true" data-action-type="openAgentIdKommChat"></i>
          </button>`;  

        },
        width: 90,
        pinned: 'right',
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center'
        }

      },
      {
        headerName: 'User Histroy',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button"  title="User Histroy">
            <i class="fa fa-history" aria-hidden="true" data-action-type="user-histroy"></i>
          </button>`; 
        },
        width: 90,
        pinned: 'right',
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center'
        },
      },
      {
        headerName: 'Create User',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Create User">
         <i class="fa fa-user-plus" aria-hidden="true" data-action-type="create_user"></i>
        </button>`

        },
        width: 90,
        pinned: 'right',
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center'
        },
      },
      // {
      //   headerName: 'Assign User',
      //   editable: false,
      //   suppressMenu  : true,
      //   sortable: true,
      //   suppressMovable: true,
      //   cellRenderer: function (params) {
      //     return `<button type="button" class="action_icon add_button" title="Assign User">
      //    <i class="fa fa-user" aria-hidden="true" data-action-type="assign_user"></i>
      //   </button>`

      //   },
      //   width: 90,
      //   pinned: 'right',
      //   cellStyle: {
      //     textAlign: 'center', display: 'flex',
      //     'align-items': 'center',
      //     'justify-content': 'center'
      //   },
      // }
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
      // this.route.navigate(['/pages/newUser/createUser']);   
      this.route.navigate(['/pages/user-management/create-user']);
  }

  // assignUser(userInfo){
  //   console.log('userInfo for Assign user: ',userInfo);
  //   sessionStorage.setItem('assignUser', JSON.stringify(userInfo));
  //   this.route.navigate(['/pages/newUser/editUser']);
  // }

  redirectToKommunicate(id){
    let path = 'https://dashboard.kommunicate.io/conversations/'+id;
    window.open(path)
  }

  showUserHistry(mail){
    let disposable = this.dialog.open(UserHistryComponent, {
      width: '60%',
      height: 'auto',
      data: {
        email: mail
      }
    })
  }

  public exceptionRowClicked(params) {
    console.log(params)
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'openAgentIdKommChat': {
          this.redirectToKommunicate(params.data.groupId)
          break;
        }
        case 'user-histroy': {
          this.showUserHistry(params.data.email)
          break;
        }
        case 'create_user': {
          this.createNewUser(params.data)
          break;
        }
        case 'assign_user': {
          // this.assignUser(params.data)
          break;
        }
      }
    }
  }

}
