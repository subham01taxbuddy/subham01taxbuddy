import { ToastMessageService } from 'src/app/services/toast-message.service';
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { environment } from 'src/environments/environment';
import { GoogleDriveService } from "../../../services/google-drive.service";
import * as FileSaver from 'file-saver';
import * as JSZip from "jszip";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { saveAs } from "file-saver/dist/FileSaver";

@Component({
  selector: 'app-show-user-documnets',
  templateUrl: './show-user-documnets.component.html',
  styleUrls: ['./show-user-documnets.component.css'],
  providers: [DatePipe]
})
export class ShowUserDocumnetsComponent implements OnInit {
  showSideBar: true
  loading: boolean = false;
  commonDocuments = []
  breadcrumbsPart: any = [];
  folders: any = [];
  isFile: boolean = false;
  filePath: any = '';
  userId: any;
  serviceType: any;

  isDownloadAllowed = false;
  mobileNumber: any;

  constructor(private itrMsService: ItrMsService, private activatedRoute: ActivatedRoute, public utilsService: UtilsService,
    private datePipe: DatePipe, private toastMessageService: ToastMessageService,
    private httpClient: HttpClient,
    private gdriveService: GoogleDriveService) { }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      console.log("params from more  :", params)
      this.userId = params['userId'];
      this.serviceType = params['serviceType']
      // this.mobileNumber = params['mobileNumber'];
      // For directly navigating to ITR folder docs
      if (this.serviceType == 'ITR') {
        this.breadcrumbsPart = ["Home", "ITR", "2023-24", "Original", "ITR Filing Docs"];
      }
      else if (this.serviceType == 'TPA') {
        this.breadcrumbsPart = ["Home", "TPA", "2023-24"];
      }
      else if (this.serviceType == 'GST') {
        this.breadcrumbsPart = ["Home", "GST", "2023-24",];
      }
      else if (this.serviceType == 'NOTICE') {
        this.breadcrumbsPart = ["Home", "NOTICE", "2023-24", "Original", "NOTICE Filing Docs"];
      }
      else {
        this.breadcrumbsPart = ["Home", "ITR", "2021-22", "Original", "ITR Filing Docs"];
      }

      this.getCloudFilePath(this.serviceType);
      this.utilsService.getUserDetailsByUserId(this.userId).subscribe((res: any) => {
        console.log(res);
        if (res?.records) {
          this.mobileNumber = res?.records[0]?.mobileNumber;
        }
      });
    });
  }

  isDownloadAccess() {
    let roles = this.utilsService.getUserRoles();
    let filtered = roles.filter(item => item === 'ROLE_ADMIN' || item === 'ROLE_LEADER' || item === 'ROLE_OWNER');
    this.isDownloadAllowed = filtered && filtered.length > 0 ? true : false;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.isDownloadAccess();
    }, 2000);
  }

  isAisDocument(document) {
    return document.documentTag === 'AIS_JSON' || document.documentTag === 'AIS' || document.fileName.includes("_AIS_");
  }

  gotoDrive(document) {
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
    });
  }

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
            if (this.folders.length <= 2 && this.folders.includes('ITR')) {
              this.getCloudFilePath('ITR');
            }
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
        if (error.status === 401) {
          this.toastMessageService.alert('error', error.error.detail)
        }
      }
    );
  }

  getCurrentPath(path, from?) {
    if (from === 'fromBreadcrum') {
      let indexOfClickPath = this.breadcrumbsPart.indexOf(path);
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

  async downloadAll(folders) {
    this.loading = true;
    const zip = new JSZip();
    const name = this.userId + '.zip';
    // tslint:disable-next-line:prefer-for-of

    let completed = [];
    let repeat = 1;
    for (let counter = 0; counter < folders.length; counter++) {
      let document = folders[counter];
      let fileUrl;
      fileUrl = environment.url + '/itr/cloud/download?filePath=' + this.userId + this.filePath + '/' + document.fileName;
      const fileData: any = await this.getFile(fileUrl);
      const b: any = new Blob([fileData], { type: '' + fileData.type + '' });
      let fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
      if (completed.includes(fileName)) {
        fileName = fileName.substring(0, fileName.lastIndexOf('.')) + "_" + repeat + fileName.substring(fileName.lastIndexOf('.'));
      }
      completed.push(fileName);
      zip.file(fileName, b);
    }
    this.loading = false;
    zip.generateAsync({ type: 'blob' }).then((content) => {
      if (content) {
        FileSaver.saveAs(content, name);
      }
    });

  }

  async getFile(url: string) {
    const httpOptions = {
      responseType: 'blob' as 'json'
    };
    const res = await this.httpClient.get(url, httpOptions).toPromise().catch((err: HttpErrorResponse) => {
      const error = err.error;
      console.log(error);
      return error;
    });
    return res;
  }

  downloadFile(document) {
    console.log('filePath: ', this.filePath)
    console.log('Href path is: ', environment.url + '/itr/cloud/download?filePath=' + this.userId + this.filePath + '/' + document.fileName)
    let signedUrl = environment.url + '/itr/cloud/download?filePath=' + this.userId + this.filePath + '/' + document.fileName;
    this.loading = true;
    this.httpClient.get(signedUrl, { responseType: "arraybuffer" }).subscribe(
      pdf => {
        this.loading = false;
        const blob = new Blob([pdf], { type: "application/pdf" });
        saveAs(blob, document.fileName);
      },
      err => {
        this.loading = false;
        this.utilsService.showSnackBar('Failed to download document');
      }
    );
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
  docType = '';
  supportedTypes = ['pdf', 'xls', 'doc', 'xlsx', 'docx'];
  supportedImageTypes = ['jpg', 'jpeg', 'png', 'svg'];

  isDocTypeSupported(document) {
    const ext = document.fileName.split('.').pop();
    return this.supportedTypes.includes(ext.toLowerCase()) || this.supportedImageTypes.includes(ext.toLowerCase());
  }

  getCommonDocsUrl(document) {
    console.log('document selected', document);
    this.loading = true;
    const ext = document.fileName.split('.').pop();
    console.log('this.viewer', this.viewer);
    if (this.supportedTypes.includes(ext.toLowerCase())) {
      this.viewer = 'DOC';
    } else if (this.supportedImageTypes.includes(ext.toLowerCase())) {
      this.viewer = 'IMG';
    }
    this.docType = document.fileName.substr(document.fileName.lastIndexOf('.') + 1);
    if (document.isPasswordProtected) {
      this.docUrl = document.passwordProtectedFileUrl;
      this.loading = false;
      return;
    }
    const param = `/cloud/signed-s3-url?cloudFileId=${document.cloudFileId}`;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      this.loading = false;
      console.log(res);
      if (res['signedUrl']) {
        this.docUrl = res['signedUrl'];
      } else {
        this.utilsService.showSnackBar(res.response);
      }
    }, error => {
      this.loading = false;
      this.utilsService.showSnackBar(error);
    });
  }

  preventDownload($event: MouseEvent) {
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
      this.utilsService.showSnackBar(res.response);
      const lastBreadcrumb = this.breadcrumbsPart[this.breadcrumbsPart.length - 1];
      this.getCloudFilePath(lastBreadcrumb);
    },
      error => {
        console.log('There is some erro for deleting file: ', error);
        this.utilsService.showSnackBar(error.response);
      });

  }

  closeComponent() {
    window.close();
  }

}
