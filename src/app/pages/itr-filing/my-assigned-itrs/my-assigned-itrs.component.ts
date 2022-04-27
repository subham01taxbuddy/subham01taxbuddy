import { ToastMessageService } from './../../../services/toast-message.service';
import { UserMsService } from './../../../services/user-ms.service';
import { FormControl, Validators } from '@angular/forms';
import { UtilsService } from 'src/app/services/utils.service';
import { ChangeDetectorRef, Component, OnInit, AfterContentChecked } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { AppConstants } from 'src/app/modules/shared/constants';
import { Router } from '@angular/router';
import { FilingStatusDialogComponent } from '../filing-status-dialog/filing-status-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment'
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { environment } from 'src/environments/environment';
import { ChangeStatusComponent } from 'src/app/modules/shared/components/change-status/change-status.component';
import { UserNotesComponent } from 'src/app/modules/shared/components/user-notes/user-notes.component';
declare function matomo(title: any, url: any, event: any, scriptId: any);

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
  config: any;
  selectedPageNo = 0;
  pageWiseItr: any = [];
  constructor(private itrMsService: ItrMsService,
    public utilsService: UtilsService,
    private userMsService: UserMsService,
    private toastMsgService: ToastMessageService,
    private router: Router,
    private dialog: MatDialog,
    private cdRef: ChangeDetectorRef) {
    this.myItrsGridOptions = <GridOptions>{
      rowData: this.createOnSalaryRowData([]),
      columnDefs: this.myItrscreateColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
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
    this.config = {
      itemsPerPage: 50,
      currentPage: 1,
      totalItems: 0
    };
  }
  ngAfterContentChecked() {
    this.cdRef.detectChanges();
  }

  // setFyDropDown() {
  //   const fyList = JSON.parse(sessionStorage.getItem(AppConstants.FY_LIST));
  //   console.log('fyList', fyList);
  //   if (this.utilsService.isNonEmpty(fyList) && fyList instanceof Array) {
  //     this.financialYear = fyList;
  //     const currentFy = this.financialYear.filter((item:any) => item.isFilingActive);
  //     this.selectedFyYear'].setValue(currentFy.length > 0 ? currentFy[0].financialYear : null);
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

  myItrsList(fy: String, pageNo) {
    this.loading = true;
    return new Promise((resolve, reject) => {
      const loggedInUserData = JSON.parse(localStorage.getItem('UMD'));
      let reqBody = {
        'financialYear': fy,
        'filingTeamMemberId': loggedInUserData.USER_UNIQUE_ID
      }
      //https://uat-api.taxbuddy.com/itr/itr-search?page=0&size=20
      //let param = `${ApiEndpoints.itrMs.itrByFilingTeamMemberId}?filingTeamMemberId=${loggedInUserData.USER_UNIQUE_ID}`;/* ${loggedInUserData.USER_UNIQUE_ID} */
      // if (fy !== '') {
      //   param = `${param}&fy=${fy}`;
      // }

      let param = `/itr-search?page=${pageNo}&size=50`;
      let param2 = reqBody;
      // this.itrMsService.getMethod(param).subscribe((res: any) => {
      this.itrMsService.postMethod(param, param2).subscribe((res: any) => {
        console.log('filingTeamMemberId: ', res);
        // TODO Need to update the api here to get the proper data like user management
        if (res['content'] instanceof Array) {
          this.pageWiseItr = res['content'];
          this.itrDataList = this.pageWiseItr;
          this.config.totalItems = res.totalElements;
          this.myItrsGridOptions.api?.setRowData(this.createOnSalaryRowData(res['content']));
        }
        // if (res && res.success) {
        //   this.itrDataList = res.data;
        //   this.myItrsGridOptions.api?.setRowData(this.createOnSalaryRowData(res.data));
        // } else {
        //   this.itrDataList = [];
        //   this.myItrsGridOptions.api?.setRowData(this.createOnSalaryRowData([]));
        // }
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
    this.selectedPageNo = 0;
    this.config.currentPage = 1;
    console.log(event);
    this.myItrsList(event, this.selectedPageNo);
  }

  // changeFy(fy: String) {
  //   this.myItrsList(fy);
  // }

  createOnSalaryRowData(data) {
    console.log('data: -> ', data)
    const newData = [];
    for (let i = 0; i < data.length; i++) {
      newData.push({
        itrId: data[i].itrId,
        userId: data[i].userId,
        fName: (this.utilsService.isNonEmpty(data[i].family) && data[i].family instanceof Array && data[i].family.length > 0) ? (data[i].family[0].fName) : '',
        lName: (this.utilsService.isNonEmpty(data[i].family) && data[i].family instanceof Array && data[i].family.length > 0) ? (data[i].family[0].lName) : '',
        panNumber: data[i].panNumber,
        contactNumber: data[i].contactNumber,
        email: data[i].email,
        itrType: data[i].itrType,
        ackStatus: data[i].ackStatus,
        acknowledgementReceived: data[i].acknowledgementReceived,
        eFillingCompleted: data[i].eFillingCompleted,
        eFillingDate: data[i].eFillingDate,
        nextYearTpa: data[i].nextYearTpa,
        isReviewGiven: data[i].reviewGiven,
        isEverified: data[i].isEverified,
        isRevised: data[i].isRevised,
      });
    }
    return newData;
  }
  getCount(val) {
    return this.itrDataList.filter((item:any) => item.eFillingCompleted === val).length
  }
  myItrscreateColumnDef() {
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
        width: 50,
        sortable: true,
        pinned: 'right',
        cellRenderer: function (params:any) {
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
        cellStyle: function (params:any) {
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
        cellRenderer: function (params:any) {
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
        headerName: 'Call',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params:any) {
          return `<button type="button" class="action_icon add_button" title="Call to user"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-phone" aria-hidden="true" data-action-type="call"></i>
           </button>`;
        },
        width: 50,
        pinned: 'right',
        cellStyle: function (params:any) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
      // {
      //   headerName: "TPA",
      //   field: "nextYearTpa",
      //   width: 50,
      //   pinned: 'right',
      //   cellRenderer: (params:any) => {
      //     return `<input type='checkbox' data-action-type="isTpa" ${params.data.nextYearTpa === 'INTERESTED' || params.data.nextYearTpa === "COMPLETED" ? 'checked' : ''} />`;
      //   },
      //   cellStyle: params => {
      //     return (params.data.nextYearTpa === 'INTERESTED' || params.data.nextYearTpa === 'COMPLETED' || !params.data.eFillingCompleted) ? { 'pointer-events': 'none', opacity: '0.4' }
      //       : '';
      //   }
      // },

      {
        headerName: 'E-Verify',
        width: 50,
        sortable: true,
        pinned: 'right',
        cellRenderer: function (params:any) {
          if (params.data.isEverified) {
            return `<button type="button" class="action_icon add_button" style="border: none;
            background: transparent; font-size: 16px; color: green">
            <i class="fa fa-circle" title="E-Verification is done" 
            aria-hidden="true"></i>
           </button>`;
          } else {
            return `<button type="button" class="action_icon add_button" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;color: orange">
            <i class="fa fa-check-circle" title="Click to check the latest E-verification status" 
            aria-hidden="true" data-action-type="ackDetails"></i>
           </button>`;
          }
        },
        cellStyle: function (params:any) {
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
        headerName: 'Cloud',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params:any) {
          return `<button type="button" class="action_icon add_button" title="View Document cloud" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-cloud" aria-hidden="true" data-action-type="link-to-doc-cloud"></i>
           </button>`;
        },
        width: 50,
        pinned: 'right',
        cellStyle: function (params:any) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
      {
        headerName: "Review",
        field: "isReviewGiven",
        width: 50,
        pinned: 'right',
        cellRenderer: params => {
          return `<input type='checkbox' data-action-type="isReviewGiven" ${params.data.isReviewGiven ? 'checked' : ''} />`;
        },
        cellStyle: params => {
          return (params.data.isReviewGiven) ? { 'pointer-events': 'none', opacity: '0.4' }
            : '';
        }
      },
      {
        headerName: 'Update Status',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params:any) {
          return `<button type="button" class="action_icon add_button" title="Update Status"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-user" aria-hidden="true" data-action-type="updateStatus"></i>
           </button>`;
        },
        width: 60,
        pinned: 'right',
        cellStyle: function (params:any) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
      {
        headerName: 'See/Add Notes',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params:any) {
          return `<button type="button" class="action_icon add_button" title="Click see/add notes"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-book" aria-hidden="true" data-action-type="addNotes"></i>
           </button>`;
        },
        width: 60,
        pinned: 'right',
        cellStyle: function (params:any) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
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
        case 'link-to-doc-cloud': {
          this.showUserDoucuments(params.data);
          break;
        }
        case 'isReviewGiven': {
          this.updateReviewStatus(params.data);
          break;
        }
        case 'call': {
          this.startCalling(params.data)
          break;
        }
        case 'updateStatus': {
          this.updateStatus('Update Status', params.data)
          break;
        }
        case 'addNotes': {
          this.showNotes(params.data)
          break;
        }
      }
    }
  }

  async startFiling(data) {
   // matomo('My ITR Tab', '/pages/itr-filing/my-itrs', ['trackEvent', 'My ITR', 'Actions', data.contactNumber], environment.matomoScriptId);
   this.utilsService.matomoCall('My ITR Tab', '/pages/itr-filing/my-itrs', ['trackEvent', 'My ITR', 'Actions', data.contactNumber], environment.matomoScriptId);
    var workingItr = this.itrDataList.filter((item:any) => item.itrId === data.itrId)[0]
    console.log('data: ', workingItr);
    Object.entries(workingItr).forEach((key, value) => {
      console.log(key, value)
      if (key[1] === null) {
        delete workingItr[key[0]];
      }
    });
    const fyList = await this.utilsService.getStoredFyList();
    const currentFyDetails = fyList.filter((item:any) => item.isFilingActive);
    if (!(currentFyDetails instanceof Array && currentFyDetails.length > 0)) {
      this.utilsService.showSnackBar('There is no any active filing year available')
      return;
    }
    let obj = this.utilsService.createEmptyJson(null, currentFyDetails[0].assessmentYear, currentFyDetails[0].financialYear)
    Object.assign(obj, workingItr)
    console.log('obj:', obj)
    workingItr = JSON.parse(JSON.stringify(obj))
    sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(workingItr));
    this.router.navigate(['/pages/itr-filing/customer-profile'])
  }

  openfilingStatusDialog(data) {
    //matomo('My ITR Tab', '/pages/itr-filing/my-itrs', ['trackEvent', 'My ITR', 'Chat', data.contactNumber], environment.matomoScriptId);
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
    //matomo('My ITR Tab', '/pages/itr-filing/my-itrs', ['trackEvent', 'My ITR', 'E-verification', data.contactNumber], environment.matomoScriptId);
    this.loading = true;
    var workingItr = this.itrDataList.filter((item:any) => item.itrId === data.itrId)[0]
    workingItr['everifiedStatus'] = 'Successfully e-Verified';
    workingItr['isEverified'] = true;
    const param = '/itr/' + workingItr.userId + '/' + workingItr.itrId + '/' + workingItr.assessmentYear;
    this.itrMsService.putMethod(param, workingItr).subscribe((result: any) => {
      this.loading = false;
      this.utilsService.showSnackBar('E-Verification status updated successfully');
      this.myItrsList(this.selectedFyYear, this.selectedPageNo);
    }, error => {
      this.loading = false;
      this.utilsService.showSnackBar('Failed to update E-Verification status');
    });
    return;
    // const param = `${ApiEndpoints.itrMs.itrVerifyStatus}/${data.itrId}`;
    this.itrMsService.putMethod(param).subscribe((res: any) => {
      this.utilsService.showSnackBar(res.status)
      this.loading = false;
      setTimeout(() => {
        this.myItrsList(this.selectedFyYear, this.selectedPageNo);
      }, 5000);

    }, error => {
      this.loading = false;
    })
  }
  interestedForNextYearTpa(data) {
    this.loading = true;
    var workingItr = this.itrDataList.filter((item:any) => item.itrId === data.itrId)[0];
    workingItr['nextYearTpa'] = 'INTERESTED';
    console.log(workingItr);

    const param = '/itr/' + workingItr['userId'] + '/' + workingItr['itrId'] + '/' + workingItr['assessmentYear'];
    this.itrMsService.putMethod(param, workingItr).subscribe((result: ITR_JSON) => {
      this.myItrsList(this.selectedFyYear, this.selectedPageNo);
    }, error => {
      this.myItrsList(this.selectedFyYear, this.selectedPageNo);
    });
  }

  showUserDoucuments(data) {
    console.log(data);
   // matomo('My ITR Tab', '/pages/itr-filing/my-itrs', ['trackEvent', 'My ITR', 'Cloud', data.contactNumber], environment.matomoScriptId);
    this.router.navigate(['/pages/itr-filing/user-docs/' + data.userId]);
  }

  updateReviewStatus(data) {
    //matomo('My ITR Tab', '/pages/itr-filing/my-itrs', ['trackEvent', 'My ITR', 'Review', data.contactNumber], environment.matomoScriptId);
    const param = `/update-itr-userProfile?itrId=${data.itrId}&userId=${data.userId}&isReviewGiven=true`;
    this.itrMsService.putMethod(param, {}).subscribe(result => {
      console.log(result);
      this.utilsService.showSnackBar('Marked as review given');
      this.myItrsList(this.selectedFyYear, this.selectedPageNo);
    }, error => {
      this.utilsService.showSnackBar('Please try again, failed to mark as review given');
      this.myItrsList(this.selectedFyYear, this.selectedPageNo);
    })
  }

  async startCalling(user) {
    const agentNumber = await this.utilsService.getMyCallingNumber();
    if (!agentNumber) {
      this.toastMsgService.alert("error", 'You dont have calling role.')
      return;
    }
    console.log('user: ', user);
    // matomo('My Todays Call', '/pages/dashboard/calling/todays-call', ['trackEvent', 'My Todays Call', 'Call', callInfo], environment.matomoScriptId);
    this.loading = true;
    let customerNumber = user.contactNumber;
    const param = `/call-management/make-call`;
    const reqBody = {
      "agent_number": agentNumber,
      "customer_number": customerNumber
    }
    console.log('reqBody:', reqBody)
    this.userMsService.postMethod(param, reqBody).subscribe((result: any) => {
      console.log('Call Result: ', result);
      this.loading = false;
      if (result.success.status) {
        this.toastMsgService.alert("success", result.success.message)
      }
    }, error => {
      this.utilsService.showSnackBar('Error while making call, Please try again.');
      this.loading = false;
    })
  }

  updateStatus(mode, client) {
    console.log('Client', client);
    let disposable = this.dialog.open(ChangeStatusComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.fName + ' ' + client.lName,
        serviceType: 'TPA',
        mode: mode,
        userInfo: client
      }
    })

    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      console.log('result: ', result);
      if (result) {

      }
    });
  }

  showNotes(client) {
    let disposable = this.dialog.open(UserNotesComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.fName + ' ' + client.lName
      }
    })
    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
  pageChanged(event) {
    this.config.currentPage = event;
    this.selectedPageNo = event - 1;
    this.myItrsList(this.selectedFyYear, this.selectedPageNo);
  }
}
