// import { Component, OnInit } from '@angular/core';

// @Component({
//   selector: 'app-tax-calculation',
//   templateUrl: './tax-calculation.component.html',
//   styleUrls: ['./tax-calculation.component.scss'],
// })
// export class TaxCalculationComponent implements OnInit {
//   income: number | null = null;
//   deductions: number | null = null;
//   calculatedTax: number | null = null;

//   constructor() {}

//   ngOnInit(): void {
//     // Initialization logic if necessary
//   }

//   onSubmit() {
//     if (this.income !== null && this.deductions !== null) {
//       this.calculatedTax = this.calculateTax(this.income, this.deductions);
//     }
//   }

//   calculateTax(income: number, deductions: number): number {
//     return income - deductions; // Simple example calculation
//   }
// }

import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

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

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Retrieve the userId from the query parameters
    // Retrieve the userId from the query parameters
    this.activatedRoute.queryParams.subscribe((params) => {
      this.userId = params['userId'];
      console.log('User ID from query params:', this.userId); // For debugging
    });
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
      assessmentYear: [''],
      dateOfBirth: ['', Validators.required],
      grossSalary: ['', Validators.required],
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
      aLetOut: [''],
      rentalIncome: [''],
      deductionAt30: [''],
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
      userId: [this.userId],
    });
  }

  onToggleChange(checked: boolean): void {
    this.toggleLabel = checked ? 'ON' : 'OFF';
  }

  // Method to handle form submission
  // Method to handle form submission
  onSubmit(): void {
    if (this.taxCalculationForm.valid) {
      const formData = {
        // userId: 1234, // Assuming a static userId or retrieve dynamically if needed
        // name: this.taxCalculationForm.get('assesseeName').value || '',
        // assessmentYear:
        //   this.taxCalculationForm.get('assessmentYear').value || '',
        // pan: this.taxCalculationForm.get('panNumber').value || '',
        // dob: this.taxCalculationForm.get('dateOfBirth').value || '',
        // grossSalary: this.taxCalculationForm.get('grossSalary').value || 0,
        // otherSourceIncome:
        //   this.taxCalculationForm.get('incomeFromOtherSources').value || 0,
        // oldRegimeSalaryExemption:
        //   this.taxCalculationForm.get('exemptionAllowedOldregime').value || 0,
        // newRegimeSalaryExemption:
        //   this.taxCalculationForm.get('exemptionAllowedNewregime').value || 0,
        // ltcg112A: this.taxCalculationForm.get('ltcg112A').value || 0,
        // ltcg112Other: this.taxCalculationForm.get('ltcg112Other').value || 0,
        // stcg111A: this.taxCalculationForm.get('stcg111A').value || 0,
        // stcgAppRate: this.taxCalculationForm.get('stcgAppRate').value || 0,
        // businessIncome:
        //   this.taxCalculationForm.get('nonSpeculative').value || 0,
        // speculativeBusinessIncome:
        //   this.taxCalculationForm.get('speculative').value || 0,
        // rentalIncome: this.taxCalculationForm.get('rentalIncome').value || 0,
        // homeLoanInterest:
        //   this.taxCalculationForm.get('homeLoanInterest').value || 0,
        // sopHomeLoanInterest:
        //   this.taxCalculationForm.get('selfOccupaid').value || 0,
        // us80c: this.taxCalculationForm.get('eightyCDD1').value || 0,
        // us80dSelf: this.taxCalculationForm.get('selfAndFamily').value || 0,
        // us80ccd1b: this.taxCalculationForm.get('eighty1B').value || 0,
        // us80ccd2: this.taxCalculationForm.get('eightyCCD2').value || 0,
        // us80ttattb: this.taxCalculationForm.get('houseProperty').value || 0,
        // pylNonSpeculativeIncome:
        //   this.taxCalculationForm.get('businessNonSpeculative').value || 0,
        // pylSpeculativeIncome:
        //   this.taxCalculationForm.get('BusinessSpeculative').value || 0,
        // pylLtcgl12A: this.taxCalculationForm.get('LTCG112A').value || 0,
        // pylStcg111A: this.taxCalculationForm.get('STCG111A').value || 0,
        // pylLtcgOtherThan112A:
        //   this.taxCalculationForm.get('LTCGother112A').value || 0,
        // pylStcgOtherThan111A:
        //   this.taxCalculationForm.get('STCGotherthan111A').value || 0,
        // tdsTcs: this.taxCalculationForm.get('TDS').value || 0,
        // advanceTaxPaid:
        //   this.taxCalculationForm.get('AdvanceTaxIfAny').value || 0,
        // anyOther: this.taxCalculationForm.get('anyOther').value || 0,
        userId: this.userId,
        name: this.taxCalculationForm.get('assesseeName').value || '',
        assessmentYear: '2025-2026', // Make sure this is a valid year
        pan: this.taxCalculationForm.get('panNumber').value || '',
        dob: this.taxCalculationForm.get('dateOfBirth').value || '', // Ensure correct date format if needed
        grossSalary: this.taxCalculationForm.get('grossSalary').value || 0,
        otherSourceIncome:
          this.taxCalculationForm.get('incomeFromOtherSources').value || 0,
        oldRegimeSalaryExemption:
          this.taxCalculationForm.get('exemptionAllowedOldregime').value || 0,
        newRegimeSalaryExemption:
          this.taxCalculationForm.get('exemptionAllowedNewregime').value || 0,
        ltcg112A: this.taxCalculationForm.get('ltcg112A').value || 0,
        ltcg112Other: this.taxCalculationForm.get('ltcg112Other').value || 0,
        stcg111A: this.taxCalculationForm.get('stcg111A').value || 0,
        stcgAppRate: this.taxCalculationForm.get('stcgAppRate').value || 0,
        businessIncome:
          this.taxCalculationForm.get('nonSpeculative').value || 0,
        speculativeBusinessIncome:
          this.taxCalculationForm.get('speculative').value || 0,
        rentalIncome: this.taxCalculationForm.get('rentalIncome').value || 0,
        homeLoanInterest:
          this.taxCalculationForm.get('homeLoanInterest').value || 0,
        sopHomeLoanInterest:
          this.taxCalculationForm.get('selfOccupaid').value || 0,
        us80c: this.taxCalculationForm.get('eightyCDD1').value || 0,
        us80dSelf: this.taxCalculationForm.get('selfAndFamily').value || 0,
        us80ccd1b: this.taxCalculationForm.get('eighty1B').value || 0,
        us80ccd2: this.taxCalculationForm.get('eightyCCD2').value || 0,
        us80ttattb: this.taxCalculationForm.get('houseProperty').value || 0,
        pylNonSpeculativeIncome:
          this.taxCalculationForm.get('businessNonSpeculative').value || 0,
        pylSpeculativeIncome:
          this.taxCalculationForm.get('BusinessSpeculative').value || 0,
        pylLtcgl12A: this.taxCalculationForm.get('LTCG112A').value || 0,
        pylStcg111A: this.taxCalculationForm.get('STCG111A').value || 0,
        pylLtcgOtherThan112A:
          this.taxCalculationForm.get('LTCGother112A').value || 0,
        pylStcgOtherThan111A:
          this.taxCalculationForm.get('STCGotherthan111A').value || 0,
        tdsTcs: this.taxCalculationForm.get('TDS').value || 0,
        advanceTaxPaid:
          this.taxCalculationForm.get('AdvanceTaxIfAny').value || 0,
        anyOther: this.taxCalculationForm.get('anyOther').value || 0,
      };

      console.log('Submitted Data: ', formData);

      // Call API
      this.http
        .post(
          'https://uat-api.taxbuddy.com/itr/calculate/advance-tax',
          formData,
          {
            headers: { 'Content-Type': 'application/json' },
          }
        )
        .subscribe(
          (response) => {
            console.log('API Response: ', response);
            // Handle successful response
          },
          (error) => {
            console.error('API Error: ', error);
            // Handle error
          }
        );
    } else {
      console.log('Form is invalid');
    }
  }
}
