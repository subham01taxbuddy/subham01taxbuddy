import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { GridOptions } from 'ag-grid-community';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';
import { AppConstants } from 'app/shared/constants';
import { AddRemoveAgentDialogComponent } from '../add-remove-agent-dialog/add-remove-agent-dialog.component';
declare function matomo(title: any, url: any, event: any);

@Component({
  selector: 'app-add-caller',
  templateUrl: './add-caller.component.html',
  styleUrls: ['./add-caller.component.css']
})
export class AddCallerComponent implements OnInit {
  loading: boolean;
  allCallerGridOptions: GridOptions;
  // addCallerGridOptions: GridOptions;
  callerData: any = [];
  allCallerData: any = [];
  selectedCallerList: any = [];
  removeCallerList: any = [];
  agentList: any = [];
  selectedAgent: any;
  showAllUser: boolean;
  // searchMobNo: any;

  constructor(private userMsService: UserMsService, private utileService: UtilsService, private toastMsgService: ToastMessageService,
    private dialog: MatDialog) {
    this.allCallerGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.allCallersColoumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: params => {
      },
      sortable: true,
    };

    // this.addCallerGridOptions = <GridOptions>{
    //   rowData: [],
    //   columnDefs: this.callersColoumnDef(),
    //   enableCellChangeFlash: true,
    //   onGridReady: params => {
    //   },
    //   sortable: true,
    // };
  }

  ngOnInit() {
    this.agentList = JSON.parse(sessionStorage.getItem(AppConstants.AGENT_LIST));
    this.getAllCallerUser()
  }

  searchByAgent() {
    if (this.utileService.isNonEmpty(this.selectedAgent)) {
      // this.searchMobNo = '';
      matomo('Team Management', '/pages/team-management/caller-assign/add-caller', ['trackEvent', 'Add/ remove caller', 'Agent ', this.selectedAgent]); 
      this.getCallerUser(this.selectedAgent);
    }
    else {
      this.toastMsgService.alert("error", "Select Agent")
    }
  }

  // serchByMobNo() {
  //   if (this.utileService.isNonEmpty(this.searchMobNo) && this.searchMobNo.length === 10) {
  //     this.selectedAgent = '';
  //     this.getAllCallerUser(this.searchMobNo);
  //   }
  //   else {
  //     this.toastMsgService.alert("error", "Enter valid mobile number.")
  //   }
  // }

  allCallersColoumnDef() {
    return [
      {
        headerName: 'Sme Id',
        field: 'smeId',
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
        headerName: 'Name',
        field: 'name',
        width: 180,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Mobile',
        field: 'mobileNumber',
        width: 140,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Email',
        field: 'email',
        width: 280,
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
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Agent',
        field: 'agents',
        width: 200,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      }
    ]
  }

  callersColoumnDef() {
    return [
      //       {
      //         headerName: 'Sme Id',
      //         field: 'smeId',
      //         width: 100,
      //         suppressMovable: true,
      //         cellStyle: { textAlign: 'center' },
      //         filter: "agTextColumnFilter",
      //         filterParams: {
      //           filterOptions: ["contains", "notContains"],
      //           debounceMs: 0
      //         }
      //       },
      //       {
      //         headerName: 'Name',
      //         field: 'name',
      //         width: 180,
      //         suppressMovable: true,
      //         cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
      //         filter: "agTextColumnFilter",
      //         filterParams: {
      //           filterOptions: ["contains", "notContains"],
      //           debounceMs: 0
      //         }
      //       },
      //       {
      //         headerName: 'Mobile',
      //         field: 'mobileNumber',
      //         width: 140,
      //         suppressMovable: true,
      //         filter: "agTextColumnFilter",
      //         filterParams: {
      //           filterOptions: ["contains", "notContains"],
      //           debounceMs: 0
      //         }
      //       },   
      //       {
      //         headerName: 'Email',
      //         field: 'email',
      //         width: 280,
      //         suppressMovable: true,
      //         cellStyle: { textAlign: 'center' },
      //         filter: "agTextColumnFilter",
      //         filterParams: {
      //           filterOptions: ["contains", "notContains"],
      //           debounceMs: 0
      //         }
      //       },
      //       {
      //         headerName: 'Service Type',
      //         field: 'serviceType',
      //         width: 150,
      //         suppressMovable: true,
      //         cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
      //         filter: "agTextColumnFilter",
      //         filterParams: {
      //           filterOptions: ["contains", "notContains"],
      //           debounceMs: 0
      //         }
      //       },

      //       { 
      //         headerName: 'Add Caller',
      //         editable: false,
      //         suppressMenu: true,
      //         sortable: true,
      //         suppressMovable: true,
      //         cellRenderer: function (params) {
      //           console.log(params)
      //           return `<input type="checkbox" [(ngModel)]="param.data.addCaller" (change)="checkValue(param)" />`;
      //         },
      //         width: 130,
      //         pinned: 'right',
      //         cellStyle: function (params) {
      //           return {
      //             textAlign: 'center', display: 'flex',
      //             'align-items': 'center',
      //             'justify-content': 'center'
      //           }
      //         },
      //       }
    ]
  }

  getAllCallerUser(mobMo?) {
    this.loading = true;
    var param;
    if (this.utileService.isNonEmpty(mobMo)) {
      param = `/call-management/caller-agents?callerAgentNumber=${mobMo}`;
    }
    else {
      param = `/call-management/caller-agents`;
    }
    this.userMsService.getMethod(param).subscribe(res => {
      console.log('caller users: ', res);
      this.loading = false;
      this.showAllUser = true;
      if (res instanceof Array && res.length > 0) {
        this.allCallerData = res;
        this.allCallerData.sort((a, b) => a.name > b.name ? 1 : -1)
        this.selectedAgent = '';
        console.log(this.allCallerData, typeof this.allCallerData)
        // if(this.allCallerGridOptions.api){
        // this.allCallerGridOptions.api.setRowData(this.createAllRowData(this.allCallerData));
        // }
      }
      else {
        this.allCallerData = [];
        this.toastMsgService.alert('error', 'Data no found.')
      }
    },
      error => {
        console.log('Error during getting caller users daa: ', error);
        this.toastMsgService.alert('error', 'Error during getting all caller users data.')
        this.loading = false;
      })
  }

  getCallerUser(id) {
    this.loading = true;
    var param;
    if (this.utileService.isNonEmpty(id)) {
      param = `/call-management/caller-agents-role?agentId=${id}`;
    }
    else {
      const userData = JSON.parse(localStorage.getItem('UMD'));
      param = `/call-management/caller-agents-role?agentId=${userData.USER_UNIQUE_ID}`;
    }

    this.userMsService.getMethod(param).subscribe(res => {
      console.log('caller users: ', res);
      this.showAllUser = false;
      this.loading = false;
      if (Array.isArray(res) && res.length > 0) {
        this.callerData = res;
        this.callerData.sort((a, b) => a.name > b.name ? 1 : -1)
        this.selectedCallerList = [];
        this.removeCallerList = [];
        // this.addCallerGridOptions.api.setRowData(this.createRowData(res));
      }
      else {
        this.callerData = [];
        this.toastMsgService.alert('error', 'Data no found.')
      }
    },
      error => {
        console.log('Error during getting caller users daa: ', error);
        this.toastMsgService.alert('error', 'Error during getting caller users data.')
        this.loading = false;
      })
  }

  createAllRowData(callerData) {
    console.log('callerData -> ', callerData);
    var callerArray = [];
    for (let i = 0; i < callerData.length; i++) {
      let couponInfo = Object.assign({}, callerArray[i], {
        smeId: callerData[i].smeId,
        name: this.utileService.isNonEmpty(callerData[i].name) ? callerData[i].name : '-',
        mobileNumber: this.utileService.isNonEmpty(callerData[i].mobileNumber) ? callerData[i].mobileNumber : '-',
        email: this.utileService.isNonEmpty(callerData[i].email) ? callerData[i].email : '-',
        serviceType: this.utileService.isNonEmpty(callerData[i].serviceType) ? callerData[i].serviceType : '-',
        agents: this.getAgents(callerData[i].agentsName)
      })
      callerArray.push(couponInfo);
    }
    console.log('callerArray-> ', callerArray)
    return callerArray;
  }

  // createRowData(callerData){
  //   console.log('callerData -> ', callerData);
  //   var callerArray = [];
  //   for (let i = 0; i < callerData.length; i++) {
  //     let couponInfo = Object.assign({}, callerArray[i], {
  //       smeId: callerData[i].smeId,
  //       name: this.utileService.isNonEmpty(callerData[i].name) ? callerData[i].name : '-',
  //       mobileNumber: this.utileService.isNonEmpty(callerData[i].mobileNumber) ? callerData[i].mobileNumber : '-',
  //       email: this.utileService.isNonEmpty(callerData[i].email) ? callerData[i].email : '-',
  //       serviceType: this.utileService.isNonEmpty(callerData[i].serviceType) ? callerData[i].serviceType : '-',
  //       agentId: this.utileService.isNonEmpty(callerData[i].agentId) ? callerData[i].agentId : '-',
  //       addCaller: false 
  //     })
  //     callerArray.push(couponInfo);
  //   }
  //   console.log('callerArray-> ', callerArray)
  //   return callerArray;
  // }

  addCaller(event, userId) {
    if (event.currentTarget.checked) {
      this.selectedCallerList.push(userId)
    }
    else {
      this.selectedCallerList = this.selectedCallerList.filter(item => item != userId);
    }
    console.log('final selectedCallerList: -> ', this.selectedCallerList)
  }

  removeCaller(event, userId) {
    if (event.currentTarget.checked) {
      this.removeCallerList.push(userId)
    }
    else {
      this.removeCallerList = this.removeCallerList.filter(item => item != userId);
    }
    console.log('final removeCallerList: -> ', this.removeCallerList)
  }

  saveCaller(action) {
    this.loading = true;
    const userData = JSON.parse(localStorage.getItem('UMD'));
    var caller;
    if (action === 'add') {
      caller = this.getCalletList(action)
      var param = `/call-management/caller-agents?agentId=${this.selectedAgent}&addCallerAgents=${caller}&removeCallerAgent=`;
      matomo('Team Management', '/pages/team-management/caller-assign/add-caller', ['trackEvent', 'Add/ remove caller', 'Add Caller ']); 
    }
    else {
      caller = this.getCalletList(action)
      var param = `/call-management/caller-agents?agentId=${this.selectedAgent}&addCallerAgents=&removeCallerAgent=${caller}`;
      matomo('Team Management', '/pages/team-management/caller-assign/add-caller', ['trackEvent', 'Add/ remove caller', 'Remove Caller']); 
    }
    console.log('caller -> ', caller)
    console.log('param: ', param)
    this.userMsService.putMethod(param).subscribe(res => {
      console.log('add: -> ', res)
      this.loading = false;
      this.toastMsgService.alert('success', 'Caller data update succesfully.');
      this.getCallerUser(this.selectedAgent);
    },
      error => {
        console.log('error during add callers: -> ', error);
        this.loading = false;
        this.toastMsgService.alert('error', 'There is some to update data.')
      })
  }

  getCalletList(action) {
    var callerList;
    if (action === 'add') {
      if (this.selectedCallerList.length === 1) {
        callerList = this.selectedCallerList[0];
      }
      else if (this.selectedCallerList.length > 1) {
        for (let i = 0; i < this.selectedCallerList.length; i++) {
          if (i === 0) {
            callerList = this.selectedCallerList[i];
          }
          else {
            callerList = callerList + ',' + this.selectedCallerList[i];
          }
        }
      }
      return callerList;
    }
    else {
      if (this.removeCallerList.length === 1) {
        callerList = this.removeCallerList[0];
      }
      else if (this.removeCallerList.length > 1) {
        for (let i = 0; i < this.removeCallerList.length; i++) {
          if (i === 0) {
            callerList = this.removeCallerList[i];
          }
          else {
            callerList = callerList + ',' + this.removeCallerList[i];
          }
        }
      }
      return callerList;
    }

  }

  getAgents(agents) {
    var agentInfo;
    if (agents instanceof Array) {
      if (agents.length === 1) {
        agentInfo = agents[0];
      }
      else if (agents.length > 1) {
        for (let i = 0; i < agents.length; i++) {
          if (i === 0) {
            agentInfo = agents[i];
          }
          else {
            agentInfo = agentInfo + ', ' + (agents[i]);
          }
        }
      }
      return agentInfo;
    }
  }

  onAllCallersClicked(params) {
    console.log(params)
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'addRemoveAgent': {
          this.addRemoveAgent(params.data)
          break;
        }
      }
    }
  }

  addRemoveAgent(agentInfo) {
    let disposable = this.dialog.open(AddRemoveAgentDialogComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userInfo: agentInfo
      }
    })

    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      // if(result){
      //   if(result.data === "statusChanged"){
      //     this.getCallerUser(this.selectedAgent);
      //   }
      // }
    });
  }

}
