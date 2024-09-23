import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ThirdPartyService } from 'src/app/services/third-party.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { AppConstants } from 'src/app/modules/shared/constants';
@Component({
  selector: 'app-profile-dialog',
  templateUrl: './profile-dialog.component.html',
  styleUrls: ['./profile-dialog.component.css']
})
export class ProfileDialogComponent implements OnInit {

  bankForm: UntypedFormGroup;
  addressForm: UntypedFormGroup;
  addressTypeData: any = [{ label: 'Home', value: 'HOME' }, { label: 'Business', value: 'BUSINESS' }];
  state_list: any = [{
    "id": "5b4599c9c15a76370a3424c2",
    "stateId": "1",
    "countryCode": "91",
    "stateName": "Andaman and Nicobar Islands",
    "stateCode": "01",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424c3",
    "stateId": "2",
    "countryCode": "91",
    "stateName": "Andhra Pradesh",
    "stateCode": "02",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424c4",
    "stateId": "3",
    "countryCode": "91",
    "stateName": "Arunachal Pradesh",
    "stateCode": "03",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424c5",
    "stateId": "4",
    "countryCode": "91",
    "stateName": "Assam",
    "stateCode": "04",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424c6",
    "stateId": "5",
    "countryCode": "91",
    "stateName": "Bihar",
    "stateCode": "05",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424c7",
    "stateId": "6",
    "countryCode": "91",
    "stateName": "Chandigarh",
    "stateCode": "06",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424c8",
    "stateId": "7",
    "countryCode": "91",
    "stateName": "Chattisgarh",
    "stateCode": "33",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424c9",
    "stateId": "8",
    "countryCode": "91",
    "stateName": "Dadra Nagar and Haveli",
    "stateCode": "07",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424ca",
    "stateId": "9",
    "countryCode": "91",
    "stateName": "Daman and Diu",
    "stateCode": "08",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424cb",
    "stateId": "10",
    "countryCode": "91",
    "stateName": "Delhi",
    "stateCode": "09",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424cc",
    "stateId": "11",
    "countryCode": "91",
    "stateName": "Goa",
    "stateCode": "10",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424cd",
    "stateId": "12",
    "countryCode": "91",
    "stateName": "Gujarat",
    "stateCode": "11",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424ce",
    "stateId": "13",
    "countryCode": "91",
    "stateName": "Haryana",
    "stateCode": "12",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424cf",
    "stateId": "14",
    "countryCode": "91",
    "stateName": "Himachal Pradesh",
    "stateCode": "13",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424d0",
    "stateId": "15",
    "countryCode": "91",
    "stateName": "Jammu and Kashmir",
    "stateCode": "14",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424d1",
    "stateId": "16",
    "countryCode": "91",
    "stateName": "Jharkhand",
    "stateCode": "35",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424d2",
    "stateId": "17",
    "countryCode": "91",
    "stateName": "Karnataka",
    "stateCode": "15",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424d3",
    "stateId": "18",
    "countryCode": "91",
    "stateName": "Kerala",
    "stateCode": "16",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424d4",
    "stateId": "19",
    "countryCode": "91",
    "stateName": "Lakshadweep",
    "stateCode": "17",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424d5",
    "stateId": "20",
    "countryCode": "91",
    "stateName": "Madhya Pradesh",
    "stateCode": "18",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424d6",
    "stateId": "21",
    "countryCode": "91",
    "stateName": "Maharashtra",
    "stateCode": "19",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424d7",
    "stateId": "22",
    "countryCode": "91",
    "stateName": "Manipur",
    "stateCode": "20",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424d8",
    "stateId": "23",
    "countryCode": "91",
    "stateName": "Meghalaya",
    "stateCode": "21",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424d9",
    "stateId": "24",
    "countryCode": "91",
    "stateName": "Mizoram",
    "stateCode": "22",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424da",
    "stateId": "25",
    "countryCode": "91",
    "stateName": "Nagaland",
    "stateCode": "23",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424db",
    "stateId": "26",
    "countryCode": "91",
    "stateName": "Orissa",
    "stateCode": "24",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424dc",
    "stateId": "27",
    "countryCode": "91",
    "stateName": "Pondicherry",
    "stateCode": "25",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424dd",
    "stateId": "28",
    "countryCode": "91",
    "stateName": "Punjab",
    "stateCode": "26",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424de",
    "stateId": "29",
    "countryCode": "91",
    "stateName": "Rajasthan",
    "stateCode": "27",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424df",
    "stateId": "30",
    "countryCode": "91",
    "stateName": "Sikkim",
    "stateCode": "28",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424e0",
    "stateId": "31",
    "countryCode": "91",
    "stateName": "Tamil Nadu",
    "stateCode": "29",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424e1",
    "stateId": "32",
    "countryCode": "91",
    "stateName": "Telangana",
    "stateCode": "36",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424e2",
    "stateId": "33",
    "countryCode": "91",
    "stateName": "Tripura",
    "stateCode": "30",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424e3",
    "stateId": "34",
    "countryCode": "91",
    "stateName": "Uttar Pradesh",
    "stateCode": "31",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424e4",
    "stateId": "35",
    "countryCode": "91",
    "stateName": "Uttarakhand",
    "stateCode": "34",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424e5",
    "stateId": "36",
    "countryCode": "91",
    "stateName": "West Bengal",
    "stateCode": "32",
    "status": true
  }, {
    "id": "5dc24c9779332f0ddccb7aa4",
    "stateId": "37",
    "countryCode": "91",
    "stateName": "Ladakh",
    "stateCode": "37",
    "status": true
  }]
  constructor(
    public dialogRef: MatDialogRef<ProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmModel,
    private fb: UntypedFormBuilder,
    private thirdPartyService: ThirdPartyService,
    private _toastMessageService: ToastMessageService,
    private userService: UserMsService,
  ) { }

  ngOnInit() {
    this.bankForm = this.fb.group({
      ifsCode: ['', [Validators.maxLength(11), Validators.pattern(AppConstants.IFSCRegex)]],
      countryName: null,
      accountNumber: [''],
      bankType: '',
      name: [''],
      hasRefund: [false],
      swiftcode: null
    })

    this.addressForm = this.fb.group({
      id: [''],
      state: [''],
      city: [''],
      country: ['INDIA'],
      premisesName: [''],
      pinCode: [''],
      addressType: [''],
      flatNo: [''],
      road: null,
      area: ['']
    })

    console.log('this.data -> ', this.data);
    if (this.data.submitBtn === "Save" && this.data.mode === "Address") {
      this.addressForm.patchValue(this.data.userObject)
      console.log('this.addressForm.value -> ', this.addressForm.value)
    }
  }

  getCityData(pinCode) {
    if (pinCode.valid) {
      const param = '/pincode/' + pinCode.value;
      this.userService.getMethod(param).subscribe({
        next: (result: any) => {
          this.addressForm.controls['country'].setValue('INDIA');   //91
          this.addressForm.controls['city'].setValue(result.taluka);
          this.addressForm.controls['state'].setValue(result.stateCode);  //stateCode
        },
        error: (error) => {
          if (error.status === 404) {
            this._toastMessageService.alert('error', 'City not found');
          } else {
            this._toastMessageService.alert('error', 'An unexpected error occurred');
          }
        }
      });
    }
  }

  getBankInfoFromIfsc(ifscCode) {
    console.log("ifscCode: ", ifscCode)
    if (ifscCode.valid) {
      let param = '/' + ifscCode.value;
      this.thirdPartyService.getBankDetailByIFSCCode(param).subscribe({
        next: (res: any) => {
          console.log("Bank details by IFSC:", res);
          const bankName = res.BANK ? res.BANK : "";
          this.bankForm.controls['name'].setValue(bankName);
        },
        error: (err) => {
          this._toastMessageService.alert("error", "Invalid IFSC code entered");
          this.bankForm.controls['name'].setValue("");
        }
      });
    }

  }

  addBankInfo() {
    if (this.bankForm.valid) {
      let body = {
        from: this.data.mode,
        formValue: this.bankForm.value
      }
      this.dialogRef.close({ event: 'close', data: body })
    }
  }

  addAddressInfo() {
    console.log('this.addressForm -> ', this.addressForm.value)
    console.log('state -> ', this.addressForm.value.state)
    if (this.addressForm.valid) {
      if (this.data.submitBtn === "Add") {
        console.log('this.addressForm -> ', this.addressForm.value)
        let randomId = Math.floor(100000 + Math.random() * 900000);
        this.addressForm.controls['id'].setValue(randomId.toString());
        let body = {
          from: this.data.mode,
          formValue: this.addressForm.value,
          action: this.data.submitBtn,
          index: ''
        }
        console.log('Add body :-> ', body)
        this.dialogRef.close({ event: 'close', data: body })
      }
      else if (this.data.submitBtn === "Save") {
        console.log('this.addressForm -> ', this.addressForm.value)
        let body = {
          from: this.data.mode,
          formValue: this.addressForm.value,
          action: this.data.submitBtn,
          index: this.data.editIndex
        }
        console.log('Edit body :-> ', body)
        this.dialogRef.close({ event: 'close', data: body })
      }

    }

  }

}

export interface ConfirmModel {
  title: string;
  submitBtn: string;
  editIndex: any;
  userObject: any;
  mode: string;
  callerObj: any;
}
