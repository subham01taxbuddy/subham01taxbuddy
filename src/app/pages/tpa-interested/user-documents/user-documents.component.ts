import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ItrMsService } from 'app/services/itr-ms.service';

@Component({
  selector: 'app-user-documents',
  templateUrl: './user-documents.component.html',
  styleUrls: ['./user-documents.component.css']
})
export class UserDocumentsComponent implements OnInit {
  loading: boolean = false;
  commonDocuments = []
  itrDocuments = [];
  constructor(private itrMsService: ItrMsService, private activatedRoute: ActivatedRoute,) { }

  ngOnInit() {
    const temp = this.activatedRoute.params.subscribe(params => {
      console.log("99999999999999999:", params)
      this.getItrDocuments(params['userId']);
      this.getCommonDocuments(params['userId']);
    });
  }
  getCommonDocuments(userId) {
    const param = `/cloud/signed-s3-urls?currentPath=${userId}/Common`;
    this.itrMsService.getMethod(param).subscribe((result: any) => {
      this.commonDocuments = result;
    })
  }
  getItrDocuments(userId) {
    const param1 =
      `/cloud/signed-s3-urls?currentPath=${userId}/ITR/2019-20/Original/ITR Filing Docs`;
    this.itrMsService.getMethod(param1).subscribe((result: any) => {
      this.itrDocuments = result;
      this.getDocsUrl(0);
    })
  }

  zoom: number = 1.0;
  incrementZoom(amount: number) {
    this.zoom += amount;
  }

  docDetails = {
    docUrl: '',
    docType: ''
  };
  getDocsUrl(index) {
    if (this.itrDocuments.length > 0) {
      const docType = this.itrDocuments[index].fileName.split('.').pop();
      if (this.itrDocuments[index].isPasswordProtected) {
        this.docDetails.docUrl = this.itrDocuments[index].passwordProtectedFileUrl;
      } else {
        this.docDetails.docUrl = this.itrDocuments[index].signedUrl;
      }
      this.docDetails.docType = docType;
    } else {
      this.docDetails.docUrl = '';
      this.docDetails.docType = '';
    }
  }

  getCommonDocsUrl(index) {
    if (this.commonDocuments.length > 0) {
      const docType = this.commonDocuments[index].fileName.split('.').pop();
      if (this.commonDocuments[index].isPasswordProtected) {
        this.docDetails.docUrl = this.commonDocuments[index].passwordProtectedFileUrl;
      } else {
        this.docDetails.docUrl = this.commonDocuments[index].signedUrl;
      }
      this.docDetails.docType = docType;
    } else {
      this.docDetails.docUrl = '';
      this.docDetails.docType = '';
    }
  }
}
