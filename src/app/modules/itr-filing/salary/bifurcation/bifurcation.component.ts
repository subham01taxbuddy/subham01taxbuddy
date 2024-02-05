import {
  Component,
  OnInit,
  Inject,
  ElementRef,
  ViewChild, Input, OnChanges, SimpleChanges, Output, EventEmitter,
} from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  Employer,
  ITR_JSON,
} from 'src/app/modules/shared/interfaces/itr-input.interface';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ComponentPortal } from '@angular/cdk/portal';
import { BreakUpComponent } from '../break-up/break-up.component';
import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { UtilsService } from 'src/app/services/utils.service';
import { SalaryComponent } from '../salary.component';

@Component({
  selector: 'app-bifurcation',
  templateUrl: './bifurcation.component.html',
  styleUrls: ['./bifurcation.component.scss'],
})
export class BifurcationComponent implements OnInit, OnChanges {
  @Input() typeIndex: number;
  @ViewChild('breakUp') breakUp: ElementRef;
  ITR_JSON: ITR_JSON;
  bifurcationFormGroup: FormGroup;
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
  controlMappings = {
    'Basic Salary': 'BASIC_SALARY',
    'House Rent Allowance (HRA)': 'HOUSE_RENT',
    'Dearness Allowance (DA)': 'DA',
  };

  @Output() valueChanged: EventEmitter<any> = new EventEmitter<any>();

  salaryNames = [
    {
      key: 'BASIC_SALARY',
      value: 'Basic',
      breakup: true,
    },
    {
      key: 'DA',
      value: 'Dearness Allowance (DA)'
    },
    {
      key: 'CONVEYANCE',
      value: 'Conveyance Allowance'
    },
    {
      key: 'HOUSE_RENT',
      value: 'House Rent Allowance (HRA)'
    },
    {
      key: 'LTA',
      value: 'Leave Travel Allowance (LTA)'
    },
    {
      key: 'CHILDREN_EDUCATION',
      value: 'Children Education Allowance (CEA)'
    },
    {
      key: 'OTHER_ALLOWANCE',
      value: 'Other Allowance'
    },
    {
      key: 'CONTRI_80CCD',
      value: 'The contribution made by the employer towards the pension scheme\n' +
          '              as referred under section 80CCD'
    },
    {
      key: 'RULE_6_PART_A_4TH_SCHEDULE',
      value: 'The amount deemed to be income under rule 6 of part A of the\n' +
          '              fourth schedule'
    },
    {
      key: 'RULE_11_4_PART_A_4TH_SCHEDULE',
      value: 'The amount deemed to be income under rule 11(4) of Part-A of the\n' +
          '              Fourth Schedule'
    },
    {
      key: 'PENSION',
      value: 'Annuity or Pension'
    },
    {
      key: 'COMMUTED_PENSION',
      value: 'Commuted Pension'
    },
    {
      key: 'GRATUITY',
      value: 'Gratuity'
    },
    {
      key: 'COMMISSION',
      value: 'Fees/Commission'
    },
    {
      key: 'ADVANCE_SALARY',
      value: 'Advance Salary'
    },
    {
      key: 'LEAVE_ENCASHMENT',
      value: 'Leave Encashment'
    },
    {
      key: 'OTHER',
      value: 'Others'
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
  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private overlay: Overlay,
    private itrMsService: ItrMsService,
    private elementRef: ElementRef,
    private utilsService: UtilsService
  ) {}

  ngOnInit(): void {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.bifurcationFormGroup = this.createBifurcationForm();

    const salaryForm = this.getControls as FormGroup;
    if(this.typeIndex === 0) {
      // Salary
      let salaryDataToPatch = this.localEmployer?.salary?.filter(
          (item) => item?.salaryType !== 'SEC17_1'
      );

      if (salaryDataToPatch && salaryDataToPatch?.length > 0) {
        salaryDataToPatch?.forEach((item) => {
          let control = this.fb.control('');
          control?.setValue(item?.taxableAmount);
          salaryForm.addControl(item?.salaryType, control);
        });
      }
    }

    if(this.typeIndex === 1) {
      let perquisitesDataToPatch = this.localEmployer?.perquisites?.filter(
          (item) => item?.perquisiteType !== 'SEC17_2'
      );

      if (perquisitesDataToPatch && perquisitesDataToPatch?.length > 0) {
        perquisitesDataToPatch?.forEach((item) => {
          let control = this.fb.control('');
          control?.setValue(item?.taxableAmount);
          salaryForm.addControl(item?.perquisiteType, control);
        });
      }
    }

    if(this.typeIndex === 2) {
      // profits in lieu
      let profitsInLieuDataToPatch =
          this.localEmployer?.profitsInLieuOfSalaryType?.filter(
              (item) => item?.salaryType !== 'SEC17_3'
          );

      if (profitsInLieuDataToPatch && profitsInLieuDataToPatch?.length > 0) {
        profitsInLieuDataToPatch?.forEach((item) => {
          profitsInLieuDataToPatch?.forEach((item) => {
            let control = this.fb.control('');
            control?.setValue(item?.taxableAmount);
            salaryForm.addControl(item?.salaryType, control);
          });
        });
      }
    }

      this.utilsService.getData().subscribe((data) => {
        this.handleData(data);
      });
    // }

    const values = this.bifurcationFormGroup.getRawValue();
    this.utilsService.setSalaryValues(values);
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('Hurray!!');
    if(!this.bifurcationFormGroup){
      this.bifurcationFormGroup = this.createBifurcationForm();
    }
    const salaryForm = this.getControls as FormGroup;
    if(this.typeIndex === 0) {
      // Salary
      let salaryDataToPatch = this.localEmployer?.salary?.filter(
          (item) => item?.salaryType !== 'SEC17_1'
      );

      if (salaryDataToPatch && salaryDataToPatch?.length > 0) {
        salaryDataToPatch?.forEach((item) => {
          let control = this.fb.control('');
          control?.setValue(item?.taxableAmount);
          salaryForm.addControl(item?.salaryType, control);
        });
      }
    }

    if(this.typeIndex === 1) {
      let perquisitesDataToPatch = this.localEmployer?.perquisites?.filter(
          (item) => item?.perquisiteType !== 'SEC17_2'
      );

      if (perquisitesDataToPatch && perquisitesDataToPatch?.length > 0) {
        perquisitesDataToPatch?.forEach((item) => {
          let control = this.fb.control('');
          control?.setValue(item?.taxableAmount);
          salaryForm.addControl(item?.perquisiteType, control);
        });
      }
    }

    if(this.typeIndex === 2) {
      // profits in lieu
      let profitsInLieuDataToPatch =
          this.localEmployer?.profitsInLieuOfSalaryType?.filter(
              (item) => item?.salaryType !== 'SEC17_3'
          );

      if (profitsInLieuDataToPatch && profitsInLieuDataToPatch?.length > 0) {
        profitsInLieuDataToPatch?.forEach((item) => {
          profitsInLieuDataToPatch?.forEach((item) => {
            let control = this.fb.control('');
            control?.setValue(item?.taxableAmount);
            salaryForm.addControl(item?.salaryType, control);
          });
        });
      }
    }
  }

  createBifurcationForm() {
    return this.fb.group({
      salary:
        this.fb.group({
        }),
      perquisites: this.fb.group({
        }),
      profitsInLieu:
        this.fb.group({
        }),
    });
  }

  formValuesChanged(prevKey, index, event?){
    if(event) {
      let type = 'salary';
      if (this.typeIndex === 0) {
        type = 'salary';
      } else if(this.typeIndex === 1) {
        type = 'perquisites';
      } else if(this.typeIndex === 2){
        type = 'profitsInLieu';
      }
      let value = (this.bifurcationFormGroup.controls[type] as FormGroup).controls[prevKey].value;
      let control = this.fb.control('');
      control.setValue(value);

      let entries = Object.entries((this.bifurcationFormGroup.controls[type] as FormGroup).value);
      let salaryForm = this.getControls as FormGroup;
      salaryForm = this.fb.group({});
      for(let i=0; i<index; i++){
        let ctrl = this.fb.control('');
        ctrl.setValue(entries[0][1]);
        salaryForm.addControl(entries[i][0], ctrl);
      }
      // (this.bifurcationFormGroup.controls[type] as FormGroup).removeControl(prevKey);
      salaryForm.addControl(event.value, control);
      for(let i=index+1; i<index; entries.length){
        let ctrl = this.fb.control('');
        ctrl.setValue(entries[0][1]);
        salaryForm.addControl(entries[i][0], ctrl);
      }
    }

    if(this.valid()) {
      this.valueChanged.emit(this.bifurcationFormGroup.getRawValue());
    }
  }

  valid(){
    let type = 'salary';
    if (this.typeIndex === 0) {
      type = 'salary';
    } else if(this.typeIndex === 1) {
      type = 'perquisites';
    } else if(this.typeIndex === 2){
      type = 'profitsInLieu';
    }
    let keys = Object.keys((this.bifurcationFormGroup.controls[type] as FormGroup).controls);
    keys.every(key => {
      if(keys.filter(v => v === key).length > 1){
        console.log('key repeated', key);
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

    console.log(this.bifurcationFormGroup, 'bifurcationsForm');
    let result;

    if (this.typeIndex === 0) {
      const salaryArray = this.getControls.value;

      let total = 0;
      for (let obj of Object.values(salaryArray)) {
        total += obj as number;
      }

      this.total.salary = total;
      this.value.salary = this.getControls.value;

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
      }

      console.log('salary copyItrJson', this.Copy_ITR_JSON);
    }

    if (this.typeIndex === 1) {
      const perquisitesArray = this.getControls.value;

      let perquisitesTotal = 0;
      for (let obj of Object.values(perquisitesArray)) {
        perquisitesTotal += obj as number;
      }

      this.total.perquisites = perquisitesTotal;
      this.value.perquisites = this.getControls.value;

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
    }

    if (this.typeIndex === 2) {
      const profitsInLieuArray = this.getControls.value;
      const profitsInLieuKeysToSum = [
        'COMPENSATION_ON_VRS',
        'AMOUNT_DUE',
        'PAYMENT_DUE',
        'ANY_OTHER',
      ];

      let profitsInLieuTotal = 0;
      for (let obj of Object.values(profitsInLieuArray)) {
        profitsInLieuTotal += obj as number;
      }

      this.total.profitsInLieuOfSalary = profitsInLieuTotal;
      this.value.profitsInLieuOfSalary = this.getControls.value;

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
    }

    this.utilsService.setChange(false);
    const values = this.bifurcationFormGroup.getRawValue();
    this.utilsService.setSalaryValues(values);
    sessionStorage.setItem('localEmployer', JSON.stringify(this.localEmployer));
  }

  deleteItem(key){
    let type = 'salary';
    if (this.typeIndex === 0) {
      type = 'salary';
    } else if(this.typeIndex === 1) {
      type = 'perquisites';
    } else if(this.typeIndex === 2){
      type = 'profitsInLieu';
    }
    (this.bifurcationFormGroup.controls[type] as FormGroup).removeControl(key);
    this.bifurcationFormGroup.updateValueAndValidity();
    this.valueChanged.emit(this.bifurcationFormGroup.getRawValue());
  }

  addItem(){
    let type = 'salary';
    let salaryType = 'SEC17_1';
    if (this.typeIndex === 0) {
      type = 'salary';
      let existingKeys = Object.keys((this.bifurcationFormGroup.controls[type] as FormGroup).controls);
      salaryType = this.salaryNames.filter(element=> !existingKeys.includes(element.key))[0]?.key;
    } else if(this.typeIndex === 1) {
      type = 'perquisites';
      let existingKeys = Object.keys((this.bifurcationFormGroup.controls[type] as FormGroup).controls);
      salaryType = this.perquisiteNames.filter(element=> !existingKeys.includes(element.key))[0]?.key;
    } else if(this.typeIndex === 2){
      type = 'profitsInLieu';
      let existingKeys = Object.keys((this.bifurcationFormGroup.controls[type] as FormGroup).controls);
      salaryType = this.profitInLieuNames.filter(element=> !existingKeys.includes(element.key))[0]?.key;
    }
    let control = this.fb.control('');
    (this.bifurcationFormGroup.controls[type] as FormGroup).addControl(salaryType, control);
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

    const value = parseFloat(
      this.getControls.value[0]?.[this.controlMappings[component]]
    );
    (componentRef.instance as BreakUpComponent).data = { value, component };

    // Subscribe to backdrop click events to close the overlay
    this.overlayRef.backdropClick().subscribe(() => {
      this.overlayRef.dispose(); // Close the overlay
    });
  }

  handleData(data: any) {
    const controlName = this.controlMappings[data?.component];
    if (controlName) {
      (this.getControls as FormGroup)?.controls[
        controlName
      ]?.setValue(Math.ceil(data?.data));
      this.overlayRef.dispose();
    }
  }

  // get functions
  get getControls() {
    // console.log('typeIndex', this.typeIndex);
    if(this.typeIndex === 2){
      return this.bifurcationFormGroup.get('profitsInLieu') as FormGroup;
    } else if(this.typeIndex === 1){
      return this.bifurcationFormGroup.get('perquisites') as FormGroup;
    } else {
      return this.bifurcationFormGroup.get('salary') as FormGroup;
    }
  }

  unsorted(a: any, b: any): number { return 0; }

  getTitle() {
    if(this.typeIndex === 2){
      return 'Profit in lieu of salary as per section 17(3)';
    } else if(this.typeIndex === 1){
      return 'Perquisites as per section 17(2)';
    } else {
      return 'Salary as per section 17(1)';
    }
  }
}
