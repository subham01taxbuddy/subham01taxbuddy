import { SelectionModel } from '@angular/cdk/collections';
import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { GridOptions } from 'ag-grid-community';
import { AppConstants } from 'src/app/modules/shared/constants';
import { BusinessDescription, ITR_JSON, NewFinancialParticulars, } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { WizardNavigation } from 'src/app/modules/itr-shared/WizardNavigation';

@Component({
  selector: 'app-balance-sheet',
  templateUrl: './balance-sheet.component.html',
  styleUrls: ['./balance-sheet.component.scss'],
})
export class BalanceSheetComponent extends WizardNavigation implements OnInit {
  public balanceSheetGridOptions: GridOptions;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  natureOfBusinessDropdownAll: any;
  assetLiabilitiesForm: UntypedFormGroup;
  total1 = 0;
  total2 = 0;
  difference = 0;
  depreciationObj: any[];
  loading: boolean;
  config: any;
  fixedAssetData: any;
  totalAppOfFunds: number = 0;
  totalDepNetBlock: any;
  isDeprecationObjInvalid: boolean;
  totalNetBlock: number = 0;

  constructor(
    public matDialog: MatDialog,
    public itrMsService: ItrMsService,
    public utilsService: UtilsService,
    public fb: UntypedFormBuilder,
  ) {
    super();
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
    this.depreciationObj = [];
  }

  @Input() sheetData: any;

  ngOnInit(): void {
    this.config = {
      itemsPerPage: 2,
      currentPage: 1,
    };

    this.dataSource = new MatTableDataSource(
      this.ITR_JSON?.business?.businessDescription
    );
    this.initForm(this.ITR_JSON.business?.financialParticulars);
    this.calculateTotal1();
    this.calculateTotal2();
    if (this.ITR_JSON.business?.fixedAssetsDetails) {
      this.depreciationObj = this.ITR_JSON.business.fixedAssetsDetails;
      this.depreciationObj.forEach(element => {
        this.totalNetBlock += Number(element.fixedAssetClosingAmount);
      });
    }

    this.calculateTotalLoans();
    this.calSourcesOfFunds();
    this.calTotalLiabilitiesProvision();
    this.calCurrentAssets();
    this.calTotalCurrentAssetsLoansAdv();
    this.calNetCurrentAssets();
  }

  calculateTotalLoans() {
    let totalLoans = 0;
    totalLoans = Number(this.assetLiabilitiesForm.controls['securedLoans'].value) + Number(this.assetLiabilitiesForm.controls['unSecuredLoans'].value);
    this.assetLiabilitiesForm.controls['totalLoans'].setValue(totalLoans);
  }

  dataSource = new MatTableDataSource<BusinessDescription>();
  selection = new SelectionModel<BusinessDescription>(true, []);


  initForm(obj?: NewFinancialParticulars) {
    this.assetLiabilitiesForm = this.fb.group({
      id: [obj?.id],
      membersOwnCapital: [obj?.membersOwnCapital, [Validators.pattern(AppConstants.numericRegex)],],
      reservesAndSurplus: [obj?.reservesAndSurplus, [Validators.pattern(AppConstants.numericRegex)]],
      securedLoans: [obj?.securedLoans, Validators.pattern(AppConstants.numericRegex)],
      unSecuredLoans: [obj?.unSecuredLoans, Validators.pattern(AppConstants.numericRegex)],
      totalLoans: [obj?.totalLoans],
      advances: [obj?.advances, Validators.pattern(AppConstants.numericRegex)],
      totalSourcesOfFunds: [obj?.totalSourcesOfFunds],
      sundryCreditorsAmount: [obj?.sundryCreditorsAmount ? obj?.sundryCreditorsAmount : 0, [Validators.required, Validators.pattern(AppConstants.numericRegex)]],
      otherLiabilities: [obj?.otherLiabilities, Validators.pattern(AppConstants.numericRegex)],
      totalCapitalLiabilities: [obj?.totalCapitalLiabilities],
      totalLiabilitiesProvision: [obj?.totalLiabilitiesProvision],
      netCurrentAsset: [obj?.netCurrentAsset],
      fixedAssets: [obj?.fixedAssets, Validators.pattern(AppConstants.numericRegex)],
      inventories: [obj?.inventories ? obj?.inventories : 0, [Validators.required, Validators.pattern(AppConstants.numericRegex)]],
      totalCurrentAssets: [obj?.totalCurrentAssets],
      totalCurrentAssetsLoansAdv: [obj?.totalCurrentAssetsLoansAdv],
      sundryDebtorsAmount: [obj?.sundryDebtorsAmount ? obj?.sundryDebtorsAmount : 0, [Validators.required, Validators.pattern(AppConstants.numericRegex)],],
      balanceWithBank: [obj?.balanceWithBank, Validators.pattern(AppConstants.numericRegex)],
      cashInHand: [obj?.cashInHand ? obj?.cashInHand : 0, [Validators.required, Validators.pattern(AppConstants.numericRegex)]],
      loanAndAdvances: [obj?.loanAndAdvances, Validators.pattern(AppConstants.numericRegex)],
      investment: [obj?.investment, Validators.pattern(AppConstants.numericRegex),],
      shortTermInvestment: [obj?.shortTermInvestment, Validators.pattern(AppConstants.numericRegex),],
      longTermInvestment: [obj?.longTermInvestment, Validators.pattern(AppConstants.numericRegex),],
      otherAssets: [obj?.otherAssets ? obj?.otherAssets:0, Validators.pattern(AppConstants.numericRegex)],
      totalAssets: [obj?.totalAssets],
      GSTRNumber: [obj?.GSTRNumber, Validators.pattern(AppConstants.gstrReg)],
      grossTurnOverAmount: [obj?.grossTurnOverAmount],
      difference: [obj?.difference || 0],
    });
  }


  calSourcesOfFunds() {
    let totalSourcesOfFunds = 0;
    totalSourcesOfFunds =
      Number(this.assetLiabilitiesForm.controls['membersOwnCapital'].value) +
      Number(this.assetLiabilitiesForm.controls['reservesAndSurplus'].value) +
      Number(this.assetLiabilitiesForm.controls['securedLoans'].value) +
      Number(this.assetLiabilitiesForm.controls['unSecuredLoans'].value) +
      Number(this.assetLiabilitiesForm.controls['advances'].value);
    this.assetLiabilitiesForm.controls['totalSourcesOfFunds'].setValue(totalSourcesOfFunds);
    this.calDifference();

  }

  calculateTotal1() {
    this.total1 = 0;
    this.total1 =
      Number(this.assetLiabilitiesForm.controls['membersOwnCapital'].value) +
      Number(this.assetLiabilitiesForm.controls['securedLoans'].value) +
      Number(this.assetLiabilitiesForm.controls['unSecuredLoans'].value) +
      Number(this.assetLiabilitiesForm.controls['advances'].value) +
      Number(
        this.assetLiabilitiesForm.controls['sundryCreditorsAmount'].value
      ) +
      Number(this.assetLiabilitiesForm.controls['otherLiabilities'].value);
  }


  calculateTotal2() {
    this.total2 = 0;
    this.total2 =
      Number(this.assetLiabilitiesForm.controls['fixedAssets'].value) +
      Number(this.assetLiabilitiesForm.controls['inventories'].value) +
      Number(this.assetLiabilitiesForm.controls['sundryDebtorsAmount'].value) +
      Number(this.assetLiabilitiesForm.controls['balanceWithBank'].value) +
      Number(this.assetLiabilitiesForm.controls['cashInHand'].value) +
      Number(this.assetLiabilitiesForm.controls['loanAndAdvances'].value) +
      Number(this.assetLiabilitiesForm.controls['investment'].value) +
      Number(this.assetLiabilitiesForm.controls['otherAssets'].value);
  }

  getFixedAssetData(data) {
    if (data === 'invalid') {
      this.isDeprecationObjInvalid = true;
    } else {
      this.isDeprecationObjInvalid = false;
      this.fixedAssetData = data;
      this.depreciationObj = this.fixedAssetData.fixedAssetsDetails;
      if (this.depreciationObj.length) {
        this.totalDepNetBlock = 0;
        this.totalNetBlock = 0;
        this.depreciationObj.forEach(element => {
          this.totalDepNetBlock += element.fixedAssetClosingAmount;
          this.totalNetBlock += Number(element.fixedAssetClosingAmount);
        });
        this.totalApplicationOfFunds();
      }
    }
  }

  calTotalLiabilitiesProvision() {
    let totalLiabilitiesProvision = 0;
    totalLiabilitiesProvision = Number(this.assetLiabilitiesForm.controls['sundryCreditorsAmount'].value) + Number(this.assetLiabilitiesForm.controls['otherLiabilities'].value);
    this.assetLiabilitiesForm.controls['totalLiabilitiesProvision'].setValue(totalLiabilitiesProvision);
    this.calNetCurrentAssets();
  }

  calCurrentAssets() {
    let totalCurrentAssets = 0;
    totalCurrentAssets = Number(this.assetLiabilitiesForm.controls['inventories'].value) + Number(this.assetLiabilitiesForm.controls['sundryDebtorsAmount'].value)
      + Number(this.assetLiabilitiesForm.controls['balanceWithBank'].value) + Number(this.assetLiabilitiesForm.controls['cashInHand'].value) + Number(this.assetLiabilitiesForm.controls['otherAssets'].value);
    this.assetLiabilitiesForm.controls['totalCurrentAssets'].setValue(totalCurrentAssets);
    this.calTotalCurrentAssetsLoansAdv();
  }

  calTotalCurrentAssetsLoansAdv() {
    let totalCurrentAssetsLoansAdv = 0;
    totalCurrentAssetsLoansAdv = Number(this.assetLiabilitiesForm.controls['totalCurrentAssets'].value) + Number(this.assetLiabilitiesForm.controls['loanAndAdvances'].value);
    this.assetLiabilitiesForm.controls['totalCurrentAssetsLoansAdv'].setValue(totalCurrentAssetsLoansAdv);
    this.calNetCurrentAssets();
  }

  calNetCurrentAssets() {
    let netCurrentAsset = 0;
    netCurrentAsset = Number(this.assetLiabilitiesForm.controls['totalCurrentAssetsLoansAdv'].value) - Number(this.assetLiabilitiesForm.controls['totalLiabilitiesProvision'].value);
    this.assetLiabilitiesForm.controls['netCurrentAsset'].setValue(netCurrentAsset);
    this.totalApplicationOfFunds();
  }

  totalApplicationOfFunds() {
    this.totalAppOfFunds = 0;
    let totalInvestment = Number(this.assetLiabilitiesForm.controls['longTermInvestment'].value) + Number(this.assetLiabilitiesForm.controls['shortTermInvestment'].value);
    this.assetLiabilitiesForm.controls['investment'].setValue(totalInvestment);
    this.totalAppOfFunds = Number(this.assetLiabilitiesForm.controls['investment'].value) + Number(this.assetLiabilitiesForm.controls['netCurrentAsset'].value);
    if (this.totalDepNetBlock) {
      this.totalAppOfFunds += Number(this.totalDepNetBlock);
    }
    this.calDifference();
  }

  calDifference() {
    let difference = 0;
    difference = Math.round(Number(this.assetLiabilitiesForm.controls['totalSourcesOfFunds'].value) - Number(this.totalAppOfFunds));
    this.assetLiabilitiesForm.controls['difference'].setValue(difference);
  }

  goBack() {
    this.saveAndNext.emit(false);
    this.nextBreadcrumb.emit("Business/Professional Income");
  }

  onContinue() {
    this.assetLiabilitiesForm.controls['fixedAssets'].setValue(Math.round(this.totalNetBlock));
    let valid: boolean = false;
    if (this.assetLiabilitiesForm.valid) {
      valid = true;
    } else {
      this.utilsService.showSnackBar(
        'Please make sure all the details of balance sheet are entered correctly'
      );
    }
    if (this.isDeprecationObjInvalid) {
      this.utilsService.showSnackBar('Please enter the all fixed asset details');
      return;
    }

    if (valid) {
      this.loading = true;
      this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

      if (!this.Copy_ITR_JSON.business) {
        this.Copy_ITR_JSON.business = {
          presumptiveIncomes: [],
          financialParticulars: {
            difference: null,
            id: null,
            grossTurnOverAmount: null,
            membersOwnCapital: null,
            reservesAndSurplus: null,
            securedLoans: null,
            unSecuredLoans: null,
            advances: null,
            sundryCreditorsAmount: null,
            totalLiabilitiesProvision: null,
            totalCurrentAssets: null,
            otherLiabilities: null,
            totalCapitalLiabilities: null,
            fixedAssets: null,
            inventories: null,
            sundryDebtorsAmount: null,
            balanceWithBank: null,
            cashInHand: null,
            loanAndAdvances: null,
            otherAssets: null,
            totalAssets: null,
            investment: null,
            shortTermInvestment: null,
            longTermInvestment: null,
            GSTRNumber: null,
          },
          businessDescription: [],
          fixedAssetsDetails: [],
          profitLossACIncomes: [],
        };
      }

      if (!this.utilsService.isNonEmpty(this.assetLiabilitiesForm.controls['GSTRNumber'].value)) {
        this.assetLiabilitiesForm.controls['GSTRNumber'].setValue(null);
      }
      this.assetLiabilitiesForm.controls['fixedAssets'].setValue(Math.round(this.totalNetBlock));
      this.Copy_ITR_JSON.business.financialParticulars =
        this.assetLiabilitiesForm.value;
      this.Copy_ITR_JSON.business.fixedAssetsDetails = this.depreciationObj;
      this.Copy_ITR_JSON.business.financialParticulars.fixedAssets = this.totalNetBlock;
      console.log(this.Copy_ITR_JSON);
      this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
        (result: any) => {
          this.loading = false;
          this.ITR_JSON = result;
          sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
          this.utilsService.showSnackBar(
            'Balance Sheet income added successfully'
          );
          console.log('Balance Sheet=', result);
          this.utilsService.smoothScrollToTop();
          this.saveAndNext.emit(true);
          this.nextBreadcrumb.emit("Business/Professional Income");
        },
        (error) => {
          this.loading = false;
          this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
          this.utilsService.showSnackBar(
            'Failed to add Balance Sheet income, please try again.'
          );
          this.utilsService.smoothScrollToTop();
        }
      );
    } else {
      if (this.assetLiabilitiesForm?.controls['difference']?.value !== 0) {
        this.utilsService.showSnackBar(
          'Please make sure the difference is not more than 0'
        );
      }
      $('input.ng-invalid').first().focus();
    }
  }
}
