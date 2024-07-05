import { Component, OnInit, Inject, ElementRef, ViewChild, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Employer, ITR_JSON, salarySevOne, salarySevThree, salarySevTwo, } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ComponentPortal } from '@angular/cdk/portal';
import { BreakUpComponent } from '../break-up/break-up.component';
import { Overlay } from '@angular/cdk/overlay';
import { UtilsService } from 'src/app/services/utils.service';
import { ConfirmDialogComponent } from 'src/app/modules/shared/components/confirm-dialog/confirm-dialog.component';
import { CalculatorModalComponent } from "../../../shared/components/calculator-modal/calculator-modal.component";

@Component({
  selector: 'app-salary-bifurcation',
  templateUrl: './salary-bifurcation.component.html',
  styleUrls: ['./salary-bifurcation.component.scss'],
})
export class SalaryBifurcationComponent implements OnInit, OnChanges {
  @ViewChild('breakUp') breakUp: ElementRef;
  ITR_JSON: ITR_JSON;
  salaryFormGroup: UntypedFormGroup;
  @Input() localEmployer: Employer;
  total = {
    salary: 0,
    perquisites: 0,
    profitsInLieuOfSalary: 0,
  };
  value = {
    salary: 0,
    perquisites: 0,
    profitsInLieuOfSalary: 0,
  };
  @Input() index: any;
  Copy_ITR_JSON: ITR_JSON;
  loading: boolean = false;
  overlayRef: any;
  salaryMappings = ['BASIC_SALARY', 'HOUSE_RENT', 'DA'];
  perquisiteMapping = ['VALUE_OF_OTHER_BENIFITS_AMENITY_SERVICE_PRIVILEGE', 'OTH_BENEFITS_AMENITIES'];
  profitInLieuMapping = ['ANY_OTHER'];

  @Output() valueChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() isValid: EventEmitter<any> = new EventEmitter<any>();

  salaryNames = [
    {
      key: 'BASIC_SALARY',
      value: 'Basic',
      breakup: true,
    },
    {
      key: 'DA',
      value: 'Dearness Allowance (DA)',
    },
    {
      key: 'CONVEYANCE',
      value: 'Conveyance Allowance',
    },
    {
      key: 'HOUSE_RENT',
      value: 'House Rent Allowance (HRA)',
    },
    {
      key: 'LTA',
      value: 'Leave Travel Allowance (LTA)',
    },
    {
      key: 'CHILDREN_EDUCATION',
      value: 'Children Education Allowance (CEA)',
    },
    {
      key: 'OTHER_ALLOWANCE',
      value: 'Other Allowance',
    },
    {
      key: 'CONTRI_80CCD',
      value: 'The contribution made by the employer towards the pension scheme\n' +
        '              as referred under section 80CCD',
    },
    {
      key: 'RULE_6_PART_A_4TH_SCHEDULE',
      value: 'The amount deemed to be income under rule 6 of part A of the\n' +
        '              fourth schedule',
    },
    {
      key: 'RULE_11_4_PART_A_4TH_SCHEDULE',
      value: 'The amount deemed to be income under rule 11(4) of Part-A of the\n' +
        '              Fourth Schedule',
    },
    {
      key: 'PENSION',
      value: 'Annuity or Pension',
    },
    {
      key: 'COMMUTED_PENSION',
      value: 'Commuted Pension',
    },
    {
      key: 'GRATUITY',
      value: 'Gratuity',
    },
    {
      key: 'COMMISSION',
      value: 'Fees/Commission',
    },
    {
      key: 'ADVANCE_SALARY',
      value: 'Advance Salary',
    },
    {
      key: 'LEAVE_ENCASHMENT',
      value: 'Leave Encashment',
    },
    {
      key: 'OTHER',
      value: 'Others',
    },
  ];
  perquisiteNames = [
    {
      key: 'ACCOMODATION',
      value: 'Accommodation'
    },
    {
      key: 'MOTOR_CAR',
      value: 'Cars/other automotive'
    },
    {
      key: 'SWEEPER_GARDNER_WATCHMAN_OR_PERSONAL_ATTENDANT',
      value: 'Sweeper/Gardner/Watchman/Personal attendant'
    },
    {
      key: 'GAST_ELECTRICITY_WATER',
      value: 'Gas, electricity, water'
    },
    {
      key: 'INTEREST_FREE_LOANS',
      value: 'Interest-free or concessional loans'
    },
    {
      key: 'HOLIDAY_EXPENSES',
      value: 'Holiday expenses'
    },
    {
      key: 'FREE_OR_CONCESSIONAL_TRAVEL',
      value: 'Free or concessional travel'
    },
    {
      key: 'FREE_MEALS',
      value: 'Free meals'
    },
    {
      key: 'FREE_EDU',
      value: 'Free education'
    },
    {
      key: 'GIFT_VOUCHERS',
      value: 'Gift vouchers etc.'
    },
    {
      key: 'CREDIT_CARD_EXPENSES',
      value: 'Credit card expenses'
    },
    {
      key: 'CLUB_EXP',
      value: 'Club expenses'
    },
    {
      key: 'USE_OF_MOVABLE_ASSETS_BY_EMPLOYEE',
      value: 'Use of movable assets by employee'
    },
    {
      key: 'TRANSFER_OF_ASSET_TO_EMPLOYEE',
      value: 'Transfer of asset to employee'
    },
    {
      key: 'VALUE_OF_OTHER_BENIFITS_AMENITY_SERVICE_PRIVILEGE',
      value: 'Value of any other benefits/amenity/service/privilege'
    },
    {
      key: 'SECTION_80_IAC_TAX_TO_BE_DEFERED',
      value: 'Stock option allotted or transferred by the employer being an\n' +
        '              eligible start-up referred to in section 80-IAC-tax to be deferred'
    },
    {
      key: 'SECTION_80_IAC_TAX_NOT_TO_BE_DEFERED',
      value: 'Stock option allotted or transferred by the employer being an' +
        'eligible start-up referred to in section 80-IAC-tax not to be deferred'
    },
    {
      key: 'STOCK_OPTIONS_OTHER_THAN_ESOP',
      value: 'Stock options(non-qualified options) other than ESOP in col 16\n' +
        '              above'
    },
    {
      key: 'SCHEME_TAXABLE_US_17_2_VII',
      value: 'Contribution by employer to fund and scheme taxable under sec\n' +
        '              17(2)(vii)'
    },
    {
      key: 'SCHEME_TAXABLE_US_17_2_VIIA',
      value: 'Annual accretion by way of interest, dividend etc. to the balance\n' +
        '              at the credit of the fund and scheme referred to in section\n' +
        '              17(2)(vii) and taxable under section 17(2)(viia)'
    },
    {
      key: 'OTH_BENEFITS_AMENITIES',
      value: 'Other benefits or amenities'
    }
  ];
  profitInLieuNames = [
    {
      key: 'COMPENSATION_ON_VRS',
      value: 'Any compensation is due or received by an assessee from an\n' +
        '              employer or former employer in connection with the termination of\n' +
        '              his employment or modification thereto.'
    },
    {
      key: 'AMOUNT_DUE',
      value: 'Any amount due or received by an assessee from any person before\n' +
        '              joining any employment with that person, or after cessation of his\n' +
        '              employment with that person'
    },
    {
      key: 'PAYMENT_DUE',
      value: 'Any Payment due or received by an assessee from an employer, or\n' +
        '              from provident or other funds, sum received under keyman insurance\n' +
        '              policy, including bonus on such policy.'
    },
    {
      key: 'ANY_OTHER',
      value: 'Any Other'
    }
  ]
  bifurcationResult: any;
  changeConsentGiven: boolean;
  income: any;
  constructor(
    private fb: UntypedFormBuilder,
    private overlay: Overlay,
    private elementRef: ElementRef,
    private utilsService: UtilsService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.salaryFormGroup = this.createBifurcationForm();

    // Salary
    let salaryDataToPatch = this.localEmployer?.salary?.filter(
      (item) => item?.salaryType !== 'SEC17_1');
    const salaryParticular = salaryDataToPatch.map(data => data.salaryType);
    const notPresentSalary = this.salaryMappings.filter(d => !salaryParticular.some(s => s === d));
    if (salaryDataToPatch && salaryDataToPatch?.length > 0) {
      salaryDataToPatch?.forEach((item) => {
        this.addItem('SEC17_1', item);
      });
    }
    notPresentSalary.forEach(element => {
      let item = {
        id: null,
        salaryType: element,
        taxableAmount: 0,
        exemptAmount: 0,
        description: ''
      };
      this.addItem('SEC17_1', item);
    });


    let perquisitesDataToPatch = this.localEmployer?.perquisites?.filter(
      (item) => item?.perquisiteType !== 'SEC17_2');
    const perquisitesParticular = perquisitesDataToPatch.map(data => data.perquisiteType);
    const notPresentPerquisites = this.perquisiteMapping.filter(d => !perquisitesParticular.some(s => s === d));

    if (perquisitesDataToPatch && perquisitesDataToPatch?.length > 0) {
      perquisitesDataToPatch?.forEach((item) => {
        this.addItem('SEC17_2', item);
      });
    }
    notPresentPerquisites.forEach(element => {
      let item = {
        id: null,
        perquisiteType: element,
        taxableAmount: 0,
        exemptAmount: 0,
        description: ''
      };
      this.addItem('SEC17_2', item);
    });



    let profitsInLieuDataToPatch =
      this.localEmployer?.profitsInLieuOfSalaryType?.filter(
        (item) => item?.salaryType !== 'SEC17_3');
    const profitsInLieuParticular = profitsInLieuDataToPatch.map(data => data.salaryType);
    const notPresentProfitsInLieu = this.profitInLieuMapping.filter(d => !profitsInLieuParticular.some(s => s === d));

    if (profitsInLieuDataToPatch && profitsInLieuDataToPatch?.length > 0) {
      profitsInLieuDataToPatch?.forEach((item) => {
        this.addItem('SEC17_3', item);
      });
    }
    notPresentProfitsInLieu.forEach(element => {
      let item = {
        id: null,
        salaryType: element,
        taxableAmount: 0,
        exemptAmount: 0,
        description: ''
      };
      this.addItem('SEC17_3', item);
    });
    let secOneTotal = this.localEmployer?.salary?.filter(
      (item) => item?.salaryType == 'SEC17_1')
    this.salaryFormGroup.controls['secOneTotal'].setValue(secOneTotal.length > 0 ? secOneTotal[0].taxableAmount : 0)

    let secTwoTotal = this.localEmployer?.perquisites?.filter(
      (item) => item?.perquisiteType == 'SEC17_2')
    this.salaryFormGroup.controls['secTwoTotal'].setValue(secTwoTotal.length > 0 ? secTwoTotal[0].taxableAmount : 0)

    let secThreeTotal = this.localEmployer?.profitsInLieuOfSalaryType?.filter(
      (item) => item?.salaryType == 'SEC17_3')
    this.salaryFormGroup.controls['secThreeTotal'].setValue(secThreeTotal.length > 0 ? secThreeTotal[0].taxableAmount : 0)
    this.formValuesChanged();
  }

  shouldShowCalculator(salaryType: string): boolean {
    return ['HOUSE_RENT', 'PENSION', 'COMMUTED_PENSION', 'GRATUITY', 'LEAVE_ENCASHMENT'].includes(salaryType);
  }

  calculate(selectedOption: string) {
    let queryParam
    let fromCommuted
    if(selectedOption === "HOUSE_RENT"){
      queryParam ='hra'
    }else if(selectedOption ==="PENSION"){
      queryParam ='pension'
      fromCommuted=`&uncommuted=true`;
    }else if(selectedOption ==="COMMUTED_PENSION"){
      queryParam ='pension'
      fromCommuted=`&commuted=true`;
    }else if(selectedOption === "GRATUITY"){
      queryParam ='gratuity'
    }else if(selectedOption === "LEAVE_ENCASHMENT"){
      queryParam ='leaveencashment'
    }else{
       return this.utilsService.showSnackBar(`Invalid option selected,No Calculator Available for ${selectedOption} `);
    }
    const dialogRef = this.dialog.open(CalculatorModalComponent, {
      width: '80%',
      height: '80%',
      data: {
        selectedOption: selectedOption,
        url: `https://www.taxbuddy.com/allcalculators/${queryParam}?inUtility=true${fromCommuted}`
      }
    });

    dialogRef.afterClosed().subscribe(copiedValues  => {
      if (copiedValues ) {
       console.log('HRA value ',copiedValues );
       if(copiedValues?.title === 'HRA'){
        const salaryArray = this.salaryFormGroup.get('salary') as FormArray;
        const selectedSalaryItem = salaryArray.controls.find(item => item.get('salaryType').value === selectedOption);
        if (selectedSalaryItem) {
          selectedSalaryItem.get('taxableAmount').setValue(copiedValues.hraValue);
        } else {
          console.error('Salary item not found for selectedOption:', selectedOption);
        }
        this.setDescriptionValidation('salary',selectedSalaryItem, true);
        this.valueChanged.emit({ type: 'HRAexemptValue', value: copiedValues.exemptValue });
        this.formValuesChanged();

       }else if (copiedValues?.title === 'PENSION'){
        const salaryArray = this.salaryFormGroup.get('salary') as FormArray;
        const selectedSalaryItem = salaryArray.controls.find(item => item.get('salaryType').value === selectedOption);
        if (selectedSalaryItem) {
          selectedSalaryItem.get('taxableAmount').setValue(copiedValues.totalPension);
        } else {
          console.error('Salary item not found for selectedOption:', selectedOption);
        }
         this.setDescriptionValidation('salary',selectedSalaryItem, true);
         this.valueChanged.emit({ type: 'PENSIONexemptValue', value: copiedValues.exemptValue });
         this.formValuesChanged();

       }else if (copiedValues?.title === 'GRATUITY'){
        const salaryArray = this.salaryFormGroup.get('salary') as FormArray;
        const selectedSalaryItem = salaryArray.controls.find(item => item.get('salaryType').value === selectedOption);
        if (selectedSalaryItem) {
          selectedSalaryItem.get('taxableAmount').setValue(copiedValues.gratuityValue);
        } else {
          console.error('Salary item not found for selectedOption:', selectedOption);
        }
         this.setDescriptionValidation('salary',selectedSalaryItem, true);
         this.valueChanged.emit({ type: 'GRATUITYexemptValue', value: copiedValues.exemptValue });
         this.formValuesChanged();
       }

       else if (copiedValues?.title === 'LEAVE_ENCASHMENT'){
        const salaryArray = this.salaryFormGroup.get('salary') as FormArray;
        const selectedSalaryItem = salaryArray.controls.find(item => item.get('salaryType').value === selectedOption);
        if (selectedSalaryItem) {
          selectedSalaryItem.get('taxableAmount').setValue(copiedValues.leaveCashValue);
        } else {
          console.error('Salary item not found for selectedOption:', selectedOption);
        }
         this.setDescriptionValidation('salary',selectedSalaryItem, true);
         this.valueChanged.emit({ type: 'leaveExemptValue', value: copiedValues.exemptValue });
         this.formValuesChanged();
       }
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {

    this.onValueChange();
  }

  createBifurcationForm() {
    return this.fb.group({
      secOneTotal: [],
      secTwoTotal: [],
      secThreeTotal: [],
      salary: this.fb.array([]),
      perquisites: this.fb.array([]),
      profitsInLieu: this.fb.array([]),
    });
  }

  get salary() {
    return <FormArray>this.salaryFormGroup.get('salary');
  }
  get perquisites() {
    return <FormArray>this.salaryFormGroup.get('perquisites');
  }
  get profitsInLieu() {
    return <FormArray>this.salaryFormGroup.get('profitsInLieu');
  }

  createSevOneForm(obj?: salarySevOne): UntypedFormGroup {
    return this.fb.group({
      id: [obj?.id ? obj?.id : null],
      salaryType: [obj?.salaryType || null, Validators.required],
      taxableAmount: [obj?.taxableAmount || 0, Validators.required],
      exemptAmount: [obj?.exemptAmount || null],
      description: [obj?.description || null, Validators.maxLength(50)],
    })
  }

  createSevTwoForm(obj: salarySevTwo): UntypedFormGroup {
    return this.fb.group({
      id: [obj?.id ? obj?.id : null],
      perquisiteType: [obj?.perquisiteType || null, Validators.required],
      taxableAmount: [obj?.taxableAmount || 0, Validators.required],
      exemptAmount: [obj?.exemptAmount || null],
      description: [obj?.description || null, Validators.maxLength(50)],
    })
  }

  createSevThreeForm(obj: salarySevThree): UntypedFormGroup {
    return this.fb.group({
      id: [obj?.id ? obj?.id : null],
      salaryType: [obj?.salaryType || null, Validators.required],
      taxableAmount: [obj?.taxableAmount || 0, Validators.required],
      exemptAmount: [obj?.exemptAmount || null],
      description: [obj?.description || null, Validators.maxLength(50)],
    })
  }

  formValuesChanged() {
    this.changeConsentGiven = false;
    if (this.salaryFormGroup.valid) {
      this.utilsService.setSalaryValues(this.salaryFormGroup.getRawValue());
      this.valueChanged.emit(this.salaryFormGroup.getRawValue());
    }
  }

  valid() {
    let type = 'salary';
    let keys = Object.keys((this.salaryFormGroup.controls[type] as UntypedFormGroup).controls);
    keys.every(key => {
      if (keys.filter(v => v === key).length > 1) {
        return false;
      }
    });

    keys = Object.keys((this.salaryFormGroup.controls[type] as UntypedFormGroup).controls);
    keys.every(key => {
      if (keys.filter(v => v === key).length > 1) {
        return false;
      }
    });

    keys = Object.keys((this.salaryFormGroup.controls[type] as UntypedFormGroup).controls);
    keys.every(key => {
      if (keys.filter(v => v === key).length > 1) {
        return false;
      }
    });
    return true;
  }
  saveBifurcations() {

    this.Copy_ITR_JSON = JSON.parse(
      sessionStorage.getItem(AppConstants.ITR_JSON)
    );

    if (!this.localEmployer) {
      this.localEmployer = {
        id: null,
        employerName: '',
        address: '',
        city: '',
        pinCode: '',
        state: '',
        employerPAN: '',
        employerTAN: '',
        taxableIncome: 0,
        exemptIncome: 0,
        standardDeduction: 0,

        // AYAsPerForm16: string;
        periodFrom: '',
        periodTo: '',
        // amountPaidAsPerForm16: number;
        taxDeducted: 0,
        taxRelief: 0,
        employerCategory: '',
        salary: [],
        allowance: [],
        perquisites: [],
        profitsInLieuOfSalaryType: [],
        deductions: [],
        upload: [],
        calculators: null,
      };
      this.Copy_ITR_JSON.employers.push(this.localEmployer);
    }

    let result;

    const salaryArray = [];

    let total = 0;
    for (let obj of Object.values(salaryArray)) {
      total += obj as number;
    }

    this.total.salary = total;
    this.value.salary = 0;

    // NEED TO CONFIRM WITH ASHWINI IF I SHOULD CALL API OR NOT
    if (this.localEmployer) {
      const bifurcationValues = this.value.salary[0];

      this.localEmployer.salary = [];
      for (const key in bifurcationValues) {
        if (bifurcationValues.hasOwnProperty(key)) {
          const element = parseFloat(bifurcationValues[key]);
          console.log(element);
          if (element && element !== 0) {
            this.localEmployer?.salary.push({
              salaryType: key,
              taxableAmount: element,
              exemptAmount: 0,
            });
          }
        }
      }

      this.loading = true;
      if (this.index !== -1) {
        const myEmp = JSON.parse(JSON.stringify(this.localEmployer));
        this.Copy_ITR_JSON.employers.splice(this.index, 1, myEmp);
      }
      console.log('salary copyItrJson', this.Copy_ITR_JSON);
    }

    const perquisitesArray = [];

    let perquisitesTotal = 0;
    for (let obj of Object.values(perquisitesArray)) {
      perquisitesTotal += obj as number;
    }

    this.total.perquisites = perquisitesTotal;
    this.value.perquisites = 0;

    // NEED TO CONFIRM WITH ASHWINI IF I SHOULD CALL API OR NOT
    if (this.localEmployer) {
      const bifurcationValues = this.value.perquisites[0];

      this.localEmployer.perquisites = [];
      for (const key in bifurcationValues) {
        if (bifurcationValues.hasOwnProperty(key)) {
          const element = parseFloat(bifurcationValues[key]);
          console.log(element);
          if (element && element !== 0) {
            this.localEmployer?.perquisites.push({
              perquisiteType: key,
              taxableAmount: element,
              exemptAmount: 0,
            });
          }
        }
      }

      this.loading = true;
      if (this.index !== -1) {
        const myEmp = JSON.parse(JSON.stringify(this.localEmployer));
        this.Copy_ITR_JSON.employers.splice(this.index, 1, myEmp);
      }
    }

    console.log('perqusities copyItrJson', this.Copy_ITR_JSON);


    const profitsInLieuArray = [];
    let profitsInLieuTotal = 0;
    for (let obj of Object.values(profitsInLieuArray)) {
      profitsInLieuTotal += obj as number;
    }

    this.total.profitsInLieuOfSalary = profitsInLieuTotal;
    this.value.profitsInLieuOfSalary = 0;

    result = {
      total: this.total.profitsInLieuOfSalary,
      value: this.value.profitsInLieuOfSalary,
      type: 'profitsInLieuOfSalary',
      index: this.index,
    };

    // NEED TO CONFIRM WITH ASHWINI IF I SHOULD CALL API OR NOT
    if (this.localEmployer) {
      const bifurcationValues = this.value.profitsInLieuOfSalary[0];

      this.localEmployer.profitsInLieuOfSalaryType = [];
      for (const key in bifurcationValues) {
        if (bifurcationValues.hasOwnProperty(key)) {
          const element = parseFloat(bifurcationValues[key]);
          console.log(element);
          if (element && element !== 0) {
            this.localEmployer?.profitsInLieuOfSalaryType.push({
              salaryType: key,
              taxableAmount: element,
              exemptAmount: 0,
            });
          }
        }
      }

      this.loading = true;
      if (this.index !== -1) {
        const myEmp = JSON.parse(JSON.stringify(this.localEmployer));
        this.Copy_ITR_JSON.employers.splice(this.index, 1, myEmp);
      }
    }

    console.log('perqusities copyItrJson', this.Copy_ITR_JSON);


    this.utilsService.setChange(false);
    let values = this.utilsService.getSalaryValues();
    if (!values) {
      values = {
        salary: [],
        perquisites: [],
        profitsInLieu: []
      }
    }


    this.utilsService.setSalaryValues(values);
    sessionStorage.setItem('localEmployer', JSON.stringify(this.localEmployer));
  }

  deleteItem(type, index, item) {
    if (type === 'salary') {
      this.salary.removeAt(index);
      this.changeSectionOne('salary');
      if (item.controls.taxableAmount.value > 0) {
        this.setDescriptionValidation(type, item, true);
      }
    } else if (type === 'perquisites') {
      this.perquisites.removeAt(index);
      this.changeSectionOne('perquisites');
      if (item.controls.taxableAmount.value > 0) {
        this.setDescriptionValidation(type, item, true);
      }
    } else if (type === 'profitsInLieu') {
      this.profitsInLieu.removeAt(index);
      this.changeSectionOne('profitsInLieu');
      if (item.controls.taxableAmount.value > 0) {
        this.setDescriptionValidation(type, item, true);
      }
    }

    this.formValuesChanged();
  }

  addItem(salaryType, item?) {
    let type = 'salary';
    if (salaryType === 'SEC17_1') {
      type = 'salary';
      const salary = this.salary;
      let salaryForm = this.createSevOneForm(item);
      salary.push(salaryForm);
      this.changeSectionOne('salary');
      this.setDescriptionValidation('salary', salaryForm, false)
    } else if (salaryType === 'SEC17_2') {
      type = 'perquisites';
      const perquisites = this.perquisites;
      let perquisitesForm = this.createSevTwoForm(item)
      perquisites.push(perquisitesForm);
      this.changeSectionOne('perquisites');
      this.setDescriptionValidation('perquisites', perquisitesForm, false)
    } else if (salaryType === 'SEC17_3') {
      type = 'profitsInLieu';
      const profitsInLieu = this.profitsInLieu;
      let profitForm = this.createSevThreeForm(item);
      profitsInLieu.push(profitForm);
      this.changeSectionOne('profitsInLieu');
      this.setDescriptionValidation('profitsInLieu', profitForm, false)
    }
  }

  //  BREAKUP MONTHLY WISE
  breakUpFn(i, component) {
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.elementRef)
      .withPositions([
        {
          originX: 'end', // Align with the right edge of the button
          originY: 'center', // Vertically center align with the button
          overlayX: 'end', // Align with the right edge of the overlay
          overlayY: 'center', // Vertically center align the overlay
          offsetX: 300, // setting horizantally
          offsetY: 0, // setting vertically
        },
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: true,
      height: '600px',
      width: '250px',
    });

    const userProfilePortal = new ComponentPortal(BreakUpComponent);
    const componentRef = this.overlayRef.attach(userProfilePortal);


    (componentRef.instance as BreakUpComponent).data = { data: [], component };

    // Subscribe to backdrop click events to close the overlay
    this.overlayRef.backdropClick().subscribe(() => {
      this.overlayRef.dispose(); // Close the overlay
    });
  }




  unsorted(a: any, b: any): number { return 0; }



  changeSectionOne(type) {
    if (type === 'salary') {
      const salary = this.salary;
      this.salaryNames.forEach((type) => {
        type['disabled'] = false;
        salary.controls.forEach((element: UntypedFormGroup) => {
          if (element.controls['salaryType'].value == type.key) {
            type['disabled'] = true;
          }
        });
      });
    } else if (type === 'perquisites') {
      const perquisites = this.perquisites;
      this.perquisiteNames.forEach((type) => {
        type['disabled'] = false;
        perquisites.controls.forEach((element: UntypedFormGroup) => {
          if (element.controls['perquisiteType'].value == type.key) {
            type['disabled'] = true;
          }
        });
      });
    } else if (type === 'profitsInLieu') {
      const profitsInLieu = this.profitsInLieu;
      this.profitInLieuNames.forEach((type) => {
        type['disabled'] = false;
        profitsInLieu.controls.forEach((element: UntypedFormGroup) => {
          if (element.controls['salaryType'].value == type.key) {
            type['disabled'] = true;
          }
        });
      });
    }
  }

  setDescriptionValidation(type, item, updateTotal) {
    if (type === 'salary') {
      if (updateTotal) {
        let total = this.salaryFormGroup?.get('salary')?.value?.reduce(
          (acc, item) => acc + parseFloat(item?.taxableAmount ? item?.taxableAmount : 0), 0);
        this.salaryFormGroup.controls['secOneTotal'].setValue(total);
      }
      if (item.controls['salaryType'].value === 'OTHER' && item.controls['taxableAmount'].value > 0) {
        item.controls['description'].setValidators([Validators.required]);
        item.controls['description'].markAsTouched();
        item.controls['description'].markAsDirty();
        item.controls['description'].updateValueAndValidity();
      } else {
        item.controls['description'].setValidators(null);
        item.controls['description'].updateValueAndValidity();
      }
    } else if (type === 'perquisites') {
      if (updateTotal) {
        let total = this.salaryFormGroup?.get('perquisites')?.value?.reduce(
          (acc, item) => acc + parseFloat(item?.taxableAmount ? item?.taxableAmount : 0), 0);
        this.salaryFormGroup.controls['secTwoTotal'].setValue(total);
      }
      if (item.controls['perquisiteType'].value === 'OTH_BENEFITS_AMENITIES' && item.controls['taxableAmount'].value > 0) {
        item.controls['description'].setValidators([Validators.required]);
        item.controls['description'].markAsTouched();
        item.controls['description'].markAsDirty();
        item.controls['description'].updateValueAndValidity();
      } else {
        item.controls['description'].setValidators(null);
        item.controls['description'].updateValueAndValidity();

      }
    } else if (type === 'profitsInLieu') {
      if (updateTotal) {
        let total = this.salaryFormGroup?.get('profitsInLieu')?.value?.reduce(
          (acc, item) => acc + parseFloat(item?.taxableAmount ? item?.taxableAmount : 0), 0);
        this.salaryFormGroup.controls['secThreeTotal'].setValue(total);
      }
      if (item.controls['salaryType'].value === 'ANY_OTHER' && item.controls['taxableAmount'].value > 0) {
        item.controls['description'].setValidators([Validators.required]);
        item.controls['description'].markAsTouched();
        item.controls['description'].markAsDirty();
        item.controls['description'].updateValueAndValidity();
      } else {
        item.controls['description'].setValidators(null);
        item.controls['description'].updateValueAndValidity();
      }
    }
    this.isValid.emit(this.salaryFormGroup.invalid);
  }

  confirmChange(event: Event, incomeType: string) {
    if (incomeType === 'SEC17_1') {
      let total = this.salaryFormGroup?.get('salary')?.value?.reduce(
        (acc, item) => acc + parseFloat(item?.taxableAmount ? item?.taxableAmount : 0), 0);
      if (this.utilsService.isNonZero(total)) {
        this.showWarningPopup(incomeType);
      }
    }

    if (incomeType === 'SEC17_2') {
      let total = this.salaryFormGroup?.get('perquisites')?.value?.reduce(
        (acc, item) => acc + parseFloat(item?.taxableAmount ? item?.taxableAmount : 0), 0);
      if (this.utilsService.isNonZero(total)) {
        this.showWarningPopup(incomeType);
      }
    }

    if (incomeType === 'SEC17_3') {
      let total = this.salaryFormGroup?.get('profitsInLieu')?.value?.reduce(
        (acc, item) => acc + parseFloat(item?.taxableAmount ? item?.taxableAmount : 0), 0);
      if (this.utilsService.isNonZero(total)) {
        this.showWarningPopup(incomeType);
      }
    }
  }

  showWarningPopup(incomeType) {
    if (this.changeConsentGiven) {
      return;
    }
    this.changeConsentGiven = false;
    let dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Warning!! Data will be removed!',
        message: 'Updating gross value will remove bifurcation.',
        showActions: false
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.changeConsentGiven = true;
      sessionStorage.setItem('localEmployer', JSON.stringify(this.localEmployer));
      this.localEmployer = JSON.parse(sessionStorage.getItem('localEmployer'));
      if (incomeType === 'SEC17_1') {
        this.salary.controls.forEach(element => {
          element.get('taxableAmount').setValue(0);
        });
        this.changeConsentGiven = false;
      }
      if (incomeType === 'SEC17_2') {
        this.perquisites.controls.forEach(element => {
          element.get('taxableAmount').setValue(0);
        });
        this.changeConsentGiven = false;
      }
      if (incomeType === 'SEC17_3') {
        this.profitsInLieu.controls.forEach(element => {
          element.get('taxableAmount').setValue(0);
        });
        this.changeConsentGiven = false;
      }
      this.salaryFormGroup.updateValueAndValidity();
      this.formValuesChanged();
    });
  }

  onValueChange() {
    if (!this.salaryFormGroup) {
      this.salaryFormGroup = this.createBifurcationForm();
    }
    this.salaryFormGroup = this.createBifurcationForm();

    let values = this.utilsService.getSalaryValues();
    if (!values) {
      values = {
        salary: [],
        perquisites: [],
        profitsInLieu: []
      }
    }
    // Salary
    let salaryDataToPatch = this.localEmployer?.salary?.filter(
      (item) => item?.salaryType !== 'SEC17_1');
    const salaryParticular = salaryDataToPatch.map(data => data.salaryType);
    const notPresentSalary = this.salaryMappings.filter(d => !salaryParticular.some(s => s === d));

    if (salaryDataToPatch && salaryDataToPatch?.length > 0) {
      salaryDataToPatch?.forEach((item) => {
        this.addItem('SEC17_1', item);
      });
    }
    notPresentSalary.forEach(element => {
      let item = {
        id: null,
        salaryType: element,
        taxableAmount: 0,
        exemptAmount: 0,
        description: ''
      };
      this.addItem('SEC17_1', item);
    });



    let perquisitesDataToPatch = this.localEmployer?.perquisites?.filter(
      (item) => item?.perquisiteType !== 'SEC17_2');
    const perquisitesParticular = perquisitesDataToPatch.map(data => data.perquisiteType);
    const notPresentPerquisites = this.perquisiteMapping.filter(d => !perquisitesParticular.some(s => s === d));
    if (perquisitesDataToPatch && perquisitesDataToPatch?.length > 0) {
      perquisitesDataToPatch?.forEach((item) => {
        this.addItem('SEC17_2', item);
      });
    }

    notPresentPerquisites.forEach(element => {
      let item = {
        id: null,
        perquisiteType: element,
        taxableAmount: 0,
        exemptAmount: 0,
        description: ''
      };
      this.addItem('SEC17_2', item);
    });

    // profits in lieu
    let profitsInLieuDataToPatch =
      this.localEmployer?.profitsInLieuOfSalaryType?.filter(
        (item) => item?.salaryType !== 'SEC17_3');
    const profitsInLieuParticular = profitsInLieuDataToPatch.map(data => data.salaryType);
    const notPresentProfitsInLieu = this.profitInLieuMapping.filter(d => !profitsInLieuParticular.some(s => s === d));

    if (profitsInLieuDataToPatch && profitsInLieuDataToPatch?.length > 0) {
      profitsInLieuDataToPatch?.forEach((item) => {
        this.addItem('SEC17_3', item);
      });
    }

    notPresentProfitsInLieu.forEach(element => {
      let item = {
        id: null,
        salaryType: element,
        taxableAmount: 0,
        exemptAmount: 0,
        description: ''
      };
      this.addItem('SEC17_3', item);
    });

    let secOneTotal = this.localEmployer?.salary?.filter(
      (item) => item?.salaryType == 'SEC17_1')
    this.salaryFormGroup.controls['secOneTotal'].setValue(secOneTotal.length > 0 ? secOneTotal[0].taxableAmount : 0)

    let secTwoTotal = this.localEmployer?.perquisites?.filter(
      (item) => item?.perquisiteType == 'SEC17_2')
    this.salaryFormGroup.controls['secTwoTotal'].setValue(secTwoTotal.length > 0 ? secTwoTotal[0].taxableAmount : 0)

    let secThreeTotal = this.localEmployer?.profitsInLieuOfSalaryType?.filter(
      (item) => item?.salaryType == 'SEC17_3')
    this.salaryFormGroup.controls['secThreeTotal'].setValue(secThreeTotal.length > 0 ? secThreeTotal[0].taxableAmount : 0)
    this.utilsService.setSalaryValues(values);
    this.formValuesChanged();
  }
}
