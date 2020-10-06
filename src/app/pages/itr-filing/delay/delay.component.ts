import { Component, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { ItrMsService } from 'app/services/itr-ms.service';
import { ToastMessageService } from 'app/services/toast-message.service';

@Component({
  selector: 'app-delay',
  templateUrl: './delay.component.html',
  styleUrls: ['./delay.component.css']
})
export class DelayComponent implements OnInit {

  loading: boolean;
  delayItrGridOptions: GridOptions;
  delayedInfo: any=[];
  constructor(private itrMsService: ItrMsService, private _toastMessageService: ToastMessageService) {

    this.delayItrGridOptions = <GridOptions>{
      rowData: this.createDelayRowData([]),
      columnDefs: this.delayCreateColoumnDef(),
      enableCellChangeFlash: true,
      onGridReady: params => {
      },
      sortable: true
    };
   }

  ngOnInit() {
    this.getDelayedItrData();
  }

  getDelayedItrData(){
    let param = '/itrByAckStatus';
    this.itrMsService.getMethod(param).subscribe((res: any)=>{
        console.log('res: ',res);
        this.delayItrGridOptions.api.setRowData(this.createDelayRowData(res));
    },
    error=>{
      console.log('error: ',error);
      if(error.error.title === "Not_found"){
        this._toastMessageService.alert("error", "Delay itr record not found.");
      }
    })
  }

  createDelayRowData(data){
    console.log('Data ===>>> ',data[0])
   // console.log('Data family ===>>> ',data[0].family)
    const newData = [];
    for (let i = 0; i < data.length; i++) {
      newData.push({
        itrId: data[i].itrId,
        //name: data[i].family[0].fName+' '+data[i].family[0].lName,
        userId: data[i].userId,
        assessmentYear: data[i].assessmentYear,
        panNumber: data[i].panNumber,
        ackStatus: data[i].ackStatus ? data[i].ackStatus : '',
        email: data[i].email,
        mobile: data[i].contactNumber
      });
    }
    console.log('Return data: ',newData)
    return newData;
  }

  delayCreateColoumnDef() {
    return [
      {
        headerName: 'ITR ID',
        field: 'itrId',
        sortable: true,
        width: 80,
        pinned: 'left',
      },
      // {
      //   headerName: "Name",
      //   field: "name",
      //   sortable: true,
      //   filterParams: {
      //     filterOptions: ["contains", "notContains"],
      //     debounceMs: 0
      //   }
      // },
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
        headerName: "Mobile",
        field: "mobile",
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
        headerName: 'Status',
        width: 100,
        sortable: true,
        pinned: 'right',
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Change status" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-weixin" aria-hidden="true" data-action-type="changeStatus"></i>
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

  public onRowClicked(params) {
    console.log(params)
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'changeStatus': {
          this.changeStatus(params.data);
          break;
       
      }
    }
  } 
 }

 changeStatus(itrData){
  console.log('change itr data: ',itrData);
  this.loading = true;
  https://api.taxbuddy.com/itr/enableItrFilling/{userId}/{itrId}/{assessmentYear}
    let param = '/enableItrFilling/'+itrData.userId+'/'+itrData.itrId+'/'+itrData.assessmentYear;
    this.itrMsService.getMethod(param).subscribe((res: any)=>{
      this.loading = false;
        console.log('res: ',res);
        this._toastMessageService.alert("success", "ITR status change successfully.");
        this.getDelayedItrData();
    },
    error=>{
      this.loading = false;
      this._toastMessageService.alert("error", "There is some issue to change status.");
    })
 }

}
