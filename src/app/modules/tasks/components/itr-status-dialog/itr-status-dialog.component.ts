import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { DatePipe } from '@angular/common';
import { UntypedFormControl, Validators } from '@angular/forms';
import { AppConstants } from 'src/app/modules/shared/constants';
import * as moment from 'moment';
import { MatStepper } from '@angular/material/stepper';
@Component({
  selector: 'app-itr-status-dialog',
  templateUrl: './itr-status-dialog.component.html',
  styleUrls: ['./itr-status-dialog.component.scss']
})
export class ItrStatusDialogComponent implements OnInit {
  @ViewChild('stepper') stepper: MatStepper;
  allIncomeSources = [
    { key: 'Salary', value: 'SALARY', selected: false },
    { key: 'House Property', value: 'HOUSE_PROPERTY', selected: false },
    { key: 'Capital Gain', value: 'CAPITAL_GAINS', selected: false },
    { key: 'Business & Profession', value: 'BUSINESS_AND_PROFESSION', selected: false },
    { key: 'Foreign Income / NRI / EXPAT', value: 'FOREIGN_INCOME_NRI_EXPAT', selected: false },
    { key: ' Futures & Options', value: 'FUTURE_AND_OPTIONS', selected: false },
    { key: 'Cryptocurrency', value: 'CRYPTOCURRENCY', selected: false }
  ];
  loading = false;
  noOFDueDays: number;
  progressPerCentage: number;
  activeIndex: number = 0;
  showTPANavigation: boolean;
  assessmentYear: any;
  cloudFinancialYear: any;
  currentFinancialYear: string;
  isEditPan: boolean;
  isEditIncomeSources: boolean;
  showSubmitBtn: boolean;
  paymentCustomAttributes: any;
  isInsuranceOpted: UntypedFormControl;
  panNumber: UntypedFormControl;
  showConfirmUploadBtn: boolean;
  itrFiledStatusData: any;
  refundProcessData: any = [];
  showRefundNote: any;
  itrLifeCycleSummaryList: any = [];
  itrFilingDueDate: any;
  draftSummaryDocDetails: any;
  invoiceDetails: any;
  ITRSummaryDocDetails: any;
  addClients = 0;
  fetchPrefill = 0;
  dateOfBirth: any;
  eligiblePlan: any;
  subscriptionAssigneeId: any;
  options: { key: string; currency: string; email: any; contact: any; name: string; order_id: any; prefill: { name: string; email: any; contact: any; }; handler: (response: any) => void; modal: { ondismiss: () => void; }; };
  uploadDoc: File;
  transactionId: any;
  viewer = 'DOC';
  docUrl = '';
  validateAcOtp: UntypedFormControl;
  validateFpOtp: UntypedFormControl;
  adharOtp: UntypedFormControl;
  bankEvc: UntypedFormControl;
  dematEvc: UntypedFormControl;
  counter = 15;
  showNextOpt: any;
  showAdharEriOtp: boolean;
  showBankEvcEriOtp: boolean;
  showDematEvcEriOtp: boolean;
  showDueDate: boolean;
  showLastFilingDate: boolean;
  selectedPlanId: any;
  userSelectedPlan: any;

  constructor(
    public dialogRef: MatDialogRef<ItrStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private itrMsService: ItrMsService,
    public utilsService: UtilsService
  ) {
    this.panNumber = new UntypedFormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern(AppConstants.panNumberRegex)]);
    this.isInsuranceOpted = new UntypedFormControl('true')
  }

  ngOnInit() {

    this.loading = false;
    this.getAssessmentYear();
    this.getDueDateDetails();
  }

  getAssessmentYear() {
    let param = '/getCurrentAY';
    this.itrMsService.getMethod(param).subscribe((response: any) => {
      if (response) {
        sessionStorage.setItem('currentYearDetails', JSON.stringify(response));
        this.assessmentYear = response.currentAssessmentYear;
        this.cloudFinancialYear = response.cloudFinancialYear;
        this.getItrLifeCycleStatus();
      }
    }, error => {
      this.calculateAssessmentYear();
    });
  }

  calculateAssessmentYear() {
    let datePipe = new DatePipe('en-IN');
    let formattedDate = datePipe.transform(new Date(), 'yyyy-MM-dd');
    let date1 = new Date(formattedDate);
    let date2 = new Date(date1.getFullYear() + "-03-31");
    if (date1.getTime() > date2.getTime()) {
      this.assessmentYear = (date1.getFullYear()) + '-' + (date1.getFullYear() + 1);
      this.currentFinancialYear = (date1.getFullYear() - 1) + '-' + (date1.getFullYear());
      this.cloudFinancialYear = (date1.getFullYear() - 1) + '-' + (date1.getFullYear()).toString().substr(-2);
    } else {
      this.assessmentYear = (date1.getFullYear() - 1) + '-' + (date1.getFullYear());
      this.currentFinancialYear = (date1.getFullYear() - 2) + '-' + (date1.getFullYear() - 1);
      this.cloudFinancialYear = (date1.getFullYear() - 2) + '-' + (date1.getFullYear() - 1).toString().substr(-2);
    }
    const response = {
      "id": null,
      "filingEndDate": null,
      "filingExtendEndDate": null,
      "assessmentYear": null,
      "cgQuarter": null,
      "isLateFiling": null,
      "isExtendedDateOver": null,
      "currentAssessmentYear": this.assessmentYear,
      "currentFinancialYear": this.currentFinancialYear,
      "cloudFinancialYear": this.cloudFinancialYear
    }
    sessionStorage.setItem('currentYearDetails', JSON.stringify(response));
    this.getItrLifeCycleStatus();
  }

  getDueDateDetails() {
    let param = '/due-date';
    this.itrMsService.getMethod(param).subscribe((response: any) => {
      if (response.success) {
        this.itrFilingDueDate = moment(response.data.itrFilingDueDate).format('DD-MM-YYYY');
        let currentDate = moment(new Date()).format("MM/DD/YYYY");
        let itrFilingDueDate = moment(response.data.itrFilingDueDate);
        let lateItrFilingDueDate = moment(response.data.lateItrFilingDueDate);
        if (itrFilingDueDate > moment(new Date())) {
          this.showDueDate = true;
          this.noOFDueDays = itrFilingDueDate.diff(currentDate, 'days');
        } else if (lateItrFilingDueDate > moment(new Date())) {
          this.showLastFilingDate = true;
          this.noOFDueDays = lateItrFilingDueDate.diff(currentDate, 'days');
        } else if ((moment(response.data.itrFilingDueDate).format("MM/DD/YYYY") === currentDate) || (moment(response.data.lateItrFilingDueDate).format("MM/DD/YYYY") === currentDate)) {
          this.noOFDueDays = 1;
        }
        sessionStorage.setItem('itrFilingDueDate', this.itrFilingDueDate);
      } else {
        this.loading = false;
        this.utilsService.showSnackBar(response.message);
      }
    },
      error => {
        console.log('error ==> ', error)
        this.loading = false;
        this.utilsService.showSnackBar('Failed to get ITR Due Date');
      });
  }

  getItrLifeCycleStatus() {
    this.loading = true;
    let param = '/life-cycle-status?userId=' + this.data.userId + '&assessmentYear=' + this.assessmentYear + '&serviceType=' + this.data?.userInfo?.serviceType;
    this.itrMsService.getItrLifeCycle(param).subscribe((response: any) => {
      if (response.success) {
        this.loading = false
        this.sortingLifeCycleObject(response);
      } else {
        this.loading = false
        this.utilsService.showSnackBar(response.message);
      }
    },
      error => {
        console.log('error ==> ', error)
        this.loading = false
        this.utilsService.showSnackBar('Failed to Save the ITR Details');

      });

  }

  sortingLifeCycleObject(response) {
    this.isEditPan = response.data?.addClient?.taskStatus === 'Completed';
    this.isEditIncomeSources = response.data?.planSelection?.taskStatus === 'Completed';
    if (response.data?.planSelection?.customAttributes) {
      this.selectedPlanId = response.data?.planSelection?.customAttributes.planId;
      this.isInsuranceOpted.setValue(response.data?.planSelection?.customAttributes?.isInsuranceOpted);
    } else {
      this.isInsuranceOpted.setValue(true);
    }
    this.paymentCustomAttributes = response.data?.paymentCompletion?.customAttributes;
    if (response.data?.documentsUploaded?.uiAction === 'Editable' || response.data?.documentsUploaded?.taskStatus === 'InProgress') {
      this.showConfirmUploadBtn = response.data?.documentsUploaded?.customAttributes?.documents.filter(element => element.isDocumentUploaded).length > 0;
    }
    if (response.data?.addPan?.customAttributes) {
      this.panNumber.setValue(response.data?.addPan?.customAttributes?.panNumber);
    }
    if (response.data?.userApprovalCompSummary?.uiAction === 'Editable' || response.data?.userApprovalCompSummary?.taskStatus === 'InProgress') {
      this.fetchDraftSummary();
    }
    if (response.data?.paymentCompletion?.customAttributes?.paymentId) {
      this.fetchInvoice();
    }
    if (response.data?.userApprovalItrSummary?.uiAction === 'Editable' || response.data?.userApprovalItrSummary?.taskStatus === 'InProgress') {
      this.fetchITRSummary();
    }

    if (response.data.itrFiledStatus.taskStatus === 'Completed') {
      this.itrFiledStatusData = response?.data?.itrFiledStatus?.customAttributes;
      this.showTPANavigation = true;
    }
    if (response.data.itrRefundStatus.customAttributes) {
      this.refundProcessData = response?.data?.itrRefundStatus?.customAttributes?.itrLifecycle;
      this.showRefundNote = this.refundProcessData?.filter(element => element.statusDesc != 'Refund issued');
    }
    const data = response.data;
    this.showSelectedSources(data.addIncomeSources);
    const sorted = Object.values(data).sort((a, b) => a['taskNumber'] - b['taskNumber']);
    this.itrLifeCycleSummaryList = sorted.reduce((agg: any, curr) => {

      if (curr['showTaskGroupOnUI'] && curr['uiAction'] != 'NotRequired') {
        let found = agg.find((x) => x.taskGroupName === curr['taskGroupName']);
        if (found) {
          found.data.push(curr);
          found.showTaskGroupOnUI = found.data.filter(element => element.showTaskGroupOnUI).length > 0;
        }
        else {
          agg.push({
            taskGroupName: curr['taskGroupName'],
            taskGroupTitle: curr['taskGroupTitle'],
            showTaskGroupOnUI: curr['showTaskGroupOnUI'],
            data: [curr]
          });
        }
      }
      return agg;


    }, []);
    this.calculateProgress(this.itrLifeCycleSummaryList);
    sessionStorage.setItem('ITR_LIFECYCLE_SUMMARY_LIST', JSON.stringify(this.itrLifeCycleSummaryList));
    setTimeout(() => {
      this?.itrLifeCycleSummaryList?.some((element, index) => {
        element.completed = true;
        this.activeIndex = index;
        this.stepper.selectedIndex = this.activeIndex;
        let lastStepObj = element.data[element.data.length - 1];

        if ((lastStepObj.taskStatus === 'Pending' && lastStepObj.uiAction === 'ReadOnly') ||
          (lastStepObj.taskStatus === 'InProgress' && lastStepObj.uiAction === 'Editable'))
          return true
      });
      this.itrLifeCycleSummaryList[this.activeIndex].completed = false;
      this.stepper.selectedIndex = this.activeIndex;
      this.stepper.selected.editable = true;

    })
  }

  calculateProgress(itrLifeCycleSummaryList) {
    let noOfTotalTask = 0;
    let noOfCompletedTask = 0;
    itrLifeCycleSummaryList.forEach(element => {
      element.data.forEach(item => {
        noOfTotalTask++;
        if (item.taskStatus === 'Completed') {
          noOfCompletedTask++;
        }
      });
    });
    this.progressPerCentage = Math.round((noOfCompletedTask / noOfTotalTask) * 100);
  }

  showSelectedSources(item) {
    if (item.customAttributes?.userSelectedIncomeSources.length > 0) {
      this.allIncomeSources.forEach(type => {
        item.customAttributes?.userSelectedIncomeSources.forEach(element => {
          if (type.value == element) {
            type.selected = true;
          }
        });
      })
    }
    this.getPlanDetails();
  }

  fetchDraftSummary() {
    const param = `/v1/cloud/signed-s3-url?userId=${this.data.userId}&documentTag=DRAFT_SUMMARY`;
    this.itrMsService.getMethod(param).subscribe((result: any) => {
      this.draftSummaryDocDetails = result?.data;
    })
  }

  fetchInvoice() {
    const param = `/v1/cloud/signed-s3-url?userId=${this.data.userId}&documentTag=INVOICE`;
    this.itrMsService.getMethod(param).subscribe((result: any) => {
      this.invoiceDetails = result?.data;
    })
  }

  fetchITRSummary() {
    const param = `/v1/cloud/signed-s3-url?userId=${this.data.userId}&documentTag=ITR_SUMMARY`;
    this.itrMsService.getMethod(param).subscribe((result: any) => {
      this.ITRSummaryDocDetails = result?.data;
    })
  }

  getPlanDetails() {
    let userSelectedIncomeSources = [];
    this.allIncomeSources.forEach(type => {
      if (type.selected) {
        userSelectedIncomeSources.push(type.value);
      }
    });
    this.loading = true;
    let param = '/plans-master?serviceType=ITR&userId=' + this.data.userId;
    this.itrMsService.getMethod(param).subscribe((response: any) => {
      this.eligiblePlan = response;
      if (this.eligiblePlan.length) {
        this.userSelectedPlan = this.eligiblePlan.filter(item => item.planId === this.selectedPlanId);
      }
    },
      error => {
        this.loading = false;
        this.utilsService.showSnackBar('Failed to get selected plan details');
      });
  }

  close() {
    this.dialogRef.close();
  }
}
