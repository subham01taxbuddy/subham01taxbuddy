import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GridOptions } from 'ag-grid-community';
import { SmeListDropDownComponent } from 'src/app/modules/shared/components/sme-list-drop-down/sme-list-drop-down.component';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ReportService } from 'src/app/services/report-service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-missed-inbound-calls',
  templateUrl: './missed-inbound-calls.component.html',
  styleUrls: ['./missed-inbound-calls.component.scss']
})
export class MissedInboundCallsComponent implements OnInit {
  loading=false;
  startDate = new FormControl('');
  endDate = new FormControl('');
  toDateMin: any;
  maxDate = new Date(2024,2,31);
  minDate = new Date(2023, 3, 1);
  dailyCallingReport:any;
  config: any;
  searchParam: any = {
    page: 0,
    pageSize: 20,
  };
  statusDropDown:any
  missedInboundCallGridOptions: GridOptions;

  constructor(
    public datePipe: DatePipe,
    private userMsService: UserMsService,
    private reportService: ReportService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private itrService: ItrMsService,
  ) {
    this.startDate.setValue('2023-04-01');
    this.endDate.setValue(new Date());

    this.missedInboundCallGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.inboundCallColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: (params) => { },
      sortable: true,
      filter:true,
    };


    this.config = {
      itemsPerPage: this.searchParam.pageSize,
      currentPage: 1,
      totalItems: null,
    };
  }

  ngOnInit() {
  }

  ownerId: number;
  filerId: number;
  agentId: number;

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

  showMissedInboundCall(){

  }

  inboundCallColumnDef(){
    return[

    ]
  }

  downloadReport(){

  }

  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  resetFilters(){
    this.startDate.setValue('2023-04-01');
    this.endDate.setValue(new Date());
    this?.smeDropDown?.resetDropdown();
    this.showMissedInboundCall();
  }

  setToDateValidation(FromDate) {
    console.log('FromDate: ', FromDate);
    this.toDateMin = FromDate;
  }
}
