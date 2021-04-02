import { ItrMsService } from './../../../services/itr-ms.service';
import { UtilsService } from './../../../services/utils.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserMsService } from 'app/services/user-ms.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-gst-cloud',
  templateUrl: './gst-cloud.component.html',
  styleUrls: ['./gst-cloud.component.css']
})
export class GstCloudComponent implements OnInit {
  loading = false;
  searchForm: FormGroup;
  selectedUserName = '';
  userProfile: any;
  selectedBillType = '';
  cloudView = 'BILLS'
  selected_invoices_list = [];
  viewer = 'DOC';
  docUrl = '';
  uploadDoc: any;

  fyDropDown = [
    { value: '2017-18', displayName: '2017-18' },
    { value: '2018-19', displayName: '2018-19' },
    { value: '2019-20', displayName: '2019-20' },
    { value: '2020-21', displayName: '2020-21' },
  ];

  monthDropDown = [
    { value: 'Jan', displayName: 'Jan' },
    { value: 'Feb', displayName: 'Feb' },
    { value: 'Mar', displayName: 'Mar' },
    { value: 'Apr', displayName: 'Apr' },
    { value: 'May', displayName: 'May' },
    { value: 'Jun', displayName: 'Jun' },
    { value: 'Jul', displayName: 'Jul' },
    { value: 'Aug', displayName: 'Aug' },
    { value: 'Sep', displayName: 'Sep' },
    { value: 'Oct', displayName: 'Oct' },
    { value: 'Nov', displayName: 'Nov' },
    { value: 'Dec', displayName: 'Dec' },
  ];
  summarisedInvoices: any;
  constructor(private fb: FormBuilder, private userMsService: UserMsService,
    public utilsService: UtilsService, private itrMsService: ItrMsService,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.searchForm = this.fb.group({
      mobileNumber: ['', Validators.required],
      financialYear: ['', Validators.required],
      month: ['', Validators.required],
    });
    this.activatedRoute.queryParams.subscribe((params) => {
      console.log("99999999999999999:", params)
      if (this.utilsService.isNonEmpty(params['userId'])) {
        this.getProfile(params['userId']);
      }
    });
  }

  async advanceSearch() {
    if (this.searchForm.valid) {
      this.loading = true
      this.userProfile = await this.getUserProfileByMobileNum(this.searchForm.value.mobileNumber).catch(error => {
        this.loading = false;
        console.log(error);
        this.utilsService.showSnackBar(error.error.detail);
        return;
      });
      console.log('User Profile', this.userProfile)
      if (this.utilsService.isNonEmpty(this.userProfile)) {
        const param = `/cloud/file-count?cloudPath=${this.userProfile.userId}/GST/${this.searchForm.value.financialYear}/${this.searchForm.value.month}/Invoice`;
        this.itrMsService.getMethod(param).subscribe((res: any) => {
          console.log('Invoices Result', res);
          this.summarisedInvoices = res;
          this.loading = false;
        }, error => {
          this.loading = false;
          this.utilsService.showSnackBar('Error while loading invoice count please try again');
        })
      }
    }
  }

  async getProfile(userId) {
    this.loading = true;
    let param = `/profile/${userId}`;
    this.userProfile = await this.userMsService.getMethod(param).toPromise().catch(error => {
      this.loading = false;
      console.log(error);
      this.utilsService.showSnackBar(error.error.detail);
      return;
    })
    this.loading = false;
    this.searchForm.controls['mobileNumber'].setValue(this.userProfile.mobileNumber);
  }
  async getUserProfileByMobileNum(mobileNumber) {
    let param = '/search/userprofile/query?mobileNumber=' + mobileNumber;
    const profiles = await this.userMsService.getMethod(param).toPromise();
    if ((profiles && profiles['records'] instanceof Array)) {
      return profiles['records'][0];
    }
    return null;
  }

  // async getUserProfile(userId) {
  //   let param = `/profile/${userId}`;
  //   const profile = await this.userMsService.getMethod(param).toPromise();
  //   return profile;
  // }

  // getInvoiceCardTitle() {
  //   if (this.selectedBillType == "sales-invoice") {
  //     return "Sales Bills Invoices";
  //   } else if (this.selectedBillType == "purchase-invoice") {
  //     return "Purchase / Expense Bills Invoices";
  //   } else if (this.selectedBillType == "credit") {
  //     return "Credit Note Bills Invoices";
  //   } else if (this.selectedBillType == "debit") {
  //     return "Debit Note Bills Invoices";
  //   } else {
  //     return "";
  //   }
  // }

  getInvoicesByBillType(type) {
    this.selectedBillType = type;
    this.loading = true;
    const param = `/cloud/files?currentPath=${this.userProfile.userId}/GST/${this.searchForm.value.financialYear}/${this.searchForm.value.month}/Invoice/${type}`;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      console.log('Invoices Result', res);
      this.selected_invoices_list = res;
      this.loading = false;
      this.cloudView = 'INVOICE_LIST'
    }, error => {
      this.loading = false;
      this.utilsService.showSnackBar('Error while loading invoice list please try again');
    })
  }

  cancelInvoiceList() {
    this.cloudView = 'BILLS'
  }

  uploadBill(ss) {

  }


  viewInvoice(invoice) {
    console.log('invoice selected', invoice);
    const ext = invoice.fileName.split('.').pop();
    console.log('this.viewer', this.viewer);
    if (ext.toLowerCase() === 'pdf' || ext.toLowerCase() === 'xls' || ext.toLowerCase() === 'doc' || ext.toLowerCase() === 'xlsx' || ext.toLowerCase() === 'docx') {
      this.viewer = 'DOC';
    } else {
      this.viewer = 'IMG';
    }
    const param = `/cloud/signed-s3-url?filePath=${this.userProfile.userId}/GST/${this.searchForm.value.financialYear}/${this.searchForm.value.month}/Invoice/${this.selectedBillType}/${invoice.fileName}`;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      console.log(res);
      this.cloudView = 'VIEW_INVOICE';
      this.docUrl = res['signedUrl'];
    })
  }

  onCancelBtnClicked() {
    this.cloudView = 'INVOICE_LIST';
  }

  uploadFile(file: FileList){
    console.log('File: ',file)
    if(file.length > 0){
      this.uploadDoc = file.item(0);
      console.log('uploadDoc -> ',this.uploadDoc)
    }
  }

  uploadDocumnet(){
    this.loading = true;
    let s3ObjectUrl = this.userProfile.userId + '/GST/'+this.searchForm.value.financialYear +'/'+this.searchForm.value.month+'/Document/'+ this.uploadDoc.name;
    let cloudFileMetaData = '{"fileName":"' + this.uploadDoc.name + '","userId":' + this.userProfile.userId + ',"accessRight":["' + this.userProfile.userId + '_W"' + '],"origin":"BO", "s3ObjectUrl":"' + s3ObjectUrl + '"'+'}';
    const formData = new FormData();
    formData.append("file", this.uploadDoc);
    formData.append("cloudFileMetaData", cloudFileMetaData);
    console.log("formData ===> ", formData);
    let param = '/itr/cloud/upload'
    this.userMsService.postMethodInfo(param, formData).subscribe((res: any) => {
      this.loading = false;
      this.uploadDoc = '';
      console.log('uploadDocument responce =>', res)
      if (res.Failed === 'Failed to uploade file!') {
        this.utilsService.showSnackBar(res.Failed)
      }
      else if (res.Success === 'File successfully uploaded!') {
        this.utilsService.showSnackBar(res.Success);
       // this.onUploadDoucument.emit('File uploaded successfully')
      }
    },
      error => {
        this.loading = false;
      })
  }
}
