import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';
import { AppConstants } from 'app/shared/constants';
import { ITR_JSON } from 'app/shared/interfaces/itr-input.interface';

@Component({
  selector: 'app-document-upload',
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.css']
})
export class DocumentUploadComponent implements OnInit {

  uploadDoc: any;
  docType: any = [
    { value: 'FORM_16', label: 'Form 16' },
    { value: 'AADHAAR_FRONT', label: 'Aadhar front' },
    { value: 'AADHAAR_BACK', label: 'Aadhar back' },
    { value: 'PAN', label: 'Pan card' },
    { value: 'BANK_STATEMENT', label: 'Bank Statement' },
    { value: 'CAPITAL_GAIN_STATEMENT', label: 'Capital Gain Statement' },
    { value: 'SALE_AGREEMENT', label: 'Sale agreement' },
    { value: 'PURCHASE_AGREEMENT', label: 'Purchase agreement' },
    { value: 'FOREIGN_INCOME_STATEMENT', label: 'Foreign income statement' },
    { value: 'LOAN_STATEMENT', label: 'Loan statement' },
    { value: 'FORM_26_AS', label: 'Form 26' },
    { value: null, label: 'Miscellaneous' }];
  isPassProtected: boolean;
  filePassword: any;
  loading: boolean = false;
  ITR_JSON: ITR_JSON;

  @Output() onUploadDoucument = new EventEmitter<any>();

  constructor(private userMsService: UserMsService, private utilsService: UtilsService) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
  }

  ngOnInit() {
  }

  clearDocVal() {
    this.uploadDoc = null;
     this.filePassword = '';
    this.isPassProtected = false;
  }

  uploadFile(file: FileList) {
    console.log("File", file);
    this.filePassword = '';
    if (file.length > 0) {
      this.uploadDoc = file.item(0);
    }
  }

  upload() {
    document.getElementById("input-file-id").click();
  }

  checkDocPassProtected(type, document, password) {
    console.log('type: ', type, ' document: ', document)
    if (document.name.split('.').reverse()[0] === 'pdf') {
      this.loading = true;
      const formData = new FormData();
      formData.append("password", password);
      formData.append("multipartFile", document);
      let param = '/gateway/custom-bot/is-password-protected'
      this.userMsService.postMethodInfo(param, formData).subscribe((res: any) => {
        this.loading = false;
        console.log('checkDocPassProtected responce =>', res)
        if (res.response === 'File is password protected!') {
          this.isPassProtected = true;
        }
        else if (res.response === 'Invalid Password') {
          this.isPassProtected = true;
          this.utilsService.showSnackBar('Invalid Password, Enter valid password.')
        }
        else if (res.response === 'Valid Password') {
          this.isPassProtected = false;
          this.uploadDocument(type, document, password)
        }
        else if (res.response === 'File is not password protected!') {
          this.isPassProtected = false;
          this.uploadDocument(type, document)
        }
        // this.uploadDocument(type, document)
      },
        error => {
          this.loading = false;
        })
    }
    else {
      this.uploadDocument(type, document)

    }
  }

  uploadDocument(type, document, password?) {
    this.loading = true;
    let userId = this.ITR_JSON.userId;
    var s3ObjectUrl;
    if (type === 'PAN' || type === 'AADHAAR_BACK' || type === 'AADHAAR_FRONT') {
      s3ObjectUrl = userId + '/Common/' + document.name;
    }
    else {
      s3ObjectUrl = userId + '/ITR/2019-20/Original/ITR Filing Docs/' + document.name;
    }

    let cloudFileMetaData = '{"fileName":"' + document.name + '","userId":' + userId + ',"accessRight":["' + userId + '_W"' + '],"origin":"BO", "s3ObjectUrl":"' + s3ObjectUrl + '","password":"' + (password ? password : null) + '"}';
    console.log("cloudFileMetaData ===> ", cloudFileMetaData)
    const formData = new FormData();
    formData.append("file", document);
    formData.append("cloudFileMetaData", cloudFileMetaData);
    let param = '/itr/cloud/upload'
    this.userMsService.postMethodInfo(param, formData).subscribe((res: any) => {
      this.loading = false;
      console.log('uploadDocument responce =>', res)
      if (res.Failed === 'Failed to uploade file!') {
        this.utilsService.showSnackBar(res.Failed)
      }
      else if (res.Success === 'File successfully uploaded!') {
        this.utilsService.showSnackBar(res.Success);
        this.onUploadDoucument.emit('File uploaded successfully')
      }
    },
      error => {
        this.loading = false;
      })
  }

}
