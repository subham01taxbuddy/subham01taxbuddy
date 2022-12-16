import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppConstants } from 'src/app/modules/shared/constants';
import { BusinessDescription, FixedAssetsDetails, professionalIncome } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';

@Component({
  selector: 'app-add-balance-sheet',
  templateUrl: './add-balance-sheet.component.html',
  styleUrls: ['./add-balance-sheet.component.scss']
})
export class AddBalanceSheetComponent implements OnInit {

  natureOfBusinessDropdownAll: any;
  natureOfProfessionDropdown: any;
  loading = false;
  professionForm: FormGroup;
  depreciationForm: FormGroup;

  assetTypeList = [
    { key: 'LaptopComputer', value: 'Laptop & Computers' },
    { key: 'PlantAndMachinery', value: 'Plant & Machinery (Mobile phones & others, etc.)' },
    { key: 'FurnitureAndFittings', value: 'Furniture & Fittings' },
    { key: 'IntangibleAssets', value: 'Intangible Assets' },

  ]
  constructor(
    public itrMsService: ItrMsService,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AddBalanceSheetComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.getMastersData();
    this.initProfessionForm(this.data.data);
    this.initDepreciationForm(this.data.data);
  }

  initProfessionForm(obj?: BusinessDescription) {
    this.professionForm = this.formBuilder.group({
      id: [obj?.id || null],
      natureOfBusiness: [obj?.natureOfBusiness || null, Validators.required],
      tradeName: [obj?.tradeName || null, [Validators.required, Validators.pattern(AppConstants.charRegex)]],
      businessDescription: [obj?.businessDescription || null, Validators.required],
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
    const param = '/itrmaster';
    this.itrMsService.getMethod(param).subscribe((result: any) => {
      this.natureOfBusinessDropdownAll = result.natureOfBusiness;
      this.natureOfProfessionDropdown = this.natureOfBusinessDropdownAll.filter((item: any) => item.section === '44ADA');
      sessionStorage.setItem('MASTER', JSON.stringify(result));
    }, error => {
    });
  }

  saveBusinessDetails() {
    this.dialogRef.close(this.professionForm.value)
  }

  saveDepreciationDetails() {
    this.dialogRef.close(this.depreciationForm.value)
  }

  cancel() {
    this.dialogRef.close();
  }
}
