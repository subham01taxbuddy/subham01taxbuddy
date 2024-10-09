import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { TaxDataService } from '../../../../app/tax-data.service';
import { UserTaxDataService } from '../../../services/user-tax-data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime } from 'rxjs/operators';
import { ChangeDetectionStrategy } from '@angular/core';
import {ApiEndpoints} from "../../../modules/shared/api-endpoint";
import {ItrMsService} from "../../../services/itr-ms.service";
import {UserMsService} from "../../../services/user-ms.service";

@Component({
  selector: 'app-tax-calculation',
  templateUrl: './tax-calculation.component.html',
  styleUrls: ['./tax-calculation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaxCalculationComponent implements OnInit {
  userId: number | undefined;
  taxCalculationForm: FormGroup;
  toggleLabel: string = 'OFF';
  apiUrl = ApiEndpoints.itrMs.itrAdvanceTax;
  isLoading = true; // Initialize loading state to true

  // Properties to hold response data
  advanceTaxQuarter1: any;
  advanceTaxQuarter2: any;
  advanceTaxQuarter3: any;
  advanceTaxQuarter4: any;
  oldRegime: any;
  newRegime: any;
  totalTaxLiability: number | undefined;
  beneficialRegime: string | undefined;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private taxDataService: TaxDataService,
    private userTaxDataService: UserTaxDataService,
    private snackBar: MatSnackBar,
    private itrMsService: ItrMsService,
    private userMsService: UserMsService
  ) {
    // Initialize the form group
    this.taxCalculationForm = this.fb.group({
      assesseeName: ['', Validators.required],
      panNumber: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(10),
        ],
      ],
      assessmentYear: [{ value: '2025-2026', disabled: true }],
      dateOfBirth: ['', Validators.required],
      grossSalary: [''],
      incomeFromOtherSources: [''],
      exemptionAllowedOldregime: [''],
      exemptionAllowedNewregime: [''],
      toggleOption: [false, Validators.required],
      ltcg112A: [''],
      ltcg112Other: [''],
      stcg111A: [''],
      stcgAppRate: [''],
      nonSpeculative: [''],
      speculative: [''],
      rentalIncome: [''],
      homeLoanInterest: [''],
      selfOccupaid: [''],
      eightyCDD1: [''],
      selfAndFamily: [''],
      eighty1B: [''],
      eightyCCD2: [''],
      houseProperty: [''],
      businessNonSpeculative: [''],
      businessSpeculative: [''],
      LTCG112A: [''],
      STCG111A: [''],
      LTCGother112A: [''],
      STCGotherthan111A: [''],
      TDS: [''],
      AdvanceTaxIfAny: [''],
      anyOther: [''],
      userId: [null],
      deductionAt30: [''],
      us80g80ggc80gga: [''],
      us80ttattb: [{ value: '', disabled: true }], // Initially disabled
      // parents: ['', Validators.required],
      parents: [''],
      hasParentAboveSixty: [false],
    });
  }

  ngOnInit(): void {
    this.listenToFormChanges();

    const panNumber = this.taxCalculationForm.get('panNumber')?.value || 0;
    const assesseeName =
      this.taxCalculationForm.get('assesseeName')?.value || 0;

    console.log({ assesseeName, panNumber });

    console.log({
      assesseeName: this.taxCalculationForm.get('assesseeName')?.value,
      panNumber: this.taxCalculationForm.get('panNumber')?.value,
      userId: this.taxCalculationForm.get('userId')?.value,
    });

    // Get userId from queryParams
    this.activatedRoute.queryParams.subscribe((params) => {
      this.userId = params['userId'];
      this.taxCalculationForm.patchValue({ userId: this.userId });

      if (this.userId) {
        this.fetchTaxData(this.userId);
        // this.fetchUserProfile(this.userId);
      }
    });
  }

  private listenToFormChanges(): void {
    this.taxCalculationForm
      .get('incomeFromOtherSources')
      ?.valueChanges.pipe(debounceTime(300)) // Adjust the debounce time as needed
      .subscribe(() => {
        this.toggleUs80ttattb();
      });
  }

  private toggleUs80ttattb(): void {
    const incomeFromOtherSources =
      this.taxCalculationForm.get('incomeFromOtherSources')?.value || 0;
    const us80ttattb = this.taxCalculationForm.get('us80ttattb')?.value || 0;

    if (incomeFromOtherSources > 0) {
      this.taxCalculationForm.get('us80ttattb')?.enable({ emitEvent: false }); // Avoid triggering value changes

      if (us80ttattb > incomeFromOtherSources) {
        this.taxCalculationForm
          .get('us80ttattb')
          ?.setErrors({ maxExceeded: true });
      } else {
        this.taxCalculationForm.get('us80ttattb')?.setErrors(null);
      }
    } else {
      this.taxCalculationForm.get('us80ttattb')?.disable({ emitEvent: false });
      this.taxCalculationForm
        .get('us80ttattb')
        ?.setValue('', { emitEvent: false });
    }
  }

  private fetchTaxData(userId: number): void {
    const apiUrl = `${ApiEndpoints.itrMs.itrAdvanceTax}/${userId}`;
    this.isLoading = true; // Start loading

    this.itrMsService.getMethod(apiUrl).subscribe(
      (response: any) => {
        // Check if the response is successful
        if (response.success) {
          const taxData = response.data;
          this.taxCalculationForm.patchValue({
            assesseeName: taxData.name,
            panNumber: taxData.pan,
            assessmentYear: taxData.assessmentYear,
            dateOfBirth: taxData.dob,
            grossSalary: taxData.grossSalary,
            exemptionAllowedOldregime: taxData.oldRegimeSalaryExemption,
            exemptionAllowedNewregime: taxData.newRegimeSalaryExemption,
            rentalIncome: taxData.rentalIncome,
            homeLoanInterest: taxData.homeLoanInterest,
            anyOther: taxData.anyOther,
            incomeFromOtherSources: taxData.otherSourceIncome,
            // nonSpeculative: taxData.pylNonSpeculativeIncome,
            // speculative: taxData.pylSpeculativeIncome,
            LTCG112A: taxData.pylLtcgl12A,
            LTCGother112A: taxData.pylLtcgOtherThan112A,
            STCG111A: taxData.pylStcgOtherThan111A,
            TDS: taxData.tdsTcs,
            AdvanceTaxIfAny: taxData.advanceTaxPaid,
            deductionAt30: taxData.deduction,
            ltcg112A: taxData.ltcg112A,
            stcg111A: taxData.stcg111A,
            ltcg112Other: taxData.ltcg112Other,
            stcgAppRate: taxData.stcgAppRate,
            selfOccupaid: taxData.sopHomeLoanInterest,
            eightyCDD1: taxData.us80c,
            selfAndFamily: taxData.us80dSelf,
            eighty1B: taxData.us80ccd1b,
            eightyCCD2: taxData.us80ccd2,
            us80ttattb: taxData.us80ttattb,
            us80g80ggc80gga: taxData.us80g80ggc80gga,
            // businessNonSpeculative: taxData.businessIncome,
            // businessSpeculative: taxData.speculativeBusinessIncome,
            houseProperty: taxData.pylHp,
            STCGotherthan111A: taxData.pylStcgOtherThan111A,
            parents: taxData.us80dParent,
            hasParentAboveSixty: taxData.hasParentAboveSixty,
            nonSpeculative: taxData.businessIncome,
            speculative: taxData.speculativeBusinessIncome,
            businessNonSpeculative: taxData.pylNonSpeculativeIncome,
            businessSpeculative: taxData.pylSpeculativeIncome,
          });
          this.isLoading = false; // Loading complete
        } else {
          // If the response is not successful, make the fallback API call
          this.fetchUserProfile(userId);
        }
      },
      (error) => {
        console.error('Error fetching tax data:', error);
        // Attempt to fetch user profile as fallback
        this.fetchUserProfile(userId);
      }
    );
  }

  private fetchUserProfile(userId: number): void {
    const userProfileUrl = `/profile/${userId}`;
    this.isLoading = true; // Start loading

    this.userMsService.getMethod(userProfileUrl).subscribe(
      (response: any) => {
        const profileData = response;
        // Patch values correctly from profileData
        console.log({ profileData });
        this.taxCalculationForm.patchValue({
          assesseeName: `${profileData.fName} ${profileData.lName || ''}`, // Combining first and last name
          panNumber: profileData.panNumber, // Ensure this matches the form control name
          dateOfBirth: profileData.dateOfBirth, // Use correct data fields
          userId: profileData.userId, // You can also set userId if needed
          // Optionally patch other fields if required
        });

        // Log assesseeName and panNumber after fetching user profile
        console.log(
          'Assessee Name:',
          this.taxCalculationForm.get('assesseeName')?.value
        );
        console.log(
          'PAN Number:',
          this.taxCalculationForm.get('panNumber')?.value
        );

        this.isLoading = false; // Loading complete
      },
      (error) => {
        console.error('Error fetching user profile:', error);
        this.isLoading = false; // Loading complete even on error
      }
    );
  }

  onToggleChange(checked: boolean): void {
    this.toggleLabel = checked ? 'ON' : 'OFF';
  }

  onSubmit(): void {
    const formData = this.buildFormData();

    const grossSalary = this.taxCalculationForm.get('grossSalary')?.value || 0;
    const oldRegimeExemption =
      this.taxCalculationForm.get('exemptionAllowedOldregime')?.value || 0;
    const newRegimeExemption =
      this.taxCalculationForm.get('exemptionAllowedNewregime')?.value || 0;
    const rentalIncome =
      this.taxCalculationForm.get('rentalIncome')?.value || 0;
    const deductionAt30 =
      this.taxCalculationForm.get('deductionAt30')?.value || 0;
    const incomeFromOtherSources =
      this.taxCalculationForm.get('incomeFromOtherSources')?.value || 0;
    const nonSpeculative =
      this.taxCalculationForm.get('nonSpeculative')?.value || 0;
    const speculative = this.taxCalculationForm.get('speculative')?.value || 0;
    const us80ttattb = this.taxCalculationForm.get('us80ttattb')?.value || 0;
    const ltcg112A = this.taxCalculationForm.get('ltcg112A')?.value || 0;
    const ltcg112Other =
      this.taxCalculationForm.get('ltcg112Other')?.value || 0;
    const stcg111A = this.taxCalculationForm.get('stcg111A')?.value || 0;
    const stcgAppRate = this.taxCalculationForm.get('stcgAppRate')?.value || 0;

    // Validate input values
    if (
      (oldRegimeExemption > 0 || newRegimeExemption > 0) &&
      grossSalary === 0
    ) {
      alert(
        'Gross Salary must have a value if either old or new regime salary exemptions have values.'
      );
      return;
    }

    if ((deductionAt30 > 0 && rentalIncome === 0) || rentalIncome === '') {
      alert(
        'Rental Income must have a value if you have entered Deduction values.'
      );
      return;
    }

    if (us80ttattb > incomeFromOtherSources) {
      alert(' 80TTA/TTB cannot exceed Income from Other Sources.');
      return;
    }

    if (
      grossSalary === 0 &&
      oldRegimeExemption === 0 &&
      newRegimeExemption === 0 &&
      rentalIncome === 0 &&
      deductionAt30 === 0 &&
      incomeFromOtherSources === 0 &&
      nonSpeculative === 0 &&
      speculative === 0 &&
      ltcg112A === 0 &&
      ltcg112Other === 0 &&
      stcg111A === 0 &&
      stcgAppRate === 0
    ) {
      alert('At least one of the Income Source you have to enter.');
      return;
    }

    if (this.taxCalculationForm.valid) {
      this.itrMsService
        .postMethod(this.apiUrl, formData)
        .subscribe(
          (response: any) => {
            if (response.success) {
              this.taxDataService.setTaxData(response.data);
              this.userTaxDataService.setUserTaxData(formData);
              this.handleApiResponse(response.data);

              this.router.navigate([
                '/pages/user-management/tax-calculation-details',
              ]);
            } else {
              console.error('API Error: ', response.message);
            }
          },
          (error) => {
            console.error('API Error: ', error);
          }
        );
    } else {
      console.log('Form is invalid or required fields are empty');
    }
  }

  private buildFormData() {
    return {
      userId: this.userId,
      name: this.taxCalculationForm.get('assesseeName')?.value || '',
      assessmentYear: '2025-2026',
      pan: this.taxCalculationForm.get('panNumber')?.value || '',
      dob: this.taxCalculationForm.get('dateOfBirth')?.value || '',
      grossSalary: this.taxCalculationForm.get('grossSalary')?.value || 0,
      otherSourceIncome:
        this.taxCalculationForm.get('incomeFromOtherSources')?.value || 0,
      oldRegimeSalaryExemption:
        this.taxCalculationForm.get('exemptionAllowedOldregime')?.value || 0,
      newRegimeSalaryExemption:
        this.taxCalculationForm.get('exemptionAllowedNewregime')?.value || 0,
      ltcg112A: this.taxCalculationForm.get('ltcg112A')?.value || 0,
      ltcg112Other: this.taxCalculationForm.get('ltcg112Other')?.value || 0,
      stcg111A: this.taxCalculationForm.get('stcg111A')?.value || 0,
      stcgAppRate: this.taxCalculationForm.get('stcgAppRate')?.value || 0,
      // pylSpeculativeIncome:
      //   this.taxCalculationForm.get('speculative')?.value || 0,
      // pylNonSpeculativeIncome:
      //   this.taxCalculationForm.get('nonSpeculative')?.value || 0,
      // speculativeBusinessIncome:
      //   this.taxCalculationForm.get('speculative')?.value || 0,
      rentalIncome: this.taxCalculationForm.get('rentalIncome')?.value || 0,
      homeLoanInterest:
        this.taxCalculationForm.get('homeLoanInterest')?.value || 0,
      sopHomeLoanInterest:
        this.taxCalculationForm.get('selfOccupaid')?.value || 0,
      us80c: this.taxCalculationForm.get('eightyCDD1')?.value || 0,
      us80dSelf: this.taxCalculationForm.get('selfAndFamily')?.value || 0,
      us80ccd1b: this.taxCalculationForm.get('eighty1B')?.value || 0,
      us80ccd2: this.taxCalculationForm.get('eightyCCD2')?.value || 0,

      // pylNonSpeculativeIncome:
      //   this.taxCalculationForm.get('businessNonSpeculative')?.value || 0,
      // pylSpeculativeIncome:
      //   this.taxCalculationForm.get('businessSpeculative')?.value || 0,
      pylLtcgl12A: this.taxCalculationForm.get('LTCG112A')?.value || 0,
      pylStcg111A: this.taxCalculationForm.get('STCG111A')?.value || 0,
      pylLtcgOtherThan112A:
        this.taxCalculationForm.get('LTCGother112A')?.value || 0,
      pylStcgOtherThan111A:
        this.taxCalculationForm.get('STCGotherthan111A')?.value || 0,
      tdsTcs: this.taxCalculationForm.get('TDS')?.value || 0,
      advanceTaxPaid:
        this.taxCalculationForm.get('AdvanceTaxIfAny')?.value || 0,
      anyOther: this.taxCalculationForm.get('anyOther')?.value || 0,
      deduction: this.taxCalculationForm.get('deductionAt30')?.value || 0,
      us80ttattb: this.taxCalculationForm.get('us80ttattb')?.value || 0,
      us80g80ggc80gga:
        this.taxCalculationForm.get('us80g80ggc80gga')?.value || 0,
      // businessIncome:
      //   this.taxCalculationForm.get('businessNonSpeculative')?.value || 0,
      // speculativeBusinessIncome:
      //   this.taxCalculationForm.get('businessSpeculative')?.value || 0,
      pylHp: this.taxCalculationForm.get('houseProperty')?.value || 0,
      us80dParent: this.taxCalculationForm.get('parents')?.value || 0,
      hasParentAboveSixty: this.taxCalculationForm.get('hasParentAboveSixty')
        ?.value,

      // businessIncome:
      // this.taxCalculationForm.get('businessNonSpeculative')?.value || 0,
      // speculativeBusinessIncome:
      // this.taxCalculationForm.get('businessSpeculative')?.value || 0,
      // pylNonSpeculativeIncome:
      // this.taxCalculationForm.get('nonSpeculative')?.value || 0,
      // pylSpeculativeIncome:
      // this.taxCalculationForm.get('speculative')?.value || 0,

      businessIncome: this.taxCalculationForm.get('nonSpeculative')?.value || 0,
      speculativeBusinessIncome:
        this.taxCalculationForm.get('speculative')?.value || 0,
      pylNonSpeculativeIncome:
        this.taxCalculationForm.get('businessNonSpeculative')?.value || 0,
      pylSpeculativeIncome:
        this.taxCalculationForm.get('businessSpeculative')?.value || 0,
    };
  }

  private handleApiResponse(data: any): void {
    this.totalTaxLiability = data.totalTaxLiability;
    this.beneficialRegime = data.beneficialRegime;
    this.advanceTaxQuarter1 = data.quarter1;
    this.advanceTaxQuarter2 = data.quarter2;
    this.advanceTaxQuarter3 = data.quarter3;
    this.advanceTaxQuarter4 = data.quarter4;
    this.oldRegime = data.oldRegimeTax;
    this.newRegime = data.newRegimeTax;
  }
}
