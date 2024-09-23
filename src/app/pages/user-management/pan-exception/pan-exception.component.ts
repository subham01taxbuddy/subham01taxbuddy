import { Component } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ReportService } from 'src/app/services/report-service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-pan-exception',
  templateUrl: './pan-exception.component.html',
  styleUrls: ['./pan-exception.component.css']
})
export class PanExceptionComponent {
  loading: boolean = false;
  disableAddButton: boolean = true;
  searchValue = new UntypedFormControl('', [Validators.required, Validators.pattern(AppConstants.panIndividualRegex),],);
  panData: any;

  constructor(
    private utilsService: UtilsService,
    private reportService: ReportService,
    private _toastMessageService: ToastMessageService,
    private userMsService: UserMsService,
  ) { }


  searchPan = async (): Promise<any> => {
    if (this.searchValue.value && this.searchValue.valid) {
      this.loading = true;
      const param = `/bo/pan-details?panNumber=${this.searchValue.value}`;

      try {
        const response: any = await lastValueFrom(this.reportService.getMethod(param));
        this.loading = false;

        if (response.success) {
          this.panData = response.data.partnerDetails;
          if (response.data?.pan_exception_added) {
            this.disableAddButton = true;
            this._toastMessageService.alert('success', 'PAN is Already Added in Exception');
          } else {
            this._toastMessageService.alert('success', 'PAN is Not Added in Exception, You can ADD this PAN in Exception');
            this.disableAddButton = false;
          }
        } else {
          this.disableAddButton = false;
          this._toastMessageService.alert('error', response.message);
        }
      } catch (error) {
        this.loading = false;
        this.disableAddButton = false;
        this._toastMessageService.alert('error', 'Error In Get PAN details API');
      }

    } else {
      this.loading = false;
      this.utilsService.showSnackBar('Please Enter Valid PAN Number');
    }
  }

  addPan(): void {
    if (this.searchValue.value && this.searchValue.valid) {
      this.loading = true;
      const panNumber = this.searchValue.value;
      const url = '/mark-pan-as-exception?panNumber=' + panNumber;

      this.userMsService.postMethod(url).subscribe({
        next: (result: any) => {
          this.loading = false;
          if (result.success) {
            this._toastMessageService.alert('success', 'Given PAN is Marked as Exception');
            setTimeout(() => {
              this.resetFilters();
            }, Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000);
          } else {
            this.disableAddButton = false;
            this._toastMessageService.alert('error', result.message);
          }
        },
        error: (error) => {
          this.loading = false;
          this._toastMessageService.alert('error', 'Error In mark-pan-as-exception API');
        }
      });
    } else {
      this.loading = false;
      this.utilsService.showSnackBar('Please Enter Valid PAN Number');
    }
  }


  resetFilters() {
    this.panData = '';
    this.searchValue.setValue(null);
    this.disableAddButton = true
  }

}
