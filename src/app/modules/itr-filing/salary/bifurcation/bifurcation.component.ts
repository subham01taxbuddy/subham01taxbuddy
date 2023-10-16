import {
  Component,
  OnInit,
  Inject,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
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

@Component({
  selector: 'app-bifurcation',
  templateUrl: './bifurcation.component.html',
  styleUrls: ['./bifurcation.component.scss'],
})
export class BifurcationComponent implements OnInit {
  @ViewChild('breakUp') breakUp: ElementRef;
  ITR_JSON: ITR_JSON;
  bifurcationFormGroup: FormGroup;
  localEmployer: Employer;
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
  index: any;
  Copy_ITR_JSON: ITR_JSON;
  loading: boolean = false;
  overlayRef: any;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<BifurcationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private overlay: Overlay,
    private itrMsService: ItrMsService,
    private elementRef: ElementRef,
    private utilsService: UtilsService
  ) {}

  ngOnInit(): void {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.bifurcationFormGroup = this.createBifurcationForm();
    this.index = this.data?.index;
    this.localEmployer = this.data?.data;

    // Salary
    const salaryFormArray = this.getSalary;
    let salaryDataToPatch = this.localEmployer?.salary?.filter(
      (item) => item?.salaryType !== 'SEC17_1'
    );

    if (salaryDataToPatch && salaryDataToPatch?.length > 0) {
      salaryDataToPatch?.forEach((item) => {
        const matchingControl = salaryFormArray?.controls[0]?.get(
          item?.salaryType
        );

        if (matchingControl) {
          matchingControl?.setValue(item?.taxableAmount);
        }
      });
    }

    // perquisities
    const perquisitesFormArray = this.getPerquisites;
    let perquisitesDataToPatch = this.localEmployer?.perquisites?.filter(
      (item) => item?.perquisiteType !== 'SEC17_2'
    );

    if (perquisitesDataToPatch && perquisitesDataToPatch?.length > 0) {
      perquisitesDataToPatch?.forEach((item) => {
        const matchingControl = perquisitesFormArray?.controls[0]?.get(
          item?.perquisiteType
        );

        if (matchingControl) {
          matchingControl?.setValue(item?.taxableAmount);
        }
      });
    }

    // profits in lieu
    let profitsInLieuDataToPatch =
      this.localEmployer?.profitsInLieuOfSalaryType?.filter(
        (item) => item?.salaryType !== 'SEC17_3'
      );
    const profitsInLieuFormArray = this.getProfitsInLieu;
    if (profitsInLieuDataToPatch && profitsInLieuDataToPatch?.length > 0) {
      profitsInLieuDataToPatch?.forEach((item) => {
        const matchingControl = profitsInLieuFormArray?.controls[0]?.get(
          item?.salaryType
        );

        if (matchingControl) {
          matchingControl?.setValue(item?.taxableAmount);
        }
      });
    }

    this.utilsService.getData().subscribe((data) => {
      this.handleData(data);
    });
  }

  createBifurcationForm() {
    return this.fb.group({
      salary: this.fb.array([
        this.fb.group({
          BASIC_SALARY: 0,
          DA: 0,
          CONVEYANCE: 0,
          HOUSE_RENT: 0,
          LTA: 0,
          CHILDREN_EDUCATION: 0,
          OTHER_ALLOWANCE: 0,
          CONTRI_80CCD: 0,
          RULE_6_PART_A_4TH_SCHEDULE: 0,
          RULE_11_4_PART_A_4TH_SCHEDULE: 0,
          PENSION: 0,
          COMMUTED_PENSION: 0,
          GRATUITY: 0,
          COMMISSION: 0,
          ADVANCE_SALARY: 0,
          LEAVE_ENCASHMENT: 0,
          OTHER: 0,
        }),
      ]),
      perquisites: this.fb.array([
        this.fb.group({
          ACCOMODATION: 0,
          MOTOR_CAR: 0,
          SWEEPER_GARDNER_WATCHMAN_OR_PERSONAL_ATTENDANT: 0,
          GAST_ELECTRICITY_WATER: 0,
          INTEREST_FREE_LOANS: 0,
          HOLIDAY_EXPENSES: 0,
          FREE_OR_CONCESSIONAL_TRAVEL: 0,
          FREE_MEALS: 0,
          FREE_EDU: 0,
          GIFT_VOUCHERS: 0,
          CREDIT_CARD_EXPENSES: 0,
          CLUB_EXP: 0,
          USE_OF_MOVABLE_ASSETS_BY_EMPLOYEE: 0,
          TRANSFER_OF_ASSET_TO_EMPLOYEE: 0,
          VALUE_OF_OTHER_BENIFITS_AMENITY_SERVICE_PRIVILEGE: 0,
          SECTION_80_IAC_TAX_TO_BE_DEFERED: 0,
          SECTION_80_IAC_TAX_NOT_TO_BE_DEFERED: 0,
          STOCK_OPTIONS_OTHER_THAN_ESOP: 0,
          SCHEME_TAXABLE_US_17_2_VII: 0,
          SCHEME_TAXABLE_US_17_2_VIIA: 0,
          OTH_BENEFITS_AMENITIES: 0,
        }),
      ]),
      profitsInLieu: this.fb.array([
        this.fb.group({
          COMPENSATION_ON_VRS: 0,
          AMOUNT_DUE: 0,
          PAYMENT_DUE: 0,
          ANY_OTHER: 0,
        }),
      ]),
    });
  }

  saveBifurcations(type) {
    console.log(this.bifurcationFormGroup, 'bifurcationsForm');
    let result;

    if (type === 'salary') {
      const salaryArray = this.getSalary.value;
      const keysToSum = [
        'BASIC_SALARY',
        'DA',
        'CONVEYANCE',
        'HOUSE_RENT',
        'LTA',
        'CHILDREN_EDUCATION',
        'OTHER_ALLOWANCE',
        'CONTRI_80CCD',
        'RULE_6_PART_A_4TH_SCHEDULE',
        'RULE_11_4_PART_A_4TH_SCHEDULE',
        'PENSION',
        'COMMUTED_PENSION',
        'GRATUITY',
        'COMMISSION',
        'ADVANCE_SALARY',
        'LEAVE_ENCASHMENT',
        'OTHER',
      ];

      let total = 0;
      for (const obj of salaryArray) {
        for (const key of keysToSum) {
          total += parseFloat(obj[key]) || 0;
        }
      }

      this.total.salary = total;
      this.value.salary = this.getSalary.value;

      result = {
        total: this.total.salary,
        value: this.value.salary,
        type: 'salary',
        index: this.index,
      };

      // NEED TO CONFIRM WITH ASHWINI IF I SHOULD CALL API OR NOT
      // if (this.localEmployer) {
      //   const bifurcationValues = this.value.salary[0];

      //   this.localEmployer.salary = [];
      //   for (const key in bifurcationValues) {
      //     if (bifurcationValues.hasOwnProperty(key)) {
      //       const element = parseFloat(bifurcationValues[key]);
      //       console.log(element);
      //       if (element && element !== 0) {
      //         this.localEmployer?.salary.push({
      //           salaryType: key,
      //           taxableAmount: element,
      //           exemptAmount: 0,
      //         });
      //       }
      //     }
      //   }

      //   this.Copy_ITR_JSON = JSON.parse(
      //     sessionStorage.getItem(AppConstants.ITR_JSON)
      //   );

      //   this.loading = true;
      //   if (this.index === -1) {
      //     const myEmp = JSON.parse(JSON.stringify(this.localEmployer));
      //     if (
      //       this.Copy_ITR_JSON.employers == null ||
      //       this.Copy_ITR_JSON.employers.length == 0
      //     ) {
      //       this.Copy_ITR_JSON.employers = [];
      //     }
      //     this.Copy_ITR_JSON.employers.push(myEmp);
      //   } else {
      //     const myEmp = JSON.parse(JSON.stringify(this.localEmployer));
      //     this.Copy_ITR_JSON.employers.splice(this.index, 1, myEmp);
      //   }

      //   const param = `/itr/itr-type`;
      //   this.itrMsService.postMethod(param, this.Copy_ITR_JSON).subscribe(
      //     (res: any) => {
      //       this.Copy_ITR_JSON.itrType = res?.data?.itrType;
      //       const param1 = '/taxitr?type=employers';
      //       this.itrMsService.postMethod(param1, this.Copy_ITR_JSON).subscribe(
      //         (result: any) => {
      //           if (this.utilsService.isNonEmpty(result)) {
      //             this.ITR_JSON = result;
      //             this.Copy_ITR_JSON = JSON.parse(
      //               JSON.stringify(this.ITR_JSON)
      //             );
      //             sessionStorage.setItem(
      //               AppConstants.ITR_JSON,
      //               JSON.stringify(this.ITR_JSON)
      //             );
      //           } else {
      //             this.loading = false;
      //             this.utilsService.showSnackBar(
      //               'Failed to save salary detail, Please try again'
      //             );
      //           }
      //         },
      //         (error) => {
      //           this.loading = false;
      //           this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      //         }
      //       );
      //     },
      //     (error) => {
      //       console.log('Error fetching itr type', error);
      //       this.utilsService.showSnackBar('Failed to save salary detail.');
      //     }
      //   );
      // }
    }

    if (type === 'perquisites') {
      const perquisitesArray = this.getPerquisites.value;
      const perquisitesKeysToSum = [
        'ACCOMODATION',
        'MOTOR_CAR',
        'SWEEPER_GARDNER_WATCHMAN_OR_PERSONAL_ATTENDANT',
        'GAST_ELECTRICITY_WATER',
        'INTEREST_FREE_LOANS',
        'HOLIDAY_EXPENSES',
        'FREE_OR_CONCESSIONAL_TRAVEL',
        'FREE_MEALS',
        'FREE_EDU',
        'GIFT_VOUCHERS',
        'CREDIT_CARD_EXPENSES',
        'CLUB_EXP',
        'USE_OF_MOVABLE_ASSETS_BY_EMPLOYEE',
        'TRANSFER_OF_ASSET_TO_EMPLOYEE',
        'VALUE_OF_OTHER_BENIFITS_AMENITY_SERVICE_PRIVILEGE',
        'SECTION_80_IAC_TAX_TO_BE_DEFERED',
        'SECTION_80_IAC_TAX_NOT_TO_BE_DEFERED',
        'STOCK_OPTIONS_OTHER_THAN_ESOP',
        'SCHEME_TAXABLE_US_17_2_VII',
        'SCHEME_TAXABLE_US_17_2_VIIA',
        'OTH_BENEFITS_AMENITIES',
      ];

      let perquisitesTotal = 0;
      for (const obj of perquisitesArray) {
        for (const key of perquisitesKeysToSum) {
          perquisitesTotal += parseFloat(obj[key]) || 0;
        }
      }

      this.total.perquisites = perquisitesTotal;
      this.value.perquisites = this.getPerquisites.value;

      result = {
        total: this.total.perquisites,
        value: this.value.perquisites,
        type: 'perquisites',
        index: this.index,
      };
    }

    if (type === 'profitsInLieu') {
      const profitsInLieuArray = this.getProfitsInLieu.value;
      const profitsInLieuKeysToSum = [
        'COMPENSATION_ON_VRS',
        'AMOUNT_DUE',
        'PAYMENT_DUE',
        'ANY_OTHER',
      ];

      let profitsInLieuTotal = 0;
      for (const obj of profitsInLieuArray) {
        for (const key of profitsInLieuKeysToSum) {
          profitsInLieuTotal += parseFloat(obj[key]) || 0;
        }
      }

      this.total.profitsInLieuOfSalary = profitsInLieuTotal;
      this.value.profitsInLieuOfSalary = this.getProfitsInLieu.value;

      result = {
        total: this.total.profitsInLieuOfSalary,
        value: this.value.profitsInLieuOfSalary,
        type: 'profitsInLieuOfSalary',
        index: this.index,
      };
    }

    this.dialogRef.close(result);
  }

  //  BREAKUP MONTHLY WISE
  breakUpFn(i) {
    const value = parseFloat(this.getSalary.value[0].BASIC_SALARY);
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

    (componentRef.instance as BreakUpComponent).data = value;

    // Subscribe to backdrop click events to close the overlay
    this.overlayRef.backdropClick().subscribe(() => {
      this.overlayRef.dispose(); // Close the overlay
    });
  }

  handleData(data: any) {
    (this.getSalary.controls[0] as FormGroup).controls['BASIC_SALARY'].setValue(
      Math.ceil(data)
    );
    this.overlayRef.dispose(); // Close the overlay
  }

  // get functions
  get getSalary() {
    return this.bifurcationFormGroup.get('salary') as FormArray;
  }

  get getPerquisites() {
    return this.bifurcationFormGroup.get('perquisites') as FormArray;
  }

  get getProfitsInLieu() {
    return this.bifurcationFormGroup.get('profitsInLieu') as FormArray;
  }
}
