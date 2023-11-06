import { state } from '@angular/animations';
import { data } from 'jquery';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ActivatedRoute } from '@angular/router';
import { map, Observable, startWith } from 'rxjs';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { Schedules } from 'src/app/modules/shared/interfaces/schedules';
import { Location } from '@angular/common';
import { filter } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/modules/shared/components/confirm-dialog/confirm-dialog.component';
declare function we_track(key: string, value: any);

@Component({
  selector: 'app-create-update-subscription',
  templateUrl: './create-update-subscription.component.html',
  styleUrls: ['./create-update-subscription.component.scss'],
})
export class CreateUpdateSubscriptionComponent implements OnInit, OnDestroy {
  subId: any;
  searchedPromoCode = new FormControl('', Validators.required);
  filteredOptions!: Observable<any[]>;
  serviceDetails = [];
  service: string;
  serviceDetail: string = '';
  selectedPlanInfo: any;
  invoiceForm: FormGroup;
  financialYear = AppConstants.subscriptionFyList;
  loading!: boolean;
  userSubscription: any;
  sourcesList = [];
  subscriptionObj: userInfo;
  createSubscriptionObj: userInfo;
  smeSelectedPlanId: any;
  loggedInSme: any;
  allPlans: any;
  maxEndDate: any;
  minEndDate: any;
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
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    public utilsService: UtilsService,
    private itrService: ItrMsService,
    private userService: UserMsService,
    private toastMessage: ToastMessageService,
    private schedules: Schedules,
    public location: Location,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.getAllPromoCode();

    this.subType = (this.subscriptionObjType = JSON.parse(
      sessionStorage.getItem('subscriptionObject')
    )?.type);

    if (this.subType !== 'edit') {
      this.isButtonDisable = false;
    } else {
      this.isButtonDisable = true;
    }

    this.filteredOptions = this.searchedPromoCode.valueChanges.pipe(
      startWith(''),
      map((value) => {
        console.log(value, this.allPromoCodes);
        return value;
      }),
      map((code) => {
        return code ? this._filter(code) : this.allPromoCodes.slice();
      })
    );

    this.createSubscriptionObj = JSON.parse(
      sessionStorage.getItem('createSubscriptionObject')
    )?.data;
    console.log('createSubscriptionObject', this.createSubscriptionObj);

    if (!this.createSubscriptionObj) {
      this.subscriptionObj = JSON.parse(
        sessionStorage.getItem('subscriptionObject')
      )?.data;
      this.invoiceAmount = this.subscriptionObj['invoiceAmount'];
      console.log('subscriptionObj', this.subscriptionObj);
    } else {
      this.subscriptionObj = this.createSubscriptionObj;
      this.userSubscription = this.createSubscriptionObj;
      this.serviceType =
        this.createSubscriptionObj?.smeSelectedPlan?.servicesType;
      this.smeSelectedPlanId =
        this?.createSubscriptionObj?.smeSelectedPlan?.planId;
      this.gstUserInfoByUserId(this.subscriptionObj.userId);
      this.setFinalPricing();
    }

    if (this.subscriptionObj != null) {
      this.personalInfoForm.patchValue(this.subscriptionObj);
      // this.otherInfoForm.patchValue(this.subscriptionObj);
      if (this.subscriptionObj.subscriptionId !== 0) {
        this.getUserPlanInfo(this.subscriptionObj?.subscriptionId);
      } else {
        this.getFy();
      }
    }
    // if(this.createSubscriptionObj !=null){
    //   this.personalInfoForm.patchValue(this.createSubscriptionObj);
    //   // this.otherInfoForm.patchValue(this.createSubscriptionObj);
    //   this.gstUserInfoByUserId(this.createSubscriptionObj?.userId);
    //   this.userSubscription=this.createSubscriptionObj;
    //   this.smeSelectedPlanId=this?.createSubscriptionObj?.smeSelectedPlan?.planId;
    //   // this.service=this.createSubscriptionObj?.smeSelectedPlan?.servicesType;
    //   this.serviceType = this.createSubscriptionObj?.smeSelectedPlan?.servicesType;
    //   // this.setServiceDetails()
    //   // this.serviceDetail=this.createSubscriptionObj.item.serviceDetail;
    // }


    this.loggedInSme = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
    this.roles = this.utilsService.getUserRoles();
    this.getAllPlanInfo(this.serviceType);
    this.getOwnerFilerName();
    this.setFormValues(this.selectedUserInfo);
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
        console.log('smeCode on blur = ', pCode);
      } else {
        this.searchedPromoCode.setErrors({ invalid: true });
      }
    }
  }

  async updateDataByPincode() {
    await this.utilsService
      .getPincodeData(this.personalInfoForm.controls['pin'])
      .then((result) => {
        console.log('pindata', result);
        this.city.setValue(result.city);
        // this.country.setValue(result.countryCode);
        this.state.setValue(result.stateCode);
        this.updateIgstFlag();
      });
  }

  maskMobileNumber(originalMobileNumber: string): string {
    if (originalMobileNumber && originalMobileNumber.length >= 10) {
      const maskedPart = '*'.repeat(originalMobileNumber.length - 4);
      const lastFourDigits = originalMobileNumber.slice(-4);
      return maskedPart + lastFourDigits;
    }
    return originalMobileNumber;
  }

  setFormValues(data) {
    console.log('data', data);
    this.userName.setValue(data?.fName + ' ' + data?.lName);
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
    ownerName: new FormControl(''),
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
  get ownerName() {
    return this.personalInfoForm.controls['ownerName'] as FormControl;
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
  });

  get description() {
    return this.otherInfoForm.controls['description'] as FormControl;
  }
  get sacNumber() {
    return this.otherInfoForm.controls['sacNumber'] as FormControl;
  }
  // otherDetailsForm:FormGroup = this.fb.group({
  //   service :new FormControl(''),
  //   serviceDetails:new FormControl(''),
  //   sacNumber:new FormControl(''),
  //   financialYear: new FormControl(''),
  //   description:new FormControl('')
  // })
  // get service() {
  //   return this.otherDetailsForm.controls['service'] as FormControl;
  // }
  // get serviceDetails() {
  //   return this.otherDetailsForm.controls['serviceDetails'] as FormControl;
  // }
  // get sacNumber() {
  //   return this.otherDetailsForm.controls['sacNumber'] as FormControl;
  // }
  // get financialYear() {
  //   return this.otherDetailsForm.controls['financialYear'] as FormControl;
  // }
  // get description() {
  //   return this.otherDetailsForm.controls['description'] as FormControl;
  // }

  gstFormGroup: FormGroup = this.fb.group({
    startDate: new FormControl(''),
    endDate: new FormControl(''),
  });
  get startDate() {
    return this.gstFormGroup.controls['startDate'] as FormControl;
  }
  get endDate() {
    return this.gstFormGroup.controls['endDate'] as FormControl;
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
    console.log('selectedPromoCode:', this.selectedPromoCode);
    this.smeSelectedPlanId = selectedPlan;
    const param = `/subscription/recalculate`;
    const request = {
      userId: this.userSubscription.userId,
      planId: selectedPlan,
      selectedBy: 'SME',
      smeUserId: this?.loggedInSme[0]?.userId,
      subscriptionId: this.userSubscription.subscriptionId,
      promoCode: this.selectedPromoCode,
      removePromoCode: false
    };
    this.itrService.postMethod(param, request).subscribe((res: any) => {
      console.log('apply promo res', res);
      this.appliedPromo = res.promoCode;
      console.log('applied promo', this.appliedPromo);
      if (res['Error']) {
        this.utilsService.showSnackBar(res['Error']);
        return;
      }
      this.isPromoRemoved = false;
      this.userSubscription = res;
      this.setFinalPricing();
      console.log('PROMO code applied', res);
      this.utilsService.showSnackBar(
        `Promo Code ${this.selectedPromoCode} applied successfully!`
      );
    });
  }

  removePromoCode(selectedPlan) {
    // if (this.userSubscription.subscriptionId && this.userSubscription.subscriptionId > 0) {
    console.log('selectedPromoCode:', this.selectedPromoCode);
    this.smeSelectedPlanId = selectedPlan;
    const param = `/subscription/recalculate`;
    const request = {
      userId: this.userSubscription.userId,
      planId: selectedPlan,
      selectedBy: 'SME',
      smeUserId: this?.loggedInSme[0]?.userId,
      subscriptionId: this.userSubscription.subscriptionId,
      promoCode: this.selectedPromoCode,
      removePromoCode: true
    };
    this.itrService.postMethod(param, request).subscribe((res: any) => {
      console.log('remove promo res', res);
      this.appliedPromo = res.promoCode;
      console.log('removed promo', this.appliedPromo);
      if (res['Error']) {
        this.utilsService.showSnackBar(res['Error']);
        return;
      }
      this.utilsService.showSnackBar(
        `Promo Code ${this.selectedPromoCode} removed successfully!`
      );
      this.isPromoRemoved = true;
      this.userSubscription = res;
      this.setFinalPricing();
    });
    // }
    /*else {
      this.selectedPromoCode = '';
      this.searchedPromoCode.reset();
      this.applySmeSelectedPlan(this.userSubscription.smeSelectedPlan.planId);
    }*/
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

  totalCon: any;
  totalConcession() {
    let concession = 0;
    this?.userSubscription?.concessionsApplied?.forEach((item) => {
      concession += item.amount;
    });
    this.totalCon =
      this.userSubscription?.smeSelectedPlan?.totalAmount - concession;
  }

  showPromoCode(code) {
    console.log('selected promo code Id: ', code);
    this.promoCodeInfo = this.allPromoCodes.filter(
      (item: any) => item.code === code
    )[0];
    console.log('promoCodeInfo: ', this.promoCodeInfo);
  }

  async getFy() {
    const fyList = await this.utilsService.getStoredFyList();
    console.log('fylist', fyList)
    const currentFyDetails = fyList.filter((item: any) => item.isFilingActive);
    this.AssessmentYear = currentFyDetails[0].assessmentYear
    console.log("ay", this.AssessmentYear)
    this.getOwnerFiler();
  }

  getOwnerFiler() {
    // https://api.taxbuddy.com/user/agent-assignment-new?userId=747677&assessmentYear=2023-2024&serviceType=ITR
    this.loading = true;
    let types = ['GST', 'NOTICE', 'TPA'];
    let sType = types.includes(this.serviceType) ? this.serviceType : 'ITR';
    const param = `/agent-assignment-new?userId=${this.subscriptionObj.userId}&assessmentYear=${this.AssessmentYear}&serviceType=${sType}`;
    this.userService.getMethod(param).subscribe((result: any) => {
      this.loading = false;
      console.log('get Owner and filer name for new create sub ', result)
      this.filerName.setValue(result.data?.name);
      this.ownerName.setValue(result.data?.ownerName);
      this.leaderName.setValue(result.data?.leaderName);
    })
  }


  getUserPlanInfo(id) {
    this.loading = true;
    let param = '/subscription/' + id;
    this.itrService.getMethod(param).subscribe(
      (subscription: any) => {
        this.userSubscription = subscription;
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
        this.ownerName.setValue(subscription.ownerName);
        this.filerName.setValue(subscription.assigneeName);
        this.leaderName.setValue(subscription.leaderName);

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
      },
      (error) => {
        this.loading = false;
        console.log('Error during: ', error);
      }
    );
  }

  setServiceDetails() {
    this.service = this.serviceType;
    this.changeService();
    switch (this.serviceType) {
      case 'ITR':
        //set plan list for service details and selected plan as seletced detail
        this.serviceDetail = this.userSubscription.smeSelectedPlan
          ? this.userSubscription.smeSelectedPlan.name
          : this.userSubscription.userSelectedPlan.name;
        break;
      case 'ITRU':
        //set plan list for service details and selected plan as seletced detail
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
          // this.otherDetailsForm.patchValue(this.selectedUserInfo);
          this.setFormValues(this.selectedUserInfo);
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
  // selectedPlan=this.sourcesList.filter((item:any) => item.selected===true)

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
        console.log(' all plans', plans);
        if (plans instanceof Array) {
          const activePlans = plans.filter(
            (item: any) => item.isActive === true
          );
          if (this.utilsService.isNonEmpty(serviceType))
            this.allPlans = activePlans.filter(
              (item: any) => item.servicesType === serviceType
            );
          else this.allPlans = activePlans;
        } else {
          this.allPlans = [plans];
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
    const param = '/subscription/recalculate';
    const request = {
      userId: this.userSubscription.userId,
      planId: selectedPlan,
      selectedBy: 'SME',
      smeUserId: this?.loggedInSme[0]?.userId,
    };

    this.itrService.postMethod(param, request).subscribe(
      (response: any) => {
        this.loading = false;
        console.log('SME Selected plan:', response);
        this.userSubscription = response;
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
        console.log('SME Selected plan error:', error);
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

  filteredFinancialYears: any[] = this.financialYear;

  changeService() {
    if (this.service === 'ITRU') {
      this.filteredFinancialYears = this.financialYear.filter(
        (year) => year.financialYear === '2020-2021' || year.financialYear === '2021-2022'
      );

    } else {
      this.filteredFinancialYears = this.financialYear;
    }
    const serviceArray = [
      //   { service: 'ITR Filing', details: 'ITR-1 filing (FY 21-22)/ (AY 2022-23)' },
      // { service: 'ITR Filing', details: 'ITR-2 filing (FY 21-22)/ (AY 2022-23)' },
      // { service: 'ITR Filing', details: 'ITR-3 filing (FY 21-22)/ (AY 2022-23)' },
      // { service: 'ITR Filing', details: 'ITR-4 filing (FY 21-22)/ (AY 2022-23)' },
      // { service: 'ITR Filing', details: 'ITR-5 filing (FY 21-22)/ (AY 2022-23)' },
      // { service: 'ITR Filing', details: 'ITR Filing' },
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
      if (this.subType === 'edit') {
        this.isButtonDisable = false;
      }
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

  // selectedPlan() {
  //   this.selectedPlanInfo = this.userSubscription.smeSelectedPlanId;
  //   console.log('selectedPlanInfo -> ', this.selectedPlanInfo);

  // }

  getOwnerFilerName() {
    // const loggedInSmeUserId=this?.loggedInSme[0]?.userId

    let param = `/sme-details-new/${this?.loggedInSme[0]?.userId}?smeUserId=${this.subscriptionObj?.subscriptionAssigneeId}`;
    this.userService.getMethodNew(param).subscribe((result: any) => {
      console.log('owner filer name  -> ', result);
      // this.filerName.setValue(result.data[0]?.name);
      // this.ownerName.setValue(result.data[0]?.parentName);
    });
  }

  updateUserDetails() {
    let param = `/profile/${this.userSubscription.userId}`;
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
      mobileNumber: this.mobileNumber.value,
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
        console.log('user upadted res: ', res);
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
    this.loading = true;
    if (this.service === 'ITRU') {
      if (this.assessmentYear.value === '') {
        this.loading = false;
        this.toastMessage.alert('error', 'Please select Financial Year For ITR-U subscription');
        return;
      }
    }
    if (this.userSubscription.smeSelectedPlan != null && this.pin.value) {
      console.log(
        'selectedPlanInfo -> ',
        this.userSubscription.smeSelectedPlan.planId
      );
      let param = '/subscription';
      let reqBody = {
        userId: this.userSubscription.userId,
        planId: this.userSubscription.smeSelectedPlan.planId,
        selectedBy: 'SME',
        promoCode: this.appliedPromo,
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
        removePromoCode: this.isPromoRemoved
      };
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
        }
      );
    } else {
      this.toastMessage.alert('error', 'Please select Plan & Pincode');
      this.loading = false;
    }
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
