import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ItrMsService } from 'app/services/itr-ms.service';
import { UtilsService } from 'app/services/utils.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-show-user-documnets',
  templateUrl: './show-user-documnets.component.html',
  styleUrls: ['./show-user-documnets.component.css']
})
export class ShowUserDocumnetsComponent implements OnInit {
  loading: boolean = false;
  commonDocuments = []
  breadcrumbsPart: any = [];
  folders: any = [];
  isFile: boolean = false;
  filePath: any = '';
  userId: any;

  constructor(private itrMsService: ItrMsService, private activatedRoute: ActivatedRoute, public utilsService: UtilsService) { }

  ngOnInit() {
    const temp = this.activatedRoute.params.subscribe(params => {
      console.log("USER ID :", params)
      // this.getCommonDocuments(params['userId']);
      this.userId = params['userId'];
      this.getCloudFilePath("");
    });
  }

  // getCommonDocuments(userId) {
  //   const param = `/cloud/signed-s3-urls?currentPath=${userId}`;
  //   this.itrMsService.getMethod(param).subscribe((result: any) => {
  //     console.log('User documents -> ',result)
  //     this.commonDocuments = result;
  //   })
  // }

  getCloudFilePath(path, from?) {
    this.loading = true;
    const param = "/cloud/childnodes?currentPath=" + this.userId + (path ? this.getCurrentPath(path, from) : ""); //+ this.userObj.userId;
    this.itrMsService.getMethod(param).subscribe(
      (result: any) => {
        console.log("Cloud path: ", result, typeof result);
        console.log("Res length: ", result.length);
        this.loading = false;
        var mainFolder = result;
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
              }
            }, (error) => {
              console.log('error: => ', error)
            }
          );
        }

      }, (error) => {
        console.log("error == ", error);
        this.loading = false;
        // this.utilsService.disposable.unsubscribe();
        // this.errorHandler(error);
      }
    );
  }

  getCurrentPath(path, from?) {
    if (from) {
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
        console.log("this.filePath: => ", this.filePath);
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
    if (ext.toLowerCase() === 'pdf' || ext.toLowerCase() === 'xls' || ext.toLowerCase() === 'doc' || ext.toLowerCase() === 'xlsx' || ext.toLowerCase() === 'docx') {
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
      console.log(res);
      this.docUrl = res['signedUrl'];
      this.loading = false;
    }, error => {
      this.loading = false;
    })
  }

  afterUploadDocs(fileUpload) {
    if (fileUpload === 'File uploaded successfully') {
      this.getCloudFilePath("");
    }
  }

  getInfotext(folder) {
    return `Deleted By ${folder.deletedBy === "USER" ? 'User' : 'Tax Buddy SME'} on ${folder.date}`
  }

}
