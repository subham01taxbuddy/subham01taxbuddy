import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VendorService {

  private vendor: string;
  private paymentMethod :string;

  setVendor(vendor: string) {
    this.vendor = vendor;
  }

  getVendor(): string {
    return this.vendor;
  }

  setPaymentMethod(paymentMethod :string){
    this.paymentMethod = paymentMethod;
  }

  getPaymentMethod() : string{
    return this.paymentMethod;
  }

}
