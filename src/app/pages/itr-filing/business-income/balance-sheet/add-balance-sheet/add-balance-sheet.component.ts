import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppConstants } from 'src/app/modules/shared/constants';
import { BusinessDescription, FixedAssetsDetails } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-add-balance-sheet',
  templateUrl: './add-balance-sheet.component.html',
  styleUrls: ['./add-balance-sheet.component.scss']
})
export class AddBalanceSheetComponent implements OnInit {

  natureOfBusinessDropdownAll: any;
  natureOfProfessionDropdown: any;
  loading = false;
  balanceGridForm: FormGroup;
  depreciationForm: FormGroup;

  assetTypeList = [
    { key: 'LaptopComputer', value: 'Laptop & Computers' },
    { key: 'PlantAndMachinery', value: 'Plant & Machinery (Mobile phones & others, etc.)' },
    { key: 'FurnitureAndFittings', value: 'Furniture & Fittings' },
    { key: 'IntangibleAssets', value: 'Intangible Assets' },
  ]
  depreciationRateList = [
    { key: 'FULL', value: 'Full Rate' },
    { key: 'HALF', value: 'Half Rate' },
  ]
  constructor(
    public itrMsService: ItrMsService,
    private formBuilder: FormBuilder,
    public toastMsgService: ToastMessageService,
    public utilsService: UtilsService,
    public dialogRef: MatDialogRef<AddBalanceSheetComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    let natureOfBusiness = JSON.parse(sessionStorage.getItem('NATURE_OF_BUSINESS'));
    if (natureOfBusiness) {
      this.natureOfBusinessDropdownAll = natureOfBusiness;
      this.data?.natureList?.forEach(item => {
        this.natureOfBusinessDropdownAll.forEach(element => {
          if (item.natureOfBusiness.includes(element.label) && this.data.data.natureOfBusiness != element.label) {
            element.disabled = true;
          }
        });
      });
    } else {
      this.getMastersData();
    }
    this.initBalanceGridForm(this.data.data);
    this.initDepreciationForm(this.data.data);
  }

  initBalanceGridForm(obj?: BusinessDescription) {
    this.balanceGridForm = this.formBuilder.group({
      id: [obj?.id || null],
      natureOfBusiness: [obj?.natureOfBusiness || null, Validators.required],
      tradeName: [obj?.tradeName || null, [Validators.required]],
      businessDescription: [obj?.businessDescription || null, Validators.pattern(AppConstants.charRegex)],
    });
  }

  initDepreciationForm(obj?: FixedAssetsDetails) {
    this.depreciationForm = this.formBuilder.group({
      id: [obj?.id || null],
      assetType: [obj?.assetType || null, Validators.required],
      description: [obj?.description || null, Validators.required],
      bookValue: [obj?.bookValue || null, Validators.required],
      depreciationRate: [obj?.depreciationRate || null, Validators.required],
      depreciationAmount: [obj?.depreciationAmount || null],
      fixedAssetClosingAmount: [obj?.fixedAssetClosingAmount || null],
    });
  }

  getMastersData() {
    this.loading = true;
    const param = '/itrmaster';
    this.itrMsService.getMethod(param).subscribe((result: any) => {
      this.natureOfBusinessDropdownAll = result.natureOfBusiness;
      this.loading = false;
      sessionStorage.setItem('NATURE_OF_BUSINESS', JSON.stringify(this.natureOfBusinessDropdownAll));
      // this.natureOfProfessionDropdown = this.natureOfBusinessDropdownAll.filter((item: any) => item.section === '44ADA');
      sessionStorage.setItem('MASTER', JSON.stringify(result));
    }, error => {
      this.loading = false;
      this.utilsService.showSnackBar('Failed to get nature of Business list, please try again.');
      this.utilsService.smoothScrollToTop();
    });
  }

  saveBalanceGridDetails() {
    this.dialogRef.close(this.balanceGridForm.value)
  }

  saveDepreciationDetails() {
    this.loading = true;
    let param = '/calculate/depreciation';
    let request = {
      "assetType": this.depreciationForm.controls['assetType'].value,
      "bookValue": this.depreciationForm.controls['bookValue'].value,
      "depreciationRate": this.depreciationForm.controls['depreciationRate'].value,
    };
    this.itrMsService.postMethod(param, request).subscribe((result: any) => {
      if (result.success) {
        this.depreciationForm.controls['depreciationAmount'].setValue(result.data.depreciationAmount);
        this.depreciationForm.controls['fixedAssetClosingAmount'].setValue(result.data.depreciationPercentageApplied);
        this.toastMsgService.alert("message", "Depreciation amount and depreciation percentage calculated successfully.");
      } else {
        this.loading = false;
        this.toastMsgService.alert("error", "Failed to calculate Depreciation amount and depreciation percentage.");
      }
      this.dialogRef.close(this.depreciationForm.value);
      this.loading = false;
    },
      error => {
        this.loading = false;
        this.toastMsgService.alert("error", "Failed to calculate Depreciation amount and depreciation percentage.");

      })

  }

  cancel() {
    this.dialogRef.close();
  }
}
