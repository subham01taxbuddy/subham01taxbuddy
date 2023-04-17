import { FormControl, Validators } from '@angular/forms';
import {
  Component,
  Inject,
  OnInit,
  AfterViewInit,
  ViewChild,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { result } from 'lodash';
@Component({
  selector: 'app-user-notes',
  templateUrl: './user-notes.component.html',
  styleUrls: ['./user-notes.component.css'],
})
export class UserNotesComponent implements OnInit, AfterViewInit {
  notes: any[] = [];

  currentPage: 0;
  pageSize: number;

  serviceTypes = [
    {
      label: 'ITR',
      value: 'ITR',
    },
    {
      label: 'GST',
      value: 'GST',
    },
    {
      label: 'NOTICE',
      value: 'NOTICE',
    },
    {
      label: 'TPA',
      value: 'TPA',
    },
  ];
  // userId: number;
  noteDetails = new FormControl('', Validators.required);
  serviceType = new FormControl('', Validators.required);
  loggedInUserRoles: any;

  dataSource = new MatTableDataSource<any>(this.notes);

  displayedColumns: string[] = [
    'Date',
    'createdByName',
    'serviceType',
    'Notes',
  ];

  // @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatPaginator, { static: false })
  set paginator(value: MatPaginator) {
    this.dataSource.paginator = value;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(
    public dialogRef: MatDialogRef<UserNotesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmModel,
    private itrMsService: ItrMsService,
    private utilsService: UtilsService
  ) {
    console.log('Selected UserID for notes', this.data.userId);
    this.loggedInUserRoles = this.utilsService.getUserRoles();
    console.info('this.loggedInUserDetails:', this.loggedInUserRoles);
    this.serviceType.setValue(this.data.serviceType);
  }

  ngOnInit() {
    this.getNotes();
  }

  async addNote() {
    if (this.serviceType.valid && this.noteDetails.valid) {
      const fyList = await this.utilsService.getStoredFyList();
      const currentFyDetails = fyList.filter(
        (item: any) => item.isFilingActive
      );
      if (!(currentFyDetails instanceof Array && currentFyDetails.length > 0)) {
        this.utilsService.showSnackBar(
          'There is no any active filing year available'
        );
        return;
      }
      const request = {
        userId: this.data.userId,
        notes: [
          {
            createdBy: this.utilsService.getLoggedInUserID(),
            assessmentYear: currentFyDetails[0].assessmentYear,
            note: this.noteDetails.value,
            serviceType: this.serviceType.value,
          },
        ],
      };
      console.info('add note request:', request);
      const param = `/note`;
      this.itrMsService.postMethod(param, request).subscribe(
        (result) => {
          console.log(result);
          this.getNotes();
          this.noteDetails.reset();
          this.utilsService.showSnackBar('Note added successfully.');
        },
        (error) => {
          console.warn(error);
          this.utilsService.showSnackBar(
            'Error while adding note, please try again.'
          );
        }
      );
    } else {
      this.serviceType.markAllAsTouched();
    }
  }

  getNotes() {
    const param = `/note/${this.data.userId}`;
    this.itrMsService.getMethod(param).subscribe(
      (result: any) => {
        console.log(result);
        if (
          this.utilsService.isNonEmpty(result) &&
          result.notes instanceof Array
        ) {
          this.notes = result.notes;
          let data = result.notes.sort((a, b) =>
            a.dateAndTime < b.dateAndTime ? 1 : -1
          );
          // this.dataSource = new MatTableDataSource<any>(this.notes);
          // this.dataSource.data = data;
          this.dataSource.data = data;
        }
      },
      (error) => {
        console.warn(error);
      }
    );
  }

  // pageChangeData(event: any) {
  //   this.currentPage = event;
  //   this.getNotes();
  // }
  pageChangeData(event: any) {
    this.currentPage = event;
    this.getNotes();
  }
}

export interface ConfirmModel {
  userId: any;
  clientName: string;
  serviceType?: string;
  title?: string;
}
