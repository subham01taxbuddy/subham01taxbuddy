import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';
import { FilingStatusDialogComponent } from 'app/pages/itr-filing/filing-status-dialog/filing-status-dialog.component';
import { ItrMsService } from 'app/services/itr-ms.service';
import { UtilsService } from 'app/services/utils.service';
import moment = require('moment');

@Component({
  selector: 'app-tpa-client-list',
  templateUrl: './tpa-client-list.component.html',
  styleUrls: ['./tpa-client-list.component.css']
})
export class TpaClientListComponent implements OnInit {
  loading: boolean = false;
  tpaGridOptions: GridOptions;
  tpaList = [];
  filingTeamMembers = [
    { teamLeadId: 1063, value: 1063, label: 'Amrita Thakur' },
    { teamLeadId: 1064, value: 1064, label: 'Ankita Murkute' },
    { teamLeadId: 1062, value: 1062, label: 'Damini Patil' },
    { teamLeadId: 1063, value: 1707, label: 'Kavita Singh' },
    { teamLeadId: 1706, value: 1706, label: 'Nimisha Panda' },
    { teamLeadId: 1063, value: 24346, label: 'Tushar Shilimkar' },
    { teamLeadId: 1062, value: 19529, label: 'Kirti Gorad' },
    { teamLeadId: 1062, value: 24348, label: 'Geetanjali Panchal' },
    { teamLeadId: 1065, value: 23553, label: 'Renuka Kalekar' },
    { teamLeadId: 1064, value: 23550, label: 'Bhavana Patil' },
    { teamLeadId: 1063, value: 23567, label: 'Sneha Suresh Utekar' },
    { teamLeadId: 1063, value: 23552, label: 'Roshan Vilas Kakade' },
    { teamLeadId: 1063, value: 23551, label: 'Pradnya Tambade' },
    { teamLeadId: 1063, value: 983, label: 'Usha Chellani' },
    { teamLeadId: 1065, value: 23670, label: 'Ashwini Kapale' },
    { teamLeadId: 1065, value: 23578, label: 'Aditi Ravindra Gujar' },
    { teamLeadId: 1062, value: 23668, label: 'Chaitanya Prakash Masurkar' },

    { teamLeadId: 1063, value: 25942, label: 'Vaibhav M. Nilkanth' },
    { teamLeadId: 1064, value: 26220, label: 'Pratiksha Shivaji Jagtap' },
    { teamLeadId: 1062, value: 177, label: 'Aditya U.Singh' },
    { teamLeadId: 1706, value: 26195, label: 'Tejaswi Suraj Bodke' },
    { teamLeadId: 1064, value: 23505, label: 'Tejshri Hanumant Bansode' },
    { teamLeadId: 1063, value: 26215, label: 'Deepali Nivrutti Pachangane' },
    // { teamLeadId: 1065, value: 26217, label: 'Manasi Jadhav' },
    { teamLeadId: 1065, value: 26236, label: 'Supriya Mahindrakar' },
    // { teamLeadId: 1065, value: 26218, label: 'Mrudula Vishvas Shivalkar' },
    // { teamLeadId: 1062, value: 26235, label: 'Chaitrali Ranalkar' },

    { teamLeadId: 1064, value: 28033, label: 'Shrikanth Elegeti' },
    // { teamLeadId: 1064, value: 28032, label: 'Pranali Patil' },
    { teamLeadId: 1064, value: 28040, label: 'Namrata Shringarpure' },
    { teamLeadId: 1064, value: 28035, label: 'Rupali Onamshetty' },
    // { teamLeadId: 1064, value: 27474, label: 'Poonam Hase' },
    { teamLeadId: 1064, value: 28044, label: 'Bhakti Khatavkar' },
    { teamLeadId: 1064, value: 28034, label: 'Dipali Waghmode' },
    { teamLeadId: 1064, value: 28031, label: 'Harsha Kashyap' },
    // { teamLeadId: 1064, value: 28222, label: 'Ankita Pawar' },
    // { teamLeadId: 1706, value: 28763, label: 'Smita Yadav' },

    { teamLeadId: 0, value: 42886, label: 'Gitanjali Kakade' },
    { teamLeadId: 0, value: 42885, label: 'Dhanashri wadekar' },
    { teamLeadId: 0, value: 42888, label: 'Baby Kumari Yadav' },
    { teamLeadId: 0, value: 43406, label: 'Priyanka Shilimkar' },
    { teamLeadId: 0, value: 42878, label: 'Supriya Waghmare' },
    { teamLeadId: 0, value: 42931, label: 'Dhanashree Amarale' },
    { teamLeadId: 1063, value: 67523, label: 'Supriya Kumbhar' },
    { teamLeadId: 1063, value: 67522, label: 'Nikita Chilveri' },
    { teamLeadId: 1063, value: 67558, label: 'Sunita Sharma' },

    { teamLeadId: 0, value: 1065, label: 'Urmila Warve' },
    { teamLeadId: 0, value: 1067, label: 'Divya Bhanushali' },
    { teamLeadId: 0, value: 21354, label: 'Brijmohan Lavaniya' },
  ];
  constructor(private itrMsService: ItrMsService, public utilsService: UtilsService, private router: Router,
    private dialog: MatDialog) {
    this.tpaGridOptions = <GridOptions>{
      rowData: this.createTpaRowData([]),
      columnDefs: this.createTpaColoumnDef(),
      enableCellChangeFlash: true,
      onGridReady: params => {
        // params.api.sizeColumnsToFit();
      },
      sortable: true,
      filter: true,
      floatingFilter: true
    };
  }

  ngOnInit() {
    this.getTpaList();
  }
  getTpaList() {
    this.loading = true;
    return new Promise((resolve, reject) => {
      // const loggedInUserData = JSON.parse(localStorage.getItem('UMD'));
      const param = `/itr/tpa?nextYearTpa=INTERESTED`;/* ${loggedInUserData.USER_UNIQUE_ID} */
      this.itrMsService.getMethod(param).subscribe((res: any) => {
        console.log('filingTeamMemberId: ', res);
        this.tpaList = res;
        this.tpaGridOptions.api.setRowData(this.createTpaRowData(res));
        this.loading = false;
        return resolve(true)
      }, error => {
        this.loading = false;
        return resolve(false)
      })
    });

    // this.loading = true;
    // const loggedInUserData = JSON.parse(localStorage.getItem('UMD'));
    // const param = `/itr-by-filingTeamMemberId?filingTeamMemberId=1063`;/* ${loggedInUserData.USER_UNIQUE_ID} */
    // this.itrMsService.getMethod(param).subscribe((res: any) => {
    //   console.log('filingTeamMemberId: ', res);
    //   this.tpaGridOptions.api.setRowData(res);
    //   this.loading = false;
    // }, error => {
    //   this.loading = false;
    // })
  }
  createTpaRowData(data) {
    const newData = [];
    for (let i = 0; i < data.length; i++) {
      const filerDetails = this.filingTeamMembers.filter(item => item.value === data[i].filingTeamMemberId);
      let filerName = 'NA';
      if (filerDetails.length > 0) {
        filerName = filerDetails[0].label
      }
      newData.push({
        itrId: data[i].itrId,
        userId: data[i].userId,
        fName: data[i].family[0].fName,
        lName: data[i].family[0].lName,
        panNumber: data[i].panNumber,
        contactNumber: data[i].contactNumber,
        email: data[i].email,
        itrType: data[i].itrType,
        ackStatus: data[i].ackStatus,
        acknowledgementReceived: data[i].acknowledgementReceived,
        eFillingCompleted: data[i].eFillingCompleted,
        eFillingDate: data[i].eFillingDate,
        filingTeamMemberId: filerName,
      });
    }
    return newData;
  }
  getCount(val) {
    return this.tpaList.filter(item => item.eFillingCompleted === val).length
  }
  createTpaColoumnDef() {
    return [
      {
        headerName: 'ITR ID',
        field: 'itrId',
        sortable: true,
        width: 70,
        pinned: 'left',
      },
      {
        headerName: "First Name",
        field: "fName",
        sortable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: "Last Name",
        field: "lName",
        sortable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: "Mobile",
        field: "contactNumber",
        sortable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          defaultOption: "startsWith",
          debounceMs: 0
        }
      },
      {
        headerName: "ITR Type",
        field: "itrType",
        width: 70,
        filter: "agTextColumnFilter",
        filterParams: {
          defaultOption: "startsWith",
          debounceMs: 0
        }
      },
      {
        headerName: "Filing Date",
        field: "eFillingDate",
        sortable: true,
        width: 100,
        valueFormatter: (data) => data.value ? moment(data.value).format('DD MMM YYYY') : null,
      },
      {
        headerName: "PAN Number",
        field: "panNumber",
        sortable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          defaultOption: "startsWith",
          debounceMs: 0
        }
      },
      {
        headerName: "EmailAddress",
        field: "email",
        sortable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          defaultOption: "contains",
          debounceMs: 0
        }
      },
      {
        headerName: "Filer Name",
        field: "filingTeamMemberId",
        sortable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          defaultOption: "contains",
          debounceMs: 0
        }
      },
      /* {
        headerName: 'Actions',
        width: 100,
        sortable: true,
        pinned: 'right',
        cellRenderer: function (params) {
          if (params.data.eFillingCompleted) {
            return `<i class="fa fa-check" title="ITR filed successfully" aria-hidden="true"></i>`;
          } else if (params.data.ackStatus === 'DELAY') {
            return `<button type="button" class="action_icon add_button" title="ITR filed successfully / Click to start revise return" style="border: none;
            background: transparent; font-size: 16px; cursor:not-allowed;color: red">
            <i class="fa fa-circle" title="Acknowledgement not received, Contact team lead" 
            aria-hidden="true"></i>
           </button>`;
          } else {
            return `<button type="button" class="action_icon add_button" title="Start ITR Filing" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;color: orange">
            <i class="fa fa-edit" aria-hidden="true" data-action-type="startFiling"></i>
           </button>`;
          }
        },
        cellStyle: function (params) {
          if (params.data.eFillingCompleted) {
            return {
              textAlign: 'center', display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              color: 'green'
            }
          } else {
            return {
              textAlign: 'center', display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              color: 'orange'
            }
          }
        },
      }, */
      {
        headerName: 'Chat',
        width: 50,
        sortable: true,
        pinned: 'right',
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Click to see chat" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;color: blueviolet">
            <i class="fa fa-weixin" aria-hidden="true" data-action-type="chatLinks"></i>
           </button>`;
        },
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
          color: 'blueviolet'

        },
      },
      {
        headerName: 'Documents',
        width: 50,
        sortable: true,
        pinned: 'right',
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="View Documents" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;color: black">
            <i class="fa fa-eye" aria-hidden="true" data-action-type="viewDocuments"></i>
           </button>`;
        },
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
          color: 'black'
        },
      },
      /* {
        headerName: "TPA",
        field: "nextYearTpa",
        width: 50,
        pinned: 'right',
        cellRenderer: params => {
          return `<input type='checkbox' data-action-type="isTpa" ${params.data.nextYearTpa === 'INTERESTED' ? 'checked' : ''} />`;
        },
        cellStyle: params => {
          return (params.data.nextYearTpa === 'INTERESTED' || !params.data.eFillingCompleted) ? { 'pointer-events': 'none', opacity: '0.4' }
            : '';
        }
      }, */
    ];
  }
  public onRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'viewDocuments': {
          this.router.navigate(['/pages/tpa-interested/list/' + params.data.userId]);
          // this.startFiling(params.data);
          break;
        }
        case 'chatLinks': {
          this.openfilingStatusDialog(params.data);
          break;
        }
        case 'isTpa': {
          // this.interestedForNextYearTpa(params.data);
          break;
        }
      }
    }
  }

  openfilingStatusDialog(data) {
    let disposable = this.dialog.open(FilingStatusDialogComponent, {
      width: '50%',
      height: 'auto',
      data: data
    })
    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}
