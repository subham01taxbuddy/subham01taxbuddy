import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { TaxDataService } from '../../../../app/tax-data.service';
import { UserTaxDataService } from '../../../services/user-tax-data.service';

@Component({
  selector: 'app-tax-calculation',
  templateUrl: './tax-calculation.component.html',
  styleUrls: ['./tax-calculation.component.scss'],
})
export class TaxCalculationComponent implements OnInit {
  userId: number | undefined;
  taxCalculationForm: FormGroup;
  toggleLabel: string = 'OFF';
  apiUrl = 'https://uat-api.taxbuddy.com/itr/calculate/advance-tax'; // API URL

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
    private taxDataService: TaxDataService, // Inject the service
    private userTaxDataService: UserTaxDataService
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
      assessmentYear: [{ value: '2024-2025', disabled: true }],
      dateOfBirth: ['', Validators.required],
      grossSalary: [''],
      incomeFromOtherSources: [''],
      exemptionAllowedOldregime: [''],
      exemptionAllowedNewregime: [''],
      toggleOption: [false, Validators.required], // Default is OFF
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
      BusinessSpeculative: [''],
      LTCG112A: [''],
      STCG111A: [''],
      LTCGother112A: [''],
      STCGotherthan111A: [''],
      TDS: [''],
      AdvanceTaxIfAny: [''],
      anyOther: [''],
      userId: [null], // This will be populated from queryParams
      deductionAt30: [''],
    });
  }

  ngOnInit(): void {
    this.taxCalculationForm.controls['assessmentYear'].setValue('2025-2026');
    this.taxCalculationForm.controls['assessmentYear'].disable();

    this.activatedRoute.queryParams.subscribe((params) => {
      this.userId = params['userId'];
      console.log('User ID from query params:', this.userId);
      this.taxCalculationForm.patchValue({ userId: this.userId });

      // Patch other values if available
      this.taxCalculationForm.patchValue({
        assesseeName: params['name'],
        panNumber: params['pan'],
        assessmentYear: params['assessmentYear'],
        dateOfBirth: params['dob'],
        grossSalary: params['grossSalary'],
        exemptionAllowedOldregime: params['oldRegimeSalaryExemption'],
        exemptionAllowedNewregime: params['newRegimeSalaryExemption'],
        ltcg112A: params['ltcg112A'],
        ltcg112Other: params['ltcg112Other'],
        stcg111A: params['stcg111A'],
        stcgAppRate: params['stcgAppRate'],
        rentalIncome: params['rentalIncome'],
        homeLoanInterest: params['homeLoanInterest'],
        anyOther: params['anyOther'],
        AdvanceTaxIfAny: params['advanceTaxPaid'],
        incomeFromOtherSources: params['otherSourceIncome'],
        nonSpeculative: params['pylNonSpeculativeIncome'],
        speculative: params['pylSpeculativeIncome'],
        houseProperty: params['pylHp'],
        businessNonSpeculative: params['pylLtcgl12A'],
        businessSpeculative: params['pylStcg111A'],
        LTCG112A: params['pylLtcgOtherThan112A'],
        STCG111A: params['pylStcgOtherThan111A'],
        TDS: params['tdsTcs'],
        deductionAt30: params['deduction'] || 0,
      });
    });
  }

  onToggleChange(checked: boolean): void {
    this.toggleLabel = checked ? 'ON' : 'OFF';
  }

  onSubmit(): void {
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

    console.log({
      grossSalary,
      oldRegimeExemption,
      newRegimeExemption,
      rentalIncome,
      deductionAt30,
      incomeFromOtherSources,
      nonSpeculative,
      speculative,
    });

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

    if (
      grossSalary === 0 &&
      oldRegimeExemption === 0 &&
      newRegimeExemption === 0 &&
      rentalIncome === 0 &&
      deductionAt30 === 0 &&
      incomeFromOtherSources === 0 &&
      nonSpeculative === 0 &&
      speculative === 0
    ) {
      alert('At least one of the Income Source you have to enter.');
      return;
    }

    if (this.taxCalculationForm.valid) {
      const formData = {
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
        businessIncome:
          this.taxCalculationForm.get('nonSpeculative')?.value || 0,
        speculativeBusinessIncome:
          this.taxCalculationForm.get('speculative')?.value || 0,
        rentalIncome: this.taxCalculationForm.get('rentalIncome')?.value || 0,
        homeLoanInterest:
          this.taxCalculationForm.get('homeLoanInterest')?.value || 0,
        sopHomeLoanInterest:
          this.taxCalculationForm.get('selfOccupaid')?.value || 0,
        us80c: this.taxCalculationForm.get('eightyCDD1')?.value || 0,
        us80dSelf: this.taxCalculationForm.get('selfAndFamily')?.value || 0,
        us80ccd1b: this.taxCalculationForm.get('eighty1B')?.value || 0,
        us80ccd2: this.taxCalculationForm.get('eightyCCD2')?.value || 0,
        us80ttattb: this.taxCalculationForm.get('houseProperty')?.value || 0,
        pylNonSpeculativeIncome:
          this.taxCalculationForm.get('businessNonSpeculative')?.value || 0,
        pylSpeculativeIncome:
          this.taxCalculationForm.get('BusinessSpeculative')?.value || 0,
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
      };

      console.log('Submitted Data: ', formData);

      // Call the API
      this.http
        .post(this.apiUrl, formData, {
          headers: { 'Content-Type': 'application/json' },
        })
        .subscribe(
          (response: any) => {
            console.log('API Response: ', response);
            if (response.success) {
              this.taxDataService.setTaxData(response.data);
              this.userTaxDataService.setUserTaxData(formData);
              this.handleApiResponse(response.data);

              // Navigate to the TaxCalculationDetailsComponent
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
      // alert('At least one of the Income Source you have to enter.');
      console.log('Form is invalid or required fields are empty');
    }
  }

  private handleApiResponse(data: any): void {
    const {
      advanceTaxQuarter1,
      advanceTaxQuarter2,
      advanceTaxQuarter3,
      advanceTaxQuarter4,
      oldRegime,
      newRegime,
      totalTaxLiability,
      beneficialRegime,
    } = data;

    this.advanceTaxQuarter1 = advanceTaxQuarter1;
    this.advanceTaxQuarter2 = advanceTaxQuarter2;
    this.advanceTaxQuarter3 = advanceTaxQuarter3;
    this.advanceTaxQuarter4 = advanceTaxQuarter4;
    this.oldRegime = oldRegime;
    this.newRegime = newRegime;
    this.totalTaxLiability = totalTaxLiability;
    this.beneficialRegime = beneficialRegime;
  }
}
