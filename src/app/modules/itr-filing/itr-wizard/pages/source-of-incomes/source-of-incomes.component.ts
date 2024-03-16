import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { sortBy } from 'lodash';
import { Schedules } from '../../../../shared/interfaces/schedules';
import { AppConstants } from '../../../../shared/constants';
import { ITR_JSON } from '../../../../shared/interfaces/itr-input.interface';
import { UtilsService } from '../../../../../services/utils.service';
import { ItrMsService } from '../../../../../services/itr-ms.service';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ConfirmDialogComponent } from 'src/app/modules/shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-source-of-incomes',
  templateUrl: './source-of-incomes.component.html',
  styleUrls: ['./source-of-incomes.component.scss'],
})
export class SourceOfIncomesComponent implements OnInit {
  sourcesList = [];
  ITR_JSON: ITR_JSON;
  eriClientValidUpto: any;
  prefillIncomeSources: any;
  userSelectedSources: any;
  dialogRef: any;

  @Output() scheduleSelected: EventEmitter<any> = new EventEmitter();

  constructor(
    private schedules: Schedules,
    private utilsService: UtilsService,
    private itrMsService: ItrMsService,
    private dialog: MatDialog
  ) {}
  ngOnInit(): void {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));

    this.getPrefillIncomeSources();
    this.utilsService
      .getUserProfile(this.ITR_JSON.userId)
      .then((result: any) => {
        console.log(result);
        this.eriClientValidUpto = result.eriClientValidUpto;
      });

    let incomeSources = JSON.parse(sessionStorage.getItem('incomeSources'));

    if (!incomeSources) {
      this.sourcesList = [
        {
          name: 'Salary',
          selected:
            this.ITR_JSON.employers != null &&
            this.ITR_JSON.employers.length > 0
              ? true
              : false,
          schedule: this.schedules.SALARY,
        },
        {
          name: 'House Property',
          selected:
            this.ITR_JSON.houseProperties != null &&
            this.ITR_JSON.houseProperties.length > 0
              ? true
              : false,
          schedule: this.schedules.HOUSE_PROPERTY,
        },
        {
          name: 'B&P Presumptive',
          selected:
            this.ITR_JSON.business != null &&
            this.ITR_JSON.business.presumptiveIncomes?.length > 0
              ? true
              : false,
          schedule: this.schedules.BUSINESS_INCOME,
        },
        {
          name: 'Capital Gain',
          selected:
            this.ITR_JSON.capitalGain != null &&
            this.ITR_JSON.capitalGain.length > 0
              ? true
              : false,
          schedule: this.schedules.CAPITAL_GAIN,
        },
        {
          name: 'F&O Business',
          selected:
            this.ITR_JSON.business?.profitLossACIncomes != null &&
            this.ITR_JSON.business?.profitLossACIncomes?.length > 0
              ? true
              : false,
          schedule: this.schedules.SPECULATIVE_INCOME,
        },
        {
          name: 'Crypto',
          selected:
            this.ITR_JSON.capitalGain?.filter(item=> item?.assetType === 'VDA') !== null &&
            this.ITR_JSON.capitalGain?.filter(item=> item?.assetType === 'VDA').length > 0
              ? true
              : false,
          schedule: this.schedules.CRYPTO_VDA,
        },
        {
          name: 'Foreign Income',
          selected: this.hasForeignIncome(),
          schedule: this.schedules.FOREIGN_INCOME,
        },
      ];
      sessionStorage.setItem('incomeSources', JSON.stringify(this.sourcesList));
    } else {
      this.sourcesList = incomeSources;
    }
    if(this.ITR_JSON.residentialStatus === 'NON_RESIDENT'){
      this.sourcesList = this.sourcesList.filter(item=>item.schedule !== this.schedules.FOREIGN_INCOME);
    }
    this.sourcesList.forEach((source) => {
      if (source.selected) {
        let event = {
          schedule: source,
          sources: this.sourcesList,
        };
        this.scheduleSelected.emit(event);
      }
    });
  }

  hasForeignIncome() {
    if (this.ITR_JSON.foreignIncome && this.ITR_JSON.foreignIncome != null) {
      let assets = this.ITR_JSON.foreignIncome.foreignAssets;
      let relief = this.ITR_JSON.foreignIncome.taxReliefClaimed;
      let isForeignIncome = false;
      relief?.forEach(r => {
        r.headOfIncome.forEach(income =>{
          let testIncome = income.outsideIncome > 0 || income.outsideTaxPaid > 0;
          if(testIncome === true) {
            isForeignIncome = true;
            return;
          }
        });
        if(isForeignIncome === true){
          return;
        }
      });
      return assets.capitalAssetsDetails?.length > 0 ||
        assets.otherIncomeDetails?.length > 0 ||
        assets.trustsDetails?.length ||
        assets.cashValueInsurance?.length > 0 ||
        assets.custodialAccounts?.length > 0 ||
        assets.depositoryAccounts?.length > 0 ||
        assets.equityAndDebtInterest?.length > 0 ||
        assets.financialInterestDetails?.length > 0 ||
        assets.immovablePropertryDetails?.length > 0 ||
        assets.signingAuthorityDetails?.length > 0 || isForeignIncome;
    } else {
      return false;
    }
  }

  arrayContains(array, schedule) {
    return array?.indexOf(this.schedules.getKey(schedule)) > -1;
  }

  sourcesUpdated(source) {
    let clickedSource = this.sourcesList.filter(
      (item) => item.name === source.name
    )[0];
    clickedSource.selected = !clickedSource.selected;

    if(!clickedSource.selected){
      this.dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Warning!!',
          message: `Do you want to deselect Income source ${clickedSource.name} ?`,
          isHide: true,
          showActions: true
        },
        disableClose: true,
        // panelClass: 'reloadWindowPopup'
      });      
      this.dialogRef.afterClosed().subscribe(result => {
        if(result === 'YES'){
          //clear data for the income source
          switch(clickedSource.schedule){
            case this.schedules.SALARY:
            {
              this.ITR_JSON.employers = null;
              break;
            }
            case this.schedules.HOUSE_PROPERTY: 
            {
              this.ITR_JSON.houseProperties = null;
              break;
            }
            case this.schedules.BUSINESS_INCOME:
            {
              this.ITR_JSON.business = {
                presumptiveIncomes: [],
                financialParticulars: {
                  difference: null,
                  id: null,
                  grossTurnOverAmount: null,
                  membersOwnCapital: null,
                  securedLoans: null,
                  unSecuredLoans: null,
                  advances: null,
                  sundryCreditorsAmount: null,
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
                  GSTRNumber: null,
                },
                businessDescription: [],
                fixedAssetsDetails: [],
                profitLossACIncomes: [],
              };
              break;
            }
            case this.schedules.CAPITAL_GAIN:
            {
              this.ITR_JSON.capitalGain = null;
              break;
            }
            case this.schedules.SPECULATIVE_INCOME:
            {
              this.ITR_JSON.business.businessDescription = null;
              this.ITR_JSON.business.profitLossACIncomes = null;
              break;
            }
            case this.schedules.CRYPTO_VDA:
            {
              this.ITR_JSON.capitalGain = this.ITR_JSON.capitalGain.filter(item=> item?.assetType !== 'VDA');
              break;
            }
            case this.schedules.FOREIGN_INCOME:
            {
              this.ITR_JSON.foreignIncome = null;
              break;
            }
          }
          sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
          //show popup
          this.utilsService.showSnackBar("Data for " + clickedSource.name + " will be deleted");
        } else{
          clickedSource.selected = true;
        }
      });
      
    }

    let event = {
      schedule: clickedSource,
      sources: this.sourcesList,
    };
    this.scheduleSelected.emit(event);
    sessionStorage.setItem('incomeSources', JSON.stringify(this.sourcesList));
  }

  private getPrefillIncomeSources() {
    const param = `/income-sources?userId=${this.ITR_JSON.userId}&assessmentYear=${this.ITR_JSON.assessmentYear}`;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      this.prefillIncomeSources = res.prefillIncomeSources;
      this.userSelectedSources = res.userSelectedSources;
    });
  }
}
