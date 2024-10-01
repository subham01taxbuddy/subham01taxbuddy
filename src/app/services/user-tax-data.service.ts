import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root', // This makes the service available globally
})
export class UserTaxDataService {
  private userTaxData: any; // Variable to hold the user tax data

  // Method to set the user tax data
  setUserTaxData(data: any): void {
    this.userTaxData = data;
  }

  // Method to get the user tax data
  getUserTaxData(): any {
    return this.userTaxData;
  }

  // Optional: Clear the user tax data if needed
  clearUserTaxData(): void {
    this.userTaxData = null;
  }
}
