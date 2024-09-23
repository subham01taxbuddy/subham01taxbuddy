import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-pop-up',
  templateUrl: './pop-up.component.html',
  styleUrls: ['./pop-up.component.scss'],
 
})
export class PopUpComponent {
  formattedData: string;
  loading : boolean = false;
  
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
    this.loading =true;
    const itrObject = this.data.response.data as ITR_JSON;

    this.utilService.saveItrObject(itrObject).subscribe(
      (result) => {
        this.loading = false;
        console.log('Response saved to DB:', result);
        console.log('Updates Applied and Data Recoverd Successfully');
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
