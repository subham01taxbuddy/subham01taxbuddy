import { Component, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid-community';

@Component({
  selector: 'app-knowlarity',
  templateUrl: './knowlarity.component.html',
  styleUrls: ['./knowlarity.component.css']
})
export class KnowlarityComponent implements OnInit {

  loading: boolean;
  inbondKnowlarityGridOption: GridOptions;

  constructor() {
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
  }

  createColoumnDef(){
    return [ {
      headerName: 'Call Date',
      field: 'userId',
      width: 100,
      suppressMovable: true,
      filter: "agTextColumnFilter",
      filterParams: {
        filterOptions: ["contains", "notContains"],
        debounceMs: 0
      }
    },
    {
      headerName: 'Call Time',
      field: 'callTime',
      width: 100,
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
      width: 100,
      suppressMovable: true,
      filter: "agTextColumnFilter",
      filterParams: {
        filterOptions: ["contains", "notContains"],
        debounceMs: 0
      }
    },
    {
      headerName: 'User Id',
      field: 'userId',
      width: 100,
      suppressMovable: true,
      filter: "agTextColumnFilter",
      filterParams: {
        filterOptions: ["contains", "notContains"],
        debounceMs: 0
      }
    },]
  }

}
