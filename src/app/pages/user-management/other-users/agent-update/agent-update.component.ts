import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { GridOptions } from 'ag-grid-community';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';
import { AppConstants } from 'app/shared/constants';
import { ChangeAgentDialogComponent } from './change-agent-dialog/change-agent-dialog.component';
declare function matomo(title: any, url: any, event: any);
@Component({
  selector: 'app-agent-update',
  templateUrl: './agent-update.component.html',
  styleUrls: ['./agent-update.component.css']
})
export class AgentUpdateComponent implements OnInit {

  loading: boolean;
  updateAgetGridOptions: GridOptions;
  smeList: any = [];
  agentList: any = [];
  selectedAgent: any;
  searchMobNo: any;
  config: any;

  constructor(private userMsService: UserMsService, private dialog: MatDialog, private utileService: UtilsService, private toastMsgService: ToastMessageService) {
    this.updateAgetGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.createColoumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: params => {
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
    this.agentList = JSON.parse(sessionStorage.getItem(AppConstants.AGENT_LIST));
    this.getCallerUser('');
  }

  createColoumnDef() {
    return [
      {
        headerName: 'SME Id',
        field: 'smeId',
        width: 70,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Name',
        field: 'name',
        width: 130,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Mobile No',
        field: 'mobileNumber',
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
        width: 240,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Service Type',
        field: 'serviceType',
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
        headerName: 'Agent name',
        field: 'agentName',
        width: 160,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Role',
        field: 'roles',
        width: 200,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Update Agent',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Update Agent"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-user" aria-hidden="true" data-action-type="updateAgent"></i>
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

  searchByAgent(selectedAgent) {
    if (this.utileService.isNonEmpty(selectedAgent)) {
      this.selectedAgent = selectedAgent;
      this.searchMobNo = ''
      this.getCallerUser(selectedAgent);
    }
    else {
      this.toastMsgService.alert("error", "Select Agent")
    }
  }

  getCallerUser(id, mobNo?) {
    this.loading = true;
    var param;
    if (this.utileService.isNonEmpty(id)) {
      param = `/sme-details?agentId=${id}`;
    }
    else {
      if (this.utileService.isNonEmpty(mobNo)) {
        param = `/custom-sme-details?mobileNumber=${mobNo}`;
      }
      else {
        param = `/custom-sme-details`;
      }
    }
    this.userMsService.getMethod(param).subscribe((res: any) => {
      console.log('sme users: ', res);
      this.loading = false;
      this.searchMobNo = ''
      if (Array.isArray(res) && res.length > 0) {
        this.smeList = res;
        this.updateAgetGridOptions.api.setRowData(this.createRowData(this.smeList));
        // this.config.totalItems = res.totalElements;
      }
      else {
        this.smeList = [];
        this.updateAgetGridOptions.api.setRowData(this.createRowData(this.smeList))
        this.toastMsgService.alert('error', 'Data not found.')
      }
    },
      error => {
        console.log('Error during getting caller users daa: ', error);
        this.toastMsgService.alert('error', 'Error during getting sme data.')
        this.loading = false;
      })
  }

  createRowData(updateAgent) {
    console.log('updateAgent -> ', updateAgent);
    var updateAgentsArray = [];
    for (let i = 0; i < updateAgent.length; i++) {
      let updateAgentsInfo = Object.assign({}, updateAgentsArray[i], {
        id: updateAgent[i]['id'],
        agentId: updateAgent[i]['agentId'],
        userId: updateAgent[i]['userId'],
        smeId: updateAgent[i]['smeId'],
        name: updateAgent[i]['name'],
        email: updateAgent[i]['email'],
        mobileNumber: updateAgent[i]['mobileNumber'],
        serviceType: updateAgent[i]['serviceType'],
        roles: this.userRole(updateAgent[i]['roles']),
        agentName: updateAgent[i]['agentName']
      })
      updateAgentsArray.push(updateAgentsInfo);
    }
    console.log('updateAgentsArray-> ', updateAgentsArray)
    return updateAgentsArray;
  }



  updateAgent(userInfo) {
    let disposable = this.dialog.open(ChangeAgentDialogComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userInfo: userInfo,
        allInfo: this
      }
    })

    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result) {
        if (result.data === "statusChanged") {
          this.getCallerUser(this.selectedAgent);
        }
      
        if(result.changeAgentInfo){
          console.log('result.changeAgentInfo: ',result.changeAgentInfo);
          let agentInfo = 'change Agent: '+result.changeAgentInfo.changeAgent+' serviceType: '+result.changeAgentInfo.serviceType;
          matomo('SME Agent Update', '/pages/user-management/sme-mgnt/agent-update', ['trackEvent', 'SMEs Agent Update', 'User Agent', agentInfo]); 
        }

      }
    });
  }

  userRole(roles) {
    var role;
    console.log(roles);
    if (roles instanceof Array) {
      if (roles.length === 1) {
        role = roles[0] === "ROLE_CALLING_TEAM" ? 'Caller Agent' : 'Filer Agent';
      }
      else if (roles.length > 1) {
        for (let i = 0; i < roles.length; i++) {
          if (i === 0) {
            role = roles[i] === "ROLE_CALLING_TEAM" ? 'Caller Agent' : 'Filer Agent';
          }
          else {
            role = role + ', ' + (roles[i] === "ROLE_CALLING_TEAM" ? 'Caller Agent' : 'Filer Agent');
          }
        }
        console.log('role -> ', role)
      }
      console.log('main role -> ', role)
      return role;
    }
  }

  serchByMobNo() {
    if (this.utileService.isNonEmpty(this.searchMobNo) && this.searchMobNo.length === 10) {
      this.getCallerUser('', this.searchMobNo);
    }
    else {
      this.toastMsgService.alert("error", "Enter valid mobile number.")
    }
  }

  onAgentUpdateClicked(params) {
    console.log(params)
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'updateAgent': {
          this.updateAgent(params.data)
          break;
        }
      }
    }
  }

}
