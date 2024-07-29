import { DatePipe } from '@angular/common';
import { Component, OnInit,Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { GoogleDriveService } from 'src/app/services/google-drive.service';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-view-documents-dialog',
  templateUrl: './view-documents-dialog.component.html',
  styleUrls: ['./view-documents-dialog.component.scss'],
  providers: [DatePipe]
})
export class ViewDocumentsDialogComponent implements OnInit {
  showSideBar:true
  loading: boolean = false;
  commonDocuments = []
  breadcrumbsPart: any = [];
  folders: any = [];
  isFile: boolean = false;
  filePath: any = '';
  userId: any;
  serviceType:any;
  selectedDocumentIds:any;

  isDownloadAllowed = false;

  constructor(private dialogRef: MatDialogRef<ViewDocumentsDialogComponent>,
  @Inject(MAT_DIALOG_DATA) public data: any,
  private itrMsService: ItrMsService,
  private activatedRoute: ActivatedRoute,
  public utilsService: UtilsService,
  private toastMessageService: ToastMessageService,
  private gdriveService: GoogleDriveService,
  private datePipe: DatePipe) {

  }

  ngOnInit() {
    console.log('Data From CG doc-viewer',this.data);
    if(this.data.serviceType=='ITR'){
      this.breadcrumbsPart = ["Home", "ITR", "2023-24", "Original"];
    }
    this.getCloudFilePath(this.data.serviceType);
  }

  getCloudFilePath(path, from?,) {
    this.loading = true;
    const param = "/cloud/childnodes?currentPath=" + this.data.userId + (path ? this.getCurrentPath(path, from) : ""); //+ this.userObj.userId;
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
          const param = "/cloud/file-info?currentPath=" + this.data.userId + (path ? this.getCurrentPath(path, from) : ""); //+ this.userObj.userId;
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
  supportedTypes = ['pdf', 'xls', 'doc', 'xlsx', 'docx'];
  supportedImageTypes = ['jpg', 'jpeg', 'png', 'svg'];

  getCommonDocsUrl(document) {

    console.log('document selected', document);
    this.loading = true;
    const ext = document.fileName.split('.').pop();
    console.log('this.viewer', this.viewer);
    if(this.supportedTypes.includes(ext.toLowerCase())) {
      this.viewer = 'DOC';
    } else if(this.supportedImageTypes.includes(ext.toLowerCase())) {
      this.viewer = 'IMG';
    }
    if (document.isPasswordProtected) {
      this.docUrl = document.passwordProtectedFileUrl;
      this.loading = false;
      return;
    }
    const param = `/cloud/signed-s3-url?cloudFileId=${document.cloudFileId}`;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      this.loading = false;
      console.log(res);
      if(res['signedUrl']){
        this.docUrl = res['signedUrl'];
      }else{
        this.utilsService.showSnackBar(res.response);
      }
    }, error => {
      this.loading = false;
      this.utilsService.showSnackBar(error);
    });
  }

  preventDownload($event: MouseEvent){
    event.preventDefault();
  }

  showDeleteText(folder) {
    let date = this.datePipe.transform(folder.date, 'medium');
    this.utilsService.showSnackBar(`Deleted By ${folder.deletedBy === "USER" ? 'User' : 'Tax Buddy SME'} on ${date}`)
  }


  selectedFile: any = null;

  selectFile(file: any) {
    this.selectedFile = file;
    console.log('selected file',this.selectedFile)
    let fileName = this.selectedFile?.fileName;
    let allowedFormats = ['xls', 'xlsx'];
    let fileExtension = fileName.split('.').pop();
    console.log('file extension after select ',fileExtension)
    if (allowedFormats.includes(fileExtension)) {
      this.dialogRef.close(this.selectedFile?.cloudFileId);
      } else {
        this.utilsService.showSnackBar(
          'Invalid file format. Only XLS and XLSX files are allowed.'
        );
      }
  }

  isFileSelected(file: any) {
    return this.selectedFile === file;
  }
}
