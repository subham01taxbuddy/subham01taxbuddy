import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-name-alert',
  templateUrl: './name-alert.component.html',
  styleUrls: ['./name-alert.component.scss']
})
export class NameAlertComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<NameAlertComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,) { }

  ngOnInit() {
    console.log();
  }

  usePanName() {
    this.dialogRef.close('PAN')
  }

}
