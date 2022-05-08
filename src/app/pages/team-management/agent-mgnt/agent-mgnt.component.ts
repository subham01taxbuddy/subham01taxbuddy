import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { UserMsService } from 'src/app/services/user-ms.service';
import { AppConstants } from 'src/app/modules/shared/constants';
import { SuperLeadDialogComponent } from './super-lead-dialog/super-lead-dialog.component';
import { UpdateAgentDialogComponent } from './update-agent-dialog/update-agent-dialog.component';

@Component({
  selector: 'app-agent-mgnt',
  templateUrl: './agent-mgnt.component.html',
  styleUrls: ['./agent-mgnt.component.css']
})
export class AgentMgntComponent implements OnInit {

  loading!: boolean;
  agentList: any = [];
  agentMgntGridOption: GridOptions;

  constructor(private dialog: MatDialog, private userMsService: UserMsService) {
    this.agentList = JSON.parse(sessionStorage.getItem(AppConstants.AGENT_LIST));

    this.agentMgntGridOption = <GridOptions>{
      rowData: [],
      columnDefs: this.createColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: params => {
      },
      sortable: true,
    };
  }

  ngOnInit() {
    this.getAgentInfo()
  }

  getAgentInfo() {
    this.loading = true;
    let param = '/agent-details';
    this.userMsService.getMethod(param).subscribe((res: any) => {
      this.loading = false;
      if (res && res instanceof Array) {
        this.agentMgntGridOption.api?.setRowData(this.agentRowData(res));
        res.sort((a, b) => a.name > b.name ? 1 : -1)
        // sessionStorage.setItem(AppConstants.AGENT_LIST, JSON.stringify(res));
      }
    }, error => {
      this.loading = false;
      console.log('Error during getting all AGENT_LIST: ', error)
    })
  }

  agentRowData(data) {
    console.log('data: -> ', data)
    const newData = [];
    for (let i = 0; i < data.length; i++) {
      newData.push({
        id: data[i].id,
        agentId: data[i].agentId,
        name: data[i].name,
        email: data[i].email,
        mobileNumber: data[i].mobileNumber,
        botId: data[i].botId,
        botName: data[i].botName,
        imageUrl: data[i].imageUrl,
        displayName: data[i].displayName,
        serviceType: data[i].serviceType,
        active: data[i].active,
        newAgentId: data[i].newAgentId,
        userId: data[i].userId,
        superLeadName: data[i].superLeadName
      });

    }
    return newData;
  }


  createColumnDef() {
    return [
      {
        headerName: 'Agent Id',
        field: 'agentId',
        width: 100,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'User Id',
        field: 'userId',
        width: 100,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Bot Id',
        field: 'botId',
        width: 140,
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
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Email Id',
        field: 'email',
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
        headerName: 'Mobile',
        field: 'mobileNumber',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Service',
        field: 'serviceType',
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
        headerName: 'Active',
        field: 'active',
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
        headerName: 'Super Lead',
        field: 'superLeadName',
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
        headerName: 'Update SL',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Update Super Lead"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-user" aria-hidden="true" data-action-type="updateSuperLead"></i>
           </button>`;
        },
        width: 80,
        pinned: 'right',
        cellStyle: function (params: any) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
      // {
      //   headerName: 'Update Status',
      //   editable: false,
      //   suppressMenu: true,
      //   sortable: true,
      //   suppressMovable: true,
      //   cellRenderer: function (params:any) {
      //     return `<button type="button" class="action_icon add_button" title="Update Agent"
      //     style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
      //       <i class="fa fa-user" aria-hidden="true" data-action-type="updateAgent"></i>
      //      </button>`;
      //   },
      //   width: 80,
      //   pinned: 'right',
      //   cellStyle: function (params:any) {
      //     return {
      //       textAlign: 'center', display: 'flex',
      //       'align-items': 'center',
      //       'justify-content': 'center'
      //     }
      //   },
      // }
    ]
  }

  onAgentMgntClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'updateAgent': {
          this.addAgent(params.data, 'Update Agent');
          break;
        }
        case 'updateSuperLead': {
          this.addAgent(params.data, 'Update Super Lead', 'SUPER_LEAD');
          break;
        }
      }
    }
  }

  addAgent(agentInfo, title, code?) {
    let disposable = this.dialog.open(UpdateAgentDialogComponent, {
      width: '50%',
      height: 'auto',
      data: {
        agentInfo: agentInfo,
        title: title,
        code: code
      }
    })

    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result) {
        if (result.data === 'Agent Added' || result.data === 'Agent Update') {
          this.getAgentInfo();
        }
      }
    });
  }

  viewSuperLeads() {
    let disposable = this.dialog.open(SuperLeadDialogComponent, {
      width: '50%',
      height: 'auto',
      data: {
        agentInfo: '',
        title: 'Super Leads'
      }
    })

    // disposable.afterClosed().subscribe(result => {
    //   console.log('The dialog was closed');
    //   if (result) {
    //     if (result.data === 'Agent Added' || result.data === 'Agent Update') {
    //       this.getAgentInfo();
    //     }
    //   }
    // });
  }
}
