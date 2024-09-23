import {Component, Input, OnInit} from '@angular/core';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import {ItrMsService} from "../../../../../services/itr-ms.service";
import {AppConstants} from "../../../../shared/constants";
import {UtilsService} from "../../../../../services/utils.service";
import {GoogleDriveService} from "../../../../../services/google-drive.service";

@Component({
  selector: 'app-upload-doc',
  templateUrl: './upload-doc.component.html',
  styleUrls: ['./upload-doc.component.scss']
})
export class UploadDocComponent implements OnInit {

  @Input() userId!: any;
  documents = []
  deletedFileData: any = [];
  viewer = 'DOC';
  docUrl = '';
  loading = false;
  ITR_JSON: ITR_JSON;
  constructor(private itrMsService: ItrMsService,
              private utilsService: UtilsService,
              private gdriveService: GoogleDriveService) { }

  ngOnInit(): void {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.currentPath = `ITR/${this?.utilsService?.getCloudFy(this.ITR_JSON.financialYear)}/Original/ITR Filing Docs`;
    this.getDocuments();
  }

  afterUploadDocs(fileUpload) {
    if (fileUpload === 'File uploaded successfully') {
      this.getDocuments();
    }
  }

  getDocuments() {
    const param = `/cloud/file-info?currentPath=${this.ITR_JSON.userId}/${this.currentPath}`;
    this.itrMsService.getMethod(param).subscribe((result: any) => {
      console.log('documents:', result);
      if(Array.isArray(result)) {
        this.documents = result;
      }
    })
  }

  currentPath = '';

  openDocument(event) {
    console.log('got', event);
    if(!event.type){
      //no doc selected, close doc view
      this.docUrl = null;
      return;
    }
    this.currentPath = event.path;
    const param = `/cloud/file-info?currentPath=${this.ITR_JSON.userId}/${event.path}`;
    this.itrMsService.getMethod(param).subscribe((result: any) => {
      this.documents = result;
      if(this.documents.length > 0) {
        this.getSignedUrl(this.documents[0]);
      }
    })
  }
  getSignedUrl(document) {
    console.log('document selected', document);
    const ext = document.fileName.split('.').pop();
    console.log('this.viewer', this.viewer);
    if (ext.toLowerCase() === 'pdf' || ext.toLowerCase() === 'xls' || ext.toLowerCase() === 'doc' || ext.toLowerCase() === 'xlsx' || ext.toLowerCase() === 'docx') {
      this.viewer = 'DOC';
    } else {
      this.viewer = 'IMG';
    }
    if (document.isPasswordProtected) {
      this.docUrl = document.passwordProtectedFileUrl;
      return;
    }

    this.loading = true;
    const param = `/cloud/signed-s3-url?cloudFileId=${document.cloudFileId}`;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      console.log(res);
      this.docUrl = res['signedUrl'];
      console.log(this.docUrl);
      this.loading = false;
    }, error => {
      this.loading = false;
    })
  }

  // ngAfterViewInit(){
  //   this.gdriveService.loadGoogleLib();
  // }

  editFile(document) {
    this.loading = true;
    const param = `/cloud/signed-s3-url?cloudFileId=${document.cloudFileId}`;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      console.log(res);
      this.docUrl = res['signedUrl'];
      console.log(this.docUrl);
      this.loading = false;

      //open file in gdrive
      this.gdriveService.loadGoogleLib(document.fileName, this.docUrl);
    }, error => {
      this.loading = false;
    })
  }

  deleteFile(fileName) {
    let adminId = this.utilsService.getLoggedInUserID();
    let path = '/itr/cloud/files?actionBy=' + adminId;
    let filePath = `${fileName}`;
    let reqBody = [filePath];
    console.log('URL path: ', path, ' filePath: ', filePath, ' Request body: ', reqBody);
    this.itrMsService.deleteMethodWithRequest(path, reqBody).subscribe((response: any) => {
        console.log('Doc delete response: ', response);
        this.utilsService.showSnackBar(response.response);
        this.getDocuments();
      },
      error => {
        console.log('Doc delete ERROR response: ', error.response);
        this.utilsService.showSnackBar(error.response);
      })
  }

  deletedFileInfo(cloudFileId) {
    this.deletedFileData = [];
    this.loading = true;
    let param = '/cloud/log?cloudFileId=' + cloudFileId;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
        this.loading = false;
        this.deletedFileData = res;
        console.log('Deleted file detail info: ', this.deletedFileData);
      },
      error => {
        this.loading = false;
      })
  }

  closeDialog() {
    this.deletedFileData = [];
  }
}
