import { UtilsService } from 'src/app/services/utils.service';
import { Component, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import * as moment from 'moment'
import { AppConstants } from "../../shared/constants";

@Component({
  selector: 'app-filing-tasks',
  templateUrl: './filing-tasks.component.html',
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
    const loggedInSmeInfo = JSON.parse(sessionStorage.getItem(AppConstants.LOGGED_IN_SME_INFO) ?? "");
    if (loggedInSmeInfo && loggedInSmeInfo[0]) {
      const smeEmailId = loggedInSmeInfo[0].email;
      this.getFilingTasks(smeEmailId);
    }
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
    ];
  }

}
