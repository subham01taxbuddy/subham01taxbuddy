import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TaxDataService } from '../../../../app/tax-data.service';
import { UserTaxDataService } from '../../../services/user-tax-data.service';

// Define an interface for the expected tax data structure
interface TaxData {
  name: string;
  pan: string;
  assessmentYear: string;
  dob: string;
  oldRegime: {
    salaryIncome?: number;
    housePropertyIncome?: number;
    capitalGain?: number;
    businessIncome?: number;
    otherSourceIncome?: number;
  };
  newRegime: any; // You can further define this structure as needed
  beneficialRegime?: string;
}

@Component({
  selector: 'app-tax-calculation-details',
  templateUrl: './tax-calculation-details.component.html',
  styleUrls: ['./tax-calculation-details.component.scss'],
})
export class TaxCalculationDetailsComponent implements OnInit {
  assesseeName: string | undefined;
  panNumber: string | undefined;
  assessmentYear: string | undefined;
  dateOfBirth: string | undefined;
  oldRegime: any = {};
  newRegime: any = {};
  beneficialRegime: string | undefined;
  totalIncome: number = 0; // Total income to compute

  constructor(
    private router: Router,
    private taxDataService: TaxDataService,
    private userTaxDataService: UserTaxDataService
  ) {}

  ngOnInit(): void {
    const data = this.taxDataService.getTaxData();
    const UserData = this.userTaxDataService.getUserTaxData();
    // const taxData = this.taxDataService.getUserTaxDetails();
    // Access the data passed from the previous component
    const navigation = this.router.getCurrentNavigation();
    // const data = navigation?.extras.state?.['taxData'] as TaxData; // Use bracket notation and type assertion

    console.log('UserData:', UserData);
    // console.log('Tax Data : ', taxData);

    // Log the data to the console
    console.log('Tax Data received:', data);

    if (data) {
      this.assesseeName = UserData.name;
      this.panNumber = UserData.pan;
      this.assessmentYear = UserData.assessmentYear;
      this.dateOfBirth = UserData.dob;

      this.oldRegime = data.oldRegime;
      this.newRegime = data.newRegime;
      this.beneficialRegime = data.beneficialRegime;

      // Calculate total income based on provided data
      this.calculateTotalIncome();
    }
  }

  // Method to calculate total income based on available data
  private calculateTotalIncome(): void {
    this.totalIncome =
      (this.oldRegime.salaryIncome || 0) +
      (this.oldRegime.housePropertyIncome || 0) +
      (this.oldRegime.capitalGain || 0) +
      (this.oldRegime.businessIncome || 0) +
      (this.oldRegime.otherSourceIncome || 0);
  }
}
