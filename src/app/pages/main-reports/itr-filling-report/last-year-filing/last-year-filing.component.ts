import { ItrMsService } from './../../../../services/itr-ms.service';
import { Component, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { UtilsService } from 'app/services/utils.service';
import moment = require('moment');
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';
import { UserNotesComponent } from 'app/shared/components/user-notes/user-notes.component';
import { MatDialog } from '@angular/material';
import { ChangeStatusComponent } from 'app/shared/components/change-status/change-status.component';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-last-year-filing',
  templateUrl: './last-year-filing.component.html',
  styleUrls: ['./last-year-filing.component.css']
})
export class LastYearFilingComponent implements OnInit {
  loading: boolean;
  lastYearReportGridOption: GridOptions;
  totalCount = 0;

  constructor(public utilsService: UtilsService,
    private itrMsService: ItrMsService,
    private _toastMessageService: ToastMessageService,
    private userMsService: UserMsService,
    private dialog: MatDialog,) {
    this.lastYearReportGridOption = <GridOptions>{
      rowData: [],
      columnDefs: this.lastYearCreateColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: params => {
      },
      sortable: true,
    };
  }

  ngOnInit() {
    this.getReport();
  }
  getReport() {
    this.loading = true;
    const param = `/itr-report-by-financialYear?financialYear=2019-2020`;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      console.log('SME REPORT: ', res);
      this.loading = false;
      if (res && res instanceof Array && res.length > 0) {
        this.totalCount = res.length;
        // res.sort((a, b) => a.smeName > b.smeName ? 1 : -1);
        this.lastYearReportGridOption.api.setRowData(res)
      } else {
        this.lastYearReportGridOption.api.setRowData([])
      }
    }, error => {
      this.loading = false;
      this.utilsService.showSnackBar('Unable to get SME Report')
    })
  }

  lastYearCreateColumnDef() {
    return [
      {
        headerName: 'User Id',
        field: 'userId',
        pinned: 'left',
        width: 60,
        suppressMovable: true,
      },
      {
        headerName: 'Client Name',
        field: 'name',
        pinned: 'left',
        sortable: true,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'PAN Number',
        field: 'pan',
        sortable: true,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Mobile Number',
        field: 'mobile',
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Email Address',
        field: 'email',
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Acknowledgment Number',
        field: 'ackNumber',
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'ITR Type',
        field: 'itrType',
        width: 70,
        sortable: true,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Date Of Filing',
        field: 'eFilingDate',
        width: 120,
        sortable: true,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        valueFormatter: (data) => data.value ? moment(data.value).format('DD MMM YYYY') : null,
      },
      {
        headerName: 'Filer Name',
        field: 'filingTeamMember',
        sortable: true,
        suppressMovable: true,
        pinned: 'right',
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
      },
      {
        headerName: 'Call',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="By clicking on call you will be able to place a call." 
            style="border: none;
            background: transparent; font-size: 16px; cursor:pointer">
            <i class="fa fa-phone" aria-hidden="true" data-action-type="place-call"></i>
           </button>`;
        },
        width: 55,
        pinned: 'right',
      },
      {
        headerName: 'See/Add Notes',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Click see/add notes"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-book" aria-hidden="true" data-action-type="addNotes"></i>
           </button>`;
        },
        width: 60,
        pinned: 'right',
        cellStyle: function (params) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
      {
        headerName: 'Update Status',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Update Status"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-user" aria-hidden="true" data-action-type="updateStatus"></i>
           </button>`;
        },
        width: 60,
        pinned: 'right',
        cellStyle: function (params) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
    ]
  }

  public onLastYearReportsRowClicked(params) {
    console.log(params)
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'place-call': {
          this.placeCall(params.data);
          break;
        }
        case 'addNotes': {
          this.showNotes(params.data)
          break;
        }
        case 'updateStatus': {
          this.updateStatus('Update Status', params.data)
          break;
        }
      }
    }
  }

  async placeCall(user) {
    console.log('user: ', user)
    const param = `/call-management/make-call`;
    const agentNumber = await this.utilsService.getMyCallingNumber();
    console.log('agent number', agentNumber)
    if (!agentNumber) {
      this._toastMessageService.alert("error", 'You dont have calling role.')
      return;
    }
    this.loading = true;
    const reqBody = {
      "agent_number": agentNumber,
      "customer_number": user.mobile
    }
    this.userMsService.postMethod(param, reqBody).subscribe((result: any) => {
      console.log('Call Result: ', result);
      this.loading = false;
      if (result.success.status) {
        this._toastMessageService.alert("success", result.success.message)
      }
    }, error => {
      this._toastMessageService.alert('error', 'Error while making call, Please try again.');
      this.loading = false;
    })
  }

  showNotes(client) {
    let disposable = this.dialog.open(UserNotesComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.name
      }
    })

    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  updateStatus(mode, client) {
    console.table(client);
    let disposable = this.dialog.open(ChangeStatusComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.name,
        serviceType: 'ITR',
        mode: mode,
        userInfo: client
      }
    })

    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result) {
        if (result.data === "statusChanged") {
          // this.config.currentPage = 1;
          // this.getInterestedClients(0);

        }
      }
    });
  }

  downloadReport() {
    const param = `/download-itr-report-by-financialYear?financialYear=2019-2020`
    location.href = environment.url + `/itr/download-itr-report-by-financialYear?financialYear=2019-2020`;
  }
}
