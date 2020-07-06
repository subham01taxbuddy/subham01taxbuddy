import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-customer-profile',
  templateUrl: './customer-profile.component.html',
  styleUrls: ['./customer-profile.component.css']
})
export class CustomerProfileComponent implements OnInit {
  loading: boolean = false;
  imageLoader: boolean = false;
  gstDetails: FormGroup;
  constructor(public fb: FormBuilder) { }

  ngOnInit() {
    this.gstDetails = this.fb.group({
      gstPortalUserName: [''],
      gstPortalPassword: [''],
      gstinNumber: ['', [/* Validators.pattern(AppConstants.GSTNRegex), */ Validators.required]],
      tradeName: ['', Validators.required],
      legalName: [''],
      gstinRegisteredMobileNumber: ['', [Validators.maxLength(10),/*  Validators.pattern(AppConstants.mobileNumberRegex) */]],
      salesInvoicePrefix: [''],
      gstr1Type: ['', [Validators.required]],
      gstType: ['', [Validators.required]],
      businessAddress: this.fb.group({
        address: [''],
        pincode: ['', [Validators.maxLength(6),/*  Validators.pattern(AppConstants.PINCode), */ Validators.required]],
        state: ['']
      }),
      bankInformation: this.fb.group({
        bankName: [''],
        accountBranch: [''],
        accountNumber: [''],
        ifscCode: ['', [Validators.maxLength(11), /* Validators.pattern(AppConstants.IFSCRegex) */]]
      })
    })
  }

}
