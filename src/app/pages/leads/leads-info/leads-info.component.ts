import { DatePipe, formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { GridOptions } from 'ag-grid-community';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';
import moment = require('moment');
import { LeadDialogComponent } from '../lead-dialog/lead-dialog.component';
// import { Angular2Csv } from 'angular2-csv/Angular2-csv';

@Component({
  selector: 'app-leads-info',
  templateUrl: './leads-info.component.html',
  styleUrls: ['./leads-info.component.css'],
  providers: [DatePipe]
})
export class LeadsInfoComponent implements OnInit {

  loading: boolean;
  leadsForm: FormGroup;
  maxDate: any = new Date();
  toDateMin: any;
  leadsListGridOptions: GridOptions;
  leadInfo: any = [];

  constructor(private fb: FormBuilder, private userService: UserMsService, @Inject(LOCALE_ID) private locale: string, private dialog: MatDialog,
              private _toastMessageService: ToastMessageService, private datePipe: DatePipe)
   { 
    this.leadsListGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.leadsreateColoumnDef(),
      enableCellChangeFlash: true,
      onGridReady: params => {
        // params.api.sizeColumnsToFit();
      },

      sortable: true,
    };
  }

  ngOnInit() {
    this.leadsForm = this.fb.group({
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required]
    })
  }

  leadsreateColoumnDef(){
    return [
      // {
      //   headerName: 'Id',
      //   field: 'id',
      //   width: 120,
      //   suppressMovable: true,
      //   filter: "agTextColumnFilter",
      //   filterParams: {
      //     filterOptions: ["contains", "notContains"],
      //     debounceMs: 0
      //   }
      // },
      {
        headerName: 'Name',
        field: 'name',
        width: 150,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Mobile No',
        field: 'mobileNumber',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Email',
        field: 'emailAddress',
        width: 180,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }

      },
      {
        headerName: 'City',
        field: 'city',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Created Date',
        field: 'createdDate',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        cellRenderer: (data) => {
          return formatDate(data.value, 'dd/MM/yyyy', this.locale)
        },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      
      {
        headerName: 'Channel',
        field: 'channel',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Service',
        field: 'service',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Assigned To',
        field: 'assignedTo',
        width: 180,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      // {
      //   headerName: 'Source',
      //   field: 'source',
      //   width: 200,
      //   suppressMovable: true,
      //   cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
      //   filter: "agTextColumnFilter",
      //   filterParams: {
      //     filterOptions: ["contains", "notContains"],
      //     debounceMs: 0
      //   }
      // },
      // {
      //   headerName: 'Status',
      //   field: 'status',
      //   width: 120,
      //   suppressMovable: true,
      //   cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
      //   filter: "agTextColumnFilter",
      //   filterParams: {
      //     filterOptions: ["contains", "notContains"],
      //     debounceMs: 0
      //   }
      // },
      // {
      //   headerName: 'Follow Up Date',
      //   field: 'followUpDate',
      //   width: 120,
      //   suppressMovable: true,
      //   cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
      //   // cellRenderer: (data) => {
      //   //   if (this.utilService.isNonEmpty(data.value)) {
      //   //     return formatDate(data.value, 'dd/MM/yyyy', this.locale)
      //   //   }
      //   // }
      // },
      {
        headerName: 'Status',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
            return `<button type="button" class="action_icon add_button" title="Status">
            <i class="fa fa-user-circle-o" aria-hidden="true" data-action-type="status"></i>
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
        headerName: 'Source',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
            return `<button type="button" class="action_icon add_button" title="Source of leads">
            <i class="fa fa-paper-plane-o" aria-hidden="true" data-action-type="source"></i>
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
          // if ((params.data.modeOfPayment === 'Cash' || params.data.paymentStatus === 'Paid') || (params.data.modeOfPayment === 'Cash' && params.data.paymentStatus === 'Paid')) {
          //   return `<button type="button" class="action_icon add_button" disabled title="Delete Invoice">
          //   <i class="fa fa-trash" aria-hidden="true" data-action-type="delete-invoice"></i>
          //  </button>`;
          // } else {
            return `<button type="button" class="action_icon add_button" title="Update Status">
            <i class="fa fa-pencil" aria-hidden="true" data-action-type="update-status"></i>
           </button>`;
          // }


        },
        width: 60,
        pinned: 'right',
        cellStyle: function (params) {
          // if ((params.data.modeOfPayment === 'Cash' || params.data.paymentStatus === 'Paid') || (params.data.modeOfPayment === 'Cash' && params.data.paymentStatus === 'Paid')) {
          //   return {
          //     textAlign: 'center', display: 'flex',
          //     'align-items': 'center',
          //     'justify-content': 'center',
          //     backgroundColor: '#dddddd',
          //     color: '#dddddd',
          //   }
          // } else {
            return {
              textAlign: 'center', display: 'flex',
              'align-items': 'center',
              'justify-content': 'center'
            }
          // }

        },
      }

    ]
  }

  setToDateValidation(FromDate) {
    this.toDateMin = FromDate;
  }

  showLeadsInfo(){
    if(this.leadsForm.valid){
      let oneDayAddedEndData = new Date(this.leadsForm['controls'].toDate.value);
      oneDayAddedEndData.setDate(oneDayAddedEndData.getDate() + 1);
      console.log('oneDayAddedEndData: ',oneDayAddedEndData)

      let startDate = (moment(this.leadsForm['controls'].fromDate.value).add(330, 'm').toDate()).toISOString();  //this.leadsForm.value.fromDate;
      // let endDate = (moment(this.leadsForm['controls'].toDate.value).add(330, 'm').toDate()).toISOString();    //this.leadsForm.value.toDate;
      let endDate = (moment(oneDayAddedEndData).add(330, 'm').toDate()).toISOString();   

      console.log('startDate: ',startDate, ' endDate: ',endDate);
      this.loading = true;
      let param = '/lead-user-details-by-date?date1='+startDate+'&date2='+endDate;
      this.userService.getMethod(param).subscribe((result: any)=>{
        console.log('result -> ',result);
        this.loading = false;
        this.leadsListGridOptions.api.setRowData(this.createRowData(result));
        this.leadInfo = result;
      }, 
      error=>{
        this.loading = false;
        this._toastMessageService.alert("error", "Fail to getting leads data, try after some time.");
        console.log('Error during getting Leads data. -> ', error)
      })
    }
  }

  createRowData(leadsInfo){
    console.log('leadsInfo ->> ',leadsInfo);
    var leadsArray = [];
    for(let i=0; i< leadsInfo.length; i++){
      var sourcesInfo = [];
       for(let j=0; j<leadsInfo[i].source.length; j++){
        sourcesInfo.push(leadsInfo[i].source[j]);
        console.log('sourcesInfo '+j+'-> ',sourcesInfo[j]);
       }
       console.log('sourcesInfo ',sourcesInfo);

       var statusInfo = [];
       for(let k=0; k<leadsInfo[i].status.length; k++){
        statusInfo.push(leadsInfo[i].status[k]);
        console.log('statusInfo '+k+'-> ',statusInfo[k]);
       }
       console.log('statusInfo ',statusInfo);

      let updatedLeads = Object.assign({}, leadsArray[i], {id: leadsInfo[i].id, name:leadsInfo[i].name, createdDate: leadsInfo[i].createdDate, mobileNumber: leadsInfo[i].mobileNumber, emailAddress: leadsInfo[i].emailAddress, city: leadsInfo[i].otherData.City, channel: leadsInfo[i].channel, service: leadsInfo[i].service, assignedTo: leadsInfo[i].assignedTo, source: sourcesInfo, status: statusInfo, followUpDate: leadsInfo[i].status.followUpDate })  //leadsInfo[i].source[0].name
      leadsArray.push(updatedLeads)
    }
    console.log('leadsArray -> ',leadsArray)
    return leadsArray;
  }

  onLeadsRowClicked(params){
    console.log(params)
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'status': {
         this.openDialog('Lead Status','status', params.data);
          break;
        }
        case 'source': {
          this.openDialog('Lead Sources','source', params.data)
          break;
        }
        case 'update-status': {
          this.openDialog('Update Status','update-status', params.data)
          break;
        }
      }
    }
  }

  openDialog(titile, key, data){
      console.log('key-> ',key+' data-> ',data);
      let disposable = this.dialog.open(LeadDialogComponent, {
        width: '60%',
        height: 'auto',
        data: {
          title: titile,
         // submitBtn: windowBtn,
          leadData: data,
          mode: key
        }
      })
  }

  downloadInfo(){
    if(this.leadsForm.valid){
      var leadIterableArray = [];

      let tableHeader = ['Name', 'Mobile No', 'Email','City','Created Date', 'Channel', 'Service', 'Source', 'Status', 'Status Created Date', 'Status Follow Up Date']; 
      leadIterableArray.push(tableHeader);
      console.log('leadsInfo ->> ',this.leadInfo);
      var leadsArray = [];
      for(let i=0; i< this.leadInfo.length; i++){
        var sources = '';
        // for(let j=0; j<this.leadInfo[i].source.length; j++){
          sources = this.leadInfo[i].source[this.leadInfo[i].source.length - 1].name+' '+this.datePipe.transform(this.leadInfo[i].source[this.leadInfo[i].source.length - 1].createdDate, 'dd/MM/yyyy, hh:mm a'); 
         //}
         console.log('sources ',sources);
  
         var status = '';
         var statusCreatedDate = '';
         var statusFollwUpDate = '';
        //  for(let k=0; k<this.leadInfo[i].status.length; k++){
          status = this.leadInfo[i].status[this.leadInfo[i].status.length - 1].status;
          statusCreatedDate = this.datePipe.transform(this.leadInfo[i].status[this.leadInfo[i].status.length - 1].createdDate, 'dd/MM/yyyy, hh:mm a') ;
          statusFollwUpDate = this.datePipe.transform(this.leadInfo[i].status[this.leadInfo[i].status.length - 1].followUpDate, 'dd/MM/yyyy, hh:mm a');
        //  }
         console.log('statusInfo ',status+' '+statusCreatedDate+' '+statusFollwUpDate);
         let leadData = [this.leadInfo[i].name, this.leadInfo[i].mobileNumber,this.leadInfo[i].emailAddress,this.leadInfo[i].otherData.City, this.datePipe.transform(this.leadInfo[i].createdDate, 'dd/MM/yyyy, hh:mm a') ,this.leadInfo[i].channel,this.leadInfo[i].services,
         sources, status, statusCreatedDate, statusFollwUpDate]
         leadIterableArray.push(leadData);
      }
      console.log('leadIterableArray -> ',leadIterableArray);
      const blob = new Blob([this.makeCsv(leadIterableArray)]);
      const a = document.createElement('a');
      a.download = 'lead.csv';
      a.href = URL.createObjectURL(blob);
      a.click();
    }
  }

  makeCsv(rows){
    return rows.map(r => r.join(",")).join("\n");
  }

}
