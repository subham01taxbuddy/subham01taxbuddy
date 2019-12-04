import { Component, OnInit } from '@angular/core';
import { NavbarService } from 'app/services/navbar.service';
import { GridOptions } from 'ag-grid-community';
import { HttpClient } from '@angular/common/http';
import { AgGridCheckboxComponent } from 'app/additional-components/ag-grid-checkbox/ag-grid-checkbox.component';
import { DatePipe } from '@angular/common';
import { ToastMessageService } from 'app/services/toast-message.service';


@Component({
    selector: 'app-report',
    templateUrl: './user-gst-status-report.component.html',
    styleUrls: ['./user-gst-status-report.component.css'],
    providers: [DatePipe]
})
export class UserGstStatusReportComponent implements OnInit {
    selected_dates: any = {
        from_date: new Date(),
        to_date: new Date()
    }
    statusReportGridOptions: GridOptions;
    // public rowData;
    constructor(private navbarService: NavbarService, private http: HttpClient, public datepipe: DatePipe, public _toastMessageService: ToastMessageService) {
        this.statusReportGridOptions = <GridOptions>{
            rowData: [],
            columnDefs: this.statusReportCreateColoumnDef(),
            /* onGridReady: () => {
                this.statusReportGridOptions.api.sizeColumnsToFit();
            }, */
            enableCellChangeFlash: true,
            onGridReady: params => {
                params.api.sizeColumnsToFit();
            }
            /*  enableCellChangeFlash: true,
             defaultColDef: {
                 resizable: true
             },
             suppressDragLeaveHidesColumns: true, */
            // cellFocused: true,
            // enableCharts: true
        };
    }
    ngOnInit() {
    }

    getUserWiseGstStatusReport() {
        const from_date = this.datepipe.transform(this.selected_dates.from_date, 'yyyy-MM-dd HH:mm:ss');
        const to_date = this.datepipe.transform(this.selected_dates.to_date, 'yyyy-MM-dd HH:mm:ss');
        return new Promise((resolve, reject) => {
            // this.active_subscriptions = []
            const param = `?fromInvoiceDate=${from_date}&toInvoiceDate=${to_date}&page=0&size=20`;
            NavbarService.getInstance(this.http).getUserWiseGstStatusReport([param]).subscribe(res => {
                console.log("User wise status report:", res)
                if (Array.isArray(res.listInvoiceFillingReport)) {
                    this.statusReportGridOptions.api.setRowData(this.createRowData(res.listInvoiceFillingReport))
                }
                return resolve(true)
            }, err => {
                let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
                this._toastMessageService.alert("error", errorMessage);
                return resolve(false)
            });
        });
    }

    onSeletedDateChange() {
        /* NavbarService.getInstance(null).selected_dates = this.selected_dates;
        NavbarService.getInstance(null).isDateRangeChanged = true; */

        let latest_date = this.datepipe.transform(this.selected_dates.from_date, 'yyyy-MM-dd HH:mm:ss');
        console.log("latest_date:", latest_date)
    }

    onApply() {
        NavbarService.getInstance(null).isApplyBtnClicked = true;
        this.getUserWiseGstStatusReport();
    }

    createRowData(data) {
        /*  const newData = {
             "metadata": {
                 "page": 5,
                 "perPage": 20,
                 "pageCount": 20,
                 "totalCount": 521,
                 "links": [{
                     "self": "/report?page=5&perPage=20"
                 }, {
                     "first": "/report?page=0&perPage=20"
                 }, {
                     "previous": "/report?page=4&perPage=20"
                 }, {
                     "next": "/report?page=6&perPage=20"
                 }, {
                     "last": "/report?page=26&perPage=20"
                 }]
             },
             "data": [{
                 "id": 1,
                 "userId": 23,
                 "name": "Ashish Hulwan",
                 "mobileNumber": "8625843563",
                 "emailAddress": "ashish.hulwan@ssbainnovations.com",
                 "invoiceStatusDTO": {
                     "uploadedCount": 45,
                     "lastUploadedDate": "28-09-2019",
                     "unAssignedCount": 34,
                     "lastAssignedDate": "28-09-2019",
                     "unProcessedCount": 11,
                     "lastProcessedDate": "",
                     "isAllBillsReceived": true,
                     "receivedConfirmationDate": ""
                 },
                 "computationStatus": {
                     "isPrepared": true,
                     "preparedOnDate": "29-09-2019",
                     "isApproved": false,
                     "approvedOnDate": ""
                 },
                 "fillingStatus": {
                     "isGSTR1Filled": true,
                     "gSTR1OnDate": "",
                     "isGSTR3BFilled": false,
                     "gSTR3BOnDate": ""
                 }
             }]
         }; */
        const donations = [];// []//this.ITR_JSON.donations.filter(item => item.donationType === donationType);
        for (let i = 0; i < data.length; i++) {
            let updateId = Object.assign({}, data[i], { id: 1 + i, mobileNumber: (data[i].mobileNumber ? data[i].mobileNumber : data[i].emailAddress) });
            donations.push(updateId);
        }

        return donations;
    }

    rowData: any;
    statusReportCreateColoumnDef() {
        return [
            {
                headerName: 'No.',
                field: 'id',
                width: 100,
                pinned: 'left',
                suppressMovable: true,
            },
            {
                headerName: 'Name',
                field: 'name',
                // //editable: false,
                suppressMovable: true,
                // onCellFocused: true,
                /* valueGetter: function nameFromCode(params) {
                    console.log('params == ', params);
                    if (otherDonationToDropdown.length !== 0) {
                        const nameArray = otherDonationToDropdown.filter(item => (item.value === params.data.schemeCode));
                        console.log('nameArray = ', nameArray);
                        return nameArray[0].label;
                    } else {
                        return params.data.value;
                    }
                } */
            },
            {
                headerName: 'Mobile Number',
                field: 'mobileNumber',
                //editable: false,
                //suppressMovable: true,
            },
            {
                headerName: 'Uploaded',
                field: 'invoiceStatusDTO.uploadedCount',
                //editable: false,
                //suppressMovable: true,
            },
            {
                headerName: 'Un Assigned',
                field: 'invoiceStatusDTO.unAssignedCount',
                //editable: false,
                //suppressMovable: true,
            },
            {
                headerName: 'Un Processed',
                field: 'invoiceStatusDTO.unProcessedCount',
                //editable: false,
                //suppressMovable: true,
            },
            {
                headerName: 'All Bills Recd',
                field: 'invoiceStatusDTO.isAllBillsReceived',
                cellRendererFramework: AgGridCheckboxComponent

                //editable: false,
                //suppressMovable: true,
            },
            {
                headerName: 'Prepared',
                field: 'computationStatus.isPrepared',
                cellRendererFramework: AgGridCheckboxComponent

                //editable: false,
                //suppressMovable: true,
            },
            {
                headerName: 'Approved',
                field: 'computationStatus.isApproved',
                cellRendererFramework: AgGridCheckboxComponent

                //editable: false,
                //suppressMovable: true,
            },
            {
                headerName: 'GSTR-1',
                field: 'fillingStatus.isGSTR1Filled',
                //editable: false,
                //suppressMovable: true,
                /* valueGetter: function statenameFromCode(params) {
                    console.log('stateDropdown == ', stateDropdown);
                    if (stateDropdown.length !== 0) {
                        const nameArray = stateDropdown.filter(item => item.stateCode === params.data.state);
                        console.log('stateDropdown = ', nameArray);
                        return nameArray[0].stateName;
                    } else {
                        return params.data.state;
                    }
                } */
            },
            {
                headerName: 'GSTR-3B',
                field: 'fillingStatus.isGSTR3BFilled',
                //editable: false,
                //suppressMovable: true,
                /* valueGetter: function statenameFromCode(params) {
                    console.log('stateDropdown == ', stateDropdown);
                    if (stateDropdown.length !== 0) {
                        const nameArray = stateDropdown.filter(item => item.stateCode === params.data.state);
                        console.log('stateDropdown = ', nameArray);
                        return nameArray[0].stateName;
                    } else {
                        return params.data.state;
                    }
                } */
            }
        ];
    }

    public onStatusReportRowClicked(params) {
        if (params.event.target !== undefined) {
            const actionType = params.event.target.getAttribute('data-action-type');
            switch (actionType) {
                case 'remove': {
                    console.log('edit params OTHER = ', params.data);
                    //   this.deleteDonation(params.data);
                    break;
                }
                case 'edit': {
                    console.log('edit params OTHER = ', params.data);
                    //   this.addDonation('Edit Donation', 'EDIT', params.data, 'OTHER');
                    break;
                }
            }
        }
    }
}
