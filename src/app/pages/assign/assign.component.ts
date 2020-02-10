import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GstMsService } from 'app/services/gst-ms.service';
import { UserMsService } from 'app/services/user-ms.service';
import { ToastMessageService } from 'app/services/toast-message.service';
import { GridOptions } from 'ag-grid-community';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-assign',
  templateUrl: './assign.component.html',
  styleUrls: ['./assign.component.css']
})
export class AssignComponent implements OnInit {

  reAssignForm: FormGroup;
  adminData: any = [];
  loading: boolean;
  uploadedData: any;
  excelTamplateForm: FormGroup;
  available_merchant_list = []// Observable<any[]>;
  filteredOptions: Observable<any[]>;
  natureCode: any;
  clientListGridOptions: GridOptions;
  uplodedFile: any;
  csvDataInArray = [];
  showCsvGrid: boolean;
  invoice_types_list: any = [{ invoiceTypeId: 1, name: "Sales" },
  { invoiceTypeId: 2, name: "Purchase" }];


  constructor(public gstMsService: GstMsService, public userMsService: UserMsService, public fb: FormBuilder,
    public _toastMessageService: ToastMessageService) {

    this.clientListGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: [],
      enableCellChangeFlash: true,
      onGridReady: params => {
        // params.api.sizeColumnsToFit();
      },
      sortable: true,
      filter: true,
      // floatingFilter: true
    };
  }

  ngOnInit() {
    this.adminList();
    this.reAssignForm = this.fb.group({
      oldTaxExpert: ['', Validators.required],
      newTaxExpert: ['', Validators.required],
    })

  }

  adminList() {
    let param = '/getAdminList';
    this.loading = true;
    this.userMsService.getMethod(param).subscribe((res: any) => {
      console.log(res)
      this.loading = false;
      this.adminData = res;
    },
      error => {
        this._toastMessageService.alert("error", error.message)
        this.loading = false;
      })
  }


  run() {
    let param = '/invoice-auto-assign/';
    this.loading = true;
    this.gstMsService.getMethod(param).subscribe((result: any) => {
      console.log(result)
      this._toastMessageService.alert("success", result.response)
      this.loading = false;
    },
      error => {
        this._toastMessageService.alert("error", error.response)
        this.loading = false;
      })
  }

  assign() {
    if (this.reAssignForm.valid) {
      console.log(this.reAssignForm.value)
      if (this.reAssignForm.value.oldTaxExpert !== this.reAssignForm.value.newTaxExpert) {
        //{{url}}/invoice-re-assign/?fromTaxExpertId=3000&toTaxExpertId=2555
        this.loading = true;
        let param = '/invoice-re-assign/?fromTaxExpertId=' + this.reAssignForm.value.oldTaxExpert + '&toTaxExpertId=' + this.reAssignForm.value.newTaxExpert;
        this.gstMsService.getMethod(param).subscribe((res: any) => {
          console.log(res)
          this._toastMessageService.alert("success", res.response)
          this.loading = false;
        },
          error => {
            this._toastMessageService.alert("error", error.response)
            this.loading = false;
          })
      } else {
        this._toastMessageService.alert("error", "Both tax experts are same, Please select different.")
      }
    }
    else {
      $('input.ng-invalid').first().focus();
      return
    }
  }

  /// Doc Upload Part ///////////////



  // papaParseCompleteFunction(results) {
  //    console.log('Results', results);
  // }



}
