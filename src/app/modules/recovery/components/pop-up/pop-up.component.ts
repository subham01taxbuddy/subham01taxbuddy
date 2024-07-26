import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-pop-up',
  templateUrl: './pop-up.component.html',
  styleUrls: ['./pop-up.component.scss'],
  styles: [`
    .mat-dialog-actions {
      padding: 16px 24px;
    }
    .action-button {
      min-width: 80px;
      margin-left: 8px;
    }
    .mat-raised-button.mat-primary {
      background-color: #1976d2 !important;
    }
    .mat-raised-button:not(.mat-primary) {
      background-color: #f5f5f5 !important;
      color: rgba(0, 0, 0, 0.87) !important;
    }
  `]
})
export class PopUpComponent {
  formattedData: string;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<PopUpComponent>,
    private utilService: UtilsService) {
    this.formattedData = JSON.stringify(data, null, 2);
  }

  isObject(value: any): boolean {
    return typeof value === 'object' && value !== null;
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  getObjectEntries(obj: any): [string, any][] {
    return Object.entries(obj);
  }

  onYesClick(): void {
    const itrObject = this.data.response.data as ITR_JSON;

    this.utilService.saveItrObject(itrObject).subscribe(
      (result) => {
        console.log('Response saved to DB:', result);
        this.dialogRef.close(true);
      },
      (error) => {
        console.error('Error saving response to DB:', error);
        this.dialogRef.close(false);
      }
    );
  }
  onNoClick(): void {
    this.dialogRef.close(false);
  }
}
