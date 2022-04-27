import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AppConstants } from 'src/app/modules/shared/constants';
import { environment } from 'src/environments/environment';
import { UserHistryComponent } from '../user-histry/user-histry.component';

@Component({
  selector: 'app-mail-user',
  templateUrl: './mail-user.component.html',
  styleUrls: ['./mail-user.component.css']
})
export class MailUserComponent implements OnInit {

  loading!: boolean;
  showMailUser: boolean;
  agentList: any = [];
  selectedAgent: any = '';
  mailUserListGridOptions: GridOptions;

  mailUser: any = [];
  public displayedColumns = ['Name', 'Mobile Number', 'Email', 'Assign Id', 'Date'];
  constructor(private userService: UserMsService, private dialog: MatDialog, @Inject(LOCALE_ID) private locale: string, private utilsService: UtilsService) {
    this.mailUserListGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.mailUsercreateColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: params => {
        // params.api.sizeColumnsToFit();
      },
      sortable: true,
    };
  }

  ngOnInit() {
    this.getAgentList();

    console.log('selectedAgentId -> ', localStorage.getItem('selectedAgentId'));
    var agentId = localStorage.getItem('selectedAgentId');
    if (this.utilsService.isNonEmpty(agentId)) {
      this.getMailUserByAgentId(agentId);
    }
    else {
      this.getMailUserByAgentId(0);
    }
  }
  async getAgentList() {
    this.agentList = await this.utilsService.getStoredAgentList();
  }

  getMailUserByAgentId(agentId?) {
    this.showMailUser = true;
    this.loading = true;
    if (agentId) {
      var param = '/email-channel?assigneeId=' + agentId;
      localStorage.setItem('selectedAgentId', agentId);
    } else {
      var param = '/email-channel?assigneeId=';
    }

    this.userService.getUserDetail(param).subscribe(responce => {
      this.loading = false;
      console.log('Email user ==> ', responce);
      this.mailUser = responce;
      this.mailUserListGridOptions.api?.setRowData(this.createRowData(this.mailUser))
    }, error => {
      this.loading = false;
      console.log('Error while getting email User data ==> ', error);
    })
  }

  showUserHistry(mail) {
    let disposable = this.dialog.open(UserHistryComponent, {
      width: '60%',
      height: 'auto',
      data: {
        email: mail
      }
    })
  }

  createRowData(mailUserData) {
    var mailUser = [];
    for (let i = 0; i < mailUserData.length; i++) {
      let updateMailUSerList = Object.assign({}, mailUserData[i], { userName: mailUserData[i].name, mobNumber: mailUserData[i].mobileNumber, email: mailUserData[i].email, assignId: mailUserData[i].assigneeId, date: mailUserData[i].createdDate })
      mailUser.push(updateMailUSerList)
    }
    console.log('user mailUser: ', mailUser);
    return mailUser;
  }

  mailUsercreateColumnDef() {
    return [
      {
        headerName: 'User Name',
        field: 'userName',
        width: 180,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Mobile Number',
        field: 'mobNumber',
        width: 130,
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
        width: 230,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }

      },
      {
        headerName: 'Assign ID',
        field: 'assignId',
        width: 250,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Date',
        field: 'date',
        width: 130,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        cellRenderer: (data) => {
          return formatDate(data.value, 'dd/MM/yyyy', this.locale)
        }
      },
      {
        headerName: 'Action',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params:any) {
          return `<button type="button" class="action_icon add_button" data-action-type="user-histroy" title="User Histroy">User Histroy</button>`;  //fa fa-info-circle  
          // <i class="fa fa-envelope" aria-hidden="true" data-action-type="send-Mail-Notification"></i>

        },
        width: 140,
        pinned: 'right',
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center'
        },
      },
    ]
  }

  public mailUserRowClicked(params) {
    console.log(params)
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'user-histroy': {
          this.showUserHistry(params.data.email)
          break;
        }
      }
    }
  }

}
