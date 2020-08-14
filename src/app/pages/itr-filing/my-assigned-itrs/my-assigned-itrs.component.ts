import { UtilsService } from 'app/services/utils.service';
import { Component, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { ItrMsService } from 'app/services/itr-ms.service';
import { AppConstants } from 'app/shared/constants';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-assigned-itrs',
  templateUrl: './my-assigned-itrs.component.html',
  styleUrls: ['./my-assigned-itrs.component.css']
})
export class MyAssignedItrsComponent implements OnInit {
  loading: boolean = false;
  myItrsGridOptions: GridOptions;
  itrDataList = [];
  constructor(private itrMsService: ItrMsService, public utilsService: UtilsService, private router: Router) {
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
    this.myItrsList();
  }
  myItrsList() {
    this.loading = true;
    return new Promise((resolve, reject) => {
      const loggedInUserData = JSON.parse(localStorage.getItem('UMD'));
      const param = `/itr-by-filingTeamMemberId?filingTeamMemberId=${loggedInUserData.USER_UNIQUE_ID}`;/* ${loggedInUserData.USER_UNIQUE_ID} */
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

    // this.loading = true;
    // const loggedInUserData = JSON.parse(localStorage.getItem('UMD'));
    // const param = `/itr-by-filingTeamMemberId?filingTeamMemberId=1063`;/* ${loggedInUserData.USER_UNIQUE_ID} */
    // this.itrMsService.getMethod(param).subscribe((res: any) => {
    //   console.log('filingTeamMemberId: ', res);
    //   this.myItrsGridOptions.api.setRowData(res);
    //   this.loading = false;
    // }, error => {
    //   this.loading = false;
    // })
  }
  createOnSalaryRowData(data) {
    const newData = [];
    for (let i = 0; i < data.length; i++) {
      newData.push({
        itrId: data[i].itrId,
        fName: data[i].family[0].fName,
        lName: data[i].family[0].lName,
        panNumber: data[i].panNumber,
        contactNumber: data[i].contactNumber,
        email: data[i].email,
        itrType: data[i].itrType,
        eFillingCompleted: data[i].eFillingCompleted,
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
      // {
      //   headerName: 'Un Cliam',
      //   editable: false,
      //   suppressMenu: true,
      //   sortable: true,
      //   suppressMovable: true,
      //   width: 100,
      //   pinned: 'left',
      //   cellRenderer: function (params) {
      //     return `<button type="button" class="action_icon add_button" title="Un-claim client" style="border: none;
      //     background: transparent;
      //     font-size: 16px; cursor:pointer">
      //     <i class="fa fa-trash" aria-hidden="true" data-action-type="unclaim"></i>
      //    </button>`;
      //   },
      //   cellStyle: {
      //     textAlign: 'center', display: 'flex',
      //     'align-items': 'center',
      //     'justify-content': 'center'
      //   },
      // },
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
        headerName: "ITR Type",
        field: "itrType",
        filter: "agTextColumnFilter",
        filterParams: {
          defaultOption: "startsWith",
          debounceMs: 0
        }
      },
      {
        headerName: 'Actions',
        width: 100,
        sortable: true,
        pinned: 'right',
        cellRenderer: function (params) {
          if (params.data.eFillingCompleted) {
            return `<i class="fa fa-check" title="ITR filed successfully" aria-hidden="true"></i>`;
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
}
