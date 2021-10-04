import { formatDate } from '@angular/common';
import { Component, Inject, Input, LOCALE_ID, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';
import { Subscription } from 'rxjs';
import { timeInterval } from 'rxjs/operators';

@Component({
  selector: 'app-service-grid-table',
  templateUrl: './service-grid-table.component.html',
  styleUrls: ['./service-grid-table.component.css']
})
export class ServiceGridTableComponent implements OnInit {

  @Input('gridRowData') gridRowData: any;
  @Input('from') from: any;
  tableGridOptions: GridOptions;
  loading: boolean;
  subscription: Subscription;

  filingTeamMembers = [
    { value: 1063, label: 'Amrita Thakur' },
    { value: 1064, label: 'Ankita Murkute' },
    { value: 1062, label: 'Damini Patil' },
    { value: 1707, label: 'Kavita Singh' },
    { value: 1706, label: 'Nimisha Panda' },
    { value: 24346, label: 'Tushar Shilimkar' },
    { value: 19529, label: 'Kirti Gorad' },
    { value: 24348, label: 'Geetanjali Panchal' },
    { value: 23553, label: 'Renuka Kalekar' },
    { value: 23550, label: 'Bhavana Patil' },
    { value: 23567, label: 'Sneha Suresh Utekar' },
    { value: 23552, label: 'Roshan Vilas Kakade' },
    { value: 23551, label: 'Pradnya Tambade' },
    { value: 983, label: 'Usha Chellani' },
    { value: 23670, label: 'Ashwini Kapale' },
    { value: 23578, label: 'Aditi Ravindra Gujar' },
    // { value: 23564, label: 'Sonali Ghanwat' }, Quit
    { value: 23668, label: 'Chaitanya Prakash Masurkar' },


    { value: 25942, label: 'Vaibhav M. Nilkanth' },
    { value: 26220, label: 'Pratiksha Shivaji Jagtap' },
    { value: 177, label: 'Aditya U.Singh' },
    { value: 26195, label: 'Tejaswi Suraj Bodke' },
    { value: 23505, label: 'Tejshri Hanumant Bansode' },
    { value: 26215, label: 'Deepali Nivrutti Pachangane' },
    { value: 26217, label: 'Manasi Jadhav' },// Quit
    { value: 26236, label: 'Supriya Mahindrakar' },
    { value: 26218, label: 'Mrudula Vishvas Shivalkar' },// Quit
    { value: 26235, label: 'Chaitrali Ranalkar' },

    { value: 28033, label: 'Shrikanth Elegeti' },
    { value: 28032, label: 'Pranali Patil' },
    { value: 28040, label: 'Namrata Shringarpure' },
    { value: 28035, label: 'Rupali Onamshetty' },
    { value: 27474, label: 'Poonam Hase' },
    { value: 28044, label: 'Bhakti Khatavkar' },
    { value: 28034, label: 'Dipali Waghmode' },
    { value: 28031, label: 'Harsha Kashyap' },
    { value: 28222, label: 'Ankita Pawar' },
    { value: 28763, label: 'Smita Yadav' },

    { value: 42886, label: 'Gitanjali Kakade' },
    { value: 42885, label: 'Dhanashri wadekar' },
    { value: 42888, label: 'Baby Kumari Yadav' },
    { value: 43406, label: 'Priyanka Shilimkar' },
    { value: 42878, label: 'Supriya Waghmare' },
    { value: 42931, label: 'Dhanashree Amarale' },
    { value: 67523, label: 'Supriya Kumbhar' },
    { value: 67522, label: 'Nikita Chilveri' },
    { value: 67558, label: 'Sunita Sharma' },
    { value: 71150, label: 'Deep Trivedi', },
    { value: 71148, label: 'Riddhi Solanki', },
    { value: 71159, label: 'Ajay Kandhway' },
    { value: 71168, label: 'Ganesh Jaiswal' },
    { value: 75925, label: 'Nikita Shah' },
    { value: 81402, label: 'Vatsa Bhanushali' },
    { value: 87321, label: 'Chetan Kori' },

    { value: 1065, label: 'Urmila Warve' },
    { value: 1067, label: 'Divya Bhanushali' },
    { value: 21354, label: 'Brijmohan Lavaniya' },
  ];

  constructor(@Inject(LOCALE_ID) private locale: string, private utileService: UtilsService, private userMsService: UserMsService) {
    this.tableGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.createColoumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: params => {
      },

      sortable: true,
    };

    this.subscription = this.utileService.onMessage().subscribe(data => {
      console.log('Service board Data: ', data)
      if (data.text.length > 0) {
        this.gridRowData = data.text;
        this.tableGridOptions.api.setRowData(this.createRowData(this.gridRowData));
      }
    });
  }

  ngOnInit() {
    console.log('gridRowData -> ', this.gridRowData);
    setTimeout(() => {
      this.tableGridOptions.api.setRowData(this.createRowData(this.gridRowData));
    }, 200)
  }

  createColoumnDef() {
    return [
      {
        headerName: 'Client Name',
        field: 'clientName',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Mobile',
        field: 'mobile',
        width: 100,
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
        width: 100,
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
        headerName: 'Status',
        field: 'status',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        filter: "agTextColumnFilter",
        cellRenderer: (data) => {
          return formatDate(data.value, 'dd/MM/yyyy', this.locale)
        },
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Filer Name',
        field: 'filerName',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'ITR Type',
        field: 'itrType',
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
        headerName: 'Platform',
        field: 'platform',
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
        headerName: 'Start Filling',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Click to start Filing"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-paperclip" aria-hidden="true" data-action-type="startFilling"></i>
           </button>`;
        },
        width: 100,
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
        headerName: 'Kommunicate Chat',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Click open kommunicate chat"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-comments-o" aria-hidden="true" data-action-type="kommunicateChat"></i>
           </button>`;
        },
        width: 100,
        pinned: 'right',
        cellStyle: function (params) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      }
    ]
  }

  createRowData(tableData) {
    console.log('tableData -> ', tableData);
    var tableArray = [];
    for (let i = 0; i < tableData.length; i++) {
      let userInfo = Object.assign({}, tableArray[i], {
        clientName: tableData[i].sourceAsMap['FirstName'] + ' ' + tableData[i].sourceAsMap['LastName'],
        mobile: tableData[i].sourceAsMap['Phone'],
        createdDate: tableData[i].sourceAsMap['CreatedDate'],
        status: this.utileService.isNonEmpty(tableData[i].sourceAsMap['itrStatusLatest']) ? tableData[i].sourceAsMap['itrStatusLatest']['Date'] : 'NA',
        filerName: this.getFilerName(tableData[i].sourceAsMap['Itr']),
        itrType: this.utileService.isNonEmpty(tableData[i].sourceAsMap['Itr']) ? tableData[i].sourceAsMap['Itr']['ItrType'] : 'NA',
        platform: this.utileService.isNonEmpty(tableData[i].sourceAsMap['InitialData']) ? tableData[i].sourceAsMap['InitialData']['Platform'] : '',
        userId: tableData[i].sourceAsMap['userId'],
        KommunicateURL: this.utileService.isNonEmpty(tableData[i].sourceAsMap['KommunicateURL']) ? tableData[i].sourceAsMap['KommunicateURL'] : ''
      })
      tableArray.push(userInfo);
    }
    console.log('tableArray-> ', tableArray)
    return tableArray;
  }

  getFilerName(itr) {
    if (this.utileService.isNonEmpty(itr) && this.utileService.isNonEmpty(itr['FilingTeamMemberId']) && itr['FilingTeamMemberId'] !== 0) {
      const filer = this.filingTeamMembers.filter(item => item.value === itr['FilingTeamMemberId']);
      if (filer.length > 0) {
        return filer[0].label;
      }
      return 'SME Not Found'
    }
    return 'Not Assigned';
  }

  onUsersRowClicked(params) {
    console.log(params)
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'startFilling': {
          this.startItrFilling(params.data);
          break;
        }
        case 'kommunicateChat': {
          this.redirectKommunicatChat(params.data)
          break;
        }
      }
    }
  }

  startItrFilling(data) {
    console.log('itr filling data -> ', data)
    this.loading = true;
    const param = `/profile/${data['userId']}`
    this.userMsService.getMethod(param).subscribe((result: any) => {
      this.utileService.getITRByUserIdAndAssesmentYear(result);
    }, error => {
      this.loading = true;
      this.utileService.showSnackBar('Some data points are missing please dont try from here')
    })
  }

  redirectKommunicatChat(data) {
    console.log('go to Kommunicate data -> ', data)
    if (this.utileService.isNonEmpty(data['KommunicateURL'])) {
      window.open(data['KommunicateURL'], '_blank')
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


}
