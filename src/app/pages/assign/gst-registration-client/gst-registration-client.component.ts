import { Component, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid-community';

@Component({
  selector: 'app-gst-registration-client',
  templateUrl: './gst-registration-client.component.html',
  styleUrls: ['./gst-registration-client.component.css']
})
export class GstRegistrationClientComponent implements OnInit {

  loading: boolean;
  clientListGridOptions: GridOptions;
  constructor() {
    this.clientListGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.clientListCreateColoumnDef(),
      //enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: params => {
        //params.api.sizeColumnsToFit();
      },
      sortable: true
    }
  }

  ngOnInit() {
  }

  clientListCreateColoumnDef() {
    return [
      {
        headerName: 'Name',
        field: 'name',
        resizable: true
      },
      {
        headerName: 'Email Id',
        field: 'email',
        resizable: true
      },
      {
        headerName: 'Mobile Number',
        field: 'isValidGSTN',
        resizable: true
      },
      {
        headerName: 'Start Date Of Business',
        field: 'isValidGSTN',
        resizable: true
      },
      {
        headerName: 'Type of Business',
        field: 'isValidGSTN',
        resizable: true
      },
      {
        headerName: 'Commodity 1',
        field: 'isValidGSTN',
        resizable: true
      },
      {
        headerName: 'Commodity 2',
        field: 'isValidGSTN',
        resizable: true
      },
      {
        headerName: 'Commodity 3',
        field: 'isValidGSTN',
        resizable: true
      },
      {
        headerName: 'Commodity 4',
        field: 'isValidGSTN',
        resizable: true
      },
      {
        headerName: 'Commodity 5',
        field: 'isValidGSTN',
        resizable: true
      },
      {
        headerName: 'Download Documents',
        field: 'isValidGSTN',
        resizable: true,
        pinned: 'right'
      },

    ]
  }

}
