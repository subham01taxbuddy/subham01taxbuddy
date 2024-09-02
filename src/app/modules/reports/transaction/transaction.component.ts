import { HttpClient, HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent {

  btnDisabled = false;
  selectedFileName = '';
  fileName = '';
  loading: boolean = false;
  selectedFile: File | null = null;
  errorMessage: string | null = null;
  maxFileSize = 10 * 1024 * 1024;

  constructor(private userMsService: UserMsService,
    private utilsService: UtilsService,
    private http: HttpClient,
    private itrMsService: ItrMsService) { }


  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      this.selectedFileName = this.selectedFile.name;
    }
  }

  uploadFile(): void {
    this.loading = true;
    if (this.selectedFile) {
      this.userMsService.uploadReport(this.selectedFile).subscribe({
        next: (response: Blob) => {
          this.loading = false;
          this.utilsService.showSnackBar('File processed successfully');
        },
        error: (error) => {
          console.error('Error processing file:', error);
          this.loading = false;
          this.utilsService.showSnackBar('Error processing file. Please try again.');
        }
      });
    } else {
      this.utilsService.showSnackBar('Please select a file first');
    }
  }

 clearErrorMessage(): void {
    this.errorMessage = null;
  }


}


