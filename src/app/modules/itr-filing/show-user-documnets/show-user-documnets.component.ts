import { ToastMessageService } from 'src/app/services/toast-message.service';
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { environment } from 'src/environments/environment';
import {GoogleDriveService} from "../../../services/google-drive.service";

@Component({
  selector: 'app-show-user-documnets',
  templateUrl: './show-user-documnets.component.html',
  styleUrls: ['./show-user-documnets.component.css'],
  providers: [DatePipe]
})
export class ShowUserDocumnetsComponent implements OnInit {
  showSideBar:true
  loading: boolean = false;
  commonDocuments = []
  breadcrumbsPart: any = [];
  folders: any = [];
  isFile: boolean = false;
  filePath: any = '';
  userId: any;
  serviceType:any;

  constructor(private itrMsService: ItrMsService, private activatedRoute: ActivatedRoute, public utilsService: UtilsService,
    private datePipe: DatePipe, private toastMessageService: ToastMessageService,
              private gdriveService: GoogleDriveService) { }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      console.log("params from more  :", params)
      // this.getCommonDocuments(params['userId']);
      this.userId = params['userId'];
      this.serviceType=params['serviceType']
      // For directly navigating to ITR folder docs
      if(this.serviceType=='ITR'){
        this.breadcrumbsPart = ["Home", "ITR", "2022-23", "Original", "ITR Filing Docs"];
      }
      else if(this.serviceType=='TPA'){
        this.breadcrumbsPart = ["Home", "TPA", "2022-23"];
      }
      else if(this.serviceType=='GST'){
        this.breadcrumbsPart = ["Home", "GST", "2022-23",];
      }
      else if(this.serviceType=='NOTICE'){
        this.breadcrumbsPart = ["Home", "NOTICE", "2022-23", "Original", "NOTICE Filing Docs"];
      }
      else{
        this.breadcrumbsPart = ["Home", "ITR", "2021-22", "Original", "ITR Filing Docs"];
      }


      this.getCloudFilePath(this.serviceType);
    });
  }

  editFile(document) {
    this.loading = true;
    const param = `/cloud/signed-s3-url?filePath=${document.filePath}`;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      console.log(res);
      this.docUrl = res['signedUrl'];
      console.log(this.docUrl);
      this.loading = false;

      //open file in gdrive
      this.gdriveService.loadGoogleLib(document.fileName, this.docUrl);
      // this.gdriveService.getUserConsent();
    }, error => {
      this.loading = false;
    })
  }
  // getCommonDocuments(userId) {
  //   const param = `/cloud/signed-s3-urls?currentPath=${userId}`;
  //   this.itrMsService.getMethod(param).subscribe((result: any) => {
  //     console.log('User documents -> ',result)
  //     this.commonDocuments = result;
  //   })
  // }

  getCloudFilePath(path, from?,) {
    this.loading = true;
    const param = "/cloud/childnodes?currentPath=" + this.userId + (path ? this.getCurrentPath(path, from) : ""); //+ this.userObj.userId;
    this.itrMsService.getMethod(param).subscribe(
      (result: any) => {
        console.log("Cloud path: ", result, typeof result);
        console.log("Res length: ", result.length);

        if (result.length > 0) {
          if (!this.breadcrumbsPart.includes("Home")) {
            this.breadcrumbsPart.splice(0, 1, "Home");
            this.folders = result;
          } else {
            this.folders = result;
          }
          if (typeof this.folders[0] === 'object') {
            let checkIsFile = this.folders.filter((item) => item.fileName.includes("."));
            if (checkIsFile.length > 0) {
              this.isFile = true;
            } else {
              this.isFile = false;
              this.docUrl = '';
            }
          } else {
            this.isFile = false;
            this.docUrl = '';
          }
          this.loading = false;

          console.log("breadcrumbsPart:===> ", this.breadcrumbsPart);
        } else if (result.length === 0) {
          const param = "/cloud/file-info?currentPath=" + this.userId + (path ? this.getCurrentPath(path, from) : ""); //+ this.userObj.userId;
          this.itrMsService.getMethod(param).subscribe(
            (folderRes: any) => {
              this.folders = folderRes;
              console.log('Type of folders 0th postion val: ', typeof this.folders[0])
              if (typeof this.folders[0] === 'object') {
                let checkIsFile = this.folders.filter((item) => item.fileName.includes("."));
                if (checkIsFile.length > 0) {
                  this.isFile = true;
                } else {
                  this.isFile = false;
                  this.docUrl = '';
                }
              } else {
                this.isFile = false;
                this.docUrl = '';
                if (from !== 'Inside') {
                  this.getCloudFilePath("", 'Inside');
                  this.breadcrumbsPart = [];
                }
              }
              this.loading = false;
            }, (error) => {
              console.log('error: => ', error);
              this.loading = false;
            }
          );
        }

      }, (error) => {
        console.log("error === ", error);
        this.loading = false;
        if (error.status === 403) {
          this.toastMessageService.alert('error', error.error.detail)
        }
        // this.utilsService.disposable.unsubscribe();
        // this.errorHandler(error);
      }
    );
  }

  getCurrentPath(path, from?) {
    if (from === 'fromBreadcrum') {
      var indexOfClickPath = this.breadcrumbsPart.indexOf(path);
      this.breadcrumbsPart.splice((indexOfClickPath + 1), this.breadcrumbsPart.length)
    }
    console.log("this.breadcrumbsPart : ", this.breadcrumbsPart);
    if (path !== "Home") {
      if (this.breadcrumbsPart.length > 0) {
        let isDuplicatePath = this.breadcrumbsPart.filter(
          (item) => item === path
        );
        console.log("isDuplicatePath: ", isDuplicatePath);
        if (isDuplicatePath.length === 0) {
          this.breadcrumbsPart.splice(this.breadcrumbsPart.length, 1, path);
        }
        this.filePath = "";
        for (let i = 0; i < this.breadcrumbsPart.length; i++) {
          if (this.breadcrumbsPart[i] !== "Home") {
            this.filePath = this.filePath + "/" + this.breadcrumbsPart[i];
          }
        }
        console.log("this.filePath: => ", this.filePath, this.breadcrumbsPart);
        return this.filePath;
      } else {
        return "";
      }
    } else {
      return "";
    }
  }

  downloadFile(fileName) {
    console.log('filePath: ', this.filePath)
    console.log('Href path is: ', environment.url + '/itr/cloud/download?filePath=' + this.userId + this.filePath + '/' + fileName)
    location.href = environment.url + '/itr/cloud/download?filePath=' + this.userId + this.filePath + '/' + fileName;
  }


  zoom: number = 1.0;
  incrementZoom(amount: number) {
    this.zoom += amount;
  }

  docDetails = {
    docUrl: '',
    docType: ''
  };

  viewer = 'DOC';
  docUrl = '';
  getCommonDocsUrl(document) {
    // this.commonDocuments = this.folders;
    // if (this.commonDocuments.length > 0) {
    //   const docType = this.commonDocuments[index].fileName.split('.').pop();
    //   if (this.commonDocuments[index].isDeleted) {
    //     this.utilsService.showSnackBar('This file is deleted by ' + this.commonDocuments[index].deletedBy)
    //     return;
    //   }
    //   if (this.commonDocuments[index].isPasswordProtected) {
    //     this.docDetails.docUrl = this.commonDocuments[index].passwordProtectedFileUrl;
    //   } else {
    //     this.docDetails.docUrl = this.commonDocuments[index].signedUrl;
    //   }
    //   this.docDetails.docType = docType;
    // } else {
    //   this.docDetails.docUrl = '';
    //   this.docDetails.docType = '';
    // }

    console.log('document selected', document);
    this.loading = true;
    const ext = document.fileName.split('.').pop();
    console.log('this.viewer', this.viewer);
    if(ext.toLowerCase() === 'pdf' || ext.toLowerCase() === 'xls' || ext.toLowerCase() === 'doc' || ext.toLowerCase() === 'xlsx' || ext.toLowerCase() === 'docx') {
      this.viewer = 'DOC';
    } else {
      this.viewer = 'IMG';
    }
    if (document.isPasswordProtected) {
      this.docUrl = document.passwordProtectedFileUrl;
      return;
    }
    const param = `/cloud/signed-s3-url?filePath=${document.filePath}`;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      this.loading = false;
      console.log(res);
      if(res['signedUrl']){
        this.docUrl = res['signedUrl'];
      }else{
        this.utilsService.showSnackBar(res.response);
      }

      // window.open(this.docUrl);
      // this.utilsService.showSnackBar(res.response);
    }, error => {
      this.loading = false;
      this.utilsService.showSnackBar(error);
    })
  }

  preventDownload($event: MouseEvent){
    event.preventDefault();
  }

  afterUploadDocs(fileUpload) {
    if (fileUpload === 'File uploaded successfully') {
      this.getCloudFilePath("");
    }
  }

  showDeleteText(folder) {
    let date = this.datePipe.transform(folder.date, 'medium');
    this.utilsService.showSnackBar(`Deleted By ${folder.deletedBy === "USER" ? 'User' : 'Tax Buddy SME'} on ${date}`)
  }

  deleteFile(fileName) {

    // this.utilsService.openLoaderDialog();
    // console.log('current loaded file path: ', this.userObj.userId + '' + this.filePath + '/' + fileName);
    // eslint-disable-next-line prefer-const
    const userId = this.utilsService.getLoggedInUserID();
    let path = '/itr/cloud/files?actionBy=' + userId;
    const filePath = this.userId + '' + this.filePath + '/' + fileName;
    const body = [filePath];
    console.log('body: ', body);
    this.itrMsService.deleteMethodWithRequest(path, body).subscribe((res: any) => {
      console.log('Responce after delete file: ', res);
      // this.utilsService.disposable.unsubscribe();
      this.utilsService.showSnackBar(res.response);
      const lastBreadcrumb = this.breadcrumbsPart[this.breadcrumbsPart.length - 1];
      this.getCloudFilePath(lastBreadcrumb);
    },
      error => {
        console.log('There is some erro for deleting file: ', error);
        // this.utilsService.disposable.unsubscribe();
        this.utilsService.showSnackBar(error.response);
      });

  }

  closeComponent() {
    window.close();
  }

}
