import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WizardNavigation } from 'src/app/modules/itr-shared/WizardNavigation';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ITR_JSON, PastYearLosses } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-schedule-cfl',
  templateUrl: './schedule-cfl.component.html',
  styleUrls: ['./schedule-cfl.component.scss']
})
export class ScheduleCflComponent extends WizardNavigation implements OnInit {
  loading = false;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  pastYearLosses: PastYearLosses[];
  cflForm: FormGroup;
  today: any;
  scheduleCflArray = [
    {
      hasEdit: '', assessmentPastYear: '2014-15', dateofFilling: '', housePropertyLoss: '', broughtForwordBusinessLoss: '', STCGLoss: '', LTCGLoss: '', speculativeBusinessLoss: ''
    },
    {
      hasEdit: '', assessmentPastYear: '2015-16', dateofFilling: '', housePropertyLoss: '', broughtForwordBusinessLoss: '', STCGLoss: '', LTCGLoss: '', speculativeBusinessLoss: ''
    },
    {
      hasEdit: '', assessmentPastYear: '2016-17', dateofFilling: '', housePropertyLoss: '', broughtForwordBusinessLoss: '', STCGLoss: '', LTCGLoss: '', speculativeBusinessLoss: ''
    },
    {
      hasEdit: '', assessmentPastYear: '2017-18', dateofFilling: '', housePropertyLoss: '', broughtForwordBusinessLoss: '', STCGLoss: '', LTCGLoss: '', speculativeBusinessLoss: ''
    },
    {
      hasEdit: '', assessmentPastYear: '2018-19', dateofFilling: '', housePropertyLoss: '', broughtForwordBusinessLoss: '', STCGLoss: '', LTCGLoss: '', speculativeBusinessLoss: ''
    }, {
      hasEdit: '', assessmentPastYear: '2019-20', dateofFilling: '', housePropertyLoss: '', broughtForwordBusinessLoss: '', STCGLoss: '', LTCGLoss: '', speculativeBusinessLoss: ''
    }, {
      hasEdit: '', assessmentPastYear: '2020-21', dateofFilling: '', housePropertyLoss: '', broughtForwordBusinessLoss: '', STCGLoss: '', LTCGLoss: '', speculativeBusinessLoss: ''
    }, {
      hasEdit: '', assessmentPastYear: '2021-22', dateofFilling: '', housePropertyLoss: '', broughtForwordBusinessLoss: '', STCGLoss: '', LTCGLoss: '', speculativeBusinessLoss: ''
    }
  ]
  constructor(
    public fb: FormBuilder,
    private utilsService: UtilsService,
    private itrMsService: ItrMsService,
  ) {
    super()
    this.today = new Date();
  }

  ngOnInit(): void {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));


    this.cflForm = this.initForm();


    this.pastYearLosses = this.ITR_JSON.pastYearLosses;
    if (this.pastYearLosses) {
      this.pastYearLosses.forEach(obj => {
        this.addMore(obj);
      });
    }
    if (!this.pastYearLosses || this.pastYearLosses.length == 0) {
      this.pastYearLosses = [];
      this.scheduleCflArray.forEach(obj => {
        this.addMore(obj);
      });
    }

    this.disableSILoss();
  }

  disableSILoss() {
    const cflArray = <FormArray>this.cflForm.get('cflArray');
    cflArray.controls.forEach((element, index) => {
      if ((element as FormGroup).controls['assessmentPastYear'].value === '2014-15' || (element as FormGroup).controls['assessmentPastYear'].value === '2015-16' || (element as FormGroup).controls['assessmentPastYear'].value === '2016-17' || (element as FormGroup).controls['assessmentPastYear'].value === '2017-18') {
        (element as FormGroup).controls['speculativeBusinessLoss'].disable();
      }
    })
  }

  initForm() {
    return this.fb.group({
      totalHPLoss: [0],
      totalBFBusinessLoss: [0],
      totalSIBusinessLoss: [0],
      totalSTCGLoss: [0],
      totalLTCGLoss: [0],
      cflArray: this.fb.array([])
    });
  }

  createCflForm(item?): FormGroup {
    return this.fb.group({
      hasEdit: [item ? item.hasEdit : false],
      pastYear: [item ? item.pastYear : null],
      assessmentPastYear: [item ? item.assessmentPastYear : ''],
      dateofFilling: [item ? item.dateofFilling : null],
      housePropertyLoss: [item ? item.housePropertyLoss : null],
      broughtForwordBusinessLoss: [item ? item.broughtForwordBusinessLoss : null],
      STCGLoss: [item ? item.STCGLoss : null],
      LTCGLoss: [item ? item.LTCGLoss : null],
      speculativeBusinessLoss: [item ? item.speculativeBusinessLoss : 0],
      setOffWithCurrentYearSpeculativeBusinessIncome: [item ? item.setOffWithCurrentYearSpeculativeBusinessIncome : null],
      setOffWithCurrentYearBroughtForwordBusinessIncome: [item ? item.setOffWithCurrentYearBroughtForwordBusinessIncome : null],
      setOffWithCurrentYearHPIncome: [item ? item.setOffWithCurrentYearHPIncome : null],
      setOffWithCurrentYearSTCGIncome: [item ? item.setOffWithCurrentYearSTCGIncome : null],
      setOffWithCurrentYearLTCGIncome: [item ? item.setOffWithCurrentYearLTCGIncome : null],
      carryForwardAmountBusiness: [item ? item.carryForwardAmountBusiness : null],
      carryForwardAmountSpeculative: [item ? item.carryForwardAmountSpeculative : null],
      carryForwardAmountHP: [item ? item.carryForwardAmountHP : null],
      carryForwardAmountSTCGIncome: [item ? item.carryForwardAmountSTCGIncome : null],
      carryForwardAmountLTCGIncome: [item ? item.carryForwardAmountLTCGIncome : null],
      totalLoss: [item ? item.totalLoss : null]
    });
  }


  editForm(i) {
    ((this.cflForm.controls['cflArray'] as FormGroup).controls[i] as FormGroup).enable();
  }

  get getCflArray() {
    return <FormArray>this.cflForm.get('cflArray');
  }


  addMore(item?) {
    const cflArray = <FormArray>this.cflForm.get('cflArray');
    cflArray.push(this.createCflForm(item));
  }

  deleteCflArray() {
    const cflArray = <FormArray>this.cflForm.get('cflArray');
    cflArray.controls.forEach((element, index) => {
      if ((element as FormGroup).controls['hasEdit'].value) {
        let assessmentPastYear = (element as FormGroup).controls['assessmentPastYear'].value;
        (element as FormGroup).reset();
        (element as FormGroup).controls['assessmentPastYear'].setValue(assessmentPastYear);
      }
    })
    this.calculateTotalLosses();
  }

  calculateTotalLosses() {
    let totalHPLoss = 0;
    let totalBFBusinessLoss = 0;
    let totalSIBusinessLoss = 0;
    let totalSTCGLoss = 0;
    let totalLTCGLoss = 0;

    const cflArray = this.cflForm.get('cflArray').value;
    cflArray.forEach(element => {
      totalHPLoss += Number(element.housePropertyLoss);
      totalBFBusinessLoss += Number(element.broughtForwordBusinessLoss);
      totalSTCGLoss += Number(element.STCGLoss);

      if (element.assessmentPastYear === '2018-19' || element.assessmentPastYear === '2019-20' || element.assessmentPastYear === '2020-21' || element.assessmentPastYear === '2021-22') {
        debugger
        totalSIBusinessLoss += Number(element.speculativeBusinessLoss);
      } else {
        totalSIBusinessLoss = 0
      }
      totalLTCGLoss += Number(element.LTCGLoss);
      this.cflForm.controls['totalHPLoss'].setValue(totalHPLoss);
      this.cflForm.controls['totalBFBusinessLoss'].setValue(totalBFBusinessLoss);
      this.cflForm.controls['totalSIBusinessLoss'].setValue(totalSIBusinessLoss);
      this.cflForm.controls['totalSTCGLoss'].setValue(totalSTCGLoss);
      this.cflForm.controls['totalLTCGLoss'].setValue(totalLTCGLoss);
    })

  }

  save() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    let isError = false;

    const cflArrays = this.cflForm.get('cflArray').value;

    cflArrays.forEach((element) => {
      if (element.dateofFilling && (element.LTCGLoss == 0 && element.STCGLoss == 0 && element.broughtForwordBusinessLoss == 0 && element.housePropertyLoss == 0 && element.speculativeBusinessLoss == 0)) {
        isError = true;
      }
    });
    if (isError) {
      this.utilsService.showSnackBar('If date of filing is present then any one of the loss should be required.');
      this.utilsService.smoothScrollToTop();
      return;
    }

    const cflArray = <FormArray>this.cflForm.get('cflArray');
    this.Copy_ITR_JSON.pastYearLosses = [];
    this.Copy_ITR_JSON.pastYearLosses = cflArray.getRawValue();
    debugger
    this.loading = true;
    this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe((result: any) => {
      this.ITR_JSON = result;
      sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
      this.loading = false;
      this.utilsService.showSnackBar('Schedule CFL updated successfully');
      console.log('Schedule CFL=', result);
      this.utilsService.smoothScrollToTop();
    }, error => {
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      this.loading = false;
      this.utilsService.showSnackBar('Failed to add schedule CFL, please try again.');
      this.utilsService.smoothScrollToTop();
    });

  }

  goBack() {
    this.saveAndNext.emit(false);
  }

  saveAll() {
    this.save();
    this.saveAndNext.emit(true);
  }

}
