import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ReportService } from 'src/app/services/report-service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UtilsService } from 'src/app/services/utils.service';
import { JsonToCsvService } from '../../shared/services/json-to-csv.service';
import { GridOptions } from 'ag-grid-community';
import { SmeListDropDownComponent } from '../../shared/components/sme-list-drop-down/sme-list-drop-down.component';
import { environment } from 'src/environments/environment';
import { GenericCsvService } from 'src/app/services/generic-csv.service';

@Component({
  selector: 'app-revenue-report',
  templateUrl: './revenue-report.component.html',
  styleUrls: ['./revenue-report.component.scss']
})
export class RevenueReportComponent implements OnInit {
  loading = false;
  leaderView = new FormControl('');
  ownerView = new FormControl('');
  loggedInSme: any;
  roles: any;
  revenueReport: any;
  config: any;
  searchParam: any = {
    page: 0,
    pageSize: 15,
  };
  revenueReportGridOptions: GridOptions;
  disableCheckboxes = false;

  constructor(
    private reportService: ReportService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private genericCsvService: GenericCsvService,
  ) {

    this.revenueReportGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.reportsCodeColumnDef('reg'),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: (params) => { },
      sortable: true,
      filter: true,
    };

    this.config = {
      itemsPerPage: this.searchParam.pageSize,
      currentPage: 1,
      totalItems: null,
    };
  }

  ngOnInit() {
    this.loggedInSme = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
    this.roles = this.loggedInSme[0]?.roles;

    if (this.roles?.includes('ROLE_OWNER')) {
      this.ownerId = this.loggedInSme[0].userId;
    } else if (!this.roles?.includes('ROLE_ADMIN') && !this.roles?.includes('ROLE_LEADER')) {
      this.filerId = this.loggedInSme[0].userId;
    }
    this.showReports()
  }

  ownerId: number;
  filerId: number;
  agentId: number;
  leaderId: number;

  fromSme(event, isOwner) {
    console.log('sme-drop-down', event, isOwner);
    if (isOwner) {
      this.ownerId = event ? event.userId : null;
      this.disableCheckboxes = true
    } else {
      this.filerId = event ? event.userId : null;
    }
    if (this.filerId) {
      this.agentId = this.filerId;

    } else if (this.ownerId) {
      this.agentId = this.ownerId;

    } else {
      let loggedInId = this.utilsService.getLoggedInUserID();
      this.agentId = loggedInId;
    }

    if (this.ownerId || this.filerId) {
      this.disableCheckboxes = true;
    } else {
      this.disableCheckboxes = false;
    }

  }

  showReports(pageChange?) {
    // 'http://localhost:9055/report/calling-report/revenue-report?page=0&pageSize=100&filerUserId=1111'
    //'http://localhost:9055/report/calling-report/revenue-report?page=0&pageSize=100&ownerView=true'
    this.loading = true;
    let loggedInId = this.utilsService.getLoggedInUserID();

    let param = '';
    let userFilter = '';
    if (this.ownerId && !this.filerId && !pageChange) {
      userFilter += `&ownerUserId=${this.ownerId}`;
      this.searchParam.page = 0;
      this.config.currentPage = 1
    }

    if (this.ownerId && pageChange) {
      userFilter += `&ownerUserId=${this.ownerId}`;
    }

    if (this.filerId && !pageChange) {
      userFilter += `&filerUserId=${this.filerId}`;
      this.searchParam.page = 0;
      this.config.currentPage = 1;
    }

    if (this.filerId && pageChange) {
      userFilter += `&filerUserId=${this.filerId}`;
    }

    if (this.leaderId && !pageChange) {
      userFilter += `&leaderUserId=${this.leaderId}`;
      this.searchParam.page = 0;
      this.config.currentPage = 1;
    }

    if (this.leaderId && pageChange) {
      userFilter += `&leaderUserId=${this.leaderId}`;
    }

    let viewFilter = '';
    if (this.ownerView.value === true && !pageChange) {
      this.searchParam.page = 0;
      this.config.currentPage = 1;
      viewFilter += `&ownerView=${this.ownerView.value}`
    }
    if (this.ownerView.value === true && pageChange) {
      viewFilter += `&ownerView=${this.ownerView.value}`
    }

    if (this.leaderView.value === true && !pageChange) {
      this.searchParam.page = 0;
      this.config.currentPage = 1;
      viewFilter += `&leaderView=${this.leaderView.value}`
    }

    if (this.leaderView.value === true && pageChange) {
      viewFilter += `&leaderView=${this.leaderView.value}`
    }

    let data = this.utilsService.createUrlParams(this.searchParam);

    param = `/calling-report/revenue-report?${data}${userFilter}${viewFilter}`;

    this.reportService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      if (response.success) {
        this.revenueReport = response?.data?.content;
        this.config.totalItems = response?.data?.totalElements;
        this.revenueReportGridOptions.api?.setRowData(this.createRowData(this.revenueReport));


      } else {
        this.loading = false;
        this.config.totalItems = 0;
        this.revenueReportGridOptions.api?.setRowData(this.createRowData([]));
        this._toastMessageService.alert("error", response.message);
      }
    }, (error) => {
      this.config.totalItems = 0;
      this.revenueReportGridOptions.api?.setRowData(this.createRowData([]));
      this.loading = false;
      this._toastMessageService.alert("error", "Error");
    });
  }

  createRowData(revenueData) {
    console.log('revenueRepoInfo -> ', revenueData);
    var revenueRepoInfoArray = [];
    for (let i = 0; i < revenueData.length; i++) {
      let agentReportInfo = Object.assign({}, revenueRepoInfoArray[i], {
        filerName: revenueData[i].filerName,
        itr1: revenueData[i].itr1,
        itr2: revenueData[i].itr2,
        itr3: revenueData[i].itr3,
        itr4: revenueData[i].itr4,
        otherItr: revenueData[i].otherItr,
        itrU: revenueData[i].itrU,
        itr1_payment: revenueData[i].itr1_payment,
        itr2_payment: revenueData[i].itr2_payment,
        itr3_payment: revenueData[i].itr3_payment,
        itr4_payment: revenueData[i].itr4_payment,
        otherItr_payment: revenueData[i].otherItr_payment,
        itrU_payment: revenueData[i].itrU_payment,
        no_of_itr_up_to_50: revenueData[i].no_of_itr_up_to_50,
        collection_up_to_50: revenueData[i].collection_up_to_50,
        no_of_itr_51_to_100: revenueData[i].no_of_itr_51_to_100,
        collection_51_to_100: revenueData[i].collection_51_to_100,
        no_of_itr_above_100: revenueData[i].no_of_itr_above_100,
        collection_above_100: revenueData[i].collection_above_100,
        internal_external: revenueData[i].internal_external || '-',
        ownerName: revenueData[i].ownerName,
        leaderName: revenueData[i].leaderName,
      })
      revenueRepoInfoArray.push(agentReportInfo);
    }
    console.log('revenueRepoInfoArray-> ', revenueRepoInfoArray)
    return revenueRepoInfoArray;
  }

  reportsCodeColumnDef(view) {
    return [
      {
        headerName: (view === 'leader' ? 'Leader Name' : (view === 'owner' ? 'Owner Name And Team' : 'Filer Name')),
        field: (view === 'leader' ? 'leaderName' : (view === 'owner' ? 'ownerName' : 'filerName')),
        sortable: true,
        width: 150,
        pinned: 'left',
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
      },
      {
        headerName: 'ITR wise filing count',
        headerClass: 'centered-header',
        children: [
          {
            headerName: 'ITR 1',
            field: 'itr1',
            sortable: true,
            width: 100,
            suppressMovable: true,
            cellStyle: { textAlign: 'center' },
          },
          {
            headerName: 'ITR 2',
            field: 'itr2',
            sortable: true,
            width: 100,
            suppressMovable: true,
            cellStyle: { textAlign: 'center' },
          },
          {
            headerName: 'ITR 3',
            field: 'itr3',
            sortable: true,
            width: 100,
            suppressMovable: true,
            cellStyle: { textAlign: 'center' },
          },
          {
            headerName: 'ITR 4',
            field: 'itr4',
            sortable: true,
            width: 100,
            suppressMovable: true,
            cellStyle: { textAlign: 'center' },
          },
          {
            headerName: 'Other ITR',
            field: 'otherItr',
            sortable: true,
            width: 110,
            suppressMovable: true,
            cellStyle: { textAlign: 'center' },
          },
          {
            headerName: 'ITR U',
            field: 'itrU',
            sortable: true,
            width: 100,
            suppressMovable: true,
            cellStyle: { textAlign: 'center' },
          },
        ],

      },
      {
        headerName: '',
        headerClass: 'vertical-line',
        width: 0,
        suppressMovable: true,
        cellStyle: {
          borderRight: '3px solid #ccc',
          backgroundColor: '#fff',
        },
      },
      {
        headerName: 'ITR wise payment collection',
        headerClass: 'centered-header',
        children: [
          {
            headerName: 'ITR 1',
            field: 'itr1_payment',
            sortable: true,
            width: 100,
            suppressMovable: true,
            cellStyle: { textAlign: 'center' },
          },
          {
            headerName: 'ITR 2',
            field: 'itr2_payment',
            sortable: true,
            width: 100,
            suppressMovable: true,
            cellStyle: { textAlign: 'center' },
          },
          {
            headerName: 'ITR 3',
            field: 'itr3_payment',
            sortable: true,
            width: 100,
            suppressMovable: true,
            cellStyle: { textAlign: 'center' },
          },
          {
            headerName: 'ITR 4',
            field: 'itr4_payment',
            sortable: true,
            width: 100,
            suppressMovable: true,
            cellStyle: { textAlign: 'center' },
          },
          {
            headerName: 'Other ITR',
            field: 'otherItr_payment',
            sortable: true,
            width: 110,
            suppressMovable: true,
            cellStyle: { textAlign: 'center' },
          },
          {
            headerName: 'ITR U',
            field: 'itrU_payment',
            sortable: true,
            width: 100,
            suppressMovable: true,
            cellStyle: { textAlign: 'center' },
          },
        ]
      },
      {
        headerName: '',
        headerClass: 'vertical-line',
        width: 0,
        suppressMovable: true,
        cellStyle: {
          borderRight: '3px solid #ccc',
          backgroundColor: '#fff',
        },
      },
      {
        headerName: 'No of filing & collection as per slabs',
        headerClass: 'centered-header',
        children: [
          {
            headerName: 'No of ITR Up to 50 ITR',
            field: 'no_of_itr_up_to_50',
            sortable: true,
            width: 160,
            suppressMovable: true,
            cellStyle: { textAlign: 'center' },
          },
          {
            headerName: 'Collection up to 50',
            field: 'collection_up_to_50',
            sortable: true,
            width: 160,
            suppressMovable: true,
            cellStyle: { textAlign: 'center' },

          },
          {
            headerName: 'No of ITR from 51 to 100 ITR',
            field: 'no_of_itr_51_to_100',
            sortable: true,
            width: 190,
            suppressMovable: true,
            cellStyle: { textAlign: 'center' },

          },
          {
            headerName: 'Collection from 51 to 100 ITR',
            field: 'collection_51_to_100',
            sortable: true,
            width: 200,
            suppressMovable: true,
            cellStyle: { textAlign: 'center' },

          },
          {
            headerName: 'No of ITR above 100',
            field: 'no_of_itr_above_100',
            sortable: true,
            width: 160,
            suppressMovable: true,
            cellStyle: { textAlign: 'center' },

          },
          {
            headerName: 'Collection from above 100 ITR',
            field: 'collection_above_100',
            sortable: true,
            width: 200,
            suppressMovable: true,
            cellStyle: { textAlign: 'center' },

          },
        ]
      },
      {
        headerName: '',
        headerClass: 'vertical-line',
        width: 0,
        suppressMovable: true,
        cellStyle: {
          borderRight: '3px solid #ccc',
          backgroundColor: '#fff',
        },
      },
      {
        headerName: 'Internal/ External',
        field: 'internal_external',
        hide: view === 'leader' ? true : false,
        sortable: true,
        width: 140,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },

      },
      {
        headerName: 'Owner Name',
        field: 'ownerName',
        hide: view === 'leader' ? true : false,
        sortable: true,
        width: 140,
        pinned: 'right',
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Leader Name',
        field: 'leaderName',
        sortable: true,
        width: view === 'leader' ? 200 : 140,
        pinned: 'right',
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
    ]
  }

  async downloadReport() {
    this.loading = true;
    let loggedInId = this.utilsService.getLoggedInUserID();
    let param = ''
    let userFilter = '';
    if (this.ownerId && !this.filerId) {
      userFilter += `&ownerUserId=${this.ownerId}`;
    }
    if (this.filerId) {
      userFilter += `&filerUserId=${this.filerId}`;
    }

    if (this.leaderId) {
      userFilter += `&leaderUserId=${this.leaderId}`;
    }

    let viewFilter = '';
    if (this.ownerView.value === true) {
      viewFilter += `&ownerView=${this.ownerView.value}`
    }
    if (this.leaderView.value === true) {
      viewFilter += `&leaderView=${this.leaderView.value}`
    }

    param = `/calling-report/revenue-report?${userFilter}${viewFilter}`;

    await this.genericCsvService.downloadReport(environment.url + '/report', param, 0,'revenue-report');
    this.loading = false;
  }

  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  resetFilters() {
    this.searchParam.page = 0;
    this.searchParam.pageSize = 15;
    this.config.currentPage = 1
    this.leaderView.enable();
    this.ownerView.enable();
    this.leaderView.setValue(false);
    this.ownerView.setValue(false);
    this?.smeDropDown?.resetDropdown();
    if (this.roles?.includes('ROLE_OWNER')) {
      this.ownerId = this.loggedInSme[0].userId;
    } else if (!this.roles?.includes('ROLE_ADMIN') && !this.roles?.includes('ROLE_LEADER')) {
      this.filerId = this.loggedInSme[0].userId;
    }
    this.showReports();
    this.revenueReportGridOptions.api?.setRowData(this.createRowData(this.revenueReport));
    this.revenueReportGridOptions.api.setColumnDefs(this.reportsCodeColumnDef(''))
  }

  handleLeaderViewChange(): void {
    if (this.leaderView.value) {
      this.ownerView.disable();
      this.showReports();
      this.revenueReportGridOptions.api?.setRowData(this.createRowData(this.revenueReport));
      this.revenueReportGridOptions.api.setColumnDefs(this.reportsCodeColumnDef('leader'))
      this.reportsCodeColumnDef('leader');
    } else {
      this.ownerView.enable();
      this.showReports();
      this.revenueReportGridOptions.api?.setRowData(this.createRowData(this.revenueReport));
      this.revenueReportGridOptions.api.setColumnDefs(this.reportsCodeColumnDef(''))
    }
  }

  handleOwnerViewChange(): void {
    if (this.ownerView.value) {
      this.leaderView.disable();
      this.showReports();
      this.revenueReportGridOptions.api?.setRowData(this.createRowData(this.revenueReport));
      this.revenueReportGridOptions.api.setColumnDefs(this.reportsCodeColumnDef('owner'))
      this.reportsCodeColumnDef('owner')
    } else {
      this.leaderView.enable();
      this.showReports();
      this.revenueReportGridOptions.api?.setRowData(this.createRowData(this.revenueReport));
      this.revenueReportGridOptions.api.setColumnDefs(this.reportsCodeColumnDef(''))
    }
  }

  pageChanged(event) {
    let pageChange = event
    this.config.currentPage = event;
    this.searchParam.page = event - 1;
    this.showReports(pageChange);
  }
}
