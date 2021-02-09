import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GridOptions } from 'ag-grid-community';
import { UserMsService } from 'app/services/user-ms.service';
import moment = require('moment');

@Component({
  selector: 'app-leads-info',
  templateUrl: './leads-info.component.html',
  styleUrls: ['./leads-info.component.css']
})
export class LeadsInfoComponent implements OnInit {

  loading: boolean;
  leadsForm: FormGroup;
  maxDate: any = new Date();
  toDateMin: any;
  leadsListGridOptions: GridOptions;

  constructor(private fb: FormBuilder, private userService: UserMsService, @Inject(LOCALE_ID) private locale: string) { 
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
      {
        headerName: 'Id',
        field: 'id',
        width: 120,
        suppressMovable: true,
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
      {
        headerName: 'Source',
        field: 'source',
        width: 200,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Status',
        field: 'status',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Follow Up Date',
        field: 'followUpDate',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        // cellRenderer: (data) => {
        //   if (this.utilService.isNonEmpty(data.value)) {
        //     return formatDate(data.value, 'dd/MM/yyyy', this.locale)
        //   }
        // }
      },
      {
        headerName: 'Update Status',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          if ((params.data.modeOfPayment === 'Cash' || params.data.paymentStatus === 'Paid') || (params.data.modeOfPayment === 'Cash' && params.data.paymentStatus === 'Paid')) {
            return `<button type="button" class="action_icon add_button" disabled title="Delete Invoice">
            <i class="fa fa-trash" aria-hidden="true" data-action-type="delete-invoice"></i>
           </button>`;
          } else {
            return `<button type="button" class="action_icon add_button" title="Delete Invoice">
            <i class="fa fa-trash" aria-hidden="true" data-action-type="delete-invoice"></i>
           </button>`;
          }


        },
        width: 80,
        pinned: 'right',
        cellStyle: function (params) {
          if ((params.data.modeOfPayment === 'Cash' || params.data.paymentStatus === 'Paid') || (params.data.modeOfPayment === 'Cash' && params.data.paymentStatus === 'Paid')) {
            return {
              textAlign: 'center', display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              backgroundColor: '#dddddd',
              color: '#dddddd',
            }
          } else {
            return {
              textAlign: 'center', display: 'flex',
              'align-items': 'center',
              'justify-content': 'center'
            }
          }

        },
      }

    ]
  }

  setToDateValidation(FromDate) {
    this.toDateMin = FromDate;
  }

  showLeadsInfo(){
    if(this.leadsForm.valid){
      let startDate = (moment(this.leadsForm['controls'].fromDate.value).add(330, 'm').toDate()).toISOString();  //this.leadsForm.value.fromDate;
      let endDate = (moment(this.leadsForm['controls'].toDate.value).add(330, 'm').toDate()).toISOString();    //this.leadsForm.value.toDate;
      console.log('startDate: ',startDate, ' endDate: ',endDate);
      let param = '/lead-user-details-by-date?date1='+startDate+'&date2='+endDate;
      console.log()
      this.userService.getMethod(param).subscribe((result: any)=>{
        console.log('result -> ',result);
        this.leadsListGridOptions.api.setRowData(this.createRowData(result))
      }, 
      error=>{
        console.log('Error during getting Leads data. -> ', error)
      })
    }
  }

  createRowData(leadsInfo){
    console.log('leadsInfo ->> ',leadsInfo);
    var leadsArray = [];
    for(let i=0; i< leadsInfo.length; i++){
      let updatedLeads = Object.assign({}, leadsArray[i], {id: leadsInfo[i].id, createdDate: leadsInfo[i].createdDate, mobileNumber: leadsInfo[i].mobileNumber, emailAddress: leadsInfo[i].emailAddress, city: leadsInfo[i].otherData.City, channel: leadsInfo[i].channel, service: leadsInfo[i].service, assignedTo: leadsInfo[i].assignedTo, source: leadsInfo[i].source[0].name, status: leadsInfo[i].status.status, followUpDate: leadsInfo[i].status.followUpDate })
      leadsArray.push(updatedLeads)
    }
    console.log('leadsArray -> ',leadsArray)
    return leadsArray;
  }

}
