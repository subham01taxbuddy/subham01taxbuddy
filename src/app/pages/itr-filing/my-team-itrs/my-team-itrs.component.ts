import { Component, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { ItrMsService } from 'app/services/itr-ms.service';
import { UtilsService } from 'app/services/utils.service';
import { Router } from '@angular/router';
import { AppConstants } from 'app/shared/constants';
import { MatDialog } from '@angular/material';
import { FilingStatusDialogComponent } from '../filing-status-dialog/filing-status-dialog.component';
import { ReviseReturnDialogComponent } from '../revise-return-dialog/revise-return-dialog.component';
import moment = require('moment');

@Component({
  selector: 'app-my-team-itrs',
  templateUrl: './my-team-itrs.component.html',
  styleUrls: ['./my-team-itrs.component.css']
})

export class MyTeamItrsComponent implements OnInit {
  loading: boolean = false;
  myItrsGridOptions: GridOptions;
  itrDataList = [];
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
    { teamLeadId: 1065, value: 26217, label: 'Manasi Jadhav' },
    { teamLeadId: 1065, value: 26236, label: 'Supriya Mahindrakar' },
    { teamLeadId: 1065, value: 26218, label: 'Mrudula Vishvas Shivalkar' },
    { teamLeadId: 1062, value: 26235, label: 'Chaitrali Ranalkar' },

    { teamLeadId: 1064, value: 28033, label: 'Shrikanth Elegeti' },
    { teamLeadId: 1064, value: 28032, label: 'Pranali Patil' },
    { teamLeadId: 1064, value: 28040, label: 'Namrata Shringarpure' },
    { teamLeadId: 1064, value: 28035, label: 'Rupali Onamshetty' },
    { teamLeadId: 1064, value: 27474, label: 'Poonam Hase' },
    { teamLeadId: 1064, value: 28044, label: 'Bhakti Khatavkar' },
    { teamLeadId: 1064, value: 28034, label: 'Dipali Waghmode' },
    { teamLeadId: 1064, value: 28031, label: 'Harsha Kashyap' },
    { teamLeadId: 1064, value: 28222, label: 'Ankita Pawar' },
    { teamLeadId: 1706, value: 28763, label: 'Smita Yadav' },

    { teamLeadId: 0, value: 42886, label: 'Gitanjali Kakade' },
    { teamLeadId: 0, value: 42885, label: 'Dhanashri wadekar' },
    { teamLeadId: 0, value: 42888, label: 'Baby Kumari Yadav' },
    { teamLeadId: 0, value: 43406, label: 'Priyanka Shilimkar' },
    { teamLeadId: 0, value: 42878, label: 'Supriya Waghmare' },
    { teamLeadId: 0, value: 42931, label: 'Dhanashree Amarale' },

    { teamLeadId: 0, value: 1065, label: 'Urmila Warve' },
    { teamLeadId: 0, value: 1067, label: 'Divya Bhanushali' },
    { teamLeadId: 0, value: 21354, label: 'Brijmohan Lavaniya' },
  ];
  myFilingTeamMembers = [];
  selectedMember: String = '';
  constructor(private itrMsService: ItrMsService, public utilsService: UtilsService, private router: Router, private dialog: MatDialog,) {
    // const loggedInUserData = JSON.parse(localStorage.getItem('UMD'))
    this.filingTeamMembers.sort((a, b) => a.label > b.label ? 1 : -1)
    this.myFilingTeamMembers = this.filingTeamMembers;
    // var filingMemberId = loggedInUserData.USER_UNIQUE_ID;
    // if (filingMemberId !== 1065 && filingMemberId !== 1067 && filingMemberId !== 21354 && filingMemberId !== 12172) {
    //   if (filingMemberId === 1707) {
    //     filingMemberId = 1063;
    //   }
    //   this.myFilingTeamMembers = this.filingTeamMembers.filter(item => item.teamLeadId === filingMemberId);
    // } else {
    //   this.myFilingTeamMembers = this.filingTeamMembers;
    // }
    this.myItrsGridOptions = <GridOptions>{
      rowData: this.createOnSalaryRowData([]),
      columnDefs: this.myItrsCreateColoumnDef(),
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

  }

  getMembersItr(id) {

    this.loading = true;
    return new Promise((resolve, reject) => {
      this.selectedMember = this.filingTeamMembers.filter(item => item.value === id)[0].label;
      // const loggedInUserData = JSON.parse(localStorage.getItem('UMD'));
      const param = `/itr-by-filingTeamMemberId?filingTeamMemberId=${id}`;
      this.itrMsService.getMethod(param).subscribe((res: any) => {
        this.itrDataList = res;
        this.myItrsGridOptions.api.setRowData(this.createOnSalaryRowData(res));
        this.loading = false;
        return resolve(true)
      }, error => {
        this.loading = false;
        return resolve(false)
      })
    });
  }
  getCount(val) {
    return this.itrDataList.filter(item => item.eFillingCompleted === val).length
  }
  createOnSalaryRowData(data) {
    const newData = [];
    for (let i = 0; i < data.length; i++) {
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
      });
    }
    return newData;
  }
  myItrsCreateColoumnDef() {
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
          defaultOption: "startsWith",
          debounceMs: 0
        }
      },
      {
        headerName: 'Start',
        width: 50,
        sortable: true,
        pinned: 'right',
        cellRenderer: function (params) {
          if (params.data.eFillingCompleted && params.data.ackStatus === 'SUCCESS') {
            return `<button type="button" class="action_icon add_button" title="Acknowledgement not received, Contact team lead" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;color: green">
            <i class="fa fa-check" title="ITR filed successfully / Click to start revise return" 
            aria-hidden="true" data-action-type="startRevise"></i>
           </button>`;
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
      },
      {
        headerName: 'Status',
        width: 50,
        sortable: true,
        pinned: 'right',
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Start ITR Filing" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;color: blueviolet">
            <i class="fa fa-weixin" aria-hidden="true" data-action-type="filingStatus"></i>
           </button>`;
        },
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
          color: 'blueviolet'

        },
      }/* ,
      {
        headerName: 'RR',
        width: 50,
        sortable: true,
        pinned: 'right',
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Start Revise return" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;color: #0dbbc3">
            <i class="fa fa-exchange" aria-hidden="true" data-action-type="startRevise"></i>
           </button>`;
        },
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
          color: '#0dbbc3'

        },
      } */
    ];
  }
  public onRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'startFiling': {
          this.startFiling(params.data);
          break;
        }
        case 'filingStatus': {
          this.openfilingStatusDialog(params.data);
          break;
        }
        case 'startRevise': {
          this.openReviseReturnDialog(params.data);
          break;
        }
      }
    }
  }

  startFiling(data) {
    var workingItr = this.itrDataList.filter(item => item.itrId === data.itrId)[0]
    console.log('data: ', workingItr);
    Object.entries(workingItr).forEach((key, value) => {
      console.log(key, value)
      if (key[1] === null) {
        delete workingItr[key[0]];
      }
    });
    let obj = this.utilsService.createEmptyJson(null, AppConstants.ayYear, AppConstants.fyYear)
    Object.assign(obj, workingItr)
    console.log('obj:', obj)
    workingItr = JSON.parse(JSON.stringify(obj))
    sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(workingItr));
    this.router.navigate(['/pages/itr-filing/customer-profile'])
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

  openReviseReturnDialog(data) {
    console.log('Data for revise return ', data);
    let disposable = this.dialog.open(ReviseReturnDialogComponent, {
      width: '50%',
      height: 'auto',
      data: data
    })
    disposable.afterClosed().subscribe(result => {
      if (result === 'reviseReturn') {
        this.router.navigate(['/pages/itr-filing/customer-profile'])
      }
      console.log('The dialog was closed', result);
    });
  }
}
