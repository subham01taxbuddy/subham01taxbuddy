import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { WizardNavigation } from 'src/app/modules/itr-shared/WizardNavigation';
import { AppConstants } from 'src/app/modules/shared/constants';
import {
  ITR_JSON,
  PastYearLosses,
} from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import {
  MatFormField,
  MatFormFieldAppearance,
} from '@angular/material/form-field';

@Component({
  selector: 'app-schedule-cfl',
  templateUrl: './schedule-cfl.component.html',
  styleUrls: ['./schedule-cfl.component.scss'],
})
export class ScheduleCflComponent extends WizardNavigation implements OnInit {
  loading = false;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  pastYearLosses: PastYearLosses[];
  cflForm: UntypedFormGroup;
  today: any;
  scheduleCflArray = [
    {
      hasEdit: '',
      assessmentPastYear: '2016-17',
      dateofFilling: '',
      housePropertyLoss: 0,
      broughtForwordBusinessLoss: 0,
      STCGLoss: 0,
      LTCGLoss: 0,
      speculativeBusinessLoss: 0,
    },
    {
      hasEdit: '',
      assessmentPastYear: '2017-18',
      dateofFilling: '',
      housePropertyLoss: 0,
      broughtForwordBusinessLoss: 0,
      STCGLoss: 0,
      LTCGLoss: 0,
      speculativeBusinessLoss: 0,
    },
    {
      hasEdit: '',
      assessmentPastYear: '2018-19',
      dateofFilling: '',
      housePropertyLoss: 0,
      broughtForwordBusinessLoss: 0,
      STCGLoss: 0,
      LTCGLoss: 0,
      speculativeBusinessLoss: 0,
    },
    {
      hasEdit: '',
      assessmentPastYear: '2019-20',
      dateofFilling: '',
      housePropertyLoss: 0,
      broughtForwordBusinessLoss: 0,
      STCGLoss: 0,
      LTCGLoss: 0,
      speculativeBusinessLoss: 0,
    },
    {
      hasEdit: '',
      assessmentPastYear: '2020-21',
      dateofFilling: '',
      housePropertyLoss: 0,
      broughtForwordBusinessLoss: 0,
      STCGLoss: 0,
      LTCGLoss: 0,
      speculativeBusinessLoss: 0,
    },
    {
      hasEdit: '',
      assessmentPastYear: '2021-22',
      dateofFilling: '',
      housePropertyLoss: 0,
      broughtForwordBusinessLoss: 0,
      STCGLoss: 0,
      LTCGLoss: 0,
      speculativeBusinessLoss: 0,
    },
    {
      hasEdit: '',
      assessmentPastYear: '2022-23',
      dateofFilling: '',
      housePropertyLoss: 0,
      broughtForwordBusinessLoss: 0,
      STCGLoss: 0,
      LTCGLoss: 0,
      speculativeBusinessLoss: 0,
    },
    {
      hasEdit: '',
      assessmentPastYear: '2023-24',
      dateofFilling: '',
      housePropertyLoss: 0,
      broughtForwordBusinessLoss: 0,
      STCGLoss: 0,
      LTCGLoss: 0,
      speculativeBusinessLoss: 0,
    },
  ];
  constructor(
    public fb: UntypedFormBuilder,
    private utilsService: UtilsService,
    private itrMsService: ItrMsService
  ) {
    super();
    this.today = new Date();
  }

  ngOnInit(): void {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    this.cflForm = this.initForm();

    this.pastYearLosses = this.ITR_JSON.pastYearLosses;
    this.pastYearLosses = this.pastYearLosses?.filter((item) =>
        item.assessmentPastYear != '2015-16');
    let latestYear = this.pastYearLosses?.map((item) => item.assessmentPastYear)
        .filter((item:string) => item === '2023-24');
    if (!latestYear || latestYear.length === 0) {
      this.pastYearLosses?.push(
          {
            hasEdit: false,
            dateofFilling: null,
            pastYear: 0,
            assessmentPastYear: '2023-24',
            housePropertyLoss: 0,
            LTCGLoss: 0,
            STCGLoss: 0,
            speculativeBusinessLoss: 0,
            broughtForwordBusinessLoss: 0,
            setOffWithCurrentYearSpeculativeBusinessIncome: 0,
            setOffWithCurrentYearBroughtForwordBusinessIncome: 0,
            setOffWithCurrentYearHPIncome: 0,
            setOffWithCurrentYearSTCGIncome: 0,
            setOffWithCurrentYearLTCGIncome: 0,
            carryForwardAmountBusiness: 0,
            carryForwardAmountSpeculative: 0,
            carryForwardAmountHP: 0,
            carryForwardAmountSTCGIncome: 0,
            carryForwardAmountLTCGIncome: 0,
            totalLoss: 0,
          }
      )
    }
    if (this.pastYearLosses) {
      this.scheduleCflArray.forEach((obj) => {
        let year = this.pastYearLosses?.map((item) => item.assessmentPastYear)
            .filter((item:string) => item === obj.assessmentPastYear)
        if(!year || year.length === 0) {
          this.addMore(obj);
        }
      });
      this.pastYearLosses.forEach((obj) => {
        this.addMore(obj);
      });
    }
    if (!this.pastYearLosses || this.pastYearLosses.length == 0) {
      this.pastYearLosses = [];
      this.scheduleCflArray.forEach((obj) => {
        this.addMore(obj);
      });
    }
    this.calculateTotalLosses();
    this.disableSILoss();
  }

  disableSILoss() {
    const cflArray = <UntypedFormArray>this.cflForm.get('cflArray');
    cflArray.controls.forEach((element, index) => {
      if (
        (element as UntypedFormGroup).controls['assessmentPastYear'].value ===
        '2016-17' ||
        (element as UntypedFormGroup).controls['assessmentPastYear'].value ===
        '2017-18' ||
        (element as UntypedFormGroup).controls['assessmentPastYear'].value ===
        '2018-19' ||
        (element as UntypedFormGroup).controls['assessmentPastYear'].value ===
        '2019-20'
      ) {
        (element as UntypedFormGroup).controls['speculativeBusinessLoss'].disable();
      }
    });
  }

  initForm() {
    return this.fb.group({
      totalHPLoss: [0],
      totalBFBusinessLoss: [0],
      totalSIBusinessLoss: [0],
      totalSTCGLoss: [0],
      totalLTCGLoss: [0],
      cflArray: this.fb.array([]),
    });
  }

  createCflForm(item?): UntypedFormGroup {
    return this.fb.group({
      hasEdit: [item ? item.hasEdit : false],
      pastYear: [item ? item.pastYear : null],
      assessmentPastYear: [item ? item.assessmentPastYear : ''],
      dateofFilling: [item ? item.dateofFilling : null],
      housePropertyLoss: [item ? item.housePropertyLoss : null],
      broughtForwordBusinessLoss: [
        item ? item.broughtForwordBusinessLoss : null,
      ],
      STCGLoss: [item ? item.STCGLoss : null],
      LTCGLoss: [item ? item.LTCGLoss : null],
      speculativeBusinessLoss: [item ? item.speculativeBusinessLoss : 0],
      setOffWithCurrentYearSpeculativeBusinessIncome: [
        item ? item.setOffWithCurrentYearSpeculativeBusinessIncome : null,
      ],
      setOffWithCurrentYearBroughtForwordBusinessIncome: [
        item ? item.setOffWithCurrentYearBroughtForwordBusinessIncome : null,
      ],
      setOffWithCurrentYearHPIncome: [
        item ? item.setOffWithCurrentYearHPIncome : null,
      ],
      setOffWithCurrentYearSTCGIncome: [
        item ? item.setOffWithCurrentYearSTCGIncome : null,
      ],
      setOffWithCurrentYearLTCGIncome: [
        item ? item.setOffWithCurrentYearLTCGIncome : null,
      ],
      carryForwardAmountBusiness: [
        item ? item.carryForwardAmountBusiness : null,
      ],
      carryForwardAmountSpeculative: [
        item ? item.carryForwardAmountSpeculative : null,
      ],
      carryForwardAmountHP: [item ? item.carryForwardAmountHP : null],
      carryForwardAmountSTCGIncome: [
        item ? item.carryForwardAmountSTCGIncome : null,
      ],
      carryForwardAmountLTCGIncome: [
        item ? item.carryForwardAmountLTCGIncome : null,
      ],
      totalLoss: [item ? item.totalLoss : null],
    });
  }

  editForm(i) {
    (
      (this.cflForm.controls['cflArray'] as UntypedFormGroup).controls[i] as UntypedFormGroup
    ).enable();
  }

  get getCflArray() {
    return <UntypedFormArray>this.cflForm.get('cflArray');
  }

  getField(i, field) {
    return <AbstractControl>(
      (<UntypedFormGroup>(
        (<UntypedFormArray>this.cflForm.controls['cflArray']).controls[i]
      )).get(field)
    );
  }

  getApperance(i, field): MatFormFieldAppearance {
    if (
      (<UntypedFormGroup>(
        (<UntypedFormArray>this.cflForm.controls['cflArray']).controls[i]
      )).get(field).disabled
    ) {
      return 'fill';
    }
    return 'outline';
  }

  addMore(item?) {
    const cflArray = <UntypedFormArray>this.cflForm.get('cflArray');
    cflArray.push(this.createCflForm(item));
  }

  deleteCflArray() {
    const cflArray = <UntypedFormArray>this.cflForm.get('cflArray');
    cflArray.controls.forEach((element, index) => {
      if ((element as UntypedFormGroup).controls['hasEdit'].value) {
        let assessmentPastYear = (element as UntypedFormGroup).controls[
          'assessmentPastYear'
        ].value;
        (element as UntypedFormGroup).reset();
        (element as UntypedFormGroup).controls['assessmentPastYear'].setValue(
          assessmentPastYear
        );
      }
    });
    this.calculateTotalLosses();
  }

  calculateTotalLosses() {
    let totalHPLoss = 0;
    let totalBFBusinessLoss = 0;
    let totalSIBusinessLoss = 0;
    let totalSTCGLoss = 0;
    let totalLTCGLoss = 0;

    const cflArray = this.cflForm.get('cflArray').value;
    cflArray.forEach((element) => {
      totalHPLoss += Number(element.housePropertyLoss);
      totalBFBusinessLoss += Number(element.broughtForwordBusinessLoss);
      totalSTCGLoss += Number(element.STCGLoss);

      if (
        element.assessmentPastYear === '2020-21' ||
        element.assessmentPastYear === '2021-22' ||
        element.assessmentPastYear === '2022-23' ||
        element.assessmentPastYear === '2023-24'
      ) {
        totalSIBusinessLoss += Number(element.speculativeBusinessLoss);
      } else {
        totalSIBusinessLoss = 0;
      }
      totalLTCGLoss += Number(element.LTCGLoss);
      this.cflForm.controls['totalHPLoss'].setValue(totalHPLoss);
      this.cflForm.controls['totalBFBusinessLoss'].setValue(
        totalBFBusinessLoss
      );
      this.cflForm.controls['totalSIBusinessLoss'].setValue(
        totalSIBusinessLoss
      );
      this.cflForm.controls['totalSTCGLoss'].setValue(totalSTCGLoss);
      this.cflForm.controls['totalLTCGLoss'].setValue(totalLTCGLoss);
    });
  }

  save() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    let isError = false;
    let dateError = false;

    const cflArrays = this.cflForm.get('cflArray') as UntypedFormArray;
    const cflArraysValue = this.cflForm.get('cflArray').value;

    cflArraysValue.forEach((element, index) => {
      if (
        element.dateofFilling &&
        element.LTCGLoss == 0 &&
        element.STCGLoss == 0 &&
        element.broughtForwordBusinessLoss == 0 &&
        element.housePropertyLoss == 0 &&
        element.speculativeBusinessLoss == 0
      ) {
        isError = true;
      } else if (
        !element.dateofFilling &&
        ((element?.LTCGLoss && parseFloat(element?.LTCGLoss) !== 0) ||
          (element?.STCGLoss && parseFloat(element?.STCGLoss) !== 0) ||
          (element?.broughtForwordBusinessLoss &&
            parseFloat(element?.broughtForwordBusinessLoss) !== 0) ||
          (element?.housePropertyLoss &&
            parseFloat(element?.housePropertyLoss) !== 0) ||
          (element?.speculativeBusinessLoss &&
            parseFloat(element?.speculativeBusinessLoss) !== 0))
      ) {
        const date = cflArrays.controls[index].get('dateofFilling');
        date?.setValidators(Validators.required);
        date?.updateValueAndValidity();
        dateError = true;
      } else {
        const date = cflArrays.controls[index].get('dateofFilling');
        date?.clearValidators();
        date?.updateValueAndValidity();
      }
    });
    if (isError) {
      this.utilsService.showSnackBar(
        'If date of filing is present then any one of the loss should be required.'
      );
      this.utilsService.smoothScrollToTop();
      return;
    }

    if (dateError) {
      this.utilsService.showSnackBar(
        'If loss amount is present then date of filing is required.'
      );
      this.utilsService.smoothScrollToTop();
      return;
    }

    if (cflArrays?.valid) {
      const cflArray = <UntypedFormArray>this.cflForm.get('cflArray');
      this.Copy_ITR_JSON.pastYearLosses = [];
      this.Copy_ITR_JSON.pastYearLosses = cflArray.getRawValue();
      this.loading = true;
      this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
        (result: any) => {
          this.ITR_JSON = result;
          sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
          this.loading = false;
          this.saveAndNext.emit(true);
          this.utilsService.showSnackBar('Schedule CFL updated successfully');
          console.log('Schedule CFL=', result);
          this.utilsService.smoothScrollToTop();
        },
        (error) => {
          this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
          this.loading = false;
          this.utilsService.showSnackBar(
            'Failed to add schedule CFL, please try again.'
          );
          this.utilsService.smoothScrollToTop();
        }
      );
    } else {
      this.utilsService.showSnackBar(
        'please make sure all details are entered correctly'
      );
    }
  }

  goBack() {
    this.saveAndNext.emit(false);
  }
}
