import { Component, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-selection-component',
  templateUrl: './selection-component.component.html',
  styleUrls: ['./selection-component.component.scss'],
})
export class SelectionComponent implements OnInit {
  selectedValue: string;

  constructor(private dialogRef: MatDialogRef<SelectionComponent>) {}

  ngOnInit(): void {
    console.log();
  }

  continue() {
    console.log('Selected value:', this.selectedValue);
    this.dialogRef.close(this.selectedValue);
  }
}
