import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { UtilsService } from 'app/services/utils.service';

@Component({
  selector: 'app-knowlarity',
  templateUrl: './knowlarity.component.html',
  styleUrls: ['./knowlarity.component.css']
})
export class KnowlarityComponent implements OnInit {

  loading: boolean;
  inbondKnowlarityGridOption: GridOptions;

  constructor(private utilService: UtilsService,  @Inject(LOCALE_ID) private locale: string) {
    this.inbondKnowlarityGridOption = <GridOptions>{
      rowData: [],
      columnDefs: this.createColoumnDef(),
      enableCellChangeFlash: true,
      onGridReady: params => {
      },
      sortable: true,
    };
   }

  ngOnInit() {
    this.getKnowlarityInfo();
  }

  getKnowlarityInfo(){
    let knowlarityInfo = JSON.parse(sessionStorage.getItem('INBOND_KNOWLARITY'));
    console.log('knowlarityInfo -> ',knowlarityInfo)
    // if(this.utilService.isNonEmpty(knowlarityInfo)){
    if(knowlarityInfo instanceof Array && knowlarityInfo.length > 0){
      this.inbondKnowlarityGridOption.api.setRowData(this.createRowData(knowlarityInfo))
    }
  }

  createColoumnDef(){
    return [
     {
      headerName: 'Call Date',
      field: 'callDate',
      width: 150,
      suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
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
      headerName: 'Call Time',
      field: 'callTime',
      width: 150,
      suppressMovable: true,
      filter: "agTextColumnFilter",
      filterParams: {
        filterOptions: ["contains", "notContains"],
        debounceMs: 0
      }
    },
    {
      headerName: 'Call Type',
      field: 'callType',
      width: 180,
      suppressMovable: true,
      filter: "agTextColumnFilter",
      filterParams: {
        filterOptions: ["contains", "notContains"],
        debounceMs: 0
      }
    },
    {
      headerName: 'Agent Number',
      field: 'agentNumber',
      width: 150,
      suppressMovable: true,
      filter: "agTextColumnFilter",
      filterParams: {
        filterOptions: ["contains", "notContains"],
        debounceMs: 0
      }
    },
    {
      headerName: 'Caller Number',
      field: 'callerNumber',
      width: 150,
      suppressMovable: true,
      filter: "agTextColumnFilter",
      filterParams: {
        filterOptions: ["contains", "notContains"],
        debounceMs: 0
      }
    },
    {
      headerName: 'Knowlarity Number',
      field: 'knowlarity_number',
      width: 180,
      suppressMovable: true,
      filter: "agTextColumnFilter",
      filterParams: {
        filterOptions: ["contains", "notContains"],
        debounceMs: 0
      }
    }]
  }

  createRowData(knowlarity){
    console.log('knowlarity -> ', knowlarity);
    var knowlaritysArray = [];
    for (let i = 0; i < knowlarity.length; i++) {  
      let knowlaritysInfo = Object.assign({}, knowlaritysArray[i], {
        callDate: this.utilService.isNonEmpty(knowlarity[i]['Event_Date_Local']) ? knowlarity[i]['Event_Date_Local'] : '-',
        callTime: this.utilService.isNonEmpty(knowlarity[i]['Caller_Channel_Created_Time']) ? knowlarity[i]['Caller_Channel_Created_Time'] : '-',
        callType: this.utilService.isNonEmpty(knowlarity[i]['business_call_type']) ? knowlarity[i]['business_call_type'] : '-',
        agentNumber: this.utilService.isNonEmpty(knowlarity[i]['agent_number']) ? knowlarity[i]['agent_number'] : '-',
        callerNumber: this.utilService.isNonEmpty(knowlarity[i]['caller']) ? knowlarity[i]['caller'] : '-',
        knowlarity_number: this.utilService.isNonEmpty(knowlarity[i]['knowlarity_number']) ? knowlarity[i]['knowlarity_number'] : '-'
      })
      knowlaritysArray.push(knowlaritysInfo);
    }
 // console.log('knowlaritysArra
   return knowlaritysArray;
  }

}
