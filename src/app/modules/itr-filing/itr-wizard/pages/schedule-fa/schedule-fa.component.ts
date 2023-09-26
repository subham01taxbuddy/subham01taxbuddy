import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Form } from '@angular/forms';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-schedule-fa',
  templateUrl: './schedule-fa.component.html',
  styleUrls: ['./schedule-fa.component.scss'],
})
export class ScheduleFaComponent implements OnInit {
  @Output() saveAndNext = new EventEmitter<any>();
  loading = false;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  topicList = [
    {
      label:
        'A1. Details of Foreign Depository Accounts held (including any beneficial interest) at any time during the calendar year ending as on 31st December, 2022',
      code: 'A1',
    },
    {
      label:
        'A2. Details of Foreign Custodial Accounts held (including any beneficial interest) at any time during the calendar year ending as on 31st December, 2022',
      code: 'A2',
    },
    {
      label:
        'A3. Details of Foreign Equity and Debt Interest held (including any beneficial interest) in any entity at any time during the calendar year ending as on 31st December, 2022',
      code: 'A3',
    },
    {
      label:
        'A4. Details of Foreign Cash Value insurance Contract or Annuity Contract held (including any beneficial interest)at any time during the calendar year ending as on 31st December, 2022',
      code: 'A4',
    },
    {
      label:
        'B. Details of Financial Interest in any Entity held (including any beneficial interest)at any time during the calendar year ending as on 31st December, 2022',
      code: 'B',
    },
    {
      label:
        'C. Details of Immovable Property held (including any beneficial interest)at any time during the calendar year ending as on 31st December, 2022',
      code: 'C',
    },
    {
      label:
        'D. Details of any other Capital Asset held (including any beneficial interest)at any time during the calendar year ending as on 31st December, 2022',
      code: 'D',
    },
    {
      label:
        'E. Details of account(s) in which you have signing authority held (including any beneficial interest)at any time during the calendar year ending as on 31st December, 2022 and which has not been included in A to D above',
      code: 'E',
    },
    {
      label:
        'F. Details of trusts, created under the laws of a country outside India, in which you are a trustee, beneficiary or settlor',
      code: 'F',
    },
    {
      label:
        'G. Details of any other income derived from any source outside India which is not included in - (i) items A to F above, (ii) income under the head business or profession',
      code: 'G',
    },
  ];
  scheduleFa: FormGroup;
  isPanelOpen: boolean = false;

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private utilsService: UtilsService
  ) {}

  ngOnInit(): void {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
    this.scheduleFa = this.createfrgnDpstryAcctForm();
  }

  createfrgnDpstryAcctForm(dpstryItem?) {
    // const depositoryAct =
    //   this.ITR_JSON.foreignIncome.foreignAssets.depositoryAccounts;

    // if (depositoryAct.length > 0) {
    //   console.log(depositoryAct, 'depositoryAct');
    //   let i: any = '';
    //   let accountArray: any = [];

    //   depositoryAct.forEach((element, index) => {
    //     accountArray.push({
    //       hasEdit: false,
    //       accountNumber: element.accountNumber,
    //       status: element.status,
    //       accountOpeningDate: element.accountOpeningDate,
    //       peakBalance: element.peakBalance,
    //       closingBalance: element.closingBalance,
    //       grossInterestPaid: element.grossInterestPaid,
    //     });
    //     this.frgnDpstryAcct = this.fb.array([
    //       {
    //         countryName: depositoryAct[i].countryName,
    //         countryCode: depositoryAct[i].countryCode,
    //         nameOfInstitution: depositoryAct[i].nameOfInstitution,
    //         addressOfInstitution: depositoryAct[i].addressOfInstitution,
    //         zipCode: depositoryAct[i].zipCode,
    //         account: accountArray,
    //       },
    //     ]);
    //   });

    //   console.log(
    //     accountArray,
    //     'accountArray',
    //     this.frgnDpstryAcct,
    //     'frgnDpstryAcct'
    //   );
    // } else {
    //   return (this.frgnDpstryAcct = this.fb.array([
    //     this.fb.group({
    //       countryName: null,
    //       countryCode: null,
    //       nameOfInstitution: null,
    //       addressOfInstitution: null,
    //       zipCode: null,
    //       account: this.fb.array([
    //         this.fb.group({
    //           hasEdit: null,
    //           accountNumber: null,
    //           status: null,
    //           accountOpeningDate: null,
    //           peakBalance: null,
    //           closingBalance: null,
    //           grossInterestPaid: null,
    //         }),
    //       ]),
    //     }),
    //   ]));
    // }

    return this.fb.group({
      frgnDpstryAcct: this.fb.array([
        this.fb.group({
          countryName: null,
          countryCode: null,
          nameOfInstitution: null,
          addressOfInstitution: null,
          zipCode: null,
          account: this.fb.array([
            this.fb.group({
              hasEdit: null,
              accountNumber: null,
              status: null,
              accountOpeningDate: null,
              peakBalance: null,
              closingBalance: null,
              grossInterestPaid: null,
            }),
          ]),
        }),
      ]),
    });
  }

  gotoSection(topicCode) {
    if (topicCode === 'A1' && this.isPanelOpen === true) {
      this.scheduleFa = this.createfrgnDpstryAcctForm();
    }
  }

  onExpandedChange(event) {
    console.log(event, 'expanded change');
    this.isPanelOpen = event;
  }

  add(dpstryItem?) {
    if (dpstryItem === 'fda') {
      const fdaArray = this.scheduleFa.get('frgnDpstryAcct') as FormArray;
      if (fdaArray.valid) {
        fdaArray.push(this.createfrgnDpstryAcctForm());
      }
    }

    const accountControls = (this.scheduleFa.get('frgnDpstryAcct') as FormArray)
      .at(0)
      .get('account') as FormArray;

    if (accountControls.valid) {
      accountControls.push(
        this.fb.group({
          hasEdit: dpstryItem ? dpstryItem.hasEdit : false,
          accountNumber: dpstryItem ? dpstryItem.accountNumber : '',
          status: dpstryItem ? dpstryItem.status : '',
          accountOpeningDate: dpstryItem ? dpstryItem.accountOpeningDate : '',
          peakBalance: dpstryItem ? dpstryItem.peakBalance : '',
          closingBalance: dpstryItem ? dpstryItem.closingBalance : '',
          grossInterestPaid: dpstryItem ? dpstryItem.grossInterestPaid : '',
        })
      );
    } else {
      this.utilsService.showSnackBar(
        'Please make sure you have filled all the details correctly to proceed ahead'
      );
    }
  }

  goBack() {
    this.saveAndNext.emit(false);
  }

  saveAll() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
    console.log(this.scheduleFa);

    const values = (
      this.scheduleFa.controls['frgnDpstryAcct'] as FormArray
    ).getRawValue();
    console.log(values, 'values');

    let objToSave = [];

    values[0].account.forEach((element) => {
      objToSave.push({
        countryName: values[0].countryName,
        countryCode: values[0].countryCode,
        nameOfInstitution: values[0].countryName,
        addressOfInstitution: values[0].addressOfInstitution,
        zipCode: values[0].zipCode,
        accountNumber: element.accountNumber,
        status: element.status,
        accountOpeningDate: element.accountOpeningDate,
        peakBalance: element.peakBalance,
        closingBalance: element.closingBalance,
        grossInterestPaid: element.grossInterestPaid,
      });
    });
    console.log(objToSave, 'objToSave');

    if (this.scheduleFa.valid) {
      objToSave.forEach((element) =>
        this.Copy_ITR_JSON?.foreignIncome?.foreignAssets?.depositoryAccounts?.push(
          element
        )
      );
    }
    console.log(this.Copy_ITR_JSON.foreignIncome);

    this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
      (result: any) => {
        this.ITR_JSON = result;
        sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
        this.loading = false;
        this.utilsService.showSnackBar('Schedule FA saved successfully');
        this.saveAndNext.emit(false);
      },
      (error) => {
        this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
        this.loading = false;
        this.utilsService.showSnackBar(
          'Failed to add schedule FA, please try again.'
        );
        this.utilsService.smoothScrollToTop();
      }
    );
  }

  get getfrgnDpstryAcct() {
    return this.scheduleFa.get('frgnDpstryAcct') as FormArray;
  }

  get getAccountControls() {
    return (this.scheduleFa.get('frgnDpstryAcct') as FormArray)
      .at(0)
      .get('account') as FormArray;
  }
}
