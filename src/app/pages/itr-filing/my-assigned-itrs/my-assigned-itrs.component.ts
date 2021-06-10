import { FormControl, Validators } from '@angular/forms';
import { UtilsService } from 'app/services/utils.service';
import { ChangeDetectorRef, Component, OnInit, AfterContentChecked } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { ItrMsService } from 'app/services/itr-ms.service';
import { AppConstants } from 'app/shared/constants';
import { Router } from '@angular/router';
import { FilingStatusDialogComponent } from '../filing-status-dialog/filing-status-dialog.component';
import { MatDialog } from '@angular/material';
import moment = require('moment');
import { ITR_JSON } from 'app/shared/interfaces/itr-input.interface';
import { ApiEndpoints } from 'app/shared/api-endpoint';

@Component({
  selector: 'app-my-assigned-itrs',
  templateUrl: './my-assigned-itrs.component.html',
  styleUrls: ['./my-assigned-itrs.component.css']
})
export class MyAssignedItrsComponent implements OnInit, AfterContentChecked {
  loading: boolean = false;
  myItrsGridOptions: GridOptions;
  itrDataList = [];
  // financialYear = [];
  selectedFyYear = '';
  constructor(private itrMsService: ItrMsService,
    public utilsService: UtilsService,
    private router: Router,
    private dialog: MatDialog,
    private cdRef: ChangeDetectorRef) {
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
    // this.setFyDropDown();
  }
  ngAfterContentChecked() {
    this.cdRef.detectChanges();
  }

  // setFyDropDown() {
  //   const fyList = JSON.parse(sessionStorage.getItem(AppConstants.FY_LIST));
  //   console.log('fyList', fyList);
  //   if (this.utilsService.isNonEmpty(fyList) && fyList instanceof Array) {
  //     this.financialYear = fyList;
  //     const currentFy = this.financialYear.filter(item => item.isFilingActive);
  //     this.selectedFyYear.setValue(currentFy.length > 0 ? currentFy[0].financialYear : null);
  //     this.myItrsList(this.selectedFyYear.value);
  //   } else {
  //     const param = `${ApiEndpoints.itrMs.filingDates}`;
  //     this.itrMsService.getMethod(param).subscribe((res: any) => {
  //       if (res && res.success && res.data instanceof Array) {
  //         sessionStorage.setItem(AppConstants.FY_LIST, JSON.stringify(res.data));
  //         this.financialYear = res.data;
  //       }
  //     }, error => {
  //       console.log('Error during getting all PromoCodes: ', error)
  //     })
  //   }
  // }

  myItrsList(fy: String) {
    this.loading = true;
    return new Promise((resolve, reject) => {
      const loggedInUserData = JSON.parse(localStorage.getItem('UMD'));
      let param = `${ApiEndpoints.itrMs.itrByFilingTeamMemberId}?filingTeamMemberId=${loggedInUserData.USER_UNIQUE_ID}`;/* ${loggedInUserData.USER_UNIQUE_ID} */
      if (fy !== '') {
        param = `${param}&fy=${fy}`;
      }
      this.itrMsService.getMethod(param).subscribe((res: any) => {
        console.log('filingTeamMemberId: ', res);
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
  fromFy(event) {
    // this.searchParams = event;
    this.selectedFyYear = event;
    console.log(event);
    this.myItrsList(event);
  }

  // changeFy(fy: String) {
  //   this.myItrsList(fy);
  // }

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
        nextYearTpa: data[i].nextYearTpa,
        isEverified: data[i].isEverified,
        isRevised: data[i].isRevised,
      });
    }
    return newData;
  }
  getCount(val) {
    return this.itrDataList.filter(item => item.eFillingCompleted === val).length
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
        headerName: "Client Name",
        // field: "fName",
        sortable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        valueGetter: function (params) {
          return params.data.fName + ' ' + params.data.lName;
        },
      },
      /* {
        headerName: "Last Name",
        field: "lName",
        sortable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      }, */
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
        headerName: "Email Address",
        field: "email",
        sortable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          defaultOption: "startsWith",
          debounceMs: 0
        }
      },
      {
        headerName: "Return Type",
        field: "isRevised",
        sortable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          defaultOption: "startsWith",
          debounceMs: 0
        },
        valueGetter: function (params) {
          if (params.data.isRevised === 'Y') {
            return 'Revised';
          }
          return 'Original'
        },
      },
      {
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
      },
      {
        headerName: "TPA",
        field: "nextYearTpa",
        width: 50,
        pinned: 'right',
        cellRenderer: params => {
          return `<input type='checkbox' data-action-type="isTpa" ${params.data.nextYearTpa === 'INTERESTED' || params.data.nextYearTpa === "COMPLETED" ? 'checked' : ''} />`;
        },
        cellStyle: params => {
          return (params.data.nextYearTpa === 'INTERESTED' || params.data.nextYearTpa === 'COMPLETED' || !params.data.eFillingCompleted) ? { 'pointer-events': 'none', opacity: '0.4' }
            : '';
        }
      },
      {
        headerName: 'E-Verify',
        width: 50,
        sortable: true,
        pinned: 'right',
        cellRenderer: function (params) {
          if (params.data.isEverified) {
            return `<button type="button" class="action_icon add_button" title="Acknowledgement not received, Contact team lead" style="border: none;
            background: transparent; font-size: 16px; color: green">
            <i class="fa fa-circle" title="E-Verification is done" 
            aria-hidden="true"></i>
           </button>`;
          } else {
            return `<button type="button" class="action_icon add_button" title="ITR filed successfully / Click to start revise return" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;color: orange">
            <i class="fa fa-circle" title="Click to check the latest E-verification status" 
            aria-hidden="true" data-action-type="ackDetails"></i>
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
        headerName: "Doc",
        field: "showDocument",
        width: 50,
        pinned: 'right',
        cellRenderer: params => {
          return `<button type="button" class="action_icon add_button" title="Show User Documents" style="border: none;
                  background: transparent; font-size: 16px; color: yellow">
                  <i class="fa fa-file" data-action-type="showDocs" title="Show User Documents" aria-hidden="true"></i>
                   </button>`;
        },
        // cellStyle: params => {
        //   return (params.data.nextYearTpa === 'INTERESTED' || params.data.nextYearTpa === 'COMPLETED' || !params.data.eFillingCompleted) ? { 'pointer-events': 'none', opacity: '0.4' }
        //     : '';
        // }
      }
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
        case 'ackDetails': {
          this.getAcknowledgeDetail(params.data);
          break;
        }
        case 'isTpa': {
          this.interestedForNextYearTpa(params.data);
          break;
        }
        case 'showDocs': {
          this.showUserDoucuments(params.data);
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
  getAcknowledgeDetail(data) {
    console.log('Data for acknowlegement status', data);
    this.loading = true;
    const param = `${ApiEndpoints.itrMs.itrVerifyStatus}/${data.itrId}`;
    this.itrMsService.putMethod(param).subscribe((res: any) => {
      this.utilsService.showSnackBar(res.status)
      this.loading = false;
      setTimeout(() => {
        this.myItrsList(this.selectedFyYear);
      }, 5000);

    }, error => {
      this.loading = false;
    })
  }
  interestedForNextYearTpa(data) {
    this.loading = true;
    var workingItr = this.itrDataList.filter(item => item.itrId === data.itrId)[0];
    workingItr['nextYearTpa'] = 'INTERESTED';
    console.log(workingItr);

    const param = '/itr/' + workingItr['userId'] + '/' + workingItr['itrId'] + '/' + workingItr['assessmentYear'];
    this.itrMsService.putMethod(param, workingItr).subscribe((result: ITR_JSON) => {
      this.myItrsList(this.selectedFyYear);
    }, error => {
      this.myItrsList(this.selectedFyYear);
    });
  }

  showUserDoucuments(data) {
    console.log(data);
    this.router.navigate(['/pages/itr-filing/user-docs/' + data.userId]);
  }
}
