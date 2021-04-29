import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ItrMsService } from 'app/services/itr-ms.service';
import { UtilsService } from 'app/services/utils.service';

@Component({
  selector: 'app-user-documents',
  templateUrl: './user-documents.component.html',
  styleUrls: ['./user-documents.component.css']
})
export class UserDocumentsComponent implements OnInit {
  loading: boolean = false;
  commonDocuments = [];
  viewer = 'DOC';
  docUrl = '';

  constructor(private itrMsService: ItrMsService, private activatedRoute: ActivatedRoute, private utilsService: UtilsService) { }

  ngOnInit() {
    const temp = this.activatedRoute.params.subscribe(params => {
      console.log("99999999999999999:", params)
      this.getDocuments(params['userId']);
    });
  }
  getDocuments(userId) {
    const param = `/cloud/file-info?currentPath=${userId}`;
    this.itrMsService.getMethod(param).subscribe((result: any) => {
      this.commonDocuments = result;
    })
  }


  getSignedUrl(document) {
    if (document.isDeleted) {
      this.utilsService.showSnackBar('This file is deleted by ' + document.deletedBy)
      return;
    }
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
    const param = `/cloud/signed-s3-url?filePath=${document.filePath}`;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      console.log(res);
      this.docUrl = res['signedUrl'];
      this.loading = false;
    }, error => {
      this.loading = false;
    })
  }
}
