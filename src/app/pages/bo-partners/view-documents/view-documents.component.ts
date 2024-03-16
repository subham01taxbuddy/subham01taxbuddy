import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-view-documents',
  templateUrl: './view-documents.component.html',
  styleUrls: ['./view-documents.component.scss'],
})
export class ViewDocumentsComponent implements OnInit {
  loading = false;

  constructor(
    public dialogRef: MatDialogRef<ViewDocumentsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public utilsService: UtilsService
  ) {}

  ngOnInit() {
    console.log(this.data);
  }
  openDocument(url) {
    let finalUrl =
      'https://5ef7f2cb-5590-4896-a20f-f3fde5abf1ff.usrfiles.com/ugd/';
    url = url.replace('wix:image://v1/', '');
    url = url.replace('wix:document://v1/', '');
    if (url.includes('.jpeg')) {
      let splitArray = url.split(/.jpeg(.*)/s);
      if (splitArray.length > 0) {
        finalUrl = finalUrl + splitArray[0] + '.jpeg';
        window.open(finalUrl, '_blank');
      }
    } else if (url.includes('.pdf')) {
      let splitArray = url.split(/.pdf(.*)/s);
      if (splitArray.length > 0) {
        finalUrl = finalUrl + splitArray[0] + '.pdf';
        window.open(finalUrl, '_blank');
      }
    } else if (url.includes('.jpg')) {
      let splitArray = url.split(/.jpg(.*)/s);
      if (splitArray.length > 0) {
        finalUrl = finalUrl + splitArray[0] + '.jpg';
        window.open(finalUrl, '_blank');
      }
    }
  }

  close() {
    this.dialogRef.close();
  }
}
