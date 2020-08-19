import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { UtilsService } from 'app/services/utils.service';
import { ItrMsService } from 'app/services/itr-ms.service';
import { ITR_JSON, PresumptiveIncomes } from 'app/shared/interfaces/itr-input.interface';
import { map, startWith } from 'rxjs/operators';
import { invalid } from 'moment';
import { Observable } from 'rxjs/Observable';
import { AppConstants } from 'app/shared/constants';
import { GridOptions } from 'ag-grid-community';

@Component({
  selector: 'app-business',
  templateUrl: './business.component.html',
  styleUrls: ['./business.component.css']
})
export class BusinessComponent implements OnInit {
  loading: boolean = false;
  employerDetailsFormGroup: FormGroup;
  itrDocuments = [];
  ITR_JSON: ITR_JSON;
  businessMode: any = '';
  mode: any = '';
  docDetails = {
    docUrl: '',
    docType: ''
  };
  natureOfBusinessPlaceholder: String = 'Nature of Business';
  natureOfBusinessForm = new FormControl('', Validators.required);
  filteredOptions: Observable<any[]>;
  tradeName = new FormControl('', [Validators.required, Validators.pattern(AppConstants.charRegex)]);
  businessType = new FormControl('BUSINESS', [Validators.required]);
  businessIncomeCashForm: FormGroup;
  businessIncomeBankForm: FormGroup;
  professionIncomeForm: FormGroup;
  commonForm: FormGroup;
  localPresumptiveIncome: PresumptiveIncomes;
  CopyIncome = [];
  total1 = 0;
  total2 = 0;

  businessTypeDropdown = [{
    value: 'BUSINESS', label: 'Business income section 44AD',
  }, {
    value: 'PROFESSIONAL', label: 'Professional income section 44ADA',
  },/*  {
    value: 'TRANSPORT', label: 'Transport income section 44AE',
  } */];

  currentIndex: number = null;
  localIncomes = [];
  public businessGridOptions: GridOptions;
  constructor(private fb: FormBuilder, public utilsService: UtilsService,
    private itrMsService: ItrMsService) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    if (this.utilsService.isNonEmpty(this.ITR_JSON.business) && this.utilsService.isNonEmpty(this.ITR_JSON.business.presumptiveIncomes) && this.ITR_JSON.business.presumptiveIncomes.length !== 0) {
      this.businessMode = 'TABLE';
    } else {
      this.businessMode = 'FORM';
      this.mode = 'ADD';
    }
  }

  ngOnInit() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));

    this.getItrDocuments();
    this.getMastersData();
    this.businessIncomeBankForm = this.fb.group({
      recieptRecievedInBank: new FormControl('', Validators.pattern(AppConstants.numericRegex)),
      presumptiveIncomeRecieveBank: new FormControl('', Validators.pattern(AppConstants.numericRegex)),
      minimumPresumptiveIncome: new FormControl('')
    });

    this.businessIncomeCashForm = this.fb.group({
      recievedinCash: new FormControl('', Validators.pattern(AppConstants.numericRegex)),
      presumptiveIncomeRecievedCash: new FormControl('', Validators.pattern(AppConstants.numericRegex)),
      minimumPresumptiveIncome: new FormControl('', Validators.pattern(AppConstants.numericRegex)),
    });

    this.professionIncomeForm = this.fb.group({
      grossReciept: new FormControl('', Validators.pattern(AppConstants.numericRegex)),
      presumptiveIncome: new FormControl('', Validators.pattern(AppConstants.numericRegex)),
      minimumPresumptiveIncome: new FormControl('')
    });
    // Common Field Form Group
    this.commonForm = this.fb.group({
      partnerOwnCapital: new FormControl('', Validators.pattern(AppConstants.numericRegex)),
      securedLoan: new FormControl('', Validators.pattern(AppConstants.numericRegex)),
      unsecuredLoan: new FormControl('', Validators.pattern(AppConstants.numericRegex)),
      advances: new FormControl('', Validators.pattern(AppConstants.numericRegex)),
      sundryCreditors: new FormControl('', Validators.compose([Validators.required, Validators.pattern(AppConstants.numericRegex)])),
      otherLiabilities: new FormControl('', Validators.pattern(AppConstants.numericRegex)),
      fixedAssets: new FormControl('', Validators.pattern(AppConstants.numericRegex)),
      inventories: new FormControl('', Validators.compose([Validators.required, Validators.pattern(AppConstants.numericRegex)])),
      sundryDeptors: new FormControl('', Validators.compose([Validators.required, Validators.pattern(AppConstants.numericRegex)])),
      balanceWithBank: new FormControl('', Validators.pattern(AppConstants.numericRegex)),
      cashInHand: new FormControl('', Validators.compose([Validators.required, Validators.pattern(AppConstants.numericRegex)])),
      loanandAdvance: new FormControl('', Validators.pattern(AppConstants.numericRegex)),
      otherAsset: new FormControl('', Validators.pattern(AppConstants.numericRegex)),
      gstrNumber: new FormControl('', Validators.pattern(AppConstants.gstrReg)),
      turnOverAsPerGST: new FormControl('', Validators.pattern(AppConstants.numericRegex)),
    });

    if (this.utilsService.isNonEmpty(this.ITR_JSON.business) && this.utilsService.isNonEmpty(this.ITR_JSON.business.financialParticulars)) {
      this.commonForm.setValue({
        gstrNumber: this.ITR_JSON.business.financialParticulars.GSTRNumber,
        turnOverAsPerGST: /* this.ITR_JSON.business.financialParticulars.grossTurnOverAmount === 0 ? null : */ this.ITR_JSON.business.financialParticulars.grossTurnOverAmount,
        partnerOwnCapital: /* this.ITR_JSON.business.financialParticulars.membersOwnCapital === 0 ? null : */ this.ITR_JSON.business.financialParticulars.membersOwnCapital,
        securedLoan: /* this.ITR_JSON.business.financialParticulars.securedLoans === 0 ? null : */ this.ITR_JSON.business.financialParticulars.securedLoans,
        unsecuredLoan: /* this.ITR_JSON.business.financialParticulars.unSecuredLoans === 0 ? null : */ this.ITR_JSON.business.financialParticulars.unSecuredLoans,
        advances: /*  this.ITR_JSON.business.financialParticulars.advances === 0 ? null : */ this.ITR_JSON.business.financialParticulars.advances,
        sundryCreditors: /*  this.ITR_JSON.business.financialParticulars.sundryCreditorsAmount === 0 ? null : */ this.ITR_JSON.business.financialParticulars.sundryCreditorsAmount,
        otherLiabilities: /*  this.ITR_JSON.business.financialParticulars.otherLiabilities === 0 ? null : */ this.ITR_JSON.business.financialParticulars.otherLiabilities,
        fixedAssets: /*  this.ITR_JSON.business.financialParticulars.fixedAssets === 0 ? null : */ this.ITR_JSON.business.financialParticulars.fixedAssets,
        inventories: /*  this.ITR_JSON.business.financialParticulars.inventories === 0 ? null : */ this.ITR_JSON.business.financialParticulars.inventories,
        sundryDeptors: /*  this.ITR_JSON.business.financialParticulars.sundryDebtorsAmount === 0 ? null : */ this.ITR_JSON.business.financialParticulars.sundryDebtorsAmount,
        balanceWithBank: /*  this.ITR_JSON.business.financialParticulars.balanceWithBank === 0 ? null : */ this.ITR_JSON.business.financialParticulars.balanceWithBank,
        cashInHand: /*  this.ITR_JSON.business.financialParticulars.cashInHand === 0 ? null : */ this.ITR_JSON.business.financialParticulars.cashInHand,
        loanandAdvance: /*  this.ITR_JSON.business.financialParticulars.loanAndAdvances === 0 ? null : */ this.ITR_JSON.business.financialParticulars.loanAndAdvances,
        otherAsset: /*  this.ITR_JSON.business.financialParticulars.otherAssets === 0 ? null : */ this.ITR_JSON.business.financialParticulars.otherAssets,
      });
    }

    this.calculateTotal1();
    this.calculateTotal2();

    this.filteredOptions = this.natureOfBusinessForm.valueChanges
      .pipe(startWith(''),
        map(value => { return value; }),
        map(name => { return name ? this._filter(name) : this.natureOfBusinessDropdown.slice(); })
      );
  }
  addBusinessIncome() {
    this.mode = 'ADD';
    this.businessMode = 'FORM';
    this.businessType.setValue('');
  }
  getItrDocuments() {
    // TODO
    const param1 =
      `/cloud/signed-s3-urls?currentPath=${this.ITR_JSON.userId}/ITR/2019-20/Original/ITR Filing Docs`;
    this.itrMsService.getMethod(param1).subscribe((result: any) => {
      console.log('Documents ITR', result)
      this.itrDocuments = result;
      // this.getDocsUrl(0);
    })
  }


  zoom: number = 1.0;
  incrementZoom(amount: number) {
    this.zoom += amount;
  }


  getDocsUrl(index) {

    if (this.itrDocuments.length > 0) {
      const docType = this.itrDocuments[index].fileName.split('.').pop();
      this.docDetails.docUrl = this.itrDocuments[index].signedUrl;
      this.docDetails.docType = docType;
    } else {
      this.docDetails.docUrl = '';
      this.docDetails.docType = '';
    }
  }

  natureCode: any;
  natureOfBusinessDropdown = [];
  natureOfBusinessDropdownAll = [];
  displayFn(label) {
    return label ? label : undefined;
  }

  _filter(name) {
    const filterValue = name.toLowerCase();
    return this.natureOfBusinessDropdown.filter(option => option.label.toLowerCase().indexOf(filterValue) === 0);
  }

  getCodeFromLabelOnBlur() {
    if (this.utilsService.isNonEmpty(this.natureOfBusinessForm.value) && this.utilsService.isNonEmpty(this.natureOfBusinessForm.value)) {
      this.natureCode = this.natureOfBusinessDropdown.filter(item => item.label.toLowerCase() === this.natureOfBusinessForm.value.toLowerCase());
      if (this.natureCode.length !== 0) {
        this.natureCode = this.natureCode[0].code;
        console.log('natureCode on blur = ', this.natureCode);
      } else {
        this.natureOfBusinessForm.setErrors(invalid);
        console.log('natureCode on blur = ', this.natureCode);
      }
    }
  }
  getMastersData() {
    const param = '/itrmaster';
    this.itrMsService.getMethod(param).subscribe((result: any) => {
      this.natureOfBusinessDropdownAll = result.natureOfBusiness;
      this.natureOfBusinessDropdown = this.natureOfBusinessDropdownAll.filter(item => item.section === '44AD');
      sessionStorage.setItem('MASTER', JSON.stringify(result));
    }, error => {
    });
  }

  calBankPresumptiveIncome(val) {
    if (val !== '' && val !== null && val !== undefined) {
      const cal = {
        assessmentYear: this.ITR_JSON.assessmentYear,
        assesseeType: this.ITR_JSON.assesseeType,
        incomes: {
          incomeType: 'BANK',
          receipts: val,
          presumptiveIncome: 0,
          periodOfHolding: 0,
          // minimumPresumptiveIncome: 0,
          ownership: '',
          registrationNo: '',
          tonnageCapacity: 0
        }
      };

      const param = '/buisnessIncome';
      this.itrMsService.postMethod(param, cal).subscribe((result: any) => {
        this.businessIncomeBankForm.controls['presumptiveIncomeRecieveBank'].setValidators([Validators.pattern(AppConstants.numericRegex), Validators.required, Validators.min(result.minimumPresumptiveIncome), Validators.max(val)]);
        this.businessIncomeBankForm.controls['presumptiveIncomeRecieveBank'].setValue(result.minimumPresumptiveIncome);
        this.businessIncomeBankForm.controls['presumptiveIncomeRecieveBank'].updateValueAndValidity();

        this.businessIncomeBankForm.controls['minimumPresumptiveIncome'].setValue(result.minimumPresumptiveIncome);
        this.businessIncomeBankForm.controls['minimumPresumptiveIncome'].updateValueAndValidity();

      });
    } else {
      this.businessIncomeBankForm.controls['presumptiveIncomeRecieveBank'].setValue(null);
      this.businessIncomeBankForm.controls['minimumPresumptiveIncome'].setValue(null);
      this.businessIncomeCashForm.controls['recievedinCash'].setValidators(Validators.required);
      this.businessIncomeCashForm.controls['recievedinCash'].updateValueAndValidity();
      this.businessIncomeCashForm.controls['presumptiveIncomeRecievedCash'].setValidators(Validators.required);
      this.businessIncomeCashForm.controls['presumptiveIncomeRecievedCash'].updateValueAndValidity();
    }
  }
  calCashPresumptiveIncome(val) {
    if (val !== '' && val !== null && val !== undefined) {
      const cal = {
        assessmentYear: this.ITR_JSON.assessmentYear,
        assesseeType: this.ITR_JSON.assesseeType,
        incomes: {
          incomeType: 'CASH',
          receipts: val,
          presumptiveIncome: 0,
          periodOfHolding: 0,
          // minimumPresumptiveIncome: 0,
          ownership: '',
          registrationNo: '',
          tonnageCapacity: 0
        }
      };
      const param = '/buisnessIncome';
      this.itrMsService.postMethod(param, cal).subscribe((result: any) => {
        this.businessIncomeCashForm.controls['presumptiveIncomeRecievedCash'].setValidators(Validators.compose([Validators.pattern(AppConstants.numericRegex), Validators.required, Validators.min(result.minimumPresumptiveIncome), Validators.max(val)]));
        this.businessIncomeCashForm.controls['presumptiveIncomeRecievedCash'].setValue(result.minimumPresumptiveIncome);
        this.businessIncomeCashForm.controls['presumptiveIncomeRecievedCash'].updateValueAndValidity();
        this.businessIncomeCashForm.controls['minimumPresumptiveIncome'].setValue(result.minimumPresumptiveIncome);
        this.businessIncomeCashForm.controls['minimumPresumptiveIncome'].updateValueAndValidity();

      });
    } else {
      this.businessIncomeCashForm.controls['presumptiveIncomeRecievedCash'].setValue(null);
      this.businessIncomeCashForm.controls['minimumPresumptiveIncome'].setValue(null);

      this.businessIncomeBankForm.controls['recieptRecievedInBank'].setValidators(Validators.required);
      this.businessIncomeBankForm.controls['recieptRecievedInBank'].updateValueAndValidity();
      this.businessIncomeBankForm.controls['presumptiveIncomeRecieveBank'].setValidators(Validators.required);
      this.businessIncomeBankForm.controls['presumptiveIncomeRecieveBank'].updateValueAndValidity();
    }
  }

  cancelBusinessForm() {
    if (this.ITR_JSON.business.presumptiveIncomes.length !== 0) {
      this.businessMode = 'TABLE';
    } else {
      this.mode = 'ADD';
      this.businessMode = 'FORM';
      this.businessType.setValue('BUSINESS');
    }
    // TODO
    // if (this.localPresumptiveIncome.businessType === 'TRANSPORT') {
    //   this.localPresumptiveIncome.incomes = JSON.parse(JSON.stringify(this.CopyIncome));
    // }
    this.natureOfBusinessForm.reset();
    this.natureCode = '';
    this.tradeName.reset();
    // this.transportArray.reset();
    this.businessIncomeBankForm.reset();
    this.businessIncomeCashForm.reset();
    this.professionIncomeForm.reset();
  }

  changeNatureOfBusiness(val) {
    this.natureOfBusinessForm.setValue(null);
    this.natureCode = '';

    if (val === 'BUSINESS') {
      this.natureOfBusinessPlaceholder = 'Nature of business';
      this.natureOfBusinessDropdown = this.natureOfBusinessDropdownAll.filter(item => item.section === '44AD');
      // this.businesTypeString = 'BUSINESS';
      this.businessIncomeBankForm.controls['recieptRecievedInBank'].setValidators([Validators.required, Validators.pattern(AppConstants.numericRegex)]);
      this.businessIncomeBankForm.controls['recieptRecievedInBank'].updateValueAndValidity();
      this.businessIncomeBankForm.controls['presumptiveIncomeRecieveBank'].setValidators([Validators.required, Validators.pattern(AppConstants.numericRegex)]);
      this.businessIncomeBankForm.controls['presumptiveIncomeRecieveBank'].updateValueAndValidity();
      this.businessIncomeCashForm.controls['recievedinCash'].setValidators([Validators.required, Validators.pattern(AppConstants.numericRegex)]);
      this.businessIncomeCashForm.controls['recievedinCash'].updateValueAndValidity();
      this.businessIncomeCashForm.controls['presumptiveIncomeRecievedCash'].setValidators([Validators.required, Validators.pattern(AppConstants.numericRegex)]);
      this.businessIncomeCashForm.controls['presumptiveIncomeRecievedCash'].updateValueAndValidity();
    } else if (val === 'PROFESSIONAL') {
      this.natureOfBusinessPlaceholder = 'Nature of profession';
      this.natureOfBusinessDropdown = this.natureOfBusinessDropdownAll.filter(item => item.section === '44ADA');
      // this.businesTypeString = 'PROFESSIONAL';
      this.professionIncomeForm.controls['grossReciept'].setValidators([Validators.required, Validators.pattern(AppConstants.numericRegex)]);
      this.professionIncomeForm.controls['grossReciept'].updateValueAndValidity();
      this.professionIncomeForm.controls['presumptiveIncome'].setValidators([Validators.required, Validators.pattern(AppConstants.numericRegex)]);
      this.professionIncomeForm.controls['presumptiveIncome'].updateValueAndValidity();
    } else if (val === 'TRANSPORT') {
      // if (this.chekIsSOPAdded()) {
      //   this.utilsService.showSnackBar('You can not add more than one Transport.');
      // } else {
      //   this.natureOfBusinessPlaceholder = 'Nature of profession';
      //   this.natureOfBusinessDropdown = this.natureOfBusinessDropdownAll.filter(item => item.section === '44AE');

      //   // this.businesTypeString = 'TRANSPORT';
      //   // this.transportMode = 'ADD';

      //   this.callInConstructor([]);
      // }
    }
    console.log('natureOfBusiness ', this.natureOfBusinessDropdown);
  }

  saveBusinessDetail() {
    console.log('this.natureOfBusinessForm == ', this.natureOfBusinessForm.value);
    if (this.natureOfBusinessForm.valid && this.tradeName.valid) {
      this.localPresumptiveIncome = {
        businessType: this.businessType.value,
        natureOfBusiness: this.natureCode,
        tradeName: this.tradeName.value,
        incomes: [],
        taxableIncome: null,
        exemptIncome: null
      };

      if (this.localPresumptiveIncome.businessType === 'BUSINESS') {
        if (this.tradeName.valid) {
          if (this.businessIncomeBankForm.valid || this.businessIncomeCashForm.valid) {
            if (this.businessIncomeCashForm.valid) {
              this.localPresumptiveIncome.incomes.push({
                incomeType: 'CASH',
                receipts: this.businessIncomeCashForm.controls['recievedinCash'].value,
                presumptiveIncome: this.businessIncomeCashForm.controls['presumptiveIncomeRecievedCash'].value,
                periodOfHolding: 0,
                minimumPresumptiveIncome: this.businessIncomeCashForm.controls['minimumPresumptiveIncome'].value
              });
            }

            if (this.businessIncomeBankForm.valid) {
              this.localPresumptiveIncome.incomes.push({
                incomeType: 'BANK',
                receipts: this.businessIncomeBankForm.controls['recieptRecievedInBank'].value,
                presumptiveIncome: this.businessIncomeBankForm.controls['presumptiveIncomeRecieveBank'].value,
                periodOfHolding: 0,
                minimumPresumptiveIncome: this.businessIncomeBankForm.controls['minimumPresumptiveIncome'].value
              });
            }
            this.serviceCallToupdateData();
          }
        }
      } else if (this.localPresumptiveIncome.businessType === 'PROFESSIONAL') {
        if (this.tradeName.valid && this.professionIncomeForm.valid) {
          this.localPresumptiveIncome.incomes = [{
            incomeType: 'PROFESSIONAL',
            receipts: this.professionIncomeForm.controls['grossReciept'].value,
            presumptiveIncome: this.professionIncomeForm.controls['presumptiveIncome'].value,
            periodOfHolding: 0,
            minimumPresumptiveIncome: this.professionIncomeForm.controls['minimumPresumptiveIncome'].value
          }];
          this.serviceCallToupdateData();
        }
      } else if (this.localPresumptiveIncome.businessType === 'TRANSPORT') {

        // TODO
        // const gridData = this.gridOptions.api.getRenderedNodes();

        // for (let i = 0; i < gridData.length; i++) {
        //   if (this.utilsService.isNonEmpty(gridData[i].data.receipts) &&
        //     this.utilsService.isNonEmpty(gridData[i].data.periodOfHolding) &&
        //     this.utilsService.isNonEmpty(gridData[i].data.presumptiveIncome) &&
        //     this.utilsService.isNonEmpty(gridData[i].data.registrationNo) &&
        //     this.utilsService.isNonEmpty(gridData[i].data.tonnageCapacity) &&
        //     this.utilsService.isNonEmpty(gridData[i].data.ownership)) {
        //     const inc = gridData[i].data;

        //     this.localPresumptiveIncome.incomes.push(inc);
        //   }

        // }
        // if (this.localPresumptiveIncome.incomes.length > 0) {
        //   console.log('this.localPresumptiveIncome.incomes = ', this.localPresumptiveIncome);
        //   this.serviceCallToupdateData();
        // } else {
        //   this.utilsService.showSnackBar('Please enter at least one truck details.');
        // }
      }
    } else {
      $('input.ng-invalid').first().focus();
    }
  }

  serviceCallToupdateData() {
    let copyAllPresumptiveIncomes = [];
    if (this.utilsService.isNonEmpty(this.ITR_JSON.business) && this.utilsService.isNonEmpty(this.ITR_JSON.business.presumptiveIncomes)) {
      copyAllPresumptiveIncomes = JSON.parse(JSON.stringify(this.ITR_JSON.business.presumptiveIncomes));
    }
    const myPresumptiveIncome = JSON.parse(JSON.stringify(this.localPresumptiveIncome));
    if (this.mode === 'ADD') {
      copyAllPresumptiveIncomes.push(myPresumptiveIncome);
    } else if (this.mode === 'UPDATE') {
      copyAllPresumptiveIncomes.splice(this.currentIndex, 1, myPresumptiveIncome);
    }
    let totalProfessionalIncome = 0;
    let totalBusinessIncome = 0;
    for (let i = 0; i < copyAllPresumptiveIncomes.length; i++) {
      if (copyAllPresumptiveIncomes[i].businessType === 'PROFESSIONAL') {
        for (let j = 0; j < copyAllPresumptiveIncomes[i].incomes.length; j++) {
          totalProfessionalIncome = totalProfessionalIncome + Number(copyAllPresumptiveIncomes[i].incomes[j].receipts);
        }
      } else if (copyAllPresumptiveIncomes[i].businessType === 'BUSINESS') {
        for (let j = 0; j < copyAllPresumptiveIncomes[i].incomes.length; j++) {
          totalBusinessIncome = totalBusinessIncome + Number(copyAllPresumptiveIncomes[i].incomes[j].receipts);
        }
      }
    }

    if (totalProfessionalIncome <= 5000000 && totalBusinessIncome <= 20000000) {
      const myPresumptiveIncome = JSON.parse(JSON.stringify(this.localPresumptiveIncome));
      if (this.mode === 'ADD') {
        this.ITR_JSON.business.presumptiveIncomes.push(myPresumptiveIncome);
      } else if (this.mode === 'UPDATE') {
        this.ITR_JSON.business.presumptiveIncomes.splice(this.currentIndex, 1, myPresumptiveIncome);
      }

      // this.utilsService.openLoaderDialog();
      this.loading = true;

      // SERVICE CALL MAIN NEXT BUTTON
      const param = '/itr/' + this.ITR_JSON.userId + '/' + this.ITR_JSON.itrId + '/' + this.ITR_JSON.assessmentYear;
      this.itrMsService.putMethod(param, this.ITR_JSON).subscribe((result: any) => {
        this.ITR_JSON = result;
        sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
        this.utilsService.smoothScrollToTop();
        this.businessMode = 'TABLE';
        this.businessType.setValue('');

        this.initializePresumptiveIncome();
        this.localIncomes = [];
        this.natureOfBusinessForm.reset();
        this.natureCode = '';
        // this.transportArray.reset();
        this.businessIncomeBankForm.reset();
        this.businessIncomeCashForm.reset();
        this.professionIncomeForm.reset();
        // this.commonForm.reset();
        this.tradeName.reset();
        this.loading = false;

        this.utilsService.showSnackBar('Data updated successfully.');
      }, error => {
        this.loading = false;
        this.utilsService.showSnackBar('Failed to update.');
      });
    } else {
      // this.typeValidation = [];
      // this.incomeLimitExceedDialog();
      this.utilsService.showSnackBar('Your all business presumptive can not exceed than 2Cr. and professional income can not exceed than 50L.');
    }
  }

  initializePresumptiveIncome() {
    this.localPresumptiveIncome = {
      businessType: '',
      natureOfBusiness: '',
      tradeName: '',
      incomes: [],
      taxableIncome: null,
      exemptIncome: null
    };
  }

  natureOfBusinessFromCode(natureOfBusiness) {
    if (this.natureOfBusinessDropdownAll.length !== 0) {
      const nameArray = this.natureOfBusinessDropdownAll.filter(item => item.code === natureOfBusiness);
      return nameArray[0].label;
    } else {
      return natureOfBusiness;
    }
  }

  calPresumptiveIncome(incomes) {
    let sum = 0;
    for (let i = 0; i < incomes.length; i++) {
      sum = sum + incomes[i].presumptiveIncome;
    }
    return this.utilsService.currencyFormatter(sum);
  }

  editBusiness(index) {
    this.mode = 'UPDATE';
    this.currentIndex = index;
    this.localPresumptiveIncome = this.ITR_JSON.business.presumptiveIncomes[index];
    this.businessMode = 'FORM';
    console.log('this.localPresumptiveIncome =', this.localPresumptiveIncome);
    const name = this.natureOfBusinessDropdownAll.filter(item => item.code === this.localPresumptiveIncome.natureOfBusiness);
    this.natureOfBusinessForm.setValue(name[0].label);
    this.natureCode = this.localPresumptiveIncome.natureOfBusiness;
    this.tradeName.setValue(this.localPresumptiveIncome.tradeName);

    if (this.localPresumptiveIncome.businessType === 'BUSINESS') {
      this.natureOfBusinessDropdown = this.natureOfBusinessDropdownAll.filter(item => item.section === '44AD');

      // this.businesTypeString = 'BUSINESS';
      this.businessType.setValue('BUSINESS');

      for (let i = 0; i < this.localPresumptiveIncome.incomes.length; i++) {
        if (this.localPresumptiveIncome.incomes[i].incomeType === 'BANK') {
          this.businessIncomeBankForm.controls['recieptRecievedInBank'].setValue(this.localPresumptiveIncome.incomes[i].receipts);
          this.businessIncomeBankForm.controls['minimumPresumptiveIncome'].setValue(this.localPresumptiveIncome.incomes[i].minimumPresumptiveIncome);
          this.businessIncomeBankForm.controls['presumptiveIncomeRecieveBank'].setValue(this.localPresumptiveIncome.incomes[i].presumptiveIncome);
          this.businessIncomeBankForm.controls['presumptiveIncomeRecieveBank'].setValidators([Validators.required, Validators.min(this.localPresumptiveIncome.incomes[i].minimumPresumptiveIncome), Validators.max(this.localPresumptiveIncome.incomes[i].receipts)]);
          this.businessIncomeBankForm.controls['presumptiveIncomeRecieveBank'].updateValueAndValidity();
        } else if (this.localPresumptiveIncome.incomes[i].incomeType === 'CASH') {
          this.businessIncomeCashForm.controls['recievedinCash'].setValue(this.localPresumptiveIncome.incomes[i].receipts);
          this.businessIncomeCashForm.controls['minimumPresumptiveIncome'].setValue(this.localPresumptiveIncome.incomes[i].minimumPresumptiveIncome);
          this.businessIncomeCashForm.controls['presumptiveIncomeRecievedCash'].setValue(this.localPresumptiveIncome.incomes[i].presumptiveIncome);
          this.businessIncomeCashForm.controls['presumptiveIncomeRecievedCash'].setValidators([Validators.required, Validators.min(this.localPresumptiveIncome.incomes[i].minimumPresumptiveIncome), Validators.max(this.localPresumptiveIncome.incomes[i].receipts)]);
          this.businessIncomeCashForm.controls['presumptiveIncomeRecievedCash'].updateValueAndValidity();
        }
      }
    } else if (this.localPresumptiveIncome.businessType === 'PROFESSIONAL') {
      // this.businesTypeString = 'PROFESSIONAL';
      this.businessType.setValue('PROFESSIONAL');
      this.natureOfBusinessDropdown = this.natureOfBusinessDropdownAll.filter(item => item.section === '44ADA');
      for (let i = 0; i < this.localPresumptiveIncome.incomes.length; i++) {
        this.professionIncomeForm.controls['grossReciept'].setValue(this.localPresumptiveIncome.incomes[i].receipts);
        this.professionIncomeForm.controls['presumptiveIncome'].setValue(this.localPresumptiveIncome.incomes[i].presumptiveIncome);
        this.professionIncomeForm.controls['presumptiveIncome'].setValidators([Validators.required, Validators.min(this.localPresumptiveIncome.incomes[i].minimumPresumptiveIncome), Validators.max(this.localPresumptiveIncome.incomes[i].receipts)]);
        this.professionIncomeForm.controls['presumptiveIncome'].updateValueAndValidity();
      }
    } else if (this.localPresumptiveIncome.businessType === 'TRANSPORT') {
      // this.natureOfBusinessDropdown = this.natureOfBusinessDropdownAll.filter(item => item.section === '44AE');
      // this.businesTypeString = 'TRANSPORT';
      // this.CopyIncome = JSON.parse(JSON.stringify(this.localPresumptiveIncome.incomes));
      // this.callInConstructor(this.localPresumptiveIncome.incomes);
    }

    // this.total1 = Number(this.commonForm.controls['partnerOwnCapital'].value) +
    //   Number(this.commonForm.controls['securedLoan'].value) +
    //   Number(this.commonForm.controls['unsecuredLoan'].value) +
    //   Number(this.commonForm.controls['advances'].value) +
    //   Number(this.commonForm.controls['sundryCreditors'].value) +
    //   Number(this.commonForm.controls['otherLiabilities'].value);

    // this.total2 = Number(this.commonForm.controls['fixedAssets'].value) +
    //   Number(this.commonForm.controls['inventories'].value) +
    //   Number(this.commonForm.controls['sundryDeptors'].value) +
    //   Number(this.commonForm.controls['balanceWithBank'].value) +
    //   Number(this.commonForm.controls['cashInHand'].value) +
    //   Number(this.commonForm.controls['loanandAdvance'].value) +
    //   Number(this.commonForm.controls['otherAsset'].value);
  }

  calprofessionPresumptiveIncome(val) {
    if (val !== '' && val !== null && val !== undefined) {
      const cal = {
        assessmentYear: this.ITR_JSON.assessmentYear,
        assesseeType: this.ITR_JSON.assesseeType,
        incomes: {
          incomeType: 'PROFESSIONAL',
          receipts: val,
          presumptiveIncome: 0,
          periodOfHolding: 0,
          // minimumPresumptiveIncome: 0,
          ownership: '',
          registrationNo: '',
          tonnageCapacity: 0
        }
      };
      const param = '/buisnessIncome';
      this.itrMsService.postMethod(param, cal).subscribe((result: any) => {
        this.professionIncomeForm.controls['presumptiveIncome'].setValidators([Validators.required, Validators.min(result.minimumPresumptiveIncome), Validators.max(val), Validators.pattern(AppConstants.numericRegex)]);
        this.professionIncomeForm.controls['presumptiveIncome'].setValue(result.minimumPresumptiveIncome);
        this.professionIncomeForm.controls['presumptiveIncome'].updateValueAndValidity();
        this.professionIncomeForm.controls['minimumPresumptiveIncome'].setValue(result.minimumPresumptiveIncome);
      });
    }
  }
  calculateTotal1() {

    this.total1 = 0;
    this.total1 = Number(this.commonForm.controls['partnerOwnCapital'].value) +
      Number(this.commonForm.controls['securedLoan'].value) +
      Number(this.commonForm.controls['unsecuredLoan'].value) +
      Number(this.commonForm.controls['advances'].value) +
      Number(this.commonForm.controls['sundryCreditors'].value) +
      Number(this.commonForm.controls['otherLiabilities'].value);
  }

  calculateTotal2() {
    this.total2 = 0;
    this.total2 = Number(this.commonForm.controls['fixedAssets'].value) +
      Number(this.commonForm.controls['inventories'].value) +
      Number(this.commonForm.controls['sundryDeptors'].value) +
      Number(this.commonForm.controls['balanceWithBank'].value) +
      Number(this.commonForm.controls['cashInHand'].value) +
      Number(this.commonForm.controls['loanandAdvance'].value) +
      Number(this.commonForm.controls['otherAsset'].value);
  }

  deleteBusiness(index) {
    this.ITR_JSON.business.presumptiveIncomes.splice(index, 1);
    if (this.ITR_JSON.business.presumptiveIncomes.length === 0) {
      this.ITR_JSON.business.financialParticulars = null;
    }
    sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));

    if (this.ITR_JSON.business.presumptiveIncomes.length !== 0) {
      this.businessMode = 'TABLE';
    } else {
      this.mode = 'ADD';
      this.businessMode = 'FORM';
    }
  }

  calTotalPresumptiveIncome() {
    let sum = 0;
    for (let i = 0; i < this.ITR_JSON.business.presumptiveIncomes.length; i++) {
      for (let j = 0; j < this.ITR_JSON.business.presumptiveIncomes[i].incomes.length; j++) {
        sum = sum + this.ITR_JSON.business.presumptiveIncomes[i].incomes[j].presumptiveIncome;
      }
    }
    return this.utilsService.currencyFormatter(sum);
  }

  saveCommonForm() {
    if (this.businessMode === 'TABLE') {
      if (this.commonForm.valid) {
        this.loading = true;
        this.ITR_JSON.business.financialParticulars = {
          GSTRNumber: this.commonForm.controls['gstrNumber'].value,
          grossTurnOverAmount: /* Number( */this.commonForm.controls['turnOverAsPerGST'].value/* ) */,
          membersOwnCapital: /* Number( */this.commonForm.controls['partnerOwnCapital'].value/* ) */,
          securedLoans: /* Number( */this.commonForm.controls['securedLoan'].value/* ) */,
          unSecuredLoans: /* Number( */this.commonForm.controls['unsecuredLoan'].value/* ) */,
          advances: /* Number( */this.commonForm.controls['advances'].value/* ) */,
          sundryCreditorsAmount: /* Number( */this.commonForm.controls['sundryCreditors'].value/* ) */,
          otherLiabilities: /* Number( */this.commonForm.controls['otherLiabilities'].value/* ) */,
          totalCapitalLiabilities: null,
          fixedAssets: /* Number( */this.commonForm.controls['fixedAssets'].value/* ) */,
          inventories: /* Number( */this.commonForm.controls['inventories'].value/* ) */,
          sundryDebtorsAmount: /* Number( */this.commonForm.controls['sundryDeptors'].value/* ) */,
          balanceWithBank: /* Number( */this.commonForm.controls['balanceWithBank'].value/* ) */,
          cashInHand: /* Number( */this.commonForm.controls['cashInHand'].value/* ) */,
          loanAndAdvances: /* Number( */this.commonForm.controls['loanandAdvance'].value/* ) */,
          otherAssets: /* Number( */this.commonForm.controls['otherAsset'].value/* ) */,
          totalAssets: null
        };
        // SERVICE CALL MAIN NEXT BUTTON
        const param = '/itr/' + this.ITR_JSON.userId + '/' + this.ITR_JSON.itrId + '/' + this.ITR_JSON.assessmentYear;
        this.itrMsService.putMethod(param, this.ITR_JSON).subscribe((result: any) => {
          this.ITR_JSON = result;
          sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
          this.utilsService.smoothScrollToTop();
          this.loading = false;
          this.utilsService.showSnackBar('Business details updated successfully.');
        }, error => {
          this.loading = false;
          this.utilsService.showSnackBar('Failed to update.');
        });
      } else {
        $('input.ng-invalid').first().focus();
      }
    }
  }
}
