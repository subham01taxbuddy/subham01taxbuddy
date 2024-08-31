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
          this.downloadFile(response, this.selectedFileName);
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

  // uploadFile() {
  //   if (this.selectedFile) {
  //     this.userMsService.uploadReport(this.selectedFile).subscribe(
  //       (response: HttpResponse<Blob>) => {
  //         console.log('Response headers:', response.headers);
  //         console.log('Response status:', response.status);
  
  //         if (response.body) {
  //           const blob: Blob = response.body;
  //           const url = window.URL.createObjectURL(blob);
  //           const a = document.createElement('a');
  //           document.body.appendChild(a);
  //           a.setAttribute('style', 'display: none');
  //           a.href = url;
  //           a.download = 'report.csv';
  //           a.click();
  //           window.URL.revokeObjectURL(url);
  //           a.remove();
  //         } else {
  //           console.error('Response body is null');
  //         }
  //       },
  //       (error) => {
  //         console.error('Upload failed', error);
  //       }
  //     );
  //   }
  // }

  downloadFile(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'updated_' + fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  clearErrorMessage(): void {
    this.errorMessage = null;
  }


}


