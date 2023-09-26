import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';

@Component({
  selector: 'app-schedule-fa',
  templateUrl: './schedule-fa.component.html',
  styleUrls: ['./schedule-fa.component.scss'],
})
export class ScheduleFaComponent implements OnInit {
  @Output() saveAndNext = new EventEmitter<any>();
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
  frgnDpstryAcct: FormGroup;
  accountControls: any;
  isPanelOpen: boolean = false;

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    // Parsing drpository details, if it exists
    if (
      this.ITR_JSON?.foreignIncome?.foreignAssets?.depositoryAccounts?.length >
      0
    ) {
      this.ITR_JSON?.foreignIncome?.foreignAssets?.depositoryAccounts?.forEach(
        (dpstry) => {
          this.createfrgnDpstryAcctForm(dpstry);
        }
      );
    } else {
      this.frgnDpstryAcct = this.createfrgnDpstryAcctForm();
    }
  }

  createfrgnDpstryAcctForm(dpstryItem?) {
    // console.log(dpstryItem);

    return (this.frgnDpstryAcct = this.fb.group({
      countryName: dpstryItem ? dpstryItem.countryName : '',
      countryCode: dpstryItem ? dpstryItem.countryCode : '',
      nameOfInstitution: dpstryItem ? dpstryItem.nameOfInstitution : '',
      addressOfInstitution: dpstryItem ? dpstryItem.addressOfInstitution : '',
      zipCode: dpstryItem ? dpstryItem.zipCode : '',
      account: this.fb.array([
        this.fb.group({
          hasEdit: dpstryItem ? dpstryItem.hasEdit : false,
          accountNumber: dpstryItem ? dpstryItem.accountNumber : '',
          status: dpstryItem ? dpstryItem.status : '',
          accountOpeningDate: dpstryItem ? dpstryItem.accountOpeningDate : '',
          peakBalance: dpstryItem ? dpstryItem.peakBalance : '',
          closingBalance: dpstryItem ? dpstryItem.closingBalance : '',
          grossInterestPaid: dpstryItem ? dpstryItem.grossInterestPaid : '',
        }),
      ]),
    }));
  }

  get getAccountControls() {
    return <FormArray>this.frgnDpstryAcct?.get('account');
  }

  gotoSection(topicCode) {
    if (topicCode === 'A1' && this.isPanelOpen === true) {
      this.frgnDpstryAcct = this.createfrgnDpstryAcctForm();
    }
  }

  onExpandedChange(event) {
    console.log(event, 'expanded change');
    this.isPanelOpen = event;
  }
  add() {}

  goBack() {
    this.saveAndNext.emit(false);
  }

  saveAll() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
    console.log(this.frgnDpstryAcct);
    if (this.frgnDpstryAcct.valid) {
      const values = this.frgnDpstryAcct.getRawValue();
      this.Copy_ITR_JSON.foreignIncome?.foreignAssets?.depositoryAccounts.push(
        values
      );
    }
    console.log(this.Copy_ITR_JSON.foreignIncome);
  }
}
