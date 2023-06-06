import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ReportService } from 'src/app/services/report-service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UtilsService } from 'src/app/services/utils.service';
import { JsonToCsvService } from '../../shared/services/json-to-csv.service';
import { GridOptions } from 'ag-grid-community';

@Component({
  selector: 'app-revenue-report',
  templateUrl: './revenue-report.component.html',
  styleUrls: ['./revenue-report.component.scss']
})
export class RevenueReportComponent implements OnInit {
  loading=false;
  leaderView =new FormControl('');
  ownerView = new FormControl('');
  loggedInSme: any;
  roles: any;
  itrFillingReport: any;
  config: any;
  searchParam: any = {
    page: 0,
    pageSize: 20,
  };
  revenueReportGridOptions:GridOptions;

  constructor(
    private reportService: ReportService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private itrService: ItrMsService,
    private jsonToCsvService: JsonToCsvService
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
    } else if(!this.roles?.includes('ROLE_ADMIN') && !this.roles?.includes('ROLE_LEADER')) {
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

  }
  showReports() {

  }

  createRowData(revenueData) {
    // console.log('fillingRepoInfo -> ', fillingData);
    // var fillingRepoInfoArray = [];
    // for (let i = 0; i < fillingData.length; i++) {
    //   let agentReportInfo = Object.assign({}, fillingRepoInfoArray[i], {
    //     filerName: fillingData[i].filerName,
    //     itr1: fillingData[i].itr1,
    //     itr2: fillingData[i].itr2,
    //     itr3: fillingData[i].itr3,
    //     itr4: fillingData[i].itr4,
    //     otherItr: fillingData[i].otherItr,
    //     itrU: fillingData[i].itrU,
    //     total: fillingData[i].total,
    //     ownerName: fillingData[i].ownerName,
    //     leaderName: fillingData[i].leaderName,
    //   })
    //   fillingRepoInfoArray.push(agentReportInfo);
    // }
    // console.log('fillingRepoInfoArray-> ', fillingRepoInfoArray)
    // return fillingRepoInfoArray;
  }

  reportsCodeColumnDef(view) {
    return[

    ]}

    downloadReport() {}
    resetFilters(){}

    handleLeaderViewChange(): void {
      if (this.leaderView.value) {
        this.ownerView.disable();
        this.showReports();
        // this.revenueReportGridOptions.api?.setRowData(this.createRowData(this.itrFillingReport));
        // this.revenueReportGridOptions.api.setColumnDefs(this.reportsCodeColumnDef('leader'))
        // this.reportsCodeColumnDef('leader');
      } else {
        this.ownerView.enable();
        this.showReports();
        // this.revenueReportGridOptions.api?.setRowData(this.createRowData(this.itrFillingReport));
        // this.revenueReportGridOptions.api.setColumnDefs(this.reportsCodeColumnDef(''))
      }
    }

    handleOwnerViewChange(): void {
      if (this.ownerView.value) {
        this.leaderView.disable();
        this.showReports();
        // this.revenueReportGridOptions.api?.setRowData(this.createRowData(this.itrFillingReport));
        // this.revenueReportGridOptions.api.setColumnDefs(this.reportsCodeColumnDef('owner'))
        // this.reportsCodeColumnDef('owner')
      } else {
        this.leaderView.enable();
        this.showReports();
        // this.revenueReportGridOptions.api?.setRowData(this.createRowData(this.itrFillingReport));
        // this.revenueReportGridOptions.api.setColumnDefs(this.reportsCodeColumnDef(''))
      }
    }
}
