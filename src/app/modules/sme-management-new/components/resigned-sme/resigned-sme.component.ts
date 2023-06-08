import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';
import { ConfirmDialogComponent } from 'src/app/modules/shared/components/confirm-dialog/confirm-dialog.component';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-resigned-sme',
  templateUrl: './resigned-sme.component.html',
  styleUrls: ['./resigned-sme.component.scss'],
})
export class ResignedSmeComponent implements OnInit {
  smeListGridOptions: GridOptions;
  loading = false;
  smeList: any = [];
  smeInfo: any;
  config: any;
  loggedInSme: any;
  searchParam: any = {
    statusId: null,
    page: 0,
    pageSize: 20,
    // assigned:true,
    // owner:true,
    active: false,
    mobileNumber: null,
    emailId: null,
  };

  constructor(
    private userService: UserMsService,
    private userMsService: UserMsService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private router: Router,
    private dialog: MatDialog,
    @Inject(LOCALE_ID) private locale: string
  ) {
    this.smeListGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.smeCreateColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: (params) => { },

      sortable: true,
    };
    this.config = {
      itemsPerPage: 30,
      currentPage: 1,
      totalItems: null,
    };
  }

  ngOnInit() {
    this.loggedInSme = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'))
    this.getSmeList();
  }

  getSmeList() {
    const loggedInSmeUserId = this.loggedInSme[0].userId
    let data = this.utilsService.createUrlParams(this.searchParam);
    let param = `/sme-details-new/${loggedInSmeUserId}?${data}`;

    this.userMsService.getMethodNew(param).subscribe(
      (result: any) => {
        if (
          Array.isArray(result.data.content) &&
          result.data.content.length > 0
        ) {
          this.loading = false;
          this.smeInfo = result.data.content;
          this.config.totalItems = result.data.totalElements;
          this.smeListGridOptions.api?.setRowData(
            this.createRowData(this.smeInfo)
          );
        } else {
          this.loading = false;
          this.smeListGridOptions.api?.setRowData(
            this.createRowData(result.data.content)
          );
        }
      },
      (error) => {
        this.loading = false;
        this._toastMessageService.alert(
          'error',
          'Fail to getting leads data, try after some time.'
        );
        console.log('Error during getting Leads data. -> ', error);
      }
    );
  }

  smeCreateColumnDef() {
    return [
      {
        field: 'selection',
        headerName: '',
        headerCheckboxSelection: true,
        checkboxSelection: true,
        width: 50,
        pinned: 'left',
        lockPosition: true,
        suppressMovable: false,
        cellRenderer: (params) => { },
      },
      {
        headerName: 'Mobile No',
        field: 'mobileNumber',
        width: 120,
        suppressMovable: true,
        pinned: 'left',
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Name',
        field: 'name',
        width: 180,
        suppressMovable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Calling No',
        field: 'callingNumber',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Official Mail ID ',
        field: 'email',
        width: 180,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Komm ID',
        field: 'kommId',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Roles',
        field: 'roles',
        width: 180,
        display: 'flex',
        suppressMovable: true,
        wrapText: true,
        autoHeight: true,
        cellStyle: {
          'white-space': 'normal',
          'overflow-wrap': 'break-word',
          textAlign: 'center',
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
        },
      },
      {
        headerName: 'Assigned Services',
        field: 'serviceType',
        width: 120,
        display: 'flex',
        suppressMovable: true,
        wrapText: true,
        autoHeight: true,
        cellStyle: {
          'white-space': 'normal',
          'overflow-wrap': 'break-word',
          textAlign: 'center',
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
        },
        // cellRenderer: function (params: any) {
        //   return
        // }
      },
      {
        headerName: 'Parent Name',
        field: 'parentName',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Language Proficiency',
        field: 'languages',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Update',
        field: '',
        width: 100,
        suppressMovable: true,
        pinned: 'right',
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },

        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Click to edit sme"
          style="border: none; background: transparent; font-size: 14px; cursor:pointer;color:#2199e8;">
          <i class="fa-sharp fa-solid fa-pen fa-xs" data-action-type="edit"> Edit</i> 
           </button>`;
        },
      },
      {
        headerName: 'Convert To Lead Partner',
        field: '',
        width: 120,
        suppressMovable: true,
        pinned: 'right',
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },

        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Click to Lead Partner"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer; color:#000000;">
          <i class="fa-solid fa-person-walking-arrow-loop-left" data-action-type="ConvertToLeadPartner"></i>
           </button>`;
        },
      },
    ];
  }
  public rowSelection: 'single' | 'multiple' = 'multiple';
  rowMultiSelectWithClick: true;

  createRowData(data: any) {
    var smeArray = [];
    return data;
  }

  onSmeRowClicked(params: any) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'edit': {
          this.editAddSme(params.data);
          break;
        }
        case 'ConvertToLeadPartner': {
          this.ConvertToLeadPartner(params.data);
          break;
        }
      }
    }
  }

  editAddSme(sme) {
    let smeData = {
      type: 'edit',
      data: sme,
    };
    sessionStorage.setItem('smeObject', JSON.stringify(smeData));
    this.router.navigate(['/sme-management-new/edit-resignedsme']);
  }

  ConvertToLeadPartner(data) {
    let dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmation Dialog',
        message: 'Are you sure want to convert this SME to lead partner?',
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'YES') {
        this.loading = true;
        let param = '/resignedSme-to-partner?userId=' + data.userId;

        this.userMsService.postMethod(param, '').subscribe((res: any) => {
          this.loading = false;
          if (res.success) {
            this._toastMessageService.alert('success', 'Converted this resigned SME to lead partner successfully.');
            this.getSmeList();
          } else {
            this._toastMessageService.alert('error', res.message);
          }
        },
          (error) => {
            this.loading = false;
            this._toastMessageService.alert('error', 'Failed convert this resigned SME to lead partner.');
          }
        );
      }
    });
  }

  pageChanged(event: any) {
    this.config.currentPage = event;
    this.searchParam.page = event - 1;
    this.getSmeList();
  }
}
