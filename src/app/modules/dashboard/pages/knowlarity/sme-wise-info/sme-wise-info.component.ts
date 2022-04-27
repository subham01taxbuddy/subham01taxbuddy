import { Component, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import * as moment from 'moment'


@Component({
  selector: 'app-sme-wise-info',
  templateUrl: './sme-wise-info.component.html',
  styleUrls: ['./sme-wise-info.component.css']
})
export class SmeWiseInfoComponent implements OnInit {
  loading!: boolean;
  selectedUser: any;
  smeList: any = [];
  smeWiseGridOptions: GridOptions;
  agentList: any = [];
  

  constructor(private toastMsgService: ToastMessageService, private userMsService: UserMsService, private utilsService: UtilsService) {
    this.smeWiseGridOptions = <GridOptions>{
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
    this.getSmeList();
  }

  // async getAgentList() {
  //   this.agentList = await this.utilsService.getStoredAgentList();
  // }

  async getSmeList() {
    this.smeList = await this.utilsService.getStoredSmeList();
  }

  createColumnDef() {
    return [
      {
        headerName: 'Sme Name',
        field: 'smeName',
        width: 190,
        suppressMovable: true,
        sortable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'User Name',
        field: 'userName',
        width: 190,
        suppressMovable: true,
        sortable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Sme Mobile No',
        field: 'smeMobileNumber',
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
        headerName: 'User Mobile No',
        field: 'userMobileNumber',
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
        headerName: 'Date',
        field: 'date',
        width: 120,
        suppressMovable: true,
        sortable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        valueFormatter: (data) => data.value ? moment(data.value).format('DD/MM/YYYY') : null,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      // {
      //   headerName: 'Service Type',
      //   field: 'serviceType',
      //   width: 130,
      //   suppressMovable: true,
      //   cellStyle: { textAlign: 'center' },
      //   filter: "agTextColumnFilter",
      //   filterParams: {
      //     filterOptions: ["contains", "notContains"],
      //     debounceMs: 0
      //   }
      // },
      {
        headerName: 'Time',
        field: 'time',
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
        headerName: 'Duration',
        field: 'duration',
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
        headerName: 'Recording Url',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params:any) {
          return `<button type="button" class="action_icon add_button" title="Redirect Url"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-info-circle" aria-hidden="true" data-action-type="redirectUrl"></i>
           </button>`;
        },
        width: 60,
        pinned: 'right',
        cellStyle: function (params:any) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      }
      
    ]
  }

  onSmeWiseClicked(params){
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'redirectUrl': {
          this.redirectToUrl(params.data)
          break;
        }
      }
    }
  }

  redirectToUrl(info){
    window.open(info.recordingUrl)
  }

  searchByMobNo(){
    if(this.utilsService.isNonEmpty(this.selectedUser)){
        this.getSmeWiseUserInfo();
    }
    else{
      this.toastMsgService.alert("error", 'Select Agent.')
    }
  }

  getSmeWiseUserInfo(){
    this.loading = true;
    const param = `/call-management/knowlarity-call-logs?callerAgentNumber=${this.selectedUser}&page=0&size=20`;
    this.userMsService.getMethod(param).subscribe((res: any) => {
      this.loading = false;
      console.log('Result', res);
      if (res instanceof Array && res.length > 0) {
        this.smeWiseGridOptions.api?.setRowData(this.createRowData(res));
      } else {
        this.smeWiseGridOptions.api?.setRowData(this.createRowData([]));
      }
    }, error => {
      this.loading = false;
    })
  }

  
  createRowData(data) {
    var dataArray = [];
    for (let i = 0; i < data.length; i++) {
      let smeWiseInfo = Object.assign({}, dataArray[i], {
        smeName: data[i].smeName,
        userName: data[i].userName,
        smeMobileNumber: data[i].smeMobileNumber,
        userMobileNumber: data[i].userMobileNumber,
        date: data[i].date,
        time: data[i].time,
        duration: data[i].duration,
        recordingUrl: data[i].recordingUrl
      })
      dataArray.push(smeWiseInfo);
    }
    console.log('dataArray-> ', dataArray)
    return dataArray;
  }


}
