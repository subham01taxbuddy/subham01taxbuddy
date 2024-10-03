import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
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
  apiUrl = 'https://uat-api.taxbuddy.com/itr/calculate/advance-tax';
  getApiUrl = 'https://uat-api.taxbuddy.com/itr/calculate/advance-tax';

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
      us80ttattb: [''],
      us80g80ggc80gga: [''],
    });
  }

  ngOnInit(): void {
    this.taxCalculationForm.controls['assessmentYear'].setValue('2025-2026');
    this.taxCalculationForm.controls['assessmentYear'].disable();

    // Get userId from queryParams
    this.activatedRoute.queryParams.subscribe((params) => {
      this.userId = params['userId'];
      this.taxCalculationForm.patchValue({ userId: this.userId });

      if (this.userId) {
        this.fetchTaxData(this.userId);
      }
    });
  }

  fetchTaxData(userId: number): void {
    const apiUrl = `${this.apiUrl}/${userId}`;

    this.http.get(apiUrl).subscribe(
      (response: any) => {
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
          nonSpeculative: taxData.pylNonSpeculativeIncome,
          speculative: taxData.pylSpeculativeIncome,
          houseProperty: taxData.pylHp,
          businessNonSpeculative: taxData.pylLtcgl12A,
          businessSpeculative: taxData.pylStcg111A,
          LTCG112A: taxData.pylLtcgOtherThan112A,
          STCG111A: taxData.pylStcgOtherThan111A,
          TDS: taxData.tdsTcs,
          AdvanceTaxIfAny: taxData.advanceTaxPaid,
          deductionAt30: taxData.deduction,
        });
      },
      (error) => {
        console.error('Error fetching tax data:', error);
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
      this.http
        .post(this.apiUrl, formData, {
          headers: { 'Content-Type': 'application/json' },
        })
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
      businessIncome: this.taxCalculationForm.get('nonSpeculative')?.value || 0,
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
        this.taxCalculationForm.get('businessSpeculative')?.value || 0,
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
