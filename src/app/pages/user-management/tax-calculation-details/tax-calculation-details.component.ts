import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TaxDataService } from '../../../../app/tax-data.service';
import { UserTaxDataService } from '../../../services/user-tax-data.service';
import { HttpClient } from '@angular/common/http';
import { saveAs } from 'file-saver';
import { Location } from '@angular/common';
import {ItrMsService} from "../../../services/itr-ms.service";

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
  advanceTaxQuarter1: any = {};
  advanceTaxQuarter2: any = {};
  advanceTaxQuarter3: any = {};
  advanceTaxQuarter4: any = {};
  totalTaxLiabilty: string | undefined;

  constructor(
    private router: Router,
    private taxDataService: TaxDataService,
    private userTaxDataService: UserTaxDataService,
    private http: HttpClient,
    private location: Location,
    private itrMsService: ItrMsService
  ) {}

  // Function to go back to the previous page
  goBack(): void {
    this.location.back();
  }

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
      this.totalTaxLiabilty = data.totalTaxLiabilty;

      this.advanceTaxQuarter1 = data.advanceTaxQuarter1;
      this.advanceTaxQuarter2 = data.advanceTaxQuarter2;
      this.advanceTaxQuarter3 = data.advanceTaxQuarter3;
      this.advanceTaxQuarter4 = data.advanceTaxQuarter4;

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

    const payload = {...userData, ...taxData};
    
    const param = '/api/download/old-vs-new/pdf';
    this.itrMsService.downloadFileAsPost(param, 'application/pdf', payload).subscribe(
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
