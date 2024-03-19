import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UtilsService } from 'src/app/services/utils.service';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';

@Component({
  templateUrl: './revise-return-dialog.component.html',
  styleUrls: ['./revise-return-dialog.component.css']
})
export class ReviseReturnDialogComponent implements OnInit {
  loading: boolean = false;
  constructor(public dialogRef: MatDialogRef<ReviseReturnDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
    public utilsService: UtilsService, private itrMsService: ItrMsService
  ) { }

  ngOnInit() {
    console.log('Data in dialog box:', this.data)
  }

  startReviseReturn() {
    this.getITRByUserIdAndAssesmentYear(this.data['userId']);
  }

  ITR_JSON: ITR_JSON;
  async getITRByUserIdAndAssesmentYear(userId) {
    const fyList = await this.utilsService.getStoredFyList();
    const currentFyDetails = fyList.filter((item:any) => item.isFilingActive);
    if (!(currentFyDetails instanceof Array && currentFyDetails.length > 0)) {
      this.utilsService.showSnackBar('There is no any active filing year available')
      return;
    }
    const param = `/itr?userId=${userId}&assessmentYear=${currentFyDetails[0].assessmentYear}`;
    this.itrMsService.getMethod(param).subscribe((result: any) => {
      console.log('My ITR by user Id and Assesment Years=', result);
      if (result.length !== 0) {
        let isWIP_ITRFound = true;
        for (let i = 0; i < result.length; i++) {
          let currentFiledITR = result.filter((item:any) => (item.assessmentYear === currentFyDetails[0].assessmentYear && item.eFillingCompleted));
          if (result[i].eFillingCompleted || result[i].ackStatus === 'SUCCESS' || result[i].ackStatus === 'DELAY') {
            //   return "REVIEW"
          } else {
            //   return "CONTINUE"
            isWIP_ITRFound = false;
            this.ITR_JSON = result[i];
            if (currentFiledITR.length > 0) {
              currentFiledITR = currentFiledITR.filter((item:any) => item.isRevised === 'N');
              if (currentFiledITR.length > 0) {
                this.ITR_JSON.orgITRAckNum = currentFiledITR[0].ackNumber;
                this.ITR_JSON.orgITRDate = currentFiledITR[0].eFillingDate;
              }
            }
            console.log('this.ITR_JSON JUST before saving:', this.ITR_JSON)
            Object.entries(this.ITR_JSON).forEach((key, value) => {
              console.log(key, value)
              if (key[1] === null) {
                delete this.ITR_JSON[key[0]];
              }
              // if(key )
              // delete this.ITR_JSON[key];
            });
            console.log('this.ITR_JSON after deleted keys:', this.ITR_JSON)

            break;
          }
        }

        if (!isWIP_ITRFound) {
          this.loading = false;
          sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
          this.dialogRef.close('reviseReturn');

        } else {
          this.createReviseReturn(result);
        }
      } else {
        console.log('At least one ITR should be there')
      }

    }, error => {
      console.log('Error:', error);
      this.loading = false;
      this.utilsService.showSnackBar('Failed to create revise return data, please try again')
    });
  }
  async createReviseReturn(currentYearItrs) {
    const fyList = await this.utilsService.getStoredFyList();
    const currentFyDetails = fyList.filter((item:any) => item.isFilingActive);
    if (!(currentFyDetails instanceof Array && currentFyDetails.length > 0)) {
      this.utilsService.showSnackBar('There is no any active filing year available')
      return;
    }
    const param = '/copyitr';
    const copy = {
      userId: this.data['userId'],
      itrId: currentYearItrs[currentYearItrs.length - 1].itrId,
      assessmentYear: currentFyDetails[0].assessmentYear
    };

    this.itrMsService.postMethod(param, copy).subscribe(
      (result: any) => {
        console.log('Revised Return copy created Result=', result);
        this.ITR_JSON = result;
        currentYearItrs = currentYearItrs.filter((item:any) => item.isRevised === 'N');
        if (currentYearItrs.length > 0) {
          this.ITR_JSON.orgITRAckNum = currentYearItrs[0].ackNumber;
          this.ITR_JSON.orgITRDate = currentYearItrs[0].eFillingDate;
        }
        this.loading = false;
        sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
        this.dialogRef.close('reviseReturn');
      },
      error => {
        this.utilsService.showSnackBar('Failed to create revise return data, please try again')
        this.loading = false;
      }
    );
  }
}
