import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { ITR_JSON, professionalIncome } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ProfessionalDialogComponent } from './professional-dialog/professional-dialog.component';

@Component({
  selector: 'app-presumptive-professional-income',
  templateUrl: './presumptive-professional-income.component.html',
  styleUrls: ['./presumptive-professional-income.component.scss']
})
export class PresumptiveProfessionalIncomeComponent implements OnInit {
  public professionalGridOptions: GridOptions;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  professionalData: professionalIncome = {
    natureOfBusiness: null,
    tradeName: null,
    receipts: null,
    presumptiveIncome: null,
  }

  constructor(
    public matDialog: MatDialog,
    public itrMsService: ItrMsService,
    public utilsService: UtilsService
  ) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
    if (this.Copy_ITR_JSON.business.presumptiveIncomes) {
      let incomeDetails;
      let data = this.Copy_ITR_JSON.business.presumptiveIncomes.filter((item: any) => item.businessType === "PROFESSIONAL");
      if (data.length > 0) {
        let businessArray = [];
        data.forEach((obj: any) => {
          incomeDetails = obj.incomes;
          for (let i = 0; i < obj.incomes.length; i++) {
            incomeDetails[i].natureOfBusiness = obj.natureOfBusiness;
            incomeDetails[i].tradeName = obj.tradeName;
            businessArray.push(incomeDetails[i]);
          }
        });
        this.getProfessionalTableData(businessArray);
      }
      else {
        this.getProfessionalTableData([]);
      }
    } else {
      this.getProfessionalTableData([]);
    }
  }

  ngOnInit(): void {
  }

  getProfessionalTableData(rowsData) {
    this.professionalGridOptions = <GridOptions>{
      rowData: rowsData,
      columnDefs: this.createProfessionalColumnDef(rowsData),
      onGridReady: () => {
        this.professionalGridOptions.api.sizeColumnsToFit();
      },
      suppressDragLeaveHidesColumns: true,
      enableCellChangeFlash: true,
      defaultColDef: {
        resizable: true,
        editable: false
      },
      suppressRowTransform: true
    };
  }

  createProfessionalColumnDef(rowsData) {
    return [
      {
        headerName: 'Nature of Profession',
        field: 'natureOfBusiness',
        suppressMovable: true,
        editable: false,
        width: 400,
        valueGetter: function nameFromCode(params) {
          return params.data.natureOfBusiness ? params.data.natureOfBusiness.toLocaleString('en-IN') : params.data.natureOfBusiness;
        },
      },

      {
        headerName: 'Trade Name',
        field: 'tradeName',
        editable: false,
        suppressMovable: true,
        width: 290,
        valueGetter: function nameFromCode(params) {
          return params.data.tradeName ? params.data.tradeName.toLocaleString('en-IN') : params.data.tradeName;
        },
      },

      {
        headerName: 'Gross Receipt',
        editable: false,
        field: 'receipts',
        width: 250,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.receipts ? params.data.receipts.toLocaleString('en-IN') : params.data.receipts;
        },
      },

      {
        headerName: 'presumptive Income min 50%',
        field: 'presumptiveIncome',
        editable: false,
        width: 250,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.presumptiveIncome ? params.data.presumptiveIncome.toLocaleString('en-IN') : params.data.presumptiveIncome;
        },
      },

      {
        headerName: 'Actions',
        editable: false,
        suppressMovable: true,
        suppressMenu: true,
        sortable: true,
        pinned: 'right',
        width: 100,
        cellStyle: { textAlign: 'center' },
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button"  title="Update Bonds details" style="border: none;
          background: transparent; font-size: 16px; cursor:pointer;color: green">
          <i class="fa fa-pencil" aria-hidden="true" data-action-type="edit"></i>
         </button>
          <button type="button" class="action_icon add_button" title="Delete Bonds" style="border: none;
          background: transparent; font-size: 16px; cursor:pointer;color: red">
          <i class="fa fa-trash" aria-hidden="true" data-action-type="remove"></i>
         </button>`;
        },
      },
    ];
  }


  public onProfessionalRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          this.deleteProfession(params.rowIndex);
          break;
        }
        case 'edit': {
          this.addEditProfessionalRow('EDIT', params.data, params.rowIndex);
          break;
        }
      }
    }
  }

  deleteProfession(index) {
    this.professionalGridOptions.rowData.splice(index, 1);
    this.professionalGridOptions.api.setRowData(this.professionalGridOptions.rowData);
  }

  addEditProfessionalRow(mode, data: any, index?) {
    if (mode === 'ADD') {
      const length = this.professionalGridOptions.rowData.length;
    }

    const dialogRef = this.matDialog.open(ProfessionalDialogComponent, {
      data: {
        mode: mode,
        data: data,
        natureList: this.professionalGridOptions.rowData,
      },
      closeOnNavigation: true,
      disableClose: false,
      width: '700px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Result add CG=', result);
      if (result !== undefined) {
        if (mode === 'ADD') {
          this.professionalGridOptions.rowData.push(result);
          this.professionalGridOptions.api.setRowData(this.professionalGridOptions.rowData);
        }
        if (mode === 'EDIT') {
          this.professionalGridOptions.rowData[index] = result;
          this.professionalGridOptions.api.setRowData(this.professionalGridOptions.rowData);
        }
      }
    });

  }

  onContinue() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    let presBusinessIncome = [];
    this.professionalGridOptions.rowData.forEach(element => {
      let isAdded = false;
      presBusinessIncome.forEach(data => {
        if (data.natureOfBusiness == element.natureOfBusiness) {
          isAdded = true;
          data.incomes.push({
            "id": null,
            "incomeType": "PROFESSIONAL",
            "receipts": element.receipts,
            "presumptiveIncome": element.presumptiveIncome,
            "periodOfHolding": null,
            "minimumPresumptiveIncome": null,
            "registrationNo": null,
            "ownership": null,
            "tonnageCapacity": null
          });
        }
      });
      if (!isAdded) {
        presBusinessIncome.push({
          "id": null,
          "businessType": "PROFESSIONAL",
          "natureOfBusiness": element.natureOfBusiness,
          "label": null,
          "tradeName": element.tradeName,
          "salaryInterestAmount": null,
          "taxableIncome": null,
          "exemptIncome": null,
          "incomes": [{
            "id": null,
            "incomeType": "PROFESSIONAL",
            "receipts": element.receipts,
            "presumptiveIncome": element.presumptiveIncome,
            "periodOfHolding": null,
            "minimumPresumptiveIncome": null,
            "registrationNo": null,
            "ownership": null,
            "tonnageCapacity": null
          }]
        });
      };
    });
    console.log("presBusinessIncome", presBusinessIncome)
    if (!this.Copy_ITR_JSON.business.presumptiveIncomes) {
      this.Copy_ITR_JSON.business.presumptiveIncomes = presBusinessIncome
    } else {
      let data = this.Copy_ITR_JSON.business.presumptiveIncomes.filter((item: any) => item.businessType != "PROFESSIONAL");
      this.Copy_ITR_JSON.business.presumptiveIncomes = (data).concat(presBusinessIncome)
    }
    console.log(this.Copy_ITR_JSON);

    const param = '/itr/' + this.ITR_JSON.userId + '/' + this.ITR_JSON.itrId + '/' + this.ITR_JSON.assessmentYear;
    this.itrMsService.putMethod(param, this.Copy_ITR_JSON).subscribe((result: any) => {
      this.ITR_JSON = result;
      sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
      this.utilsService.showSnackBar('professional income added successfully');
      console.log('business=', result);
      this.utilsService.smoothScrollToTop();
    }, error => {
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      this.utilsService.showSnackBar('Failed to add professional income, please try again.');
      this.utilsService.smoothScrollToTop();
    });
  }
}
