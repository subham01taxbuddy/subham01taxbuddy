import { Employer } from './../../../modules/shared/interfaces/itr-input.interface';
import { ITR_JSON } from '../../../modules/shared/interfaces/itr-input.interface';
import { UtilsService } from './../../../services/utils.service';
import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AppConstants } from 'src/app/modules/shared/constants';
import { GridOptions, ValueSetterParams } from 'ag-grid-community';
import { ItrMsService } from 'src/app/services/itr-ms.service';
declare let $: any;

@Component({
  selector: 'app-salary',
  templateUrl: './salary.component.html',
  styleUrls: ['./salary.component.css']
})
export class SalaryComponent implements OnInit {
  loading: boolean = false;
  employerDetailsFormGroup: FormGroup;
  public salaryGridOptions: GridOptions;
  public summaryAllowGridOptions: GridOptions;
  public employersGridOptions: GridOptions;
  localEmployer: Employer;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  readonly limitPT = 2500;
  maxPT = this.limitPT;
  maxEA = 5000;
  salaryView: string = "FORM";
  employerMode = "ADD";
  currentIndex: number = null;
  // itrDocuments = [];
  // deletedFileData: any = [];
  // viewer = 'DOC';
  // docUrl = '';
  salaryDropdown = [{
    "value": "SEC17_1",
    "label": "Salary as per section 17(1)",
  }, {
    "value": "SEC17_2",
    "label": "Perquisites as per section 17(2)",
  }, {
    "value": "SEC17_3",
    "label": "Profit in lieu of salary  as per section 17(3)",
  },]

  allowanceDropdown = [{
    id: null,
    seqNum: 1,
    value: "HOUSE_RENT",
    label: "House Rent Allowance u/s 13(A)",
    detailed: false
  }, {
    id: null,
    seqNum: 2,
    value: "LTA",
    label: "Leave Travel Allowances u/s 10(5)",
    detailed: false
  }, {
    "id": null,
    "seqNum": 4,
    "value": "CHILDREN_EDUCATION",
    "label": "Children education allowance",
    "detailed": false
  }, {
    "id": null,
    "seqNum": 6,
    "value": "GRATUITY",
    "label": "Gratuity received u/s 10(10)",
    "detailed": false
  }, {
    "id": null,
    "seqNum": 7,
    "value": "COMMUTED_PENSION",
    "label": "Pension received u/s 10(10A)",
    "detailed": false
  }, {
    "id": null,
    "seqNum": 8,
    "value": "LEAVE_ENCASHMENT",
    "label": "Leave Encashment u/s 10(10AA)",
    "detailed": false
  }, {
    "id": null,
    "seqNum": 10,
    "value": "ANY_OTHER",
    "label": "Any Other Allowance",
    "detailed": false
  }];
  stateDropdown = AppConstants.stateDropdown;
  constructor(private router: Router,
    private fb: FormBuilder,
    public utilsService: UtilsService,
    private itrMsService: ItrMsService,) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.localEmployer = {
      id: Math.random().toString(36).substr(2, 9),
      employerName: '',
      address: '',
      city: '',
      pinCode: '',
      state: '',
      employerPAN: '',
      employerTAN: '',
      taxableIncome: null,
      exemptIncome: null,
      standardDeduction: null,
      periodFrom: '',
      periodTo: '',
      taxDeducted: null,
      taxRelief: null,
      employerCategory: '',
      salary: [],
      allowance: [],
      perquisites: [],
      profitsInLieuOfSalaryType: [],
      deductions: [],
      upload: [],
      calculators: null
    };
    if (this.utilsService.isNonEmpty(this.ITR_JSON) && this.utilsService.isNonEmpty(this.ITR_JSON.employers) &&
      this.ITR_JSON.employers instanceof Array && this.ITR_JSON.employers.length > 0) {
      this.salaryView = 'TABLE';
    }
  }

  ngOnInit() {
    // this.getDocuments();
    this.utilsService.smoothScrollToTop();
    this.employerDetailsFormGroup = this.createEmployerDetailsFormGroup();
    this.salaryCallInConstructor(this.salaryDropdown);
    this.summaryAllowCallInConstructor(this.allowanceDropdown);
    this.employerCallInConstructor();

    //this.maxPT = 5000;
    this.maxEA = 5000;
    if (this.ITR_JSON.employers === null || this.ITR_JSON.employers === undefined) {
      this.ITR_JSON.employers = [];
    }
    this.ITR_JSON.employers.forEach((item: any) => {
      if (item.deductions instanceof Array) {
        item.deductions.forEach(deductions => {
          if (deductions.deductionType === 'PROFESSIONAL_TAX') {
            this.maxPT = this.maxPT - Number(deductions.exemptAmount);
          }

          if (deductions.deductionType === 'ENTERTAINMENT_ALLOW') {
            this.maxEA = this.maxEA - Number(deductions.exemptAmount);
          }
        });
      }
    });
    if (this.ITR_JSON.regime === 'NEW') {
      this.employerDetailsFormGroup.controls['professionalTax'].setValue(null)
      this.employerDetailsFormGroup.controls['professionalTax'].disable();
    }
    if ((this.ITR_JSON.employerCategory !== 'GOVERNMENT' && this.ITR_JSON.employerCategory !== 'CENTRAL_GOVT') || this.ITR_JSON.regime === 'NEW') {
      this.employerDetailsFormGroup.controls['entertainmentAllow'].disable();
    }
    // this.employerDetailsFormGroup.controls['professionalTax'].setValidators(Validators.compose([Validators.max(this.limitPT), Validators.pattern(AppConstants.numericRegex)]));
    // this.employerDetailsFormGroup.controls['professionalTax'].updateValueAndValidity();
    this.employerDetailsFormGroup.controls['entertainmentAllow'].setValidators(Validators.compose([Validators.pattern(AppConstants.numericRegex), Validators.max(this.maxEA)]));
    this.employerDetailsFormGroup.controls['entertainmentAllow'].updateValueAndValidity();
  }

  createEmployerDetailsFormGroup() {
    return this.fb.group({
      employerName: ['', Validators.compose([Validators.required, Validators.pattern(AppConstants.charRegex)])],
      address: ['', Validators.required],
      city: ['', Validators.compose([Validators.required, Validators.pattern(AppConstants.charRegex)])],
      state: ['', Validators.compose([Validators.required])],
      pinCode: ['', Validators.compose([Validators.required, Validators.maxLength(6), Validators.pattern(AppConstants.PINCode)])],
      // employerPAN: ['', Validators.pattern(AppConstants.panNumberRegex)],
      employerTAN: ['', Validators.compose([Validators.pattern(AppConstants.tanNumberRegex)])],
      entertainmentAllow: [null, Validators.compose([Validators.pattern(AppConstants.numericRegex), Validators.max(5000)])],
      professionalTax: [null, { validators: Validators.compose([Validators.max(this.limitPT), Validators.pattern(AppConstants.numericRegex)]), updateOn: 'change' }],
    });
  }

  // Salary Grid Start
  salaryCallInConstructor(salaryDropdown) {
    this.salaryGridOptions = <GridOptions>{
      rowData: this.salaryCreateRowData(salaryDropdown),
      columnDefs: this.salaryCreateColumnDef(salaryDropdown),
      onGridReady: () => {
        this.salaryGridOptions.api.sizeColumnsToFit();
      },

      // frameworkComponents: {
      //   numericEditor: NumericEditorComponent
      // },
      suppressDragLeaveHidesColumns: true,
      // enableCellChangeFlash: true,
      enableCellTextSelection: true,
      defaultColDef: {
        resizable: true
      },
    };
  }

  // Using 280994
  salaryCreateColumnDef(salaryDropdown) {
    return [
      {
        headerName: 'Salary Type',
        field: 'salaryType',
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          if (salaryDropdown.length !== 0) {
            const nameArray = salaryDropdown.filter((item: any) => item.value === params.data.salaryType);
            return nameArray[0].label;
          } else {
            return params.data.salaryType;
          }
        },
        editable: false,
        tooltip: function (params) {
          if (salaryDropdown.length !== 0) {
            const nameArray = salaryDropdown.filter((item: any) => item.value === params.data.salaryType);
            return nameArray[0].label;
          } else {
            return params.data.salaryType;
          }
        },
        suppressMenu: true
      },
      {
        headerName: 'Gross Amount',
        field: 'taxableAmount',
        suppressMovable: true,
        editable: true,
        cellEditor: 'numericEditor',
        headerComponentParams: { menuIcon: 'fa-external-link-alt' },
        valueSetter: (params: ValueSetterParams) => {  //to make sure user entered number only
          var newValInt = parseInt(params.newValue);
          var valueChanged = params.data.taxableAmount !== newValInt;
          if (valueChanged) {
            params.data.taxableAmount = newValInt ? newValInt : params.oldValue;
          }
          return valueChanged;
        },
      },

      {
        headerName: 'Clear',
        suppressMovable: true,
        editable: false,
        suppressMenu: true,
        sortable: true,
        width: 75,
        cellStyle: { textAlign: 'center' },
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Clear" style="border: none;
          background: transparent; font-size: 16px; cursor:pointer;color: red">
        <i class="fa fa-times-circle" aria-hidden="true" data-action-type="remove"></i>
       </button>`;
        },
      },

    ];
  }

  public onSalaryRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          this.salaryGridOptions.rowData.splice(params.rowIndex, 1, {
            id: params.data.id,
            salaryType: params.data.salaryType,
            taxableAmount: null,
            exemptAmount: null
          });
          this.salaryGridOptions.api?.setRowData(this.salaryGridOptions.rowData);
          break;
        }
      }
    }
  }

  salaryCreateRowData(salaryDropdown) {
    const data = [];
    for (let i = 0; i < salaryDropdown.length; i++) {
      data.push({
        id: i,
        salaryType: salaryDropdown[i].value,
        taxableAmount: null,
        exemptAmount: null
      });
    }
    return data;
  }

  summaryAllowCallInConstructor(allowanceDropdownSummary) {
    this.summaryAllowGridOptions = <GridOptions>{
      rowData: this.summaryAllowCreateRowData(allowanceDropdownSummary),
      columnDefs: this.summaryAllowCreateColumnDef(allowanceDropdownSummary),
      onGridReady: () => {
        this.summaryAllowGridOptions.api.sizeColumnsToFit();
      },

      // frameworkComponents: {
      //   numericEditor: NumericEditorComponent
      // },
      suppressDragLeaveHidesColumns: true,
      // enableCellChangeFlash: true,
      enableCellTextSelection: true,
      defaultColDef: {
        resizable: true
      },
    };
  }

  summaryAllowCreateColumnDef(allowanceDropdownSummary) {
    return [
      {
        headerName: 'Allowance Type',
        field: 'allowanceType',
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          if (allowanceDropdownSummary.length !== 0) {
            const nameArray = allowanceDropdownSummary.filter((item: any) => item.value === params.data.allowanceType);
            return nameArray[0].label;
          } else {
            return params.data.allowanceType;
          }
        },
        editable: false,
        tooltip: function (params) {
          if (allowanceDropdownSummary.length !== 0) {
            const nameArray = allowanceDropdownSummary.filter((item: any) => item.value === params.data.allowanceType);
            return nameArray[0].label;
          } else {
            return params.data.allowanceType;
          }
        },
      },
      {
        headerName: 'Exempt Amount',
        field: 'exemptAmount',
        editable: true,
        suppressMovable: true,
        cellEditor: 'numericEditor',
        valueSetter: (params: ValueSetterParams) => {  //to make sure user entered number only
          var newValInt = parseInt(params.newValue);
          var valueChanged = params.data.exemptAmount !== newValInt;
          if (valueChanged) {
            params.data.exemptAmount = newValInt ? newValInt : params.oldValue;
          }
          return valueChanged;
        },
      },
      {
        headerName: 'Clear',
        editable: false,
        suppressMovable: true,
        suppressMenu: true,
        sortable: true,
        width: 75,
        cellStyle: { textAlign: 'center' },
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Clear" style="border: none;
          background: transparent; font-size: 16px; cursor:pointer;color: red">
          <i class="fa fa-times-circle" aria-hidden="true" data-action-type="remove"></i>
         </button>`;
        },
      },
    ];
  }

  public onSummaryAllowRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          this.summaryAllowGridOptions.rowData.splice(params.rowIndex, 1, {
            id: params.data.id,
            allowanceType: params.data.allowanceType,
            taxableAmount: null,
            exemptAmount: 0
          });
          this.summaryAllowGridOptions.api?.setRowData(this.summaryAllowGridOptions.rowData);
          break;
        }
      }
    }
  }

  summaryAllowCreateRowData(allowanceDropdownSummary) {
    if (this.ITR_JSON.regime === 'NEW')
      allowanceDropdownSummary = allowanceDropdownSummary.filter(item => item.value !== 'HOUSE_RENT' && item.value !== 'LTA' && item.value !== 'CHILDREN_EDUCATION' && item.value !== 'HOSTEL_EXPENDITURE');
    const data = [];
    for (let i = 0; i < allowanceDropdownSummary.length; i++) {
      data.push({
        id: i,
        allowanceType: allowanceDropdownSummary[i].value,
        taxableAmount: 0,
        exemptAmount: null
      });
    }
    return data;
  }

  addEmployer(data) {
    this.salaryView = 'FORM';
    this.employerMode = 'ADD';
    this.employerDetailsFormGroup = this.createEmployerDetailsFormGroup();
    this.salaryCallInConstructor(this.salaryDropdown);
    this.summaryAllowCallInConstructor(this.allowanceDropdown);

    // this.localIdentifier = Math.random().toString(36).substr(2, 9);
    this.localEmployer = {
      id: Math.random().toString(36).substr(2, 9),
      employerName: '',
      address: '',
      city: '',
      pinCode: '',
      state: '',
      employerPAN: '',
      employerTAN: '',
      taxableIncome: null,
      exemptIncome: null,
      standardDeduction: null,
      periodFrom: '',
      periodTo: '',
      taxDeducted: null,
      taxRelief: null,
      employerCategory: '',
      salary: [],
      allowance: [],
      perquisites: [],
      profitsInLieuOfSalaryType: [],
      deductions: [],
      upload: [],
      calculators: null
    };
    this.employerDetailsFormGroup.controls['employerName'].setValue(this.utilsService.isNonEmpty(data) ? data.deductorName : '');
    this.employerDetailsFormGroup.controls['employerTAN'].setValue(this.utilsService.isNonEmpty(data) ? data.deductorTAN : '');

    // this.maxPT = 5000;
    this.maxEA = 5000;
    this.ITR_JSON.employers.forEach((item: any) => {
      item.deductions.forEach(deductions => {
        if (deductions.deductionType === 'PROFESSIONAL_TAX') {
          this.maxPT = this.maxPT - Number(deductions.exemptAmount);
        }

        if (deductions.deductionType === 'ENTERTAINMENT_ALLOW') {
          this.maxEA = this.maxEA - Number(deductions.exemptAmount);
        }
      });
    });
    if ((this.ITR_JSON.employerCategory !== 'GOVERNMENT' && this.ITR_JSON.employerCategory !== 'CENTRAL_GOVT') || this.ITR_JSON.regime === 'NEW') {
      this.employerDetailsFormGroup.controls['entertainmentAllow'].disable();
    }
    this.employerDetailsFormGroup.controls['professionalTax'].setValidators(Validators.compose([Validators.max(this.limitPT), Validators.pattern(AppConstants.numericRegex)]));
    this.employerDetailsFormGroup.controls['professionalTax'].updateValueAndValidity();
    this.employerDetailsFormGroup.controls['entertainmentAllow'].setValidators(Validators.compose([Validators.pattern(AppConstants.numericRegex), Validators.max(this.maxEA)]));
    this.employerDetailsFormGroup.controls['entertainmentAllow'].updateValueAndValidity();
    /* Using End */
  }

  validatePT() {
    this.employerDetailsFormGroup.controls['professionalTax'].markAllAsTouched();
  }

  saveEmployerDetails() {

    // this.localEmployer = {
    //   id: Math.random().toString(36).substr(2, 9),
    //   employerName: '',
    //   address: '',
    //   city: '',
    //   pinCode: '',
    //   state: '',
    //   employerPAN: '',
    //   employerTAN: '',
    //   taxableIncome: null,
    //   exemptIncome: null,
    //   standardDeduction: null,
    //   periodFrom: '',
    //   periodTo: '',
    //   taxDeducted: null,
    //   taxRelief: null,
    //   employerCategory: '',
    //   salary: [],
    //   allowance: [],
    //   perquisites: [],
    //   profitsInLieuOfSalaryType: [],
    //   deductions: [],
    //   upload: [],
    //   calculators: null
    // };
    if (this.employerDetailsFormGroup.valid) {
      this.localEmployer.address = this.employerDetailsFormGroup.controls['address'].value
      this.localEmployer.employerName = this.employerDetailsFormGroup.controls['employerName'].value
      this.localEmployer.state = this.employerDetailsFormGroup.controls['state'].value
      this.localEmployer.pinCode = this.employerDetailsFormGroup.controls['pinCode'].value
      this.localEmployer.city = this.employerDetailsFormGroup.controls['city'].value
      this.localEmployer.employerTAN = this.employerDetailsFormGroup.controls['employerTAN'].value
      this.localEmployer.salary = [];
      this.localEmployer.perquisites = [];
      this.localEmployer.profitsInLieuOfSalaryType = [];
      for (let i = 0; i < this.salaryGridOptions.rowData.length; i++) {
        if (this.utilsService.isNonEmpty(this.salaryGridOptions.rowData[i].taxableAmount) || this.utilsService.isNonEmpty(this.salaryGridOptions.rowData[i].exemptAmount)) {
          if (this.salaryGridOptions.rowData[i].salaryType === "SEC17_1") {
            this.localEmployer.salary.push({
              salaryType: "SEC17_1",
              taxableAmount: Number(this.salaryGridOptions.rowData[i].taxableAmount),
              exemptAmount: Number(this.salaryGridOptions.rowData[i].exemptAmount)
            });
            // totalSalExempt = totalSalExempt + Number(this.salaryGridOptions.rowData[i].exemptAmount);
          }
          if (this.salaryGridOptions.rowData[i].salaryType === "SEC17_2") {
            this.localEmployer.perquisites.push({
              perquisiteType: 'SEC17_2',
              taxableAmount: Number(this.salaryGridOptions.rowData[i].taxableAmount),
              exemptAmount: Number(this.salaryGridOptions.rowData[i].exemptAmount)
            });
          }
          if (this.salaryGridOptions.rowData[i].salaryType === "SEC17_3") {
            this.localEmployer.profitsInLieuOfSalaryType.push({
              salaryType: 'SEC17_3',
              taxableAmount: Number(this.salaryGridOptions.rowData[i].taxableAmount),
              exemptAmount: Number(this.salaryGridOptions.rowData[i].exemptAmount)
            });
          }
        }
      }

      this.localEmployer.allowance = [];
      let totalAllowExempt = 0;
      for (let i = 0; i < this.summaryAllowGridOptions.rowData.length; i++) {
        if (this.utilsService.isNonZero(this.summaryAllowGridOptions.rowData[i].taxableAmount) || this.utilsService.isNonZero(this.summaryAllowGridOptions.rowData[i].exemptAmount)) {
          this.localEmployer.allowance.push({
            allowanceType: this.summaryAllowGridOptions.rowData[i].allowanceType,
            taxableAmount: Number(this.summaryAllowGridOptions.rowData[i].taxableAmount),
            exemptAmount: Number(this.summaryAllowGridOptions.rowData[i].exemptAmount)
          });
          totalAllowExempt = totalAllowExempt + Number(this.summaryAllowGridOptions.rowData[i].exemptAmount);
        }
      }
      if (this.utilsService.isNonZero(totalAllowExempt) || this.utilsService.isNonZero(totalAllowExempt)) {
        this.localEmployer.allowance.push({
          allowanceType: 'ALL_ALLOWANCES',
          taxableAmount: 0,
          exemptAmount: totalAllowExempt
        });
      }

      if (!this.utilsService.isNonEmpty(this.localEmployer.deductions)) {
        this.localEmployer.deductions = [];
      }
      this.localEmployer.deductions = this.localEmployer.deductions.filter((item: any) => item.deductionType !== 'PROFESSIONAL_TAX');
      if (this.employerDetailsFormGroup.controls['professionalTax'].value !== null && this.employerDetailsFormGroup.controls['professionalTax'].value !== '') {
        this.localEmployer.deductions.push({
          deductionType: 'PROFESSIONAL_TAX',
          taxableAmount: 0,
          exemptAmount: Number(this.employerDetailsFormGroup.controls['professionalTax'].value)
        });
      }
      this.localEmployer.deductions = this.localEmployer.deductions.filter((item: any) => item.deductionType !== 'ENTERTAINMENT_ALLOW');
      if (this.employerDetailsFormGroup.controls['entertainmentAllow'].value !== null && this.employerDetailsFormGroup.controls['entertainmentAllow'].value !== '') {
        this.localEmployer.deductions.push({
          deductionType: 'ENTERTAINMENT_ALLOW',
          taxableAmount: 0,
          exemptAmount: Number(this.employerDetailsFormGroup.controls['entertainmentAllow'].value)
        });
      }

      this.serviceCall()
    } else {
      $('input.ng-invalid').first().focus();
    }
  }

  serviceCall() {
    this.Copy_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.loading = true;
    if (this.employerMode === 'ADD') {
      const myEmp = JSON.parse(JSON.stringify(this.localEmployer));
      if(this.Copy_ITR_JSON.employers == null || this.Copy_ITR_JSON.employers.length == 0){
        this.Copy_ITR_JSON.employers = [];
      }
      this.Copy_ITR_JSON.employers.push(myEmp);
    } else if (this.employerMode === 'UPDATE') {
      const myEmp = JSON.parse(JSON.stringify(this.localEmployer));
      this.Copy_ITR_JSON.employers.splice(this.currentIndex, 1, myEmp);
    }

    if (!this.Copy_ITR_JSON.systemFlags) {
      this.Copy_ITR_JSON.systemFlags = {
        hasSalary: false,
        hasHouseProperty: false,
        hasMultipleProperties: false,
        hasForeignAssets: false,
        hasCapitalGain: false,
        hasBroughtForwardLosses: false,
        hasAgricultureIncome: false,
        hasOtherIncome: false,
        hasParentOverSixty: false,
        hasBusinessProfessionIncome: false,
        hasFutureOptionsIncome: false,
        hasNRIIncome: false,
        hraAvailed: false,
        directorInCompany: false,
        haveUnlistedShares: false
      };
    }
    this.Copy_ITR_JSON.systemFlags.hasSalary = true;
    this.Copy_ITR_JSON = this.claimEitherHraOr80GG(this.Copy_ITR_JSON);
    // this.ITR_JSON.employers = [];
    // const myEmp = JSON.parse(JSON.stringify(this.localEmployer));
    // this.ITR_JSON.employers.push(myEmp);
    // sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
    console.log('Employer details Filled:', this.ITR_JSON)
    const param = '/taxitr?type=employers';

    // this.ITR_JSON = result;
    // this.ITR_JSON = JSON.parse(JSON.stringify(this.Copy_ITR_JSON))
    // this.currentIndex = this.ITR_JSON.employers.findIndex((item:any) => item.id === this.localEmployer.id);
    // this.localEmployer = JSON.parse(JSON.stringify(this.ITR_JSON.employers[this.currentIndex]));
    // this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
    // sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));

    // // this.utilsService.disposable.unsubscribe();
    // this.utilsService.showSnackBar('Salary updated successfully.');
    // this.utilsService.smoothScrollToTop();
    // this.salaryView = 'TABLE';
    // this.employerCallInConstructor();

    this.itrMsService.postMethod(param, this.Copy_ITR_JSON).subscribe((result: any) => {
      if (this.utilsService.isNonEmpty(result)) {
        this.ITR_JSON = result;
        this.currentIndex = this.ITR_JSON.employers.findIndex((item: any) => item.id === this.localEmployer.id);
        this.localEmployer = JSON.parse(JSON.stringify(this.ITR_JSON.employers[this.currentIndex]));
        this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
        sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));

        // this.utilsService.disposable.unsubscribe();
        this.utilsService.showSnackBar('Salary updated successfully.');
        this.utilsService.smoothScrollToTop();
        this.salaryView = 'TABLE';
        this.employerCallInConstructor();
        this.loading = false;
        return
      } else {
        this.loading = false;
        this.utilsService.showSnackBar('Failed to save salary detail, Please try again');
      }

    }, error => {
      this.loading = false;
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      // this.utilsService.disposable.unsubscribe();
      this.utilsService.showSnackBar('Failed to save salary detail.');
      this.utilsService.smoothScrollToTop();
    });
  }

  cancelEmployer() {
    if (this.utilsService.isNonEmpty(this.ITR_JSON) && this.utilsService.isNonEmpty(this.ITR_JSON.employers) &&
      this.ITR_JSON.employers instanceof Array && this.ITR_JSON.employers.length > 0) {
      this.salaryView = 'TABLE';
      this.employerDetailsFormGroup.reset();
    } else {
      this.salaryView = 'FORM';
      this.employerDetailsFormGroup = this.createEmployerDetailsFormGroup();
    }

    this.utilsService.smoothScrollToTop();
  }
  editEmployerDetails(index) {
    this.employerDetailsFormGroup.reset();
    this.currentIndex = index;
    this.salaryView = 'FORM';
    this.localEmployer = this.ITR_JSON.employers[index];
    this.employerMode = 'UPDATE';

    // if (this.localEmployer.id === null || this.localEmployer.id === '' || this.localEmployer.id === undefined) {
    //   this.localIdentifier = Math.random().toString(36).substr(2, 9);
    // } else {
    //   this.localIdentifier = this.localEmployer.id;
    // }

    // if (this.localEmployer.salary === null) {
    //   this.localEmployer.salary = [];
    // }

    // if (this.localEmployer.profitsInLieuOfSalaryType === null) {
    //   this.localEmployer.profitsInLieuOfSalaryType = [];
    // }
    // if (this.localEmployer.allowance === null) {
    //   this.localEmployer.allowance = [];
    // }
    // if (this.localEmployer.perquisites === null) {
    //   this.localEmployer.perquisites = [];
    // }
    // if (this.localEmployer.deductions === null) {
    //   this.localEmployer.deductions = [];
    // }

    /* Employer set values */
    this.employerDetailsFormGroup.patchValue(this.localEmployer);

    // this.getData(this.localEmployer.pinCode);
    this.salaryGridOptions.rowData = this.salaryCreateRowData(this.salaryDropdown);
    this.salaryGridOptions.columnDefs = this.salaryCreateColumnDef(this.salaryDropdown);
    if (this.localEmployer.salary instanceof Array) {
      // const salary = this.localEmployer.salary.filter((item:any) => item.salaryType !== 'SEC17_1');
      for (let i = 0; i < this.localEmployer.salary.length; i++) {
        const id = this.salaryGridOptions.rowData.filter((item: any) => item.salaryType === this.localEmployer.salary[i].salaryType)[0].id;
        this.salaryGridOptions.rowData.splice(id, 1, {
          id: id,
          salaryType: this.localEmployer.salary[i].salaryType,
          taxableAmount: this.localEmployer.salary[i].taxableAmount,
          exemptAmount: this.localEmployer.salary[i].exemptAmount
        });
      }
      // const sec17_1 = this.localEmployer.salary.filter((item:any) => item.salaryType === 'SEC17_1');
      // if (sec17_1.length > 0) {
      //   this.summarySalaryForm.controls['sec17_1'].setValue(sec17_1[0].taxableAmount);
      // }
    }
    /* Perquisites Set Values */
    if (this.localEmployer.perquisites instanceof Array) {
      for (let i = 0; i < this.localEmployer.perquisites.length; i++) {
        const id = this.salaryGridOptions.rowData.filter((item: any) => item.salaryType === this.localEmployer.perquisites[i].perquisiteType)[0].id;
        this.salaryGridOptions.rowData.splice(id, 1, {
          id: id,
          salaryType: this.localEmployer.perquisites[i].perquisiteType,
          taxableAmount: this.localEmployer.perquisites[i].taxableAmount,
          exemptAmount: this.localEmployer.perquisites[i].exemptAmount
        });
      }
    }
    /* ProfitsInLieuOfSalary Set Values */
    if (this.localEmployer.profitsInLieuOfSalaryType instanceof Array) {
      for (let i = 0; i < this.localEmployer.profitsInLieuOfSalaryType.length; i++) {
        const id = this.salaryGridOptions.rowData.filter((item: any) => item.salaryType === this.localEmployer.profitsInLieuOfSalaryType[i].salaryType)[0].id;
        this.salaryGridOptions.rowData.splice(id, 1, {
          id: id,
          salaryType: this.localEmployer.profitsInLieuOfSalaryType[i].salaryType,
          taxableAmount: this.localEmployer.profitsInLieuOfSalaryType[i].taxableAmount,
          exemptAmount: this.localEmployer.profitsInLieuOfSalaryType[i].exemptAmount
        });
      }
    }

    // Set Allowance
    this.summaryAllowGridOptions.rowData = this.summaryAllowCreateRowData(this.allowanceDropdown);
    this.summaryAllowGridOptions.columnDefs = this.summaryAllowCreateColumnDef(this.allowanceDropdown);
    if (this.localEmployer.allowance instanceof Array) {
      const allowance = this.localEmployer.allowance.filter((item: any) => item.allowanceType !== 'ALL_ALLOWANCES');
      for (let i = 0; i < allowance.length; i++) {
        const id = this.summaryAllowGridOptions.rowData.filter((item: any) => item.allowanceType === allowance[i].allowanceType)[0].id;
        this.summaryAllowGridOptions.rowData.splice(id, 1, {
          id: id,
          allowanceType: allowance[i].allowanceType,
          taxableAmount: allowance[i].taxableAmount,
          exemptAmount: allowance[i].exemptAmount
        });
      }
    }




    /* Deductions Set Values */
    if (this.localEmployer.deductions instanceof Array) {
      for (let i = 0; i < this.localEmployer.deductions.length; i++) {
        if (this.localEmployer.deductions[i].deductionType === 'ENTERTAINMENT_ALLOW') {
          this.employerDetailsFormGroup.controls['entertainmentAllow'].setValue(this.localEmployer.deductions[i].exemptAmount);
        } else if (this.localEmployer.deductions[i].deductionType === 'PROFESSIONAL_TAX') {
          this.employerDetailsFormGroup.controls['professionalTax'].setValue(this.localEmployer.deductions[i].exemptAmount);
          if (this.ITR_JSON.regime === 'NEW') {
            this.employerDetailsFormGroup.controls['professionalTax'].setValue(null)
            this.employerDetailsFormGroup.controls['professionalTax'].disable();
          }
        }
      }
    }

    // this.maxPT = 5000;
    this.maxEA = 5000;
    this.ITR_JSON.employers.forEach((item: any) => {
      if (item.deductions instanceof Array) {
        item.deductions.forEach(deductions => {
          if (deductions.deductionType === 'PROFESSIONAL_TAX') {
            this.maxPT = this.maxPT - Number(deductions.exemptAmount);
          }
          if (deductions.deductionType === 'ENTERTAINMENT_ALLOW') {
            this.maxEA = this.maxEA - Number(deductions.exemptAmount);
          }
        });
      }
    });
    this.maxPT = this.maxPT + Number(this.employerDetailsFormGroup.controls['professionalTax'].value);
    this.maxEA = this.maxEA + Number(this.employerDetailsFormGroup.controls['entertainmentAllow'].value);
    // this.employerDetailsFormGroup.controls['professionalTax'].setValidators(Validators.compose([Validators.max(this.limitPT), Validators.pattern(AppConstants.numericRegex)]));
    // this.employerDetailsFormGroup.controls['professionalTax'].updateValueAndValidity();
    this.employerDetailsFormGroup.controls['entertainmentAllow'].setValidators(Validators.compose([Validators.pattern(AppConstants.numericRegex), Validators.max(this.maxEA)]));
    this.employerDetailsFormGroup.controls['entertainmentAllow'].updateValueAndValidity();

    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
  }
  claimEitherHraOr80GG(ITR_JSON: ITR_JSON) {
    let hraFound = false;
    for (let i = 0; i < ITR_JSON.employers?.length; i++) {
      for (let j = 0; j < ITR_JSON.employers[i].allowance?.length; j++) {
        if (ITR_JSON.employers[i].allowance[j].allowanceType === 'HOUSE_RENT') {
          hraFound = true;
          break;
        }
      }
    }
    if (hraFound) {
      ITR_JSON.systemFlags.hraAvailed = true;
      ITR_JSON.expenses?.filter((item: any) => item.expenseType !== 'HOUSE_RENT_PAID')
    } else {
      ITR_JSON.systemFlags.hraAvailed = false;
    }
    return ITR_JSON;
  }
  employerCallInConstructor() {
    this.employersGridOptions = <GridOptions>{
      rowData: this.employerCreateRowData(),
      columnDefs: this.employerCreateColumnDef(),
      onGridReady: () => {
        this.employersGridOptions.api.sizeColumnsToFit();
      },

      // frameworkComponents: {
      //   numericEditor: NumericEditorComponent
      // },
      suppressDragLeaveHidesColumns: true,
      // enableCellChangeFlash: true,
      enableCellTextSelection: true,
      defaultColDef: {
        resizable: true
      },
    };
  }

  employerCreateColumnDef() {
    return [
      {
        headerName: 'No',
        field: 'index',
        suppressMovable: true,
        editable: false,
        width: 75,
      },
      {
        headerName: 'Employer Name',
        field: 'employerName',
        suppressMovable: true,
        editable: false,
      },
      {
        headerName: 'Gross Salary',
        field: 'grossSalary',
        editable: false,
        suppressMovable: true,
      },
      {
        headerName: 'Exemptions',
        field: 'exemptions',
        editable: false,
        suppressMovable: true,
      },
      {
        headerName: 'Total Deductions',
        field: 'totalDeductions',
        editable: false,
        suppressMovable: true,
      },
      {
        headerName: 'Taxable Income',
        field: 'taxableIncome',
        editable: false,
        suppressMovable: true,
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
          return `<button type="button" class="action_icon add_button" title="Delete Employer" style="border: none;
          background: transparent; font-size: 16px; cursor:pointer;color: red">
          <i class="fa fa-trash" aria-hidden="true" data-action-type="remove"></i>
         </button>
          <button type="button" class="action_icon add_button"  title="Update Employer details" style="border: none;
          background: transparent; font-size: 16px; cursor:pointer;color: green">
          <i class="fa fa-pencil" aria-hidden="true" data-action-type="edit"></i>
         </button>`;
        },
      },
    ];
  }

  public onEmployerRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          console.log('Params for delete', params)
          // this.employersGridOptions.rowData.splice(params.rowIndex, 1, {
          //   id: params.data.id,
          //   allowanceType: params.data.allowanceType,
          //   taxableAmount: null,
          //   exemptAmount: 0
          // });
          // this.employersGridOptions.api?.setRowData(this.employersGridOptions.rowData);
          this.deleteEmployer(params)
          break;
        }
        case 'edit': {
          this.editEmployerDetails(params.rowIndex);
          break;
        }
      }
    }
  }
  deleteEmployer(params) {
    this.Copy_ITR_JSON.employers = this.Copy_ITR_JSON.employers.filter((item: any) => item.id !== params.data.id);
    if (this.Copy_ITR_JSON.employers.length > 0) {
      this.Copy_ITR_JSON.systemFlags.hasSalary = true;
    } else {
      if (this.Copy_ITR_JSON.planIdSelectedByTaxExpert === 22) { //here 22 is salary planId
        this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
        this.utilsService.showSnackBar('You have selected Salary Income Plan, at least one employer details is required.');
        return;
      }
      this.Copy_ITR_JSON.systemFlags.hraAvailed = false;
      this.Copy_ITR_JSON.systemFlags.hasSalary = false;
    }
    // const param = `/itremployer?docId=${id}&userId=${this.ITR_JSON.userId}&itrId=${this.ITR_JSON.itrId}&assessmentYear=${this.ITR_JSON.assessmentYear}`;
    // this.itrMsService.deleteMethod(param).subscribe((result: any) => {
    //   this.ITR_JSON = result;
    //   this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
    //   if(this.ITR_JSON.employers.length > 0){
    //     this.employerCallInConstructor();
    //   }else{
    //     this.addEmployer(null);
    //   }
    //   sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
    //   this.loading = false;
    // }, error => {
    //   this.loading = false;
    // });
    this.loading = true;
    const param = '/taxitr?type=employers';
    this.itrMsService.postMethod(param, this.Copy_ITR_JSON).subscribe((result: any) => {
      this.ITR_JSON = result;
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
      if (this.ITR_JSON.employers.length > 0) {
        this.employersGridOptions.api.updateRowData({ remove: [params.data] });
      } else {
        this.addEmployer(null);
      }

      this.loading = false;
      this.utilsService.showSnackBar('Employer deleted Successfully.');
    }, error => {
      this.loading = false;
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      // this.utilsService.disposable.unsubscribe();
      this.utilsService.showSnackBar('Failed to delete employer detail.');
      this.utilsService.smoothScrollToTop();
    });

  }
  getSalaryTaxableIncome() {
    let taxable = 0
    for (let i = 0; i < this.ITR_JSON?.employers?.length; i++) {
      taxable = taxable + this.ITR_JSON.employers[i].taxableIncome;
    }
    return this.utilsService.currencyFormatter(taxable);
  }
  employerCreateRowData() {
    const data = [];
    if (this.utilsService.isNonEmpty(this.ITR_JSON) && this.utilsService.isNonEmpty(this.ITR_JSON.employers) && this.ITR_JSON.employers instanceof Array) {
      for (let i = 0; i < this.ITR_JSON.employers.length; i++) {
        let exemptions = this.ITR_JSON.employers[i].allowance?.filter(item => item.allowanceType === 'ALL_ALLOWANCES');
        let salary = this.ITR_JSON.employers[i].salary?.filter(item => item.salaryType === 'SEC17_1');
        let profitsInLieuOfSalary = this.ITR_JSON.employers[i].profitsInLieuOfSalaryType?.filter(item => item.salaryType === 'SEC17_3');
        let perquisites = this.ITR_JSON.employers[i].perquisites?.filter(item => item.perquisiteType === 'SEC17_2');
        let pt = this.ITR_JSON.employers[i].deductions?.filter(item => item.deductionType === 'PROFESSIONAL_TAX');
        data.push({
          index: i + 1,
          id: this.ITR_JSON.employers[i].id,
          employerName: this.utilsService.isNonEmpty(this.ITR_JSON.employers[i].employerName) ? this.ITR_JSON.employers[i].employerName : `Employer ${i + 1}`,
          grossSalary: (salary?.length > 0 ? salary[0].taxableAmount : 0) + (profitsInLieuOfSalary?.length > 0 ? profitsInLieuOfSalary[0].taxableAmount : 0) + (perquisites?.length > 0 ? perquisites[0].taxableAmount : 0),
          exemptions: exemptions?.length > 0 ? exemptions[0].exemptAmount : 0,
          totalDeductions: this.ITR_JSON.employers[i].standardDeduction + (pt?.length > 0 ? pt[0].exemptAmount : 0),
          taxableIncome: this.ITR_JSON.employers[i].taxableIncome,
          // exemptAmount: null
        });
      }
    }
    return data;
  }

  documents = []
  //  !! deprecated 
  // getDocuments() {
  //   const param = `/cloud/file-info?currentPath=${this.ITR_JSON.userId}/ITR/${this.utilsService.getCloudFy(this.ITR_JSON.financialYear)}/Original/ITR Filing Docs`;
  //   this.itrMsService.getMethod(param).subscribe((result: any) => {
  //     this.documents = result;
  //   })
  // }
  //  !! deprecated 
  // deleteFile(fileName) {
  //   let adminId = JSON.parse(localStorage.getItem("UMD"));
  //   var path = '/itr/cloud/files?actionBy=' + adminId.USER_UNIQUE_ID;
  //   let filePath = `${this.ITR_JSON.userId}/ITR/${this.utilsService.getCloudFy(this.ITR_JSON.financialYear)}/Original/ITR Filing Docs/${fileName}`;
  //   var reqBody = [filePath];
  //   console.log('URL path: ', path, ' filePath: ', filePath, ' Request body: ', reqBody);
  //   this.itrMsService.deleteMethodWithRequest(path, reqBody).subscribe((responce: any) => {
  //     console.log('Doc delete responce: ', responce);
  //     this.utilsService.showSnackBar(responce.response);
  //     this.getDocuments();
  //   },
  //     error => {
  //       console.log('Doc delete ERROR responce: ', error.responce);
  //       this.utilsService.showSnackBar(error.response);
  //     })
  // }
  //  !! deprecated 
  // deletedFileInfo(cloudFileId) {
  //   this.deletedFileData = [];
  //   this.loading = true;
  //   let param = '/cloud/log?cloudFileId=' + cloudFileId;
  //   this.itrMsService.getMethod(param).subscribe((res: any) => {
  //     this.loading = false;
  //     this.deletedFileData = res;
  //     console.log('Deleted file detail info: ', this.deletedFileData);
  //   },
  //     error => {
  //       this.loading = false;
  //     })
  // }

  // closeDialog() {
  //   this.deletedFileData = [];
  // }
  //  !! deprecated 
  // afterUploadDocs(fileUpload) {
  //   if (fileUpload === 'File uploaded successfully') {
  //     this.getDocuments();
  //   }
  // }

  // getAllForm16s(documentTag) {
  //   return this.itrDocuments.filter((item: any) => item.documentTag === documentTag)

  // }
  //  !! deprecated 
  /* getSignedUrl(document) {
    console.log('document selected', document);
    const ext = document.fileName.split('.').pop();
    console.log('this.viewer', this.viewer);
    if (ext.toLowerCase() === 'pdf' || ext.toLowerCase() === 'xls' || ext.toLowerCase() === 'doc' || ext.toLowerCase() === 'xlsx' || ext.toLowerCase() === 'docx') {
      this.viewer = 'DOC';
    } else {
      this.viewer = 'IMG';
    }
    if (document.isPasswordProtected) {
      this.docUrl = document.passwordProtectedFileUrl;
      return;
    }

    this.loading = true;
    const param = `/cloud/signed-s3-url?filePath=${document.filePath}`;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      console.log(res);
      this.docUrl = res['signedUrl'];
      this.loading = false;
    }, error => {
      this.loading = false;
    })
  } */
}
