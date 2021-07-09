import { AppConstants } from 'app/shared/constants';
import { FormControl, Validators } from '@angular/forms';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ItrMsService } from 'app/services/itr-ms.service';
import { UtilsService } from 'app/services/utils.service';

@Component({
  selector: 'app-user-notes',
  templateUrl: './user-notes.component.html',
  styleUrls: ['./user-notes.component.css']
})
export class UserNotesComponent implements OnInit {
  notes = [];
  // userId: number;
  noteDetails = new FormControl('', Validators.required);
  loggedInUserDetails: any;
  constructor(public dialogRef: MatDialogRef<UserNotesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmModel,
    private itrMsService: ItrMsService,
    private utilsService: UtilsService,
  ) {
    console.log('Selected UserID for notes',
      this.data.userId);
    this.loggedInUserDetails = JSON.parse(localStorage.getItem('UMD'));
    console.info('this.loggedInUserDetails:', this.loggedInUserDetails);

  }


  ngOnInit() {
    this.getNotes();
  }

  async addNote() {
    const fyList = await this.utilsService.getStoredFyList();
    const currentFyDetails = fyList.filter(item => item.isFilingActive);
    if (!(currentFyDetails instanceof Array && currentFyDetails.length > 0)) {
      this.utilsService.showSnackBar('There is no any active filing year available')
      return;
    }
    const request = {
      "userId": this.data.userId,
      "notes": [
        {
          "createdBy": this.loggedInUserDetails['USER_UNIQUE_ID'],
          "assessmentYear": currentFyDetails[0].assessmentYear,
          "note": this.noteDetails.value
        }
      ]
    }
    console.info('add note request:', request);
    const param = `/note`;
    this.itrMsService.postMethod(param, request).subscribe(result => {
      console.log(result);
      this.getNotes();
      this.noteDetails.reset();
      this.utilsService.showSnackBar('Note added successfully.')
    }, error => {
      console.warn(error);
      this.utilsService.showSnackBar('Error while adding note, please try again.')
    })
  }

  getNotes() {
    const param = `/note/${this.data.userId}`;
    this.itrMsService.getMethod(param).subscribe((result: any) => {
      console.log(result);
      if (this.utilsService.isNonEmpty(result) && result.notes instanceof Array) {
        this.notes = result.notes;
      }
    }, error => {
      console.warn(error);
    })
  }
}

export interface ConfirmModel {
  userId: any;
  clientName: string;
}