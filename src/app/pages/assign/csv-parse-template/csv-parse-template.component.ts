import { Component, OnInit } from '@angular/core';
import { UserMsService } from 'app/services/user-ms.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UtilsService } from 'app/services/utils.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { invalid } from 'moment';
import { Papa } from 'ngx-papaparse';
import { GridOptions } from 'ag-grid-community';
import { GstMsService } from 'app/services/gst-ms.service';
import * as moment from 'moment';
import { threadId } from 'worker_threads';
import { NumericEditor } from 'app/shared/numeric-editor.component';
import { CustomDateComponent } from 'app/shared/date.component';
import { AgGridMaterialSelectEditorComponent } from 'app/shared/dropdown.component';
import { AppConstants } from 'app/shared/constants';
import { NavbarService } from 'app/services/navbar.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-csv-parse-template',
  templateUrl: './csv-parse-template.component.html',
  styleUrls: ['./csv-parse-template.component.css']
})
export class CSVParseTemplateComponent implements OnInit {

  excelTamplateForm: FormGroup;
  available_merchant_list = []// Observable<any[]>;
  filteredOptions: Observable<any[]>;
  natureCode: any;
  clientListGridOptions: GridOptions;
  uplodedFile: any;
  csvDataInArray: any;
  periodType: any = [];
  isLeapYear: boolean;
  loading: boolean;
  selectedPeriod: any;
  invoice_types_list: any = [{ invoiceTypeId: 1, name: "Sales" },
  { invoiceTypeId: 2, name: "Purchase" }];

  constructor(public userMsService: UserMsService, public fb: FormBuilder, public gstMsService: GstMsService,
    public _toastMessageService: ToastMessageService, public utilsService: UtilsService, private papa: Papa, public http: HttpClient) {
    this.clientListGridOptions = <GridOptions>{
      rowData: [],
      // columnDefs: this.clientListCreateColoumnDef(),
      enableCellChangeFlash: true,
      onGridReady: params => {
        // params.api.sizeColumnsToFit();
      },
      frameworkComponents: {
        numericEditor: NumericEditor,
        agDateInput: CustomDateComponent,
        matSelect: AgGridMaterialSelectEditorComponent
      },
      sortable: true,
      // filter: true,
      // floatingFilter: true
    };

  }

  ngOnInit() {
    this.getMerchantList();
    this.excelTamplateForm = this.fb.group({
      user: ['', Validators.required],
      period: ['', Validators.required],
      type: ['', Validators.required],
      upload: ['', Validators.required]

    })
  }


  getMerchantList() {
    this.loading = true;
    let param = '/itr/getGSTDetail';
    this.userMsService.getMethodInfo(param).subscribe((res: any) => {
      if (Array.isArray(res)) {
        res.forEach(bData => {
          let tName = bData.fName + " " + bData.lName;
          if (bData.mobileNumber) {
            tName += " (" + bData.mobileNumber + ")"
          } else if (bData.emailAddress) {
            tName += " (" + bData.emailAddress + ")"
          }
          this.available_merchant_list.push({ userId: bData.userId, name: tName });
          this.filteredOptions = this.excelTamplateForm.controls['user'].valueChanges
            .pipe(
              startWith(''),
              map(userId => {
                return userId;
              }),
              map(name => {
                return name ? this._filter(name) : this.available_merchant_list.slice();
              })
            );
        });
      }
      this.loading = false;
    }, err => {
      let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
      this._toastMessageService.alert("error", "business list - " + errorMessage);
      this.loading = false;
    });
  }

  getPeriodList(event) {
    alert(event)
  }

  displayFn(name) {
    return name ? name : undefined;
  }

  _filter(name) {
    const filterValue = name.toLowerCase();
    return this.available_merchant_list.filter(option => option.name.toLowerCase().indexOf(filterValue) === 0);
  }
  periodArray = [];
  getCodeFromLabelOnBlur() {
    console.log(this.excelTamplateForm.value)
    if (this.utilsService.isNonEmpty(this.excelTamplateForm.value.user) && this.utilsService.isNonEmpty(this.excelTamplateForm.value.user)) {
      this.natureCode = this.available_merchant_list.filter(item => item.name.toLowerCase() === this.excelTamplateForm.value.user.toLowerCase());
      if (this.natureCode.length !== 0) {
        this.natureCode = this.natureCode[0].userId;
        console.log('1 natureCode on blur = ', this.natureCode);
        this.loading = true;
        const param = `/gst-return-calendars/?businessId=${this.natureCode}&gstrType=${1}`;
        this.gstMsService.getMethod(param).subscribe((res: any) => {
          if (Array.isArray(res)) {
            this.periodArray = res
            res.forEach((cData: any) => {
              let tName = cData.gstReturnMonthDisplay + "-" + cData.gstReturnYear;
              // let tmonthYear = cData.gstReturnMonth + "-" + cData.gstReturnYear;
              this.periodType.push({ id: cData.id, name: tName })
            });
          }
          this.loading = false;
          // return resolve(true);
        }, error => {
          this.loading = false;
          // console.log('get profile failure:', error);
        })


      } else {
        this.excelTamplateForm.controls['user'].setErrors(invalid);
        console.log('2 natureCode on blur = ', this.natureCode);
      }
    }
  }

  records: any;
  uploadFile($event) {
    console.log($event)
    const fileList = $event.srcElement.files;
    //const fileList = $event.FileList;
    this.parseCsvFile(fileList[0]);
    this.excelTamplateForm.controls['upload'].setValue(fileList[0]);
    console.log(this.excelTamplateForm)
  }
  parseCsvFile(file) {
    this.papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: 'greedy',
      worker: true,
      chunk: this.papaParseChunk,
      // complete: this.papaParseCompleteFunction
    });
  }
  invoiceType: any = [];
  uploadInfo() {
    console.log(this.excelTamplateForm.value)
    this.selectedPeriod = this.excelTamplateForm.value.period;
    this.invoiceType = this.excelTamplateForm.value.type;
    console.log("Doneeeeeeeeeeeeeeeee")
    console.log('My uploaded data', this.csvDataInArray)
    let file = JSON.parse(sessionStorage.getItem('uploaedFile'));
    console.log('File header data', file.meta.fields);
    let calenderData = this.periodArray.filter(item => item.id === this.excelTamplateForm.value.period)[0];
    this.clientListGridOptions.api.setColumnDefs(this.clientListCreateColoumnDef(file.meta.fields, calenderData, this.invoiceType))
    this.clientListGridOptions.api.setRowData(this.createRowData(file.data, file.meta.fields));
  }

  papaParseChunk(chunk) {
    console.log("Chunk:", chunk, chunk.data);
    this.csvDataInArray = chunk.data;
    sessionStorage.setItem('uploaedFile', JSON.stringify(chunk));
  }

  clientListCreateColoumnDef(headers, calenderData, invoiceType) {
    console.log(invoiceType)
    let invoiceTypeSales = [{ countryCode: 'B2B', countryName: 'Sales B2B' }, { countryCode: 'B2C', countryName: 'Sales B2C' }]
    let invoiceTypePurchase = [{ countryCode: 'Purchase', countryName: 'Purchase' }, { countryCode: 'Expense', countryName: 'Expense' }]
    let startDate = new Date(calenderData.gstReturnYear, (calenderData.gstReturnMonth - 1), 1);
    let endDay = new Date(calenderData.gstReturnYear, calenderData.gstReturnMonth, 0).getDate();
    let endDate = new Date(calenderData.gstReturnYear, (calenderData.gstReturnMonth - 1), endDay);
    return [
      {
        headerName: 'Validated',
        field: 'isValidGSTN',
        width: 70,
        cellRenderer: function (params) {
          console.log(params.data.gstin)
          if (params.data.gstin !== null && params.data.gstin !== "" && params.data.gstin !== undefined) {
            if (params.data.isValidGSTN === true) {
              return `<i class="fa fa-check" style="color: green;" aria-hidden="true"></i>`;
            } else {
              return `<i class="fa fa-times" style="color: red;" aria-hidden="true"></i>`;
            }
          }
        },
        cellStyle: { textAlign: 'center' },
        pinned: 'left',
      },
      {
        // headerName: 'Invoice Type',
        headerName: headers[0],
        field: 'invoiceType',
        width: 100,
        //editable: true,
        callEditor: 'matSelect',
        cellEditorParams: { values: extractValues((invoiceType === 1 ? invoiceTypeSales : invoiceTypePurchase)) },
        valueFormatter: function (params) {
          console.log('params valueFormatter', params);
          return lookupValue((invoiceType === 1 ? invoiceTypeSales : invoiceTypePurchase), params.value);
        },
        valueParser: function (params) {
          console.log('params parser', params);
          return lookupKey((invoiceType === 1 ? invoiceTypeSales : invoiceTypePurchase), params.newValue);
        }
        //},
      },
      {
        headerName: headers[1],
        field: 'invoiceDate',
        width: 100,
        editable: true,
        cellEditor: 'agDateInput',
        valueFormatter: (data) => data.value ? moment(data.value).format('DD/MM/YYYY') : null,
        cellClassRules: {
          'invalid-row': function (params) {
            // console.log('My params data.....', params.data.invoiceDate);

            if (params.data.invoiceDate) {
              let date = new Date(params.data.invoiceDate);
              if (startDate <= date && date <= endDate) {
                return false;
              }
              else {
                return true;
              }
            }
          },
        },
      },
      {
        headerName: headers[2],
        field: 'invoiceNum',
        width: 100,
        editable: true,
        cellClassRules: {
          'invalid-row': function (params) {
            console.log('My params invoiceNum.....', params.data.invoiceNum);
            //console.log('invoiceNum length.....', params.data.invoiceNum.length);
            if (params.data.invoiceNum) {
              if (params.data.invoiceNum.toString().length <= 20) {
                return false;
              }
              else {
                return true;
              }
            }
          },
        },
      },
      {
        headerName: headers[3],
        field: 'gstin',
        width: 100,
        editable: function (params) {
          if (invoiceType == 1) {
            if (params.data.invoiceType === "B2B") {
              return true;
            } else {
              return false;
            }
          } else if (invoiceType == 2) {
            return true;
          }

        },
        cellClassRules: {
          'invalid-row': function (params) {
            console.log('My params Contact.....', params);
            if (params.data.gstin !== null && params.data.invoiceType !== "B2C") {
              if (AppConstants.GSTNRegex.test(params.data.gstin)) {
                return false;
              }
              else {
                return true;
              }
            }

          },
        },
      },
      {
        headerName: headers[4],
        field: 'contactNo',
        width: 100,
        editable: true,
        //valueFormatter: (data) => data.value ? moment(data.value).format('DD/MM/YYYY') : null,
        cellEditor: 'numericEditor',
        tooltip: function (params) {
          return ('Contact number should be numeric, no decimal, upto 10 digit.');
        },
        cellClassRules: {
          'invalid-row': function (params) {
            // console.log('My params Contact.....', params);
            if (params.data.contactNo !== null) {
              if (AppConstants.mobileNumberRegex.test(params.data.contactNo)) {
                return false;
              }
              else {
                return true;
              }
            }
          },
        },
      },

      {
        headerName: headers[5],
        field: 'custName',
        // width: 100,
        editable: true,
        cellClassRules: {
          'invalid-row': function (params) {
            // console.log('My params data.....', params.data.invoiceDate);
            if (params.data.custName) {
              if (params.data.custName.length <= 200) {
                return false;
              }
              else {
                return true;
              }
            }
          },
        },
      },
      {
        headerName: headers[6],
        field: 'custEmail',
        //width: 100,
        editable: true,
        cellClassRules: {
          'invalid-row': function (params) {
            // console.log('My params Contact.....', params);
            if (params.data.custEmail !== null) {
              if (AppConstants.emailRegex.test((params.data.custEmail).trim())) {
                return false;
              }
              else {
                return true;
              }
            }
          },
        },
      },
      {
        headerName: headers[7],
        field: 'plcaeOfSupply',
        width: 100,
        editable: true
      },
      {
        headerName: headers[8],
        field: 'description',
        width: 100,
        editable: true,
        cellStyle: { textAlign: 'center' }
      },
      {
        headerName: headers[9],
        field: 'hsn',
        width: 100,
        editable: true,
        cellEditor: 'numericEditor',
        tooltip: function (params) {
          return ('HSN/SAC number should be numeric, no decimal');
        },
        cellStyle: { textAlign: 'right' }
      },
      {
        headerName: headers[10],
        field: 'taxVal',
        width: 100,
        editable: true,
        cellEditor: 'numericEditor',
        cellStyle: { textAlign: 'right' },
        valueFormatter: function valueFormatter(params) {
          return params.data.taxVal ? params.data.taxVal.toLocaleString('en-IN'): params.data.taxVal;   
        }
      },
      {
        headerName: headers[11],
        field: 'rate',
        width: 100,
        editable: true,
        // callEditor: 'matSelect'
        cellStyle: { textAlign: 'center' }
      },
      {
        headerName: headers[12],
        field: 'cgst',
        width: 100,
        editable: true,
        cellEditor: 'numericEditor',
        cellStyle: { textAlign: 'right' },
        valueFormatter: function valueFormatter(params) {
          return params.data.cgst ? params.data.cgst.toLocaleString('en-IN'): params.data.cgst;   
        }
      },
      {
        headerName: headers[13],
        field: 'sgst',
        width: 100,
        editable: true,
        cellEditor: 'numericEditor',
        cellStyle: { textAlign: 'right' },
        valueFormatter: function valueFormatter(params) {
          return params.data.sgst ? params.data.sgst.toLocaleString('en-IN'): params.data.sgst;   
        }

      },
      {
        headerName: headers[14],
        field: 'igst',
        width: 100,
        editable: true,
        cellEditor: 'numericEditor',
        cellStyle: { textAlign: 'right' },
        valueFormatter: function valueFormatter(params) {
          return params.data.igst ? params.data.igst.toLocaleString('en-IN'): params.data.igst;   
        }
      },
      {
        headerName: headers[15],
        field: 'cess',
        width: 100,
        editable: true,
        cellEditor: 'numericEditor',
        cellStyle: { textAlign: 'right' }

      },
      {
        headerName: headers[16],
        field: 'grossVal',
        width: 100,
        editable: true,
        cellEditor: 'numericEditor',
        cellStyle: { textAlign: 'right' },
        /* valueFormatter: function valueFormatter(params) {
          return params.data.grossVal ? (Math.round(params.data.sales * 100) / 100).toLocaleString('en-IN') : params.data.sales;
        }, */
        valueFormatter: function valueFormatter(params) {
          return params.data.grossVal ? params.data.grossVal.toLocaleString('en-IN'): params.data.grossVal;   
        }
      },
      {
        headerName: headers[17],
        field: 'amntRecevied',
        width: 100,
        hide: invoiceType === 1 ? false : true,
        editable: true,
        cellEditor: 'numericEditor',
        cellStyle: { textAlign: 'right' }
      }

    ];
  }

  createRowData(data, column) {
    const userData = [];
    console.log(data, column)
    for (let i = 0; i < data.length; i++) {

      // console.log("invoiceType: ", data[i]['Invoice Type'], "invoiceDate: ", data[i]['Invoice Date'], "invoiceNum: ", data[i]['Invoice Number'],
      //   "contactNo: ", this.excelTamplateForm.value.type === 1 ? data[i]['Customer Contact No.'] : data[i]['Supplier Contact No.'], "gstin: ", data[i]['GSTN Of Customer'], "custName: ", data[i]['Customer Name'], "custEmail: ", data[i]['Customer Email'], "plcaeOfSupply: ", data[i]['Place of Supply'], "description: ", data[i]['Description'], "hsn: ", data[i]['HSN/SAC'], "taxVal: ", data[i]['Taxable Value'], "rate: ", data[i]['Rate'], "cgst: ", data[i]['CGST'], "sgst: ", data[i]['SGST'], "igst: ", data[i]['IGST'], "cess: " + data[i]['Cess'], "grossVal: ", data[i]['Gross Value'], "amntRecevied: ", data[i]['Amount Received'])
      // let uploadFile = Object.assign({}, { invoiceType: data[i]['Invoice Type'], invoiceDate: data[i]['Invoice Date'], invoiceNum: data[i]['Invoice Number'],
      //  contactNo: data[i][this.excelTamplateForm.value.type === 1 ? 'Customer Contact No.':'Supplier Contact No.'], gstin: data[i]['GSTN Of Customer'], custName: data[i][this.excelTamplateForm.value.type === 1 ? 'Customer Name':'Supplier Name'], custEmail: data[i][this.excelTamplateForm.value.type === 1 ? 'Customer Email':'Supplier Email'], plcaeOfSupply: data[i]['Place of Supply'], description: data[i]['Description'], hsn: data[i]['HSN/SAC'], taxVal: data[i]['Taxable Value'], rate: data[i]['Rate'], cgst: data[i]['CGST'], sgst: data[i]['SGST'], igst: data[i]['IGST'], cess: data[i]['Cess'], grossVal: data[i]['Gross Value'], amntRecevied: data[i]['Amount Received'] });   // organizationId: (data[i].organizationId && data[i].organizationId.length > 0) ? 'Yes' : 'No', organizationSponsored: data[i].organizationSponsored ? 'Yes' : 'No',
      let uploadFile = {
        invoiceType: data[i][column[0]],
        invoiceDate: data[i][column[1]],
        invoiceNum: data[i][column[2]],
        gstin: data[i][column[0]] == 'B2C' ? '' : data[i][column[3]],
        contactNo: data[i][column[4]],
        custName: data[i][column[5]],
        custEmail: data[i][column[6]],
        plcaeOfSupply: data[i][column[7]],
        description: data[i][column[8]],
        hsn: data[i][column[9]],
        taxVal: data[i][column[10]],
        rate: data[i][column[11]],
        cgst: data[i][column[12]],
        sgst: data[i][column[13]],
        igst: data[i][column[14]],
        cess: data[i][column[15]],
        grossVal: data[i][column[16]],
        amntRecevied: data[i][column[17]],
        isValidGSTN: false
      }
      console.log(uploadFile)
      userData.push(uploadFile);

    }
    console.log("userData: ")
    console.log(userData)

    return userData;
  }


  //New upload material btn functional part
  mainUpload() {
    const fileUpload = document.getElementById('fileUploaded') as HTMLInputElement;
    fileUpload.onchange = () => {
      if (fileUpload.files.length > 0) {
        this.uploadFile(fileUpload.files)
      }
    }
    fileUpload.click();
  }


  getLastDay(date) {
    if (date) {
      return new Date(date.getFullYear(), (date.getMonth() + 1), 0).getDate();
    }
  }

  placeOfSupplyValid(data) {
    let stateCode = data.gstin.split(0, 2)
    console.log(stateCode)
    return true;
  }

  checkAndSubimit() {
    //debugger
    let gridRowData = this.clientListGridOptions.api.getRenderedNodes();
    let param = '';

    for (let i = 0; i < gridRowData.length; i++) {
      if (this.utilsService.isNonEmpty(gridRowData[i].data.gstin)) {
        param = param + gridRowData[i].data.gstin + ',';
      }
    }
    param.endsWith('');
    console.log(param)
    this.loading = true;
    NavbarService.getInstance(this.http).getPartyInfoByNoOfGSTIN({ gstinData: param }).subscribe(res => {
      if (res instanceof Array) {
        console.log(res)
        this.loading = false;
        for (let i = 0; i < gridRowData.length; i++) {
          if (this.utilsService.isNonEmpty(gridRowData[i].data.gstin)) {
            let matchGstin = res.filter(item => item.partyGstin === gridRowData[i].data.gstin)
            console.log("matchGstin: ", matchGstin)
            if (matchGstin.length > 0) {
              gridRowData[i].data.isValidGSTN = true;     //Set GSTIN part valid
            } else {
              gridRowData[i].data.isValidGSTN = false;
            }
          }
        }
        console.log(gridRowData)
        this.clientListGridOptions.api.refreshView();

      }
    }, err => {
      this.loading = false;
      if (err.error && err.error.title) { this._toastMessageService.alert("error", err.error.title); }
      // return resolve(null);
    });

  }
}

function extractValues(mappings) {
  const array = [];
  if (mappings) {
    mappings.forEach(element => {
      array.push(element);
    });
  }
  // console.log("")
  return array;
}

// convert code to value
function lookupValue(mappings, key) {
  let country = '';
  mappings.forEach(element => {
    if (element.countryCode == key) {
      country = element.countryName
    }
  });
  if (country !== '' && country !== undefined && country !== null) {
    return `${country[0]}${country.substr(1).toLowerCase()}`;
  } else {
    return ''
  }
}

// convert value to code
function lookupKey(mappings, name) {
  mappings.forEach(element => {
    if (element.countryCode == name) {
      return element.countryName
    }
  });
}
