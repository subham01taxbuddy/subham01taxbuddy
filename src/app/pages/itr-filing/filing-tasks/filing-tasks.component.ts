import { UtilsService } from 'src/app/services/utils.service';
import { Component, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import * as moment from 'moment'

@Component({
  selector: 'app-filing-tasks',
  templateUrl: './filing-tasks.component.html',
  styleUrls: ['./filing-tasks.component.css']
})
export class FilingTasksComponent implements OnInit {

  loading!: boolean;
  tasksGridOptions: GridOptions;
  delayedInfo: any = [];
  constructor(private itrMsService: ItrMsService, private _toastMessageService: ToastMessageService, public utilsService: UtilsService) {

    this.tasksGridOptions = <GridOptions>{
      rowData: this.createTasksRowData([]),
      columnDefs: this.taskscreateColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: params => {
      },
      sortable: true
    };
  }

  ngOnInit() {
    const smeEmailId = JSON.parse(localStorage.getItem('UMD'))['USER_EMAIL'];
    this.getFilingTasks(smeEmailId);
  }

  getFilingTasks(smeEmailId) {
    let param = `/sme-task?smeEmailId=${smeEmailId}`;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      console.log('res: ', res);
      this.tasksGridOptions.api?.setRowData(this.createTasksRowData(res));
    },
      error => {
        console.log('error: ', error);
        if (error.error.title === "Not_found") {
          this._toastMessageService.alert("error", "Delay itr record not found.");
        }
      })
  }

  createTasksRowData(data) {
    const newData = [];
    for (let i = 0; i < data.length; i++) {
      newData.push({
        userId: data[i].userId,
        clientName: data[i].clientName,
        clientMobile: data[i].clientMobile,
        clientEmail: data[i].clientEmail,
        comment: data[i].comment,
        itrType: data[i].itrType,
        estimatedDateTime: data[i].estimatedDateTime,
        isMarkAsDone: data[i].isMarkAsDone
      });
    }
    console.log('Return data: ', newData)
    return newData;
  }

  taskscreateColumnDef() {
    return [
      {
        headerName: 'User ID',
        field: 'userId',
        sortable: true,
        width: 80,
        pinned: 'left',
      },
      {
        headerName: "Client Name",
        field: "clientName",
        sortable: true,
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: "Mobile",
        field: "clientMobile",
        sortable: true,
        // width: 200,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        filter: "agTextColumnFilter",
        suppressMovable: true,
        filterParams: {
          defaultOption: "startsWith",
          debounceMs: 0
        }
      },
      {
        headerName: "Estimated Date",
        field: "estimatedDateTime",
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        valueFormatter: (data) => data.value ? moment(data.value).format('DD MMM YYYY') : null,
        // filter: "agTextColumnFilter",
        // width: 200,
        // filterParams: {
        //   defaultOption: "startsWith",
        //   debounceMs: 0
        // }
      },
      {
        headerName: "ITR Type",
        field: "itrType",
        filter: "agTextColumnFilter",
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        width: 80,
        filterParams: {
          defaultOption: "startsWith",
          debounceMs: 0
        }
      },
      {
        headerName: "Comment",
        field: "comment",
        filter: "agTextColumnFilter",
        width: 300,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        suppressMovable: true,
        filterParams: {
          defaultOption: "startsWith",
          debounceMs: 0
        }
      },
      {
        headerName: "Filed",
        field: "isMarkAsDone",
        valueGetter: function (params) {
          return params.data.isMarkAsDone ? 'Yes' : 'No';
        },
        width: 80,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        pinned: 'right',
      },

      //   {
      //     headerName: 'Status',
      //     width: 80,
      //     sortable: true,
      //     pinned: 'right',
      //     cellRenderer: function (params:any) {
      //       return `<button type="button" class="action_icon add_button" title="Unblock user ITR" style="border: none;
      //         background: transparent; font-size: 16px; cursor:pointer;">
      //         <i class="fa fa-edit" aria-hidden="true" data-action-type="changeStatus"></i>
      //        </button>`;
      //     },
      //     cellStyle: {
      //       textAlign: 'center', display: 'flex',
      //       'align-items': 'center',
      //       'justify-content': 'center',
      //       color: 'blueviolet'

      //     },
      //   },
      //   {
      //     headerName: 'Ack Status',
      //     width: 80,
      //     sortable: true,
      //     pinned: 'right',
      //     cellRenderer: function (params:any) {
      //       return `<button type="button" class="action_icon add_button" title="Change Acknowlegement status" style="border: none;
      //         background: transparent; font-size: 16px; cursor:pointer;">
      //         <i class="fa fa-user" aria-hidden="true" data-action-type="ackStatus"></i>
      //        </button>`;
      //     },
      //     cellStyle: {
      //       textAlign: 'center', display: 'flex',
      //       'align-items': 'center',
      //       'justify-content': 'center',
      //       color: 'blueviolet'

      //     },
      //   }

    ];
  }

  public onRowClicked(params) {
    console.log(params)
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        // case 'changeStatus': {
        //   this.changeStatus(params.data);
        //   break;

        // }
        // case 'ackStatus': {
        //   this.getAcknowledgeDetail(params.data);
        //   break;
        // }
      }
    }
  }

  //   changeStatus(itrData) {
  //     console.log('change itr data: ', itrData);
  //     this.loading = true;
  //     let param = '/enableItrFilling/' + itrData.userId + '/' + itrData.itrId + '/' + itrData.assessmentYear;
  //     this.itrMsService.getMethod(param).subscribe((res: any) => {
  //       this.loading = false;
  //       console.log('res: ', res);
  //       this._toastMessageService.alert("success", "User unblocked successfully.");
  //       this.getFilingTasks();
  //     },
  //       error => {
  //         this.loading = false;
  //         this._toastMessageService.alert("error", "Error while unblocking, please try again");
  //       })
  //   }

  //   getAcknowledgeDetail(data){
  //     console.log('Data for acknowlegement status', data);
  //     this.loading = true;
  //     const param = `/api/itr-Ack-details?panNumber=${data.panNumber}&assessmentYear=2020-2021`;
  //       this.itrMsService.getMethod(param).subscribe((res: any) => {
  //         this.utilsService.showSnackBar(res.status)
  //         this.loading = false;
  //         setTimeout(()=>{
  //           this.getFilingTasks();
  //         }, 5000)
  //       }, error => {
  //         this.loading = false;
  //       })
  //   }

}
