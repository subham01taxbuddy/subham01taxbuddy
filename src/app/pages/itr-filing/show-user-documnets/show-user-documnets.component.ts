import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ItrMsService } from 'app/services/itr-ms.service';
import { UtilsService } from 'app/services/utils.service';

@Component({
  selector: 'app-show-user-documnets',
  templateUrl: './show-user-documnets.component.html',
  styleUrls: ['./show-user-documnets.component.css']
})
export class ShowUserDocumnetsComponent implements OnInit {
  loading: boolean = false;
  commonDocuments = []

  constructor(private itrMsService: ItrMsService, private activatedRoute: ActivatedRoute, private utilsService: UtilsService) { }

  ngOnInit() {
    const temp = this.activatedRoute.params.subscribe(params => {
      console.log("USER ID :", params)
      this.getCommonDocuments(params['userId']);
    });
  }

  getCommonDocuments(userId) {
    const param = `/cloud/signed-s3-urls?currentPath=${userId}`;
    this.itrMsService.getMethod(param).subscribe((result: any) => {
      console.log('User documents -> ',result)
      this.commonDocuments = result;
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

  getCommonDocsUrl(index) {
    if (this.commonDocuments.length > 0) {
      const docType = this.commonDocuments[index].fileName.split('.').pop();
      if (this.commonDocuments[index].isDeleted) {
        this.utilsService.showSnackBar('This file is deleted by ' + this.commonDocuments[index].deletedBy)
        return;
      }
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
