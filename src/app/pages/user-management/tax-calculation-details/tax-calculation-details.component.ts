import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TaxDataService } from '../../../../app/tax-data.service';
import { UserTaxDataService } from '../../../services/user-tax-data.service';
import { HttpClient } from '@angular/common/http';
import { saveAs } from 'file-saver';

interface TaxData {
  name: string;
  pan: string;
  assessmentYear: string;
  dob: string;
  oldRegime: any;
  newRegime: any;
  beneficialRegime?: string;
  advanceTaxQuarter1?: any;
  advanceTaxQuarter2?: any;
  advanceTaxQuarter3?: any;
  advanceTaxQuarter4?: any;
  totalTaxLiabilty?: number;
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
  totalIncome: number = 0;

  constructor(
    private router: Router,
    private taxDataService: TaxDataService,
    private userTaxDataService: UserTaxDataService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const data = this.taxDataService.getTaxData();
    const UserData = this.userTaxDataService.getUserTaxData();

    console.log('UserData:', UserData);
    console.log('Tax Data received:', data);

    if (data) {
      this.assesseeName = UserData.name;
      this.panNumber = UserData.pan;
      this.assessmentYear = UserData.assessmentYear;
      this.dateOfBirth = UserData.dob;

      this.oldRegime = data.oldRegime;
      this.newRegime = data.newRegime;
      this.beneficialRegime = data.beneficialRegime;

      this.calculateTotalIncome();
    }
  }

  private calculateTotalIncome(): void {
    this.totalIncome =
      (this.oldRegime.salaryIncome || 0) +
      (this.oldRegime.housePropertyIncome || 0) +
      (this.oldRegime.capitalGain || 0) +
      (this.oldRegime.businessIncome || 0) +
      (this.oldRegime.otherSourceIncome || 0);
  }

  downloadPDF(): void {
    const userData = this.userTaxDataService.getUserTaxData();
    const taxData = this.taxDataService.getTaxData();

    const payload = {
      name: userData.name,
      pan: userData.pan,
      assessmentYear: userData.assessmentYear,
      dob: userData.dob,
      advanceTaxQuarter1: {
        rate: taxData.advanceTaxQuarter1.rate,
        installmentAmount: taxData.advanceTaxQuarter1.installmentAmount,
        installment: taxData.advanceTaxQuarter1.installment,
        cumulativeTaxLiability:
          taxData.advanceTaxQuarter1.cumulativeTaxLiability,
      },
      oldRegime: taxData.oldRegime,
      totalTaxLiabilty: taxData.totalTaxLiabilty,
      beneficialRegime: taxData.beneficialRegime,
      newRegime: taxData.newRegime,
      advanceTaxQuarter2: {
        rate: taxData.advanceTaxQuarter2.rate,
        installmentAmount: taxData.advanceTaxQuarter2.installmentAmount,
        installment: taxData.advanceTaxQuarter2.installment,
        cumulativeTaxLiability:
          taxData.advanceTaxQuarter2.cumulativeTaxLiability,
      },
      advanceTaxQuarter3: {
        rate: taxData.advanceTaxQuarter3.rate,
        installmentAmount: taxData.advanceTaxQuarter3.installmentAmount,
        installment: taxData.advanceTaxQuarter3.installment,
        cumulativeTaxLiability:
          taxData.advanceTaxQuarter3.cumulativeTaxLiability,
      },
      advanceTaxQuarter4: {
        rate: taxData.advanceTaxQuarter4.rate,
        installmentAmount: taxData.advanceTaxQuarter4.installmentAmount,
        installment: taxData.advanceTaxQuarter4.installment,
        cumulativeTaxLiability:
          taxData.advanceTaxQuarter4.cumulativeTaxLiability,
      },
    };

    this.http
      .post(
        'https://uat-api.taxbuddy.com/itr/api/download/old-vs-new/pdf',
        payload,
        {
          responseType: 'blob',
        }
      )
      .subscribe(
        (response) => {
          const blob = new Blob([response], { type: 'application/pdf' });
          const fileName = 'tax_report.pdf';
          saveAs(blob, fileName);
        },
        (error) => {
          console.error('Error downloading PDF:', error);
        }
      );
  }
}
