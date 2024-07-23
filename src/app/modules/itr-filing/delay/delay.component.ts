import { AppConstants } from 'src/app/modules/shared/constants';
import { ApiEndpoints } from 'src/app/modules/shared/api-endpoint';
import { UtilsService } from 'src/app/services/utils.service';
import { AfterContentChecked, ChangeDetectorRef, Component } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';

@Component({
  selector: 'app-delay',
  templateUrl: './delay.component.html',
})
export class DelayComponent implements AfterContentChecked {

  loading!: boolean;
  delayItrGridOptions: GridOptions;
  delayedInfo: any = [];
  selectedFyYear = '';
  constructor(private itrMsService: ItrMsService,
    private _toastMessageService: ToastMessageService,
    public utilsService: UtilsService,
    private cdRef: ChangeDetectorRef) {

    this.delayItrGridOptions = <GridOptions>{
      rowData: this.createDelayRowData([]),
      columnDefs: this.delaycreateColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: params => {
      },
      sortable: true
    };
  }

  fromFy(event:any) {
    this.selectedFyYear = event;
    console.log(event);
    this.getDelayedItrData(event);
  }

  ngAfterContentChecked() {
    this.cdRef.detectChanges();
  }

  getDelayedItrData(fy:any) {
    const loggedInUserId = this.utilsService.getLoggedInUserID();
    let reqBody = {
      'financialYear': fy,
      'filingTeamMemberId': loggedInUserId
    }
    let param = '/itr-search?page=0&size=20';
    let param2 = reqBody;
    this.itrMsService.postMethod(param, param2).subscribe((res: any) => {
      console.log('res: ', res);
      if (res && res.success) {
        this.delayItrGridOptions.api?.setRowData(this.createDelayRowData(res.data));
      }

    }, error => {
      console.log('error: ', error);
      if (error.error.title === "Not_found") {
        this._toastMessageService.alert("error", "Delay itr record not found.");
      }
    })
  }

  createDelayRowData(data:any) {
    console.log("delay data -> ", data)
    const newData = [];
    for (let i = 0; i < data.length; i++) {
      newData.push({
        itrId: data[i].itrId,
        name: (this.utilsService.isNonEmpty(data[i].family) && data[i].family instanceof Array && data[i].family.length > 0) ? (data[i].family[0].fName + ' ' + data[i].family[0].lName) : '',
        userId: data[i].userId,
        assessmentYear: data[i].assessmentYear,
        panNumber: data[i].panNumber,
        ackStatus: data[i].ackStatus ? data[i].ackStatus : '',
        email: data[i].email,
        contactNumber: data[i].contactNumber
      });
    }
    console.log('Return data: ', newData)
    return newData;
  }

  delaycreateColumnDef() {
    return [
      {
        headerName: 'ITR ID',
        field: 'itrId',
        sortable: true,
        width: 80,
        pinned: 'left',
      },
      {
        headerName: "Name",
        field: "name",
        sortable: true,
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: "Mobile",
        field: "contactNumber",
        sortable: true,
        width: 200,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        filter: "agTextColumnFilter",
        suppressMovable: true,
        filterParams: {
          defaultOption: "startsWith",
          debounceMs: 0
        }
      },
      {
        headerName: "PAN number",
        field: "panNumber",
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        filter: "agTextColumnFilter",
        width: 200,
        filterParams: {
          defaultOption: "startsWith",
          debounceMs: 0
        }
      },
      {
        headerName: "ACK Statue",
        field: "ackStatus",
        filter: "agTextColumnFilter",
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        width: 150,
        filterParams: {
          defaultOption: "startsWith",
          debounceMs: 0
        }
      },
      {
        headerName: "Email",
        field: "email",
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
        headerName: 'Status',
        width: 80,
        sortable: true,
        pinned: 'right',
        cellRenderer: function (params:any) {
          return `<button type="button" class="action_icon add_button" title="Unblock user ITR" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-edit" aria-hidden="true" data-action-type="changeStatus"></i>
           </button>`;
        },
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
          color: 'blueviolet'

        },
      },
      {
        headerName: 'Ack Status',
        width: 80,
        sortable: true,
        pinned: 'right',
        cellRenderer: function (params:any) {
          return `<button type="button" class="action_icon add_button" title="Change Acknowlegement status" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-user" aria-hidden="true" data-action-type="ackStatus"></i>
           </button>`;
        },
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
          color: 'blueviolet'

        },
      }

    ];
  }

  public onRowClicked(params:any) {
    console.log(params)
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'changeStatus': {
          this.changeStatus(params.data);
          break;

        }
        case 'ackStatus': {
          this.getAcknowledgeDetail(params.data);
          break;
        }
      }
    }
  }

  changeStatus(itrData:any) {
    console.log('change itr data: ', itrData);
    this.loading = true;
    let param = `${ApiEndpoints.itrMs.enableItrFilling}/${itrData.userId}/${itrData.itrId}/${itrData.assessmentYear}`;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      this.loading = false;
      console.log('res: ', res);
      this._toastMessageService.alert("success", "User unblocked successfully.");
      this.getDelayedItrData(this.selectedFyYear);
    },
      error => {
        this.loading = false;
        this._toastMessageService.alert("error", "Error while unblocking, please try again");
      })
  }

  getAcknowledgeDetail(data:any) {
    console.log('Data for acknowlegement status', data);
    this.loading = true;
    const fyDetails = JSON.parse(sessionStorage.getItem(AppConstants.FY_LIST) || '');
    const selectedAy = fyDetails.filter((item:any) => item.financialYear)[0].assessmentYear
    const param = `${ApiEndpoints.itrMs.itrAckDetails}?panNumber=${data.panNumber}&assessmentYear=${selectedAy}`;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      this.utilsService.showSnackBar(res.status)
      this.loading = false;
      setTimeout(() => {
        this.getDelayedItrData(this.selectedFyYear);
      }, 5000)
    }, error => {
      this.loading = false;
    })
  }

}
