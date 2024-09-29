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

@Component({
  selector: 'app-tax-calculation',
  templateUrl: './tax-calculation.component.html',
  styleUrls: ['./tax-calculation.component.scss'],
})
export class TaxCalculationComponent implements OnInit {
  taxCalculationForm: FormGroup;
  toggleLabel: string = 'OFF';
  apiUrl = 'https://uat-api.taxbuddy.com/itr/calculate/advance-tax';

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
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
      assessmentYear: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      grossSalary: ['', Validators.required],
      incomeFromOtherSources: ['', Validators.required],
      exemptionAllowedOldregime: ['', Validators.required],
      exemptionAllowedNewregime: ['', Validators.required],
      toggleOption: [false, Validators.required], // Default is OFF
      ltcg112A: ['', Validators.required],
      ltcg112Other: ['', Validators.required],
      stcg111A: ['', Validators.required],
      stcgAppRate: ['', Validators.required],
      nonSpeculative: ['', Validators.required],
      speculative: ['', Validators.required],
      aLetOut: ['', Validators.required],
      rentalIncome: ['', Validators.required],
      deductionAt30: ['', Validators.required],
      homeLoanInterest: ['', Validators.required],
      selfOccupaid: ['', Validators.required],
      eightyCDD1: ['', Validators.required],
      selfAndFamily: ['', Validators.required],
      eighty1B: ['', Validators.required],
      eightyCCD2: ['', Validators.required],
      houseProperty: ['', Validators.required],
      businessNonSpeculative: ['', Validators.required],
      BusinessSpeculative: ['', Validators.required],
      LTCG112A: ['', Validators.required],
      STCG111A: ['', Validators.required],
      LTCGother112A: ['', Validators.required],
      STCGotherthan111A: ['', Validators.required],
      TDS: ['', Validators.required],
      AdvanceTaxIfAny: ['', Validators.required],
      anyOther: ['', Validators.required],
    });
  }

  onToggleChange(checked: boolean): void {
    this.toggleLabel = checked ? 'ON' : 'OFF';
  }

  // Method to handle form submission
  onSubmit(): void {
    if (this.taxCalculationForm.valid) {
      const formData = {
        name: this.taxCalculationForm.get('assesseeName').value,
        assessmentYear: this.taxCalculationForm.get('assessmentYear').value,
        pan: this.taxCalculationForm.get('panNumber').value,
        dob: this.taxCalculationForm.get('dateOfBirth').value,
        grossSalary: this.taxCalculationForm.get('grossSalary').value,
        otherSourceIncome: this.taxCalculationForm.get('incomeFromOtherSources')
          .value,
        oldRegimeSalaryExemption: this.taxCalculationForm.get(
          'exemptionAllowedOldregime'
        ).value,
        newRegimeSalaryExemption: this.taxCalculationForm.get(
          'exemptionAllowedNewregime'
        ).value,
        ltcg112A: this.taxCalculationForm.get('ltcg112A').value,
        ltcg112Other: this.taxCalculationForm.get('ltcg112Other').value,
        stcg111A: this.taxCalculationForm.get('stcg111A').value,
        stcgAppRate: this.taxCalculationForm.get('stcgAppRate').value,
        nonSpeculative: this.taxCalculationForm.get('nonSpeculative').value,
        speculative: this.taxCalculationForm.get('speculative').value,
        aLetOut: this.taxCalculationForm.get('aLetOut').value,
        rentalIncome: this.taxCalculationForm.get('rentalIncome').value,
        deductionAt30: this.taxCalculationForm.get('deductionAt30').value,
        homeLoanInterest: this.taxCalculationForm.get('homeLoanInterest').value,
        selfOccupaid: this.taxCalculationForm.get('selfOccupaid').value,
        eightyCDD1: this.taxCalculationForm.get('eightyCDD1').value,
        selfAndFamily: this.taxCalculationForm.get('selfAndFamily').value,
        eighty1B: this.taxCalculationForm.get('eighty1B').value,
        eightyCCD2: this.taxCalculationForm.get('eighty1B').value,
        houseProperty: this.taxCalculationForm.get('houseProperty').value,
        businessNonSpeculative: this.taxCalculationForm.get(
          'businessNonSpeculative'
        ).value,
        BusinessSpeculative: this.taxCalculationForm.get('BusinessSpeculative')
          .value,
        LTCG112A: this.taxCalculationForm.get('LTCG112A').value,
        STCG111A: this.taxCalculationForm.get('STCG111A').value,
        LTCGother112A: this.taxCalculationForm.get('LTCGother112A').value,
        STCGotherthan111A:
          this.taxCalculationForm.get('STCGotherthan111A').value,
        TCS: this.taxCalculationForm.get('TDS').value,
        AdvanceTaxIfAny: this.taxCalculationForm.get('AdvanceTaxIfAny').value,
        anyOther: this.taxCalculationForm.get('anyOther').value,
      };
      console.log('Submitted Data: ', formData);
      // Call API
      this.http
        .post(this.apiUrl, formData, {
          headers: { 'Content-Type': 'application/json' },
        })
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
