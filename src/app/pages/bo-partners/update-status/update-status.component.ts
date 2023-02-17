import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ViewDocumentsComponent } from '../view-documents/view-documents.component';

@Component({
  selector: 'app-update-status',
  templateUrl: './update-status.component.html',
  styleUrls: ['./update-status.component.scss']
})
export class UpdateStatusComponent implements OnInit {
  loading = false;
  boStatus = ['Approve','Follow up','Drop Off','Document Pending'];

  constructor(public dialogRef: MatDialogRef<ViewDocumentsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {console.log(this.data);
  }
  addStatus(){

  }

}
