import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { UserChatsComponent } from './user-chats/user-chats.component';

@Component({
  selector: 'app-spam-table',
  templateUrl: './spam-table.component.html',
  styleUrls: ['./spam-table.component.css']
})
export class SpamTableComponent implements OnInit {

  loading!: boolean;
  spamRepoGridOption: GridOptions;
  actionFilter: any;
  actions: any = [
    {label: '', value: 'BLANK'},
    {label: 'Blocked', value: 'BLOCKED'},
    {label: 'Wrong Detection', value: 'WRONG_DETECTION'}
  ]

  constructor(private userService: UserMsService, private utileService: UtilsService, private dialog: MatDialog, private toastService: ToastMessageService) { 
    this.spamRepoGridOption = <GridOptions>{
      rowData: [],
      columnDefs: this.newSpamReportColoumnDef(),
      enableCellChangeFlash: true,
      onGridReady: params => {
      },
      sortable: true,
    };
  }

  ngOnInit() {
    this.getSpamData()
  }

  getSpamData(filterKey?){
    this.loading = true;
    var param;
    console.log('filterKey: ',filterKey);
    if(this.utileService.isNonEmpty(filterKey)){
      param = '/gateway/spams?action='+filterKey;
    }
    else{
      param = '/gateway/spams?action=BLANK';
    }
    this.userService.getMethodInfo(param).subscribe((res: any)=>{
      this.loading = false;
        console.log('spam reports: ',res);
        if(res instanceof Array && res.length > 0){
          this.spamRepoGridOption.api?.setRowData(this.createRowData(res));
        }
        else{
          this.spamRepoGridOption.api?.setRowData(this.createRowData([]));
        }
    },
    error=>{
      this.loading = false;
      console.log('there is issue during getting spam reports: ',error)
    })
  }

  createRowData(spanInfo){
    console.log('spanInfo -> ', spanInfo);
    var spamInfoArray = [];
    for (let i = 0; i < spanInfo.length; i++) {
      let sceduleCallsInfo = Object.assign({}, spamInfoArray[i], {
        userId: spanInfo[i]['userId'],
        name: spanInfo[i]['name'],
        userMobile: spanInfo[i]['userMobile'],
        mobileNumber: spanInfo[i]['mobileNumber'],
        agentName: spanInfo[i]['agentName'],
        action:  spanInfo[i]['action'],
        chatInfoList: spanInfo[i]['chatInfoList'],
      })
      spamInfoArray.push(sceduleCallsInfo);
    }
    console.log('spamInfoArray-> ', spamInfoArray)
    return spamInfoArray;
  }
  newSpamReportColoumnDef(){
    return [
      {
        headerName: 'User Id',
        field: 'userId',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        sortable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Name',
        field: 'name',
        width: 220,
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
        field: 'mobileNumber',
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
        headerName: 'Agent name',
        field: 'agentName',
        width: 220,
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
        headerName: 'Chat',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params:any) {
          return `<button type="button" class="action_icon add_button" title="Open Chat"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-comments-o" aria-hidden="true" data-action-type="open-chat"></i>
           </button>`;
        },
        width: 100,
        pinned: 'right',
        cellStyle: function (params:any) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
      {
        headerName: 'Wrong Detection',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,    // style="border: none; background: transparent; font-size: 16px; cursor:pointer;"
        cellRenderer: function (params:any) {
          if(params.data.action === "BLANK"){
            return `<button type="button" class="action_icon add_button" data-action-type="wrong-detection">Wrong Detection</button>`;
          }
          else{
            return `<button type="button" class="action_icon add_button" 
            style="display: none;">Wrong Detection</button>`;
          }
        },
        width: 150,
        pinned: 'right',
        cellStyle: function (params:any) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
      {
        headerName: 'Block',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params:any) {    //style="border: none; background: transparent; font-size: 16px; cursor:pointer;"
          if(params.data.action === "BLANK"){
            return `<button type="button" class="action_icon add_button" data-action-type="block"> Block</button>`;
          }
          else{
            return `<button type="button" class="action_icon add_button" 
            style="display: none"> Block</button>`;
          }
         
        },
        width: 100,
        pinned: 'right',
        cellStyle: function (params:any) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
    ]
  }

  onSpamDataRowClicked(params){
    console.log(params)
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'open-chat': {
          this.checkChats(params.data);
          break;
        }
        case 'wrong-detection': {
          this.chageStatus('wrong-detection',params.data);
          break;
        }
        case 'block': {
          this.chageStatus('block',params.data);
          break;
        }
      }
    }
  }

  checkChats(userInfo){
    let disposable = this.dialog.open(UserChatsComponent, {
      width: '50%',
      height: 'auto',
      data: {
         userData : userInfo
      }
    })
  }

  chageStatus(filterType, data){
    console.log(filterType,' data: ',data);
     this.loading = true;
    if(filterType === 'wrong-detection'){
      data.action = 'WRONG_DETECTION';
    }
    else{
      data.action = 'BLOCKED';
    }
    let param = '/gateway/spams';
    let reqBody = data;
    console.log('reqBody: ',reqBody);
    this.userService.spamPutMethod(param, reqBody).subscribe((res)=>{
        console.log('res: ',res);
        this.loading = false;
        if(filterType === 'wrong-detection'){
          this.toastService.alert('success','Wrong detection update successfully.')
        }
        else{
          this.toastService.alert('success','User Blocked successfully.')
        }
        
        setTimeout(()=>{
          this.getSpamData()
        }, 4000)
       ;
    },
    error=>{
      this.loading = false;
      console.log('error during block user/wrong detecion : ',error);
      this.toastService.alert('error','Issue in update data.')
    })
  }

}
