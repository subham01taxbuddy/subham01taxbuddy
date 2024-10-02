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
      // assessmentYear: [''], // You can also make this dynamic
      assessmentYear: [{ value: '2024-2025', disabled: true }],
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
    });
    // Set the value and disable the form control separately
    // this.taxCalculationForm.controls['assessmentYear'].setValue('2024-2025');
    // this.taxCalculationForm.controls['assessmentYear'].disable();
  }

  ngOnInit(): void {
    // Set the assessment year when the component loads
    this.taxCalculationForm.controls['assessmentYear'].setValue('2024-2025');
    this.taxCalculationForm.controls['assessmentYear'].disable();

    // Retrieve userId from query parameters
    this.activatedRoute.queryParams.subscribe((params) => {
      this.userId = params['userId'];
      console.log('User ID from query params:', this.userId);
      // Patch the userId to the form
      this.taxCalculationForm.patchValue({ userId: this.userId });

      // If you want to patch additional data from params into the form
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
        AdvanceTaxIfAny: params['advanceTaxPaid'], // Mapping to correct field
        incomeFromOtherSources: params['otherSourceIncome'],
        nonSpeculative: params['pylNonSpeculativeIncome'],
        speculative: params['pylSpeculativeIncome'],
        houseProperty: params['pylHp'],
        businessNonSpeculative: params['pylLtcgl12A'],
        businessSpeculative: params['pylStcg111A'],
        LTCG112A: params['pylLtcgOtherThan112A'],
        STCG111A: params['pylStcgOtherThan111A'],
        TDS: params['tdsTcs'],
      });
      console.log(
        'Assessment Year from query params:',
        params['assessmentYear']
      );
    });
  }

  // Handle toggle change for the form
  onToggleChange(checked: boolean): void {
    this.toggleLabel = checked ? 'ON' : 'OFF';
  }

  // Handle form submission
  onSubmit(): void {
    console.log(this.taxCalculationForm.get('assessmentYear')?.value);

    // Define an array of fields to check
    const fieldsToCheck = [
      'grossSalary',
      'incomeFromOtherSources',
      'exemptionAllowedOldregime',
      'exemptionAllowedNewregime',
      'ltcg112A',
      'ltcg112Other',
      'stcg111A',
      'stcgAppRate',
      'nonSpeculative',
      'speculative',
    ];

    // Check if any of the specified fields are either empty or 0
    const hasValidValues = fieldsToCheck.some((field) => {
      const value = this.taxCalculationForm.get(field)?.value;
      return value !== '' && value !== 0;
    });

    if (this.taxCalculationForm.valid && hasValidValues) {
      const formData = {
        userId: this.userId,
        name: this.taxCalculationForm.get('assesseeName')?.value || '',
        assessmentYear: '2024-2025',
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
              // Handle successful response and store data
              this.handleApiResponse(response.data); // Pass the data to a method to handle it

              console.log('API Response before navigating:', response);

              // Navigate to the TaxCalculationDetailsComponent
              this.router.navigate(
                ['/pages/user-management/tax-calculation-details']
                // {
                //   state: { taxData: formData },
                // }
              );
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

  // Method to handle API response data
  private handleApiResponse(data: any): void {
    // You can create properties in your component to hold this data
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

    // Store these values in component properties to display in the template
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
