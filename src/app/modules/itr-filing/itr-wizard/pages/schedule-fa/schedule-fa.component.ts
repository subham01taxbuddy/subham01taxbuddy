import { Component, OnInit, Output, EventEmitter } from '@angular/core';
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

  constructor(private fb: FormBuilder, private utilsService: UtilsService) {}

  ngOnInit(): void {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
    this.scheduleFa = this.initForm();

    // depository account
    const depositoryAct =
      this.ITR_JSON?.foreignIncome?.foreignAssets?.depositoryAccounts;
    if (depositoryAct?.length > 0) {
      this.createForm();
    }

    // equity and debt
    const eqtyDbtInt =
      this.ITR_JSON?.foreignIncome?.foreignAssets?.equityAndDebtInterest;
    if (eqtyDbtInt?.length > 0) {
      this.createForm();
    }

    // cash value insurance
    const cvi = this.ITR_JSON?.foreignIncome?.foreignAssets?.cashValueInsurance;
    if (cvi?.length > 0) {
      this.createForm();
    }

    // financial interest details
    const fid =
      this.ITR_JSON?.foreignIncome?.foreignAssets?.financialInterestDetails;
    if (fid?.length > 0) {
      this.createForm();
    }

    // immovable property details
    const ipd =
      this.ITR_JSON?.foreignIncome?.foreignAssets?.immovablePropertryDetails;
    if (ipd?.length > 0) {
      this.createForms();
    }
  }

  //FORMS SECTION
  initForm() {
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
      eqtyDbtInt: this.fb.array([
        this.fb.group({
          countryName: null,
          countryCode: null,
          nameOfEntity: null,
          addressOfEntity: null,
          zipCode: null,
          natureOfEntity: null,
          dateOfInterest: null,
          initialValue: null,
          peakValue: null,
          closingValue: null,
          totalGrossAmountPaid: null,
          totalGrossProceedsFromSale: null,
        }),
      ]),
      cashValueInsurance: this.fb.array([
        this.fb.group({
          countryName: null,
          countryCode: null,
          nameOfInstitution: null,
          addressOfInstitution: null,
          zipCode: null,
          dateOfContract: null,
          cashValue: null,
          totalGrossAmountPaid: null,
        }),
      ]),
      financialInterestDetails: this.fb.array([
        this.fb.group({
          countryCode: null,
          countryName: null,
          natureOfEntity: null,
          nameOfEntity: null,
          address: null,
          zipCode: null,
          natureOfInterest: null,
          date: null,
          totalInvestments: null,
          accruedIncome: null,
          natureOfIncome: null,
          amount: null,
          scheduleOfferd: null,
          numberOfSchedule: 0,
        }),
      ]),
      immovablePropertryDetails: this.fb.array([
        this.fb.group({
          countryName: null,
          countryCode: null,
          address: null,
          zipCode: null,
          ownerShip: null,
          date: null,
          totalInvestments: null,
          derivedIncome: null,
          natureOfIncome: null,
          amount: null,
          scheduleOfferd: null,
          numberOfSchedule: 0,
        }),
      ]),
    });
  }

  initFdaForm() {
    return this.fb.group({
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
    });
  }

  initEdtForm() {
    return this.fb.group({
      countryName: null,
      countryCode: null,
      nameOfEntity: null,
      addressOfEntity: null,
      zipCode: null,
      natureOfEntity: null,
      dateOfInterest: null,
      initialValue: null,
      peakValue: null,
      closingValue: null,
      totalGrossAmountPaid: null,
      totalGrossProceedsFromSale: null,
    });
  }

  initCviForm() {
    return this.fb.group({
      countryCode: null,
      countryName: null,
      nameOfInstitution: null,
      addressOfInstitution: null,
      zipCode: null,
      dateOfContract: null,
      cashValue: null,
      totalGrossAmountPaid: null,
    });
  }

  initFdiForm() {
    return this.fb.group({
      countryName: null,
      countryCode: null,
      natureOfEntity: null,
      nameOfEntity: null,
      address: null,
      zipCode: null,
      natureOfInterest: null,
      date: null,
      totalInvestments: null,
      accruedIncome: null,
      natureOfIncome: null,
      amount: null,
      scheduleOfferd: null,
      numberOfSchedule: 0,
    });
  }

  initIpdForm() {
    return this.fb.group({
      countryName: null,
      countryCode: null,
      address: null,
      zipCode: null,
      ownerShip: null,
      date: null,
      totalInvestments: null,
      derivedIncome: null,
      natureOfIncome: null,
      amount: null,
      scheduleOfferd: null,
      numberOfSchedule: 0,
    });
  }

  createForm() {
    // // Depository Account
    // const depositoryAct =
    //   this.ITR_JSON?.foreignIncome?.foreignAssets?.depositoryAccounts;
    // console.log(depositoryAct, 'depositoryAct');
    // const dpstryResult = depositoryAct.reduce((acc, element) => {
    //   const existingEntry = acc.find(
    //     (entry) =>
    //       entry.countryCode === element.countryCode &&
    //       entry.nameOfInstitution === element.nameOfInstitution
    //   );
    //   console.log(existingEntry, 'existingEntry');
    //   if (existingEntry) {
    //     existingEntry?.account.push({
    //       hasEdit: false,
    //       accountNumber: element.accountNumber,
    //       status: element.status,
    //       accountOpeningDate: element.accountOpeningDate,
    //       peakBalance: element.peakBalance,
    //       closingBalance: element.closingBalance,
    //       grossInterestPaid: element.grossInterestPaid,
    //     });
    //   } else {
    //     acc.push({
    //       countryName: element.countryCode,
    //       countryCode: element.countryCode,
    //       nameOfInstitution: element.nameOfInstitution,
    //       addressOfInstitution: element.addressOfInstitution,
    //       zipCode: element.zipCode,
    //       account: [
    //         {
    //           hasEdit: false,
    //           accountNumber: element.accountNumber,
    //           status: element.status,
    //           accountOpeningDate: element.accountOpeningDate,
    //           peakBalance: element.peakBalance,
    //           closingBalance: element.closingBalance,
    //           grossInterestPaid: element.grossInterestPaid,
    //         },
    //       ],
    //     });
    //   }
    //   return acc;
    // }, []);
    // console.log(dpstryResult, 'result');
    // const dpstryForm = (
    //   this.scheduleFa.controls['frgnDpstryAcct'] as FormArray
    // ).setValue(dpstryResult);
    // console.log(dpstryForm, 'setdpstryForm');

    // Equity and debt
    {
      const equityAndDebtInterest =
        this.ITR_JSON?.foreignIncome?.foreignAssets?.equityAndDebtInterest;

      const eqtyDbtIntForm = this.scheduleFa.controls[
        'eqtyDbtInt'
      ] as FormArray;

      // Clear existing controls in the FormArray.
      // ========================This is not working properly======================================
      while (eqtyDbtIntForm.length !== 0) {
        eqtyDbtIntForm.removeAt(0);
      }

      // Add new controls based on the length of equityAndDebtInterest
      equityAndDebtInterest.forEach((item, i) => {
        // console.log(item);
        eqtyDbtIntForm.push(
          this.fb.group({
            countryName: item.countryName ? item.countryName : item.countryCode,
            countryCode: item.countryCode,
            nameOfEntity: item.nameOfEntity,
            addressOfEntity: item.addressOfEntity,
            zipCode: item.zipCode,
            natureOfEntity: item.natureOfEntity,
            dateOfInterest: item.dateOfInterest,
            initialValue: item.initialValue,
            peakValue: item.peakValue,
            closingValue: item.closingValue,
            totalGrossAmountPaid: item.totalGrossAmountPaid,
            totalGrossProceedsFromSale: item.totalGrossProceedsFromSale,
          })
        );
      });

      // console.log(eqtyDbtIntForm.value, 'seteqtyDbtIntForm');
    }

    // cash value insurance
    {
      const cashValueInsurance =
        this.ITR_JSON?.foreignIncome?.foreignAssets?.cashValueInsurance;

      const cviIntForm = this.scheduleFa.controls[
        'cashValueInsurance'
      ] as FormArray;

      // Clear existing controls in the FormArray.
      // ========================This is not working properly======================================
      while (cviIntForm.length !== 0) {
        cviIntForm.clear();
      }

      // Add new controls based on the length of equityAndDebtInterest
      cashValueInsurance.forEach((item, i) => {
        // console.log(item);
        cviIntForm.push(
          this.fb.group({
            countryCode: item.countryCode,
            countryName: item.countryName,
            nameOfInstitution: item.nameOfInstitution,
            addressOfInstitution: item.addressOfInstitution,
            zipCode: item.zipCode,
            dateOfContract: item.dateOfContract,
            cashValue: item.cashValue,
            totalGrossAmountPaid: item.totalGrossAmountPaid,
          })
        );
      });

      // console.log(cviIntForm.value, 'setCviIntForm');
    }

    // financial interest details
    {
      const financialInterestDetails =
        this.ITR_JSON?.foreignIncome?.foreignAssets?.financialInterestDetails;

      const fidIntForm = this.scheduleFa.controls[
        'financialInterestDetails'
      ] as FormArray;

      // Clear existing controls in the FormArray.
      // ========================This is not working properly======================================
      while (fidIntForm.length !== 0) {
        fidIntForm.clear();
      }

      // Add new controls based on the length of equityAndDebtInterest
      financialInterestDetails.forEach((item, i) => {
        // console.log(item);
        fidIntForm.push(
          this.fb.group({
            id: item.id,
            countryCode: item.countryCode,
            countryName: item.countryName,
            natureOfEntity: item.natureOfEntity,
            nameOfEntity: item.nameOfEntity,
            address: item.address,
            zipCode: item.zipCode,
            natureOfInterest: item.natureOfInterest,
            date: item.date,
            totalInvestments: item.totalInvestments,
            accruedIncome: item.accruedIncome,
            natureOfIncome: item.natureOfIncome,
            amount: item.amount,
            scheduleOfferd: item.scheduleOfferd,
            numberOfSchedule: item.numberOfSchedule,
          })
        );
      });

      // console.log(fidIntForm.value, 'setCviIntForm');
    }

    // financial interest details
    {
      const immovablePropertryDetails =
        this.ITR_JSON?.foreignIncome?.foreignAssets?.immovablePropertryDetails;

      const ipdIntForm = this.scheduleFa.controls[
        'immovablePropertryDetails'
      ] as FormArray;

      // Clear existing controls in the FormArray.
      // ========================This is not working properly======================================
      while (ipdIntForm.length !== 0) {
        ipdIntForm.clear();
      }

      // Add new controls based on the length of equityAndDebtInterest
      immovablePropertryDetails.forEach((item, i) => {
        // console.log(item);
        ipdIntForm.push(
          this.fb.group({
            countryName: item.countryName,
            countryCode: item.countryCode,
            address: item.address,
            zipCode: item.zipCode,
            ownerShip: item.ownerShip,
            date: item.date,
            totalInvestments: item.totalInvestments,
            derivedIncome: item.derivedIncome,
            natureOfIncome: item.natureOfIncome,
            amount: item.amount,
            scheduleOfferd: item.scheduleOfferd,
            numberOfSchedule: item.numberOfSchedule,
          })
        );
      });

      // console.log(ipdIntForm.value, 'ipdIntForm');
    }
  }

  createForms() {}

  // ADD SECTION
  // adding whole section
  addMore(section) {
    if (section === 'fda') {
      const fdaArray = this.scheduleFa.get('frgnDpstryAcct') as FormArray;
      if (fdaArray.valid) {
        fdaArray.push(this.initFdaForm());
      }
    } else if (section === 'edt') {
      const edtArray = this.scheduleFa.get('eqtyDbtInt') as FormArray;
      if (edtArray.valid) {
        edtArray.push(this.initEdtForm());
      }
    } else if (section === 'cvi') {
      const cviArray = this.scheduleFa.get('cashValueInsurance') as FormArray;
      if (cviArray.valid) {
        cviArray.push(this.initCviForm());
      }
    } else if (section === 'fid') {
      const fidArray = this.scheduleFa.get(
        'financialInterestDetails'
      ) as FormArray;
      if (fidArray.valid) {
        fidArray.push(this.initFdiForm());
      }
    } else if (section === 'ipd') {
      const ipdArray = this.scheduleFa.get(
        'immovablePropertryDetails'
      ) as FormArray;
      if (ipdArray.valid) {
        ipdArray.push(this.initIpdForm());
      }
    }
  }

  // adding nested form array
  add(topic?) {
    const accountControls = (this.scheduleFa.get('frgnDpstryAcct') as FormArray)
      .at(0)
      .get('account') as FormArray;

    if (accountControls.valid) {
      accountControls.push(
        this.fb.group({
          hasEdit: topic ? topic.hasEdit : false,
          accountNumber: topic ? topic.accountNumber : '',
          status: topic ? topic.status : '',
          accountOpeningDate: topic ? topic.accountOpeningDate : '',
          peakBalance: topic ? topic.peakBalance : '',
          closingBalance: topic ? topic.closingBalance : '',
          grossInterestPaid: topic ? topic.grossInterestPaid : '',
        })
      );
    } else {
      this.utilsService.showSnackBar(
        'Please make sure you have filled all the details correctly to proceed ahead'
      );
    }
  }

  // SAVING SECTION
  saves() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

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

  saveAll() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    console.log(this.scheduleFa);

    // Depository account
    {
      const fdaValues = (
        this.scheduleFa.controls['frgnDpstryAcct'] as FormArray
      ).getRawValue();
      // console.log(fdaValues, 'values');

      let objToSave = [];
      // TO-DO =================
      fdaValues[0].account.forEach((element) => {
        objToSave.push({
          countryName: fdaValues[0].countryName,
          countryCode: fdaValues[0].countryCode,
          nameOfInstitution: fdaValues[0].countryName,
          addressOfInstitution: fdaValues[0].addressOfInstitution,
          zipCode: fdaValues[0].zipCode,
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
    }

    // Equity and debt
    {
      // Equity debt interest
      const edtValues = (
        this.scheduleFa.controls['eqtyDbtInt'] as FormArray
      ).getRawValue();
      // console.log(edtValues, 'values');

      if (this.scheduleFa.valid) {
        edtValues.forEach((element) => {
          this.Copy_ITR_JSON.foreignIncome.foreignAssets.equityAndDebtInterest.push(
            element
          );
        });
      }
    }

    // cash value insurance
    {
      const cviValues = (
        this.scheduleFa.controls['cashValueInsurance'] as FormArray
      ).getRawValue();
      // console.log(cviValues, 'values');

      if (this.scheduleFa.valid) {
        cviValues.forEach((element) => {
          this.Copy_ITR_JSON.foreignIncome.foreignAssets.cashValueInsurance.push(
            element
          );
        });
      }
    }

    // financial interest details
    {
      const fidValues = (
        this.scheduleFa.controls['financialInterestDetails'] as FormArray
      ).getRawValue();
      // console.log(fidValues, 'values');

      if (this.scheduleFa.valid) {
        fidValues.forEach((element) => {
          this.Copy_ITR_JSON?.foreignIncome?.foreignAssets?.financialInterestDetails?.push(
            element
          );
        });
      }
    }

    // immovable property details
    {
      const ipdValues = (
        this.scheduleFa.controls['immovablePropertryDetails'] as FormArray
      ).getRawValue();
      // console.log(ipdValues, 'values');

      if (this.scheduleFa.valid) {
        ipdValues.forEach((element) => {
          this.Copy_ITR_JSON?.foreignIncome?.foreignAssets?.immovablePropertryDetails?.push(
            element
          );
        });
      }
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

  // GET FUNCTIONS SECTION
  get getfrgnDpstryAcct() {
    return this.scheduleFa.get('frgnDpstryAcct') as FormArray;
  }

  // TO-DO =================pass index of edit, allow one edit only
  get getAccountControls() {
    return (this.scheduleFa.get('frgnDpstryAcct') as FormArray)
      .at(0)
      .get('account') as FormArray;
  }

  get getEqtyDbtInt() {
    return this.scheduleFa.get('eqtyDbtInt') as FormArray;
  }

  get getCashValueInsurance() {
    return this.scheduleFa.get('cashValueInsurance') as FormArray;
  }

  get getFinancialInterestDetails() {
    return this.scheduleFa.get('financialInterestDetails') as FormArray;
  }

  get getImmovablePropertryDetails() {
    return this.scheduleFa.get('immovablePropertryDetails') as FormArray;
  }

  // OTHER SECTION
  gotoSection(topicCode) {
    if (topicCode === 'A1' && this.isPanelOpen === true) {
    }
  }

  onExpandedChange(event) {
    // console.log(event, 'expanded change');
    this.isPanelOpen = event;
  }

  goBack() {
    this.saveAndNext.emit(false);
  }
}

// TO-DO
// 1. PROVIDE CHECKBOS AND DELETE OPTION FOR EACH NON NESTED
// 2. clear form check while auto-populating on init. maybe i can clear itrObj array and then push new ones so this will automatically work
