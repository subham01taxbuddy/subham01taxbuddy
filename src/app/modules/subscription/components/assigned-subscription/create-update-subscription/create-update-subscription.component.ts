import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { AppConstants } from 'src/app/modules/shared/constants';
import { map, Observable, startWith } from 'rxjs';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/modules/shared/components/confirm-dialog/confirm-dialog.component';
import { ReportService } from 'src/app/services/report-service';
import { ActivatedRoute, Router } from '@angular/router';
declare function we_track(key: string, value: any);

@Component({
  selector: 'app-create-update-subscription',
  templateUrl: './create-update-subscription.component.html',
  styleUrls: ['./create-update-subscription.component.scss'],
})
export class CreateUpdateSubscriptionComponent implements OnInit, OnDestroy, AfterViewInit {
  searchedPromoCode = new FormControl('', Validators.required);
  filteredOptions!: Observable<any[]>;
  serviceDetails = [];
  service: string;
  serviceDetail: string = '';
  defaultFinancialYear: string;
  selectedPlanInfo: any;
  invoiceForm: FormGroup;
  financialYear = AppConstants.subscriptionFyList;
  loading!: boolean;
  userSubscription: any;
  sourcesList = [];
  subscriptionObj: userInfo;
  createSubscriptionObj: userInfo;
  smeSelectedPlanId: any;
  couponCodeAmount = 0;
  selectedCouponCodeSubscriptionIds: number[] = [];
  removeCouponCodeFlag: boolean = false;
  couponCodeAppliedFlag: boolean = false;
  loggedInSme: any;
  allPlans: any;
  availableCouponCodes: any[] = [];
  maxEndDate: any;
  selectedPromoCode = '';
  appliedPromo: any;
  allPromoCodes: any[] = [];
  promoCodeInfo: any;
  serviceType = '';
  selectedUserInfo: any;
  scheduleCallPay = new FormControl('', []);
  tpaPaid = new FormControl('', []);
  noOfMonths = new FormControl('', []);
  subStartDate = new FormControl(new Date(), [Validators.required]);
  subEndDate = new FormControl(new Date('Mar 31, 2023'), [Validators.required]);
  gstType = new FormControl('', []);
  frequency = new FormControl('', []);
  subscriptionAssigneeId = new FormControl('');
  finalPricing = {
    basePrice: null,
    cgst: null,
    sgst: null,
    igst: null,
    totalTax: null,
    totalAmount: null,
  };
  subscriptionObjType: any;
  isButtonDisable: boolean;
  AssessmentYear: string;
  dialogRef: any;

  gstTypesMaster = AppConstants.gstTypesMaster;
  stateDropdown = AppConstants.stateDropdown;
  frequencyTypesMaster: any = [
    { label: 'Monthly', value: 'MONTHLY' },
    { label: 'Quarterly', value: 'QUARTERLY' },
  ];
  roles: any;
  subType: string;
  invoiceAmount: any;
  smeDetails: any;
  showMessage = '';
  serviceEligibility: any;
  assignedFilerId: any;
  refundInvoiceDetails: any;
  selectedITRUFy: any =[];
  partnerType:any;
  scheduledCallServiceTypes =[
    {
      label: 'ITR',
      value: 'ITR',
    },
    {
      label: 'GST',
      value: 'GST',
    },
    {
      label: 'NOTICE',
      value: 'NOTICE',
    },
    {
      label: 'TPA',
      value: 'TPA',
    },
  ]
  showScheduledFields:boolean =false;

  constructor(
    private fb: FormBuilder,
    public utilsService: UtilsService,
    private itrService: ItrMsService,
    private userService: UserMsService,
    private toastMessage: ToastMessageService,
    public location: Location,
    private dialog: MatDialog,
    private reportService: ReportService,
    private route: ActivatedRoute,
    private router:Router
  ) {
    this.roles = this.utilsService.getUserRoles();
    this.loggedInSme = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
    this.partnerType = this.utilsService.getPartnerType();
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.onPersonalInfoFormChanges();
      this.onOtherInfoFormChange();
    }, 7000);
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.assignedFilerId = params['assignedFilerId'];
      console.log('Filer ID:', this.assignedFilerId);
    });
    this.getAllPromoCode();
    this.subType = (this.subscriptionObjType = JSON.parse(
      sessionStorage.getItem('subscriptionObject')
    )?.type);

    // if (this.subType !== 'edit') {
    //   this.isButtonDisable = false;
    // } else {
    //   this.isButtonDisable = true;
    // }

    if (this.roles?.includes('ROLE_FILER') || this.assignedFilerId) {
      this.getSmeDetail();
    }

    this.filteredOptions = this.searchedPromoCode.valueChanges.pipe(
      startWith(''),
      map((value) => {
        return value;
      }),
      map((code) => {
        return code ? this._filter(code) : this.allPromoCodes.slice();
      })
    );

    this.createSubscriptionObj = JSON.parse(
      sessionStorage.getItem('createSubscriptionObject')
    )?.data;

    if (!this.createSubscriptionObj) {
      this.subscriptionObj = JSON.parse(
        sessionStorage.getItem('subscriptionObject')
      )?.data;
      if (this.subscriptionObj?.['invoiceAmount']) {
        this.invoiceAmount = this.subscriptionObj['invoiceAmount'];
      }
    } else {
      this.subscriptionObj = this.createSubscriptionObj;
      this.userSubscription = this.createSubscriptionObj;
      this.getRefundProcessedInvoices();
      this.serviceType =
        this.createSubscriptionObj?.smeSelectedPlan?.servicesType;
      this.smeSelectedPlanId =
        this?.createSubscriptionObj?.smeSelectedPlan?.planId;
      this.gstUserInfoByUserId(this.subscriptionObj.userId);
      this.setFinalPricing();
    }

    this.setAvailableCouponCodes();

    if (this.subscriptionObj != null) {
      this.personalInfoForm.patchValue(this.subscriptionObj);
      if (this.subscriptionObj.subscriptionId !== 0) {
        this.getUserPlanInfo(this.subscriptionObj?.subscriptionId);
      } else {
        this.getFy();
      }
    }

    this.getAllPlanInfo(this.serviceType);
    this.getLeaderFilerName();
    this.setFormValues(this.selectedUserInfo);
    this.isButtonDisable = true;
    if(this.serviceType === 'ITR')
      this.defaultFinancialYear = this.financialYear[0].financialYear;

    if(this.smeSelectedPlanId === 120){
      this.showScheduledFields =true;
    }
  }

  printValue(){
    console.log(this.selectedCouponCodeSubscriptionIds, "subscriptionCouponCode")
  }

  setAvailableCouponCodes(){
    let param = '/bo/subscription/coupon-code?userId='+this.subscriptionObj.userId+'&isCouponCodeAvailable=true';
    this.reportService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      if (response.success && response.data.length > 0)
            this.availableCouponCodes = response.data;

      console.log(this.availableCouponCodes, "this.availableCouponCodes")

    });
  }

  setExistingCouponCode(){
    const couponCodeDetails = this.userSubscription?.concessionsApplied?.filter(item => item.title === 'Coupon Code');
    if(couponCodeDetails?.length > 0) {
      couponCodeDetails.forEach(couponCodeDetail => {
        if(!this.availableCouponCodes.some(cd => cd.couponCodeSubscriptionId === couponCodeDetail?.subscriptionId)){
          this.availableCouponCodes.push({
            couponCodeSubscriptionId: couponCodeDetail?.subscriptionId,
            amount: couponCodeDetail.amount,
            name: couponCodeDetail.planName
          });
        }
      });
      this.selectedCouponCodeSubscriptionIds = couponCodeDetails?.map(item=>item.subscriptionId);
      this.couponCodeAppliedFlag = true;
      this.couponCodeAmount = couponCodeDetails?.reduce((total, element)=>total+element.amount, 0);
    } else {
      this.selectedCouponCodeSubscriptionIds = [];
      this.couponCodeAppliedFlag = false;
      this.couponCodeAmount = 0;
    }
  }

  applyCouponCode(selectedPlan) {
    this.smeSelectedPlanId = selectedPlan;
    this.removeCouponCodeFlag = false;
    if(this.selectedCouponCodeSubscriptionIds?.length === 0)
      this.removeCouponCodeFlag = true;

    this.couponCodeAppliedFlag = true;

    const param = `/subscription/recalculate`;
    const request = {
      userId: this.userSubscription.userId,
      planId: selectedPlan,
      selectedBy: 'SME',
      smeUserId: this?.loggedInSme[0]?.userId,
      subscriptionId: this.userSubscription.subscriptionId,
      promoCode: this.selectedPromoCode,
      removePromoCode: this.isPromoRemoved,
      removeCouponCode: this.removeCouponCodeFlag,
      couponCodeSubscriptionIds: this.selectedCouponCodeSubscriptionIds
    };
    this.itrService.postMethod(param, request).subscribe((res: any) => {
      this.appliedPromo = res.promoCode;
      if (res['Error']) {
        this.utilsService.showSnackBar(res['Error']);
        return;
      }
      this.userSubscription = res;
      this.getRefundProcessedInvoices();
      this.setFinalPricing();
      this.setExistingCouponCode();
      this.utilsService.showSnackBar(
        `Coupon Code applied successfully!`
      );
    });
  }

  removeCouponCode(selectedPlan) {
    this.smeSelectedPlanId = selectedPlan;
    this.removeCouponCodeFlag = true;
    this.couponCodeAppliedFlag = false;
    const param = `/subscription/recalculate`;
    const request = {
      userId: this.userSubscription.userId,
      planId: selectedPlan,
      selectedBy: 'SME',
      smeUserId: this?.loggedInSme[0]?.userId,
      subscriptionId: this.userSubscription.subscriptionId,
      removePromoCode: this.isPromoRemoved,
      removeCouponCode: this.removeCouponCodeFlag,
      promoCode: this.selectedPromoCode,
    };

    this.itrService.postMethod(param, request).subscribe((res: any) => {
      this.appliedPromo = res.promoCode;
      if (res['Error']) {
        this.utilsService.showSnackBar(res['Error']);
        return;
      }
      this.userSubscription = res;
      this.getRefundProcessedInvoices();
      this.setFinalPricing();
      this.setExistingCouponCode();
      this.utilsService.showSnackBar(
        `Coupon Code removed successfully!`
      );
    });
  }

  addPromoMaxValidation(event) {
    this.allPromoCodes.forEach(element => {
      if (element.title === event.option.value) {
        if (element.discountType === 'AMOUNT' && element.discountAmount > this.userSubscription?.smeSelectedPlan?.totalAmount) {
          this.searchedPromoCode.setErrors({ maxError: true });
        }
      }
    });
  }

  displayFn(label: any) {
    return label ? label : undefined;
  }

  _filter(title: any) {
    const filterValue = title.toLowerCase();
    return this.allPromoCodes.filter(
      (option) => option.title.toLowerCase().indexOf(filterValue) === 0
    );
  }

  getSmeDetail() {
    // https://dev-api.taxbuddy.com/report/bo/sme-details-new/3000'
    let loggedInSmeUserId = this.loggedInSme[0]?.userId;
    let userId;
    if (this.assignedFilerId) {
      userId = this.assignedFilerId;
    } else {
      userId = loggedInSmeUserId;
    }
    let param = `/bo/sme-details-new/${userId}`
    this.reportService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      if (response.success) {
        this.smeDetails = response.data[0];
        if (this.roles.includes('ROLE_ADMIN') || this.roles.includes('ROLE_LEADER')) {
          if (this.assignedFilerId && (this.serviceType === 'ITR' ||this.serviceType === 'ITRU' )) {
            this.showMessage = 'Filer is not eligible for the disabled plans. Please give plan capability and then try or reassign the user.'
          }
        } else if (this.roles.includes('ROLE_FILER')) {
          this.showMessage = 'Disabled plans are not available in your eligibility please contact with your leader'
        }
      }
    })
  }

  getCodeFromLabelOnBlur() {
    if (
      this.utilsService.isNonEmpty(this.searchedPromoCode.value) &&
      this.utilsService.isNonEmpty(this.searchedPromoCode.value)
    ) {
      let pCode = this.allPromoCodes.filter(
        (item: any) =>
          item.title.toLowerCase() ===
          this.searchedPromoCode.value.toLowerCase()
      );
      if (pCode.length !== 0) {
        this.selectedPromoCode = pCode[0].code;
      } else {
        this.searchedPromoCode.setErrors({ invalid: true });
      }
    }
  }

  async updateDataByPincode() {
    await this.utilsService
      .getPincodeData(this.personalInfoForm.controls['pin'])
      .then((result) => {
        this.city.setValue(result.city);
        this.state.setValue(result.stateCode);
        this.updateIgstFlag();
      });
  }

  maskMobileNumber(originalMobileNumber: string): string {
    if (originalMobileNumber && originalMobileNumber.length) {
      let maskedNo = 'X'.repeat(originalMobileNumber.length);
      return maskedNo
    }
    return originalMobileNumber;
  }

  unMaskedMobileNo: any;

  setFormValues(data) {
    this.userName.setValue(data?.fName + ' ' + data?.lName);
    this.unMaskedMobileNo = data?.mobileNumber
    if (this.roles.includes('ROLE_ADMIN') || this.roles.includes('ROLE_LEADER')) {
      this.mobileNumber.setValue(data?.mobileNumber);
    } else {
      this.mobileNumber.setValue(this.maskMobileNumber(data?.mobileNumber));
    }
    this.emailAddress.setValue(data?.emailAddress);
    this.pin.setValue(data?.address[0]?.pinCode);
    this.state.setValue(data?.address[0]?.state);
    this.city.setValue(data?.address[0]?.city);
    this.zipcode.setValue(data?.address[0]?.pinCode);
  }

  sourcesUpdated(source) {
    let clickedSource = this.sourcesList.filter(
      (item) => item.name === source.name
    )[0];
    clickedSource.selected = !clickedSource.selected;

    let event = {
      schedule: clickedSource,
      sources: this.sourcesList,
    };
    console.log('updated source:', this.sourcesList);
    this.getAllPlanInfo(this?.userSubscription?.userSelectedPlan?.servicesType);
  }

  personalInfoForm: FormGroup = this.fb.group({
    userName: new FormControl(''),
    mobileNumber: new FormControl(''),
    emailAddress: new FormControl(''),
    gstNo: new FormControl(''),
    reminderMobileNumber: new FormControl(''),
    reminderEmail: new FormControl(''),
    pin: new FormControl(
      '',
      Validators.compose([
        Validators.maxLength(6),
        Validators.pattern(AppConstants.PINCode),
      ])
    ),
    state: new FormControl(''),
    city: new FormControl(''),
    zipcode: new FormControl(''),
    filerName: new FormControl(''),
    assessmentYear: new FormControl(''),
    leaderName: new FormControl(''),
  });

  get mobileNumber() {
    return this.personalInfoForm.controls['mobileNumber'] as FormControl;
  }
  get userName() {
    return this.personalInfoForm.controls['userName'] as FormControl;
  }
  get emailAddress() {
    return this.personalInfoForm.controls['emailAddress'] as FormControl;
  }
  get gstNo() {
    return this.personalInfoForm.controls['gstNo'] as FormControl;
  }
  get reminderMobileNumber() {
    return this.personalInfoForm.controls[
      'reminderMobileNumber'
    ] as FormControl;
  }
  get reminderEmail() {
    return this.personalInfoForm.controls['reminderEmail'] as FormControl;
  }
  get pin() {
    return this.personalInfoForm.controls['pin'] as FormControl;
  }
  get state() {
    return this.personalInfoForm.controls['state'] as FormControl;
  }
  get city() {
    return this.personalInfoForm.controls['city'] as FormControl;
  }
  get zipcode() {
    return this.personalInfoForm.controls['zipcode'] as FormControl;
  }

  get filerName() {
    return this.personalInfoForm.controls['filerName'] as FormControl;
  }
  get assessmentYear() {
    return this.personalInfoForm.controls['assessmentYear'] as FormControl;
  }

  get leaderName() {
    return this.personalInfoForm.controls['leaderName'] as FormControl;
  }

  otherInfoForm: FormGroup = this.fb.group({
    sacNumber: new FormControl('998232'),
    description: new FormControl(''),
    scheduleCallService:new FormControl(''),
  });

  get description() {
    return this.otherInfoForm.controls['description'] as FormControl;
  }
  get sacNumber() {
    return this.otherInfoForm.controls['sacNumber'] as FormControl;
  }
  get scheduleCallService() {
    return this.otherInfoForm.controls['scheduleCallService'] as FormControl;
  }

  getAllPromoCode() {
    let param = '/promocodes?isActive=true';
    this.itrService.getMethod(param).subscribe(
      (promoCode) => {
        console.log('Plans -> ', promoCode);
        if (Array.isArray(promoCode) && promoCode.length > 0) {
          this.allPromoCodes = promoCode;
          this.showPromoCode(this.selectedPromoCode);
        }
      },
      (error) => {
        console.log('Error during getting all PromoCodes: ', error);
      }
    );
  }

  isPromoRemoved = false;
  applyPromo(selectedPlan) {
    this.smeSelectedPlanId = selectedPlan;
    if(this.selectedCouponCodeSubscriptionIds.length === 0)
      this.couponCodeAppliedFlag = true;

    if(this.couponCodeAppliedFlag)
      this.couponCodeAppliedFlag = true;

    const param = `/subscription/recalculate`;
    const request = {
      userId: this.userSubscription.userId,
      planId: selectedPlan,
      selectedBy: 'SME',
      smeUserId: this?.loggedInSme[0]?.userId,
      subscriptionId: this.userSubscription.subscriptionId,
      promoCode: this.selectedPromoCode,
      removePromoCode: false,
      removeCouponCode: this.removeCouponCodeFlag,
      couponCodeSubscriptionIds:this.selectedCouponCodeSubscriptionIds
    };
    this.itrService.postMethod(param, request).subscribe((res: any) => {
      this.appliedPromo = res.promoCode;
      if (res['Error']) {
        this.utilsService.showSnackBar(res['Error']);
        return;
      }
      this.isPromoRemoved = false;
      this.userSubscription = res;
      this.getRefundProcessedInvoices();
      this.setFinalPricing();
      this.setExistingCouponCode();
      this.utilsService.showSnackBar(
        `Promo Code ${this.selectedPromoCode} applied successfully!`
      );
    });
  }

  removePromoCode(selectedPlan) {
    this.smeSelectedPlanId = selectedPlan;
    if(this.selectedCouponCodeSubscriptionIds.length === 0)
      this.removeCouponCodeFlag = true;
    const param = `/subscription/recalculate`;
    const request = {
      userId: this.userSubscription.userId,
      planId: selectedPlan,
      selectedBy: 'SME',
      smeUserId: this?.loggedInSme[0]?.userId,
      subscriptionId: this.userSubscription.subscriptionId,
      promoCode: this.selectedPromoCode,
      removePromoCode: true,
      removeCouponCode: this.removeCouponCodeFlag,
      couponCodeSubscriptionIds:this.selectedCouponCodeSubscriptionIds
    };
    this.itrService.postMethod(param, request).subscribe((res: any) => {
      this.appliedPromo = res.promoCode;
      if (res['Error']) {
        this.utilsService.showSnackBar(res['Error']);
        return;
      }
      this.utilsService.showSnackBar(
        `Promo Code ${this.selectedPromoCode} removed successfully!`
      );
      this.isPromoRemoved = true;
      this.userSubscription = res;
      this.getRefundProcessedInvoices();
      this.setFinalPricing();
      this.setExistingCouponCode();
    });
  }

  getExactPromoDiscount() {
    return this.userSubscription?.promoApplied?.discountedAmount;
  }

  getConcessionsApplied() {
    this?.userSubscription?.concessionsApplied?.forEach((element) => {
      if (element.title == 'Schedule Call Paid') {
        this.scheduleCallPay.setValue(element.amount);
      } else if (element.title == 'Already Paid') {
        this.tpaPaid.setValue(element.amount);
      } else {
        return 'NA';
      }
    });
  }

  get concessionsApplied(){
    return this?.userSubscription?.concessionsApplied?.filter(item=>item.title !== 'Coupon Code');
  }

  totalCon: any;
  totalConcession() {
    let concession = 0;
    this?.userSubscription?.concessionsApplied?.filter(item=>item.title !== 'Coupon Code').forEach((item) => {
      concession += item.amount;
    });
    this.totalCon =
      this.userSubscription?.smeSelectedPlan?.totalAmount - concession;
  }

  showPromoCode(code) {
    this.promoCodeInfo = this.allPromoCodes.filter(
      (item: any) => item.code === code
    )[0];
    console.log('promoCodeInfo: ', this.promoCodeInfo);
  }

  async getFy() {
    const fyList = await this.utilsService.getStoredFyList();
    const currentFyDetails = fyList.filter((item: any) => item.isFilingActive);
    this.AssessmentYear = currentFyDetails[0].assessmentYear
    console.log("ay", this.AssessmentYear)
    this.getLeaderFiler();
  }

  getLeaderFiler() {
    // https://api.taxbuddy.com/user/agent-assignment-new?userId=747677&assessmentYear=2023-2024&serviceType=ITR
    this.loading = true;
    let types = ['GST', 'NOTICE', 'TPA'];
    let sType = types.includes(this.serviceType) ? this.serviceType : 'ITR';
    const param = `/leader-assignment?userId=${this.subscriptionObj.userId}&serviceType=${sType}`;
    this.userService.getMethod(param).subscribe((result: any) => {
      this.loading = false;
      console.log('get Owner and filer name for new create sub ', result)
      this.filerName.setValue(result.data?.filerName);
      this.leaderName.setValue(result.data?.leaderName);
    })
  }


  getUserPlanInfo(id) {
    this.loading = true;
    let param = '/subscription/' + id;
    this.itrService.getMethod(param).subscribe(
      (subscription: any) => {
        this.userSubscription = subscription;
        this.getRefundProcessedInvoices();
        console.log('user Subscription', this.userSubscription);
        this.gstUserInfoByUserId(subscription.userId);
        this.loading = false;
        if (this.roles.includes('ROLE_ADMIN') || this.roles.includes('ROLE_LEADER')) {
          this.reminderMobileNumber.setValue(subscription.reminderMobileNumber);
        } else {
          this.reminderMobileNumber.setValue(this.maskMobileNumber(subscription.reminderMobileNumber));
        }
        this.reminderEmail.setValue(subscription.reminderEmail);
        this.description.setValue(subscription.item.itemDescription);
        this.sacNumber.setValue(subscription.item.sacCode);
        this.assessmentYear.setValue(subscription.item.financialYear);
        this.filerName.setValue(subscription.assigneeName);
        this.leaderName.setValue(subscription.leaderName);
        if (this.utilsService.isNonEmpty(this.userSubscription)) {
          const smePlanId = this.userSubscription?.smeSelectedPlan?.planId;
          const userPlanId = this.userSubscription?.userSelectedPlan?.planId;

          const hasSmePlan120 = smePlanId === 120;
          const hasUserPlan120 = userPlanId === 120;

          const shouldShowScheduledFields = hasSmePlan120 || hasUserPlan120;

          this.showScheduledFields = shouldShowScheduledFields;
          if (shouldShowScheduledFields) {
            this.scheduleCallService.setValue(this.userSubscription.serviceType);
          }
        } else {
          this.showScheduledFields = false;
        }

        let myDate = new Date();
        console.log(myDate.getMonth(), myDate.getDate(), myDate.getFullYear());
        if (
          this.utilsService.isNonEmpty(this.userSubscription) &&
          this.utilsService.isNonEmpty(this.userSubscription.smeSelectedPlan)
        ) {
          myDate.setDate(
            new Date().getDate() +
            this.userSubscription.smeSelectedPlan.validForDays -
            1
          );
          this.maxEndDate = new Date(myDate);
          this.serviceType = this.userSubscription.smeSelectedPlan.servicesType;
          this.noOfMonths.setValue(
            Math.round(this.userSubscription.smeSelectedPlan.validForDays / 30)
          );
          this.getAllPlanInfo(
            this.userSubscription.smeSelectedPlan.servicesType
          );
        } else if (
          this.utilsService.isNonEmpty(this.userSubscription) &&
          this.utilsService.isNonEmpty(this.userSubscription.userSelectedPlan)
        ) {
          myDate.setDate(
            new Date().getDate() +
            this?.userSubscription?.userSelectedPlan.validForDays -
            1
          );
          this.maxEndDate = new Date(myDate);
          this.serviceType =
            this?.userSubscription?.userSelectedPlan?.servicesType;
          this.noOfMonths.setValue(
            Math.round(
              this?.userSubscription?.userSelectedPlan?.validForDays / 30
            )
          );
          this.getAllPlanInfo(
            this?.userSubscription?.userSelectedPlan?.servicesType
          );
        }
        if (this.serviceType !== 'GST') {
          this.maxEndDate = new Date(
            myDate.getMonth() <= 2
              ? myDate.getFullYear()
              : myDate.getFullYear() + 1,
            2,
            31
          );
        }
        if (this.utilsService.isNonEmpty(this.userSubscription.startDate)) {
          this.subStartDate.setValue(this.userSubscription.startDate);
        }
        if (this.utilsService.isNonEmpty(this.userSubscription.endDate)) {
          this.subEndDate.setValue(this.userSubscription.endDate);
        }
        this.subscriptionAssigneeId.setValue(
          this.userSubscription.subscriptionAssigneeId
        );
        if (!this.utilsService.isNonEmpty(this.subscriptionAssigneeId.value)) {
          const smeId = this.utilsService.getLoggedInUserID();
          this.subscriptionAssigneeId.setValue(smeId);
        }
        this.setFinalPricing();
        this.getConcessionsApplied();
        this.totalConcession();
        this.setExistingCouponCode();
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  getRefundProcessedInvoices() {
    if (this.userSubscription?.invoiceDetail?.length) {
      if (this.userSubscription?.invoiceDetail[0]?.invoiceRefundDetails && this.userSubscription?.invoiceDetail[0]?.invoiceRefundDetails?.length) {
        this.refundInvoiceDetails = this.userSubscription?.invoiceDetail[0]?.invoiceRefundDetails.filter(item => item.refundStatus === 'PROCESSED');
      }
    }
  }

  setServiceDetails() {
    this.service = this.serviceType;
    this.changeService();
    switch (this.serviceType) {
      case 'ITR':
        this.serviceDetail = this.userSubscription.smeSelectedPlan
          ? this.userSubscription.smeSelectedPlan.name
          : this.userSubscription.userSelectedPlan.name;
        break;
      case 'ITRU':
        this.serviceDetail = this.userSubscription.smeSelectedPlan
          ? this.userSubscription.smeSelectedPlan.name
          : this.userSubscription.userSelectedPlan.name;
        break;
    }
    this.description.setValue(this.userSubscription?.item.itemDescription);
  }

  gstUserInfoByUserId(userId) {
    let param = '/search/userprofile/query?userId=' + userId;
    this.userService.getMethodNew(param).subscribe(
      (res: any) => {
        console.log('Get user info by userId: ', res);
        if (res && res.records instanceof Array) {
          this.selectedUserInfo = res.records[0];
          console.log('this.selectedUserInfo:', this.selectedUserInfo);
          this.personalInfoForm.patchValue(this.selectedUserInfo); // all
          this.setFormValues(this.selectedUserInfo);
          if(this.serviceType === 'ITRU'){
            if (this.roles.includes('ROLE_ADMIN') || this.roles.includes('ROLE_LEADER')) {
              this.mobileNumber.setValue(this.selectedUserInfo.mobileNumber);
            } else {
              this.mobileNumber.setValue(this.maskMobileNumber(this.selectedUserInfo.mobileNumber));
            }
            this.checkPreviousITRuSub();
          }
          this.updateIgstFlag();
          if (
            this.utilsService.isNonEmpty(this.selectedUserInfo) &&
            this.utilsService.isNonEmpty(this.selectedUserInfo.gstDetails)
          ) {
            this.personalInfoForm.controls['gstNo'].setValue(this.selectedUserInfo.gstDetails.gstinNumber);
            this.gstType.setValue(this.selectedUserInfo.gstDetails.gstType);
            if (
              this.utilsService.isNonEmpty(
                this.selectedUserInfo.gstDetails.gstType
              ) &&
              this.selectedUserInfo.gstDetails.gstType === 'REGULAR'
            ) {
              this.frequency.setValue(
                this.selectedUserInfo.gstDetails.gstr1Type
              );
            } else {
              this.frequencyTypesMaster = [
                { label: 'Quarterly', value: 'QUARTERLY' },
              ];
              this.frequency.setValue('QUARTERLY');
            }
          }
        }
      },
      (error) => {
        console.log('Error -> ', error);
      }
    );
  }

  setFinalPricing() {
    this.selectedPromoCode = this.userSubscription.promoCode;
    this.searchedPromoCode.setValue(this.userSubscription.promoAppliedTitle);
    if (
      this.utilsService.isNonEmpty(this.selectedPromoCode) &&
      this.utilsService.isNonEmpty(this.allPromoCodes)
    ) {
      this.showPromoCode(this.selectedPromoCode);
    }
    if (
      this.utilsService.isNonEmpty(this.userSubscription) &&
      this.utilsService.isNonEmpty(this.userSubscription.smeSelectedPlan)
    ) {
      this.smeSelectedPlanId = this.userSubscription.smeSelectedPlan.planId;
    }

    if (
      this.utilsService.isNonEmpty(this.userSubscription) &&
      this.utilsService.isNonEmpty(this.userSubscription.promoApplied)
    ) {
      Object.assign(this.finalPricing, this.userSubscription.promoApplied);
    } else if (
      this.utilsService.isNonEmpty(this.userSubscription) &&
      this.utilsService.isNonEmpty(this.userSubscription.smeSelectedPlan)
    ) {
      Object.assign(this.finalPricing, this.userSubscription.smeSelectedPlan);
    } else if (
      this.utilsService.isNonEmpty(this.userSubscription) &&
      this.utilsService.isNonEmpty(this.userSubscription.userSelectedPlan)
    ) {
      Object.assign(this.finalPricing, this.userSubscription.userSelectedPlan);
    }
  }

  showIgst = true;

  updateIgstFlag() {
    if (this.state.value === '19') {
      this.showIgst = false;
    } else if (this.personalInfoForm.controls['gstNo'].value.startsWith('27')) {
      this.showIgst = false;
    }
  }

  getAllPlanInfo(serviceType) {
    let param = '/plans-master';
    let selected = '';
    this.sourcesList.forEach((item: any) => {
      if (item.selected === true) {
        console.log(item.schedule);
        if (this.utilsService.isNonEmpty(selected)) {
          selected += ',' + item.schedule;
        } else {
          selected += item.schedule;
        }
      }
    });

    if (this.utilsService.isNonEmpty(selected)) {
      param +=
        '?serviceType=ITR&eligilities=' +
        selected +
        '&userId=' +
        this.userSubscription.userId;
    }

    this.itrService.getMethod(param).subscribe(
      (plans: any) => {
        if (plans instanceof Array) {
          const activePlans = plans.filter(
            (item: any) => item.isActive === true
          );
          if (this.utilsService.isNonEmpty(serviceType)) {
            this.allPlans = activePlans.filter((item: any) => item.servicesType === serviceType);
            if (this.roles.includes('ROLE_FILER') || (this.assignedFilerId && (serviceType === 'ITR' || serviceType === 'ITRU' ))) {
              this.allPlans.forEach((item: any) => {
                item.disable = true;
                if (this.smeDetails?.skillSetPlanIdList.includes(item.planId))
                  item.disable = false;
              })
            }
          }
          else {
            this.allPlans = activePlans;
            if (this.roles.includes('ROLE_FILER')) {
              this.allPlans.forEach((item: any) => {
                item.disable = true;
                if (this.smeDetails?.skillSetPlanIdList.includes(item.planId))
                  item.disable = false;
              })
            }
          }
        } else {
          this.allPlans = [plans];
          if (this.roles.includes('ROLE_FILER')) {
            this.allPlans.forEach((item: any) => {
              item.disable = true;
              if (this.smeDetails?.skillSetPlanIdList.includes(item.planId))
                item.disable = false;
            })
          }
        }
        this.setServiceDetails();
      },
      (error) => {
        console.log('Error during getting all plans: ', error);
      }
    );
  }

  applySmeSelectedPlan(selectedPlan) {
    this.loading = true;
    this.smeSelectedPlanId = selectedPlan;
    if(this.selectedCouponCodeSubscriptionIds.length === 0)
      this.removeCouponCodeFlag = true;
    const param = '/subscription/recalculate';
    const request = {
      userId: this.userSubscription.userId,
      planId: selectedPlan,
      selectedBy: 'SME',
      smeUserId: this?.loggedInSme[0]?.userId,
      subscriptionId: this.userSubscription.subscriptionId,
      promoCode: this.selectedPromoCode,
      removePromoCode: false,
      couponCodeSubscriptionIds: this.selectedCouponCodeSubscriptionIds,
      removeCouponCode: this.removeCouponCodeFlag
    };

    this.itrService.postMethod(param, request).subscribe(
      (response: any) => {
        this.loading = false;
        console.log('SME Selected plan:', response);
        this.userSubscription = response;
        if (this.utilsService.isNonEmpty(this.userSubscription)) {
          const smePlanId = this.userSubscription?.smeSelectedPlan?.planId;
          const userPlanId = this.userSubscription?.userSelectedPlan?.planId;

          const hasSmePlan120 = smePlanId === 120;
          const hasUserPlan120 = userPlanId === 120;

          const shouldShowScheduledFields = hasSmePlan120 || hasUserPlan120;

          this.showScheduledFields = shouldShowScheduledFields;

        } else {
          this.showScheduledFields = false;
        }

        this.getRefundProcessedInvoices();
        this.loading = false;
        if (
          this.utilsService.isNonEmpty(this.userSubscription) &&
          this.utilsService.isNonEmpty(this.userSubscription.smeSelectedPlan)
        ) {
          if (!this.maxEndDate) {
            let myDate = new Date();
            this.maxEndDate = new Date(
              myDate.getMonth() <= 2
                ? myDate.getFullYear()
                : myDate.getFullYear() + 1,
              2,
              31
            );
          }
          this.maxEndDate.setDate(
            this.maxEndDate.getDate() +
            this.userSubscription.smeSelectedPlan.validForDays -
            1
          );
        }
        this.setServiceDetails();
        this.setFinalPricing();
        this.totalConcession();
        // this.selectedPlan()
        this.loading = false;
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  onUpdateGstNoValidation() {
    if (
      this.service == 'GST Filing' &&
      this.serviceDetail !== 'GST Registration'
    ) {
      this.invoiceForm.controls['gstin'].setValidators([
        Validators.required,
        Validators.pattern(AppConstants.GSTNRegex),
      ]);
    } else {
      this.invoiceForm.controls['gstin'].setValidators(
        Validators.pattern(AppConstants.GSTNRegex)
      );
    }
    this.invoiceForm.controls['gstin'].updateValueAndValidity();
  }

  checkPreviousITRuSub(){
     // https://dev-api.taxbuddy.com/report/bo/subscription-dashboard-new?page=0&pageSize=20
     const loggedInSmeUserId = this?.loggedInSme[0]?.userId
     let filter = '';
    filter = '&mobileNumber=' + this.unMaskedMobileNo

     let userFilter = ''
     if (this.roles.includes('ROLE_LEADER')) {
       userFilter += `&leaderUserId=${loggedInSmeUserId}`;

     }
     if (this.roles.includes('ROLE_FILER') && this.partnerType != "PRINCIPAL") {
       userFilter += `&filerUserId=${loggedInSmeUserId}`;
     }

     if (this.roles.includes('ROLE_FILER') && this.partnerType === "PRINCIPAL") {
       userFilter += `&searchAsPrincipal=true&filerUserId=${loggedInSmeUserId}`;
     }

     this.loading = true;
     let param = `/bo/subscription-dashboard-new?page=0&pageSize=20${userFilter}${filter}`;
     this.reportService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      // this.selectedITRUFy = response?.data?.content.map(sub => sub?.item?.financialYear);
      this.selectedITRUFy = response?.data?.content.filter(sub => sub?.item?.service === 'ITRU').map(sub => sub?.item?.financialYear);
     })
  }

  filteredFinancialYears: any[] = this.financialYear;

  isYearDisabled(year: string): boolean {
    return this.service === 'ITRU' && this.selectedITRUFy?.includes(year);
  }

  changeService() {
    if (this.service === 'ITRU') {
      this.filteredFinancialYears = this.financialYear.filter(
        (year) => year.financialYear === '2020-2021' || year.financialYear === '2021-2022' || year.financialYear === '2022-2023'
      );

    } else if(this.service === 'ITR')
        this.filteredFinancialYears = this.financialYear.slice(0, 1);
      else
        this.filteredFinancialYears = this.financialYear;

    const serviceArray = [
      { service: 'GST', details: 'GST Registration' },
      { service: 'GST', details: 'GST Annual Subscription' },
      { service: 'GST', details: 'GSTR Annual return' },
      { service: 'GST', details: 'GSTR Filing' },
      { service: 'GST', details: 'GST Notice' },
      { service: 'GST', details: 'Any other services' },
      { service: 'NOTICE', details: 'Defective Notice response u/s 139 (9)' },
      {
        service: 'NOTICE',
        details: 'Notice response and rectification  u/s 143 (1)',
      },
      { service: 'NOTICE', details: 'Notice response u/s 142 (1)' },
      { service: 'NOTICE', details: 'Notice response u/s 148' },
      { service: 'NOTICE', details: 'Notice e-proceeding response' },
      { service: 'NOTICE', details: 'Notice response u/s 143 (3)' },
      {
        service: 'NOTICE',
        details: 'Notice response to outstanding demand u/s 245',
      },
      { service: 'NOTICE', details: 'Any Other Notice' },
      { service: 'TPA', details: 'TPA' },
      { service: 'TPA', details: 'HNI' },
      { service: 'OTHER', details: 'TDS (26Q ) filing' },
      { service: 'OTHER', details: 'TDS (24Q ) filing' },
      { service: 'OTHER', details: 'TDS (27Q ) filing' },
      { service: 'OTHER', details: 'TDS Notice' },
      { service: 'OTHER', details: 'Any other services' },
      { service: 'OTHER', details: 'Accounting' },
      { service: 'OTHER', details: 'TDS Registration' },
      { service: 'OTHER', details: 'TDS Filing' },
      { service: 'OTHER', details: 'ROC / Firm Registration' },
      { service: 'OTHER', details: 'PT Registration' },
      { service: 'OTHER', details: 'PT Return Filing' },
      { service: 'OTHER', details: 'PF Withdrawal' },
      { service: 'OTHER', details: 'Food Licence' },
      { service: 'OTHER', details: 'Shop Licence / adhhr Udhuyog' },
      { service: 'OTHER', details: 'Company registration' },
      { service: 'OTHER', details: 'Import / Export Certificate' },
      { service: 'OTHER', details: 'PF / ESIC Registration' },
      {
        service: 'OTHER',
        details: 'Audit (Professional / Free Lancer',
      },
      { service: 'OTHER', details: 'Other Services' },
      { service: 'OTHER', details: 'Schedule Call' },
    ];

    if (this.service === 'ITR' || this.service === 'ITRU') {
      // if (this.subType === 'edit' && this.service !== 'ITR') {
      //   this.isButtonDisable = false;
      // }
      this.serviceDetails = this.allPlans.map((item) => {
        return { service: this.service, details: item.name };
      });
    } else {
      this.serviceDetails = serviceArray.filter(
        (item: any) => item.service === this.service
      );
      let planName = ''
      if (this.userSubscription?.userSelectedPlan) {
        planName = this.userSubscription.userSelectedPlan.name;
      } else {
        planName = this.userSubscription?.smeSelectedPlan.name;
      }
      let filtered = this.serviceDetails.filter(item => item.details.toLowerCase() === planName.toLowerCase());
      if (filtered.length === 1) {
        this.serviceDetail = filtered[0].details;
      }
    }
  }


  getLeaderFilerName() {
    let param = `/bo/sme-details-new/${this.subscriptionObj?.subscriptionAssigneeId}`;
    this.reportService.getMethod(param).subscribe((result: any) => {
      console.log('owner filer name  -> ', result);
      this.filerName.setValue(result.data[0]?.name);
      this.leaderName.setValue(result.data[0]?.parentName);
      if (this.roles.includes('ROLE_ADMIN') || this.roles.includes('ROLE_LEADER')) {
        if (result.data[0].filer && !result.data[0].leader) {
          this.assignedFilerId = result.data[0].userId;
          this.getSmeDetail();
          this.getAllPlanInfo(this.serviceType);
        }
      }
    });
  }

  updateUserDetails() {
    let param = `/profile/${this.userSubscription.userId}?serviceType=${this.serviceType}`;
    if (this.personalInfoForm.controls['gstNo'].value) {
      if (!this.selectedUserInfo.gstDetails) {
        this.selectedUserInfo.gstDetails = {
          bankInformation: null,
          businessAddress: null,
          businessLogo: null,
          businessSignature: null,
          compositeDealerQuarter: null,
          compositeDealerYear: null,
          gstCertificate: null,
          gstPortalPassword: "",
          gstPortalUserName: "",
          gstType: null,
          gstinNumber: null,
          gstinRegisteredMobileNumber: "",
          gstr1Type: "",
          legalName: "",
          natureOfBusiness: null,
          openingPurchaseValue: null,
          openingSalesValue: null,
          registrationDate: null,
          regularDealerMonth: null,
          regularDealerYear: null,
          returnType: null,
          salesInvoicePrefix: "",
          termsAndConditions: null,
          tradeName: ""
        };
      }
      this.selectedUserInfo.gstDetails.gstinNumber = this.personalInfoForm.controls['gstNo'].value;
    }
    let reqBody = {
      createdDate: this.selectedUserInfo.createdDate,
      id: this.selectedUserInfo.id,
      userId: this.selectedUserInfo.userId,
      fName: this.selectedUserInfo.fName,
      mName: this.selectedUserInfo.mName,
      lName: this.selectedUserInfo.lName,
      fatherName: this.selectedUserInfo.fatherName,
      gender: this.selectedUserInfo.gender,
      dateOfBirth: this.selectedUserInfo.dateOfBirth,
      maritalStatus: this.selectedUserInfo.maritalStatus,
      emailAddress: this.emailAddress.value,
      aadharNumber: this.selectedUserInfo.aadharNumber,
      panNumber: this.selectedUserInfo.panNumber,
      imageURL: this.selectedUserInfo.imageURL,
      mobileNumber: this.unMaskedMobileNo,
      residentialStatus: this.selectedUserInfo.residentialStatus,
      zohoDeskId: this.selectedUserInfo.zohoDeskId,
      address: [
        {
          premisesName: this.selectedUserInfo?.address[0]?.premisesName,
          road: this.selectedUserInfo?.address[0]?.road,
          area: this.selectedUserInfo?.address[0]?.area,
          city: this.city.value,
          state: this.state.value,
          pinCode: this.pin.value,
        },
      ],
      whatsAppNumber: this.selectedUserInfo.whatsAppNumber,
      optinDate: this.selectedUserInfo.optinDate,
      optoutDate: this.selectedUserInfo.optoutDate,
      isUserOpted: this.selectedUserInfo.isUserOpted,
      isWhatsAppMsgAllowed: this.selectedUserInfo.isWhatsAppMsgAllowed,
      bankDetails: this.selectedUserInfo.bankDetails,
      gstDetails: this.selectedUserInfo.gstDetails,
      messageSentCount: this.selectedUserInfo.messageSentCount,
      countryCode: this.selectedUserInfo.countryCode,
      theFlyLink: this.selectedUserInfo.theFlyLink,
      language: this.selectedUserInfo.language,
      eriClientValidUpto: this.selectedUserInfo.eriClientValidUpto,
      eriClientotpSourceFlag: this.selectedUserInfo.eriClientotpSourceFlag,
      reviewGiven: this.selectedUserInfo.reviewGiven,
      assesseeType: this.selectedUserInfo.assesseeType,
      subscriptionId: this.selectedUserInfo.subscriptionId,
      subscriptionAssigneeId: this.selectedUserInfo.subscriptionAssigneeId,
    };
    this.loading = true;
    let requestData = JSON.parse(JSON.stringify(reqBody));
    console.log('requestData', requestData);
    this.userService.putMethod(param, reqBody).subscribe(
      (res: any) => {
        this.loading = false;
        this.loading = false;
        this.toastMessage.alert('success', 'user details updated successfully');
      },
      (error) => {
        this.toastMessage.alert('error', 'failed to update.');
        this.loading = false;
      }
    );
  }

  updateSubscription() {
    this.loading =true;
    this.utilsService.getUserCurrentStatus(this.userSubscription.userId).subscribe((res: any) => {

      console.log(res);
      if (res.error) {
        this.utilsService.showSnackBar(res.error);
        return;
      } else {
        this.loading = true;
        if(this.selectedCouponCodeSubscriptionIds.length > 0 && (this.userSubscription?.payableSubscriptionAmount < 0 || this.userSubscription?.invoiceDetail?.some(invoice=> invoice.paymentStatus === 'Paid'))){
          this.utilsService.showSnackBar("If you apply a coupon code, it is not possible to generate a subscription with a negative amount.");
          this.loading = false;
          return;
        }

        if (this.service === 'ITRU' || this.service === 'ITR') {
          if (this.assessmentYear.value === '' || typeof this.assessmentYear.value === 'undefined' || this.assessmentYear.value === 'undefined' ) {
            this.loading = false;
            this.toastMessage.alert('error', 'Please select Financial Year For ' + (this.service === 'ITR' ? 'ITR' : 'ITR-U') + ' subscription');
            return;
          }
        }
        if(this.showScheduledFields === true && (this.scheduleCallService.value ==='' || typeof this.scheduleCallService.value === 'undefined' || this.scheduleCallService.value === 'undefined' ) ){
          this.loading = false;
            this.toastMessage.alert('error', 'Please Select Service Type For Scheduled Call ');
            return;
        }
        if (this.userSubscription.smeSelectedPlan != null && this.pin.value) {
          console.log(
            'selectedPlanInfo -> ',
            this.userSubscription.smeSelectedPlan.planId
          );

          if(!this.couponCodeAppliedFlag)
            this.selectedCouponCodeSubscriptionIds = [];

          let param = '/subscription';
          let reqBody : any = {
            userId: this.userSubscription.userId,
            planId: this.userSubscription.smeSelectedPlan.planId,
            selectedBy: 'SME',
            smeUserId: this?.loggedInSme[0]?.userId,
            item: {
              itemDescription: this.description?.value,
              quantity: this.userSubscription?.item[0]?.quantity,
              rate: this?.userSubscription?.payableSubscriptionAmount,
              cgstPercent: this?.userSubscription?.cgstPercent,
              cgstAmount: this?.userSubscription?.cgstAmount,
              igstAmount: this?.userSubscription?.igstAmount,
              igstPercent: this?.userSubscription?.igstPercent,
              sgstPercent: this?.userSubscription?.sgstPercent,
              sgstAmount: this?.userSubscription?.sgstAmount,
              amount: this?.userSubscription?.payableSubscriptionAmount,
              sacCode: this.sacNumber.value,
              financialYear: this.assessmentYear.value,
              service: this.service,
              serviceDetail: this.serviceDetail,
            },
            reminderEmail: this.reminderEmail.value,
            reminderMobileNumber: this.reminderMobileNumber.value,
            subscriptionId: this.subscriptionObj.subscriptionId,
            removePromoCode: this.isPromoRemoved,
            promoCode: this.selectedPromoCode,
            couponCodeSubscriptionIds: this.selectedCouponCodeSubscriptionIds,
            removeCouponCode: this.removeCouponCodeFlag
          };

          if(this.scheduleCallService.value){
            reqBody.serviceType = this.scheduleCallService.value
          }
          console.log('Req Body: ', reqBody);
          let requestData = JSON.parse(JSON.stringify(reqBody));
          this.itrService.postMethod(param, requestData).subscribe(
            (res: any) => {
              this.loading = false;
              let invoiceTypeDetails;
              if (this.invoiceAmount > this.userSubscription?.payableSubscriptionAmount) {
                invoiceTypeDetails = 'Downgrade'
              } else {
                invoiceTypeDetails = 'Upgrade'
              }
              we_track('Subscription Edit', {
                'User Number': this.personalInfoForm.controls['mobileNumber'].value,
                'Service': this.service,
                'Plan': this.serviceDetail,
                'Promo Code': this.searchedPromoCode.value,
                'Downgrade or Upgrade': invoiceTypeDetails
              });
              this.toastMessage.alert('success', 'Subscription created successfully.');
              this.location.back();
            },
            (error) => {
              this.loading = false;
              if (error.error.error === 'BAD_REQUEST') {
                this.toastMessage.alert('error', error.error.message);
              } else {
                this.toastMessage.alert('error', this.utilsService.showErrorMsg(error.error.status));
              }
              this.router.navigate(['/subscription/assigned-subscription'], {
                queryParams: { fromEdit: true  },
              })
            }
          );
        } else {
          this.toastMessage.alert('error', 'Please select Plan & Pincode');
          this.loading = false;
        }
      }
    },(error) => {
      this.loading=false;
        if (error.error && error.error.error) {
          this.utilsService.showSnackBar(error.error.error);
          this.router.navigate(['/subscription/assigned-subscription'], {
            queryParams: { fromEdit: true  },
          })
        } else {
          this.utilsService.showSnackBar("An unexpected error occurred.");
        }
    });
  }

  ngOnDestroy() {
    sessionStorage.removeItem('subscriptionObject');
    sessionStorage.removeItem('createSubscriptionObject');
  }

  cancelSubscription() {
    this.dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Cancel Subscription!',
        message: 'Are you sure you want to Cancel the Subscription?',
      },

    });
    this.dialogRef.afterClosed().subscribe(result => {
      if (result === 'YES') {
        this.loading = true;
        let param = `/itr/subscription`;
        let reqBody = {
          "subscriptionId": this.userSubscription.subscriptionId,
          "cancellationStatus": "PENDING"
        };
        this.userService.spamPutMethod(param, reqBody).subscribe(
          (res: any) => {
            this.loading = false;
            we_track('Cancel Subscription  ', {
              'User number ': this.personalInfoForm.controls['mobileNumber'].value,
            });
            this.toastMessage.alert('success', 'Subscription will be canceled/Deleted onces your Owner Approves it.');
            this.location.back();
          },
          (error) => {
            this.loading = false;
            if (error.error.error === 'BAD_REQUEST') {
              this.toastMessage.alert('error', error.error.message);
            } else {
              this.toastMessage.alert('error', 'failed to update.');
            }
          }
        );
      }
    });

  }

  changesMade: boolean = false;

  onPersonalInfoFormChanges() {
    this.personalInfoForm.valueChanges.subscribe((event) => {
      this.changesMade = true;
    });

    this.searchedPromoCode.valueChanges.subscribe(() => {
      this.changesMade = true;
    });
  }

  onOtherInfoFormChange() {
    this.otherInfoForm.valueChanges.subscribe(() => {
      this.changesMade = true;
    });
  }

  onNgModelChange() {
    this.changesMade = true;
  }

  cancel() {
    if (this.changesMade) {
      this.dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Cancel!',
          message: 'Changes have not been saved. Are you sure you want to cancel?',
        },

      });
      this.dialogRef.afterClosed().subscribe(result => {
        if (result === 'YES') {
          this.location.back();
        }
      })
    } else {
      this.location.back();
    }
  }
}

export interface userInfo {
  createdDate: string;
  id: string;
  userId: number;
  fName: string;
  mName: any;
  lName: string;
  fatherName: any;
  gender: any;
  dateOfBirth: string;
  maritalStatus: any;
  emailAddress: string;
  aadharNumber: any;
  panNumber: any;
  imageURL: any;
  mobileNumber: string;
  residentialStatus: any;
  zohoDeskId: any;
  address: any[];
  whatsAppNumber: string;
  optinDate: any;
  optoutDate: any;
  isUserOpted: boolean;
  isWhatsAppMsgAllowed: string;
  bankDetails: any[];
  gstDetails: any;
  messageSentCount: number;
  countryCode: string;
  theFlyLink: any;
  language: string;
  eriClientValidUpto: any;
  eriClientotpSourceFlag: any;
  reviewGiven: boolean;
  assesseeType: string;
  subscriptionId: number;
  subscriptionAssigneeId: number;
  smeSelectedPlan: any;
  item: any;
}
