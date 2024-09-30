import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root', // This allows the service to be available application-wide
})
export class TaxDataService {
  private taxData: any; // Variable to hold the tax data

  // Method to set the tax data
  setTaxData(data: any): void {
    this.taxData = data;
  }

  setUserTaxDetails(data: any): void {
    this.taxData = data;
  }

  // Method to get the tax data
  getTaxData(): any {
    return this.taxData;
  }

  getUserTaxDetails(): any {
    return this.taxData;
  }
}
