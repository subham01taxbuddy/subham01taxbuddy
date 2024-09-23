import { ITR_JSON } from '../../interfaces/itr-input.interface';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UtilsService } from 'src/app/services/utils.service';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { AppConstants } from '../../constants';


@Component({
  selector: 'app-itr-actions',
  templateUrl: './itr-actions.component.html',
  styleUrls: ['./itr-actions.component.css']
})
export class ItrActionsComponent implements OnInit {
  ITR_JSON!: ITR_JSON
  clientName = '';
  filingTeamMembers = [
    { value: 1063, label: 'Amrita Thakur' },
    { value: 1064, label: 'Ankita Murkute' },
    { value: 1062, label: 'Damini Patil' },
    { value: 1707, label: 'Kavita Singh' },
    { value: 1706, label: 'Nimisha Panda' },
    { value: 24346, label: 'Tushar Shilimkar' },
    { value: 19529, label: 'Kirti Gorad' },
    { value: 24348, label: 'Geetanjali Panchal' },
    { value: 23553, label: 'Renuka Kalekar' },
    { value: 23550, label: 'Bhavana Patil' },
    { value: 23567, label: 'Sneha Suresh Utekar' },
    { value: 23552, label: 'Roshan Vilas Kakade' },
    { value: 23551, label: 'Pradnya Tambade' },
    { value: 983, label: 'Usha Chellani' },
    { value: 23670, label: 'Ashwini Kapale' },
    { value: 23578, label: 'Aditi Ravindra Gujar' },
    { value: 23564, label: 'Sonali Ghanwat' }, //Quit
    { value: 23668, label: 'Chaitanya Prakash Masurkar' },


    { value: 25942, label: 'Vaibhav M. Nilkanth' },
    { value: 26220, label: 'Pratiksha Shivaji Jagtap' },
    { value: 177, label: 'Aditya U.Singh' },
    { value: 26195, label: 'Tejaswi Suraj Bodke' },
    { value: 23505, label: 'Tejshri Hanumant Bansode' },
    { value: 26215, label: 'Deepali Nivrutti Pachangane' },
    { value: 26217, label: 'Manasi Jadhav' }, //Quit
    { value: 26236, label: 'Supriya Mahindrakar' },
    { value: 26218, label: 'Mrudula Vishvas Shivalkar' },// Quit
    { value: 26235, label: 'Chaitrali Ranalkar' },

    { value: 28033, label: 'Shrikanth Elegeti' },
    { value: 28032, label: 'Pranali Patil' },
    { value: 28040, label: 'Namrata Shringarpure' },
    { value: 28035, label: 'Rupali Onamshetty' },
    { value: 27474, label: 'Poonam Hase' },
    { value: 28044, label: 'Bhakti Khatavkar' },
    { value: 28034, label: 'Dipali Waghmode' },
    { value: 28031, label: 'Harsha Kashyap' },
    { value: 28222, label: 'Ankita Pawar' },
    { value: 28763, label: 'Smita Yadav' },

    { value: 42886, label: 'Gitanjali Kakade' },
    { value: 42885, label: 'Dhanashri wadekar' },
    { value: 42888, label: 'Baby Kumari Yadav' },
    { value: 43406, label: 'Priyanka Shilimkar' },
    { value: 42878, label: 'Supriya Waghmare' },
    { value: 42931, label: 'Dhanashree Amarale' },
    { value: 67523, label: 'Supriya Kumbhar' },
    { value: 67522, label: 'Nikita Chilveri' },
    { value: 67558, label: 'Sunita Sharma' },
    { value: 71150, label: 'Deep Trivedi', },
    { value: 71148, label: 'Riddhi Solanki', },
    { value: 71159, label: 'Ajay Kandhway' },
    { value: 71168, label: 'Ganesh Jaiswal' },
    { value: 75925, label: 'Nikita Shah' },
    { value: 81402, label: 'Vatsa Bhanushali' },

    { value: 1065, label: 'Urmila Warve' },
    { value: 1067, label: 'Divya Bhanushali' },
    { value: 21354, label: 'Brijmohan Lavaniya' },
  ];
  constructor(public dialogRef: MatDialogRef<ItrActionsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmModel, private router: Router, private itrMsService: ItrMsService,
    public utilsService: UtilsService) { }

  ngOnInit() {
    console.log('ITR_JSON', this.data);
    this.clientName = this.data.itrObjects[0].family[0].fName + ' ' + this.data.itrObjects[0].family[0].lName;
  }
  getFilerName(id:any) {
    if (id !== null && id !== '' && id !== undefined && id !== 0) {
      return this.filingTeamMembers.filter((item:any) => item.value === id)[0].label;
    }
    return 'Not Found';
  }
  reviseReturn(data:any) {
    this.getITRByUserIdAndAssesmentYear(data.userId)
  }

  async getITRByUserIdAndAssesmentYear(userId:any) {
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
                delete (this.ITR_JSON as any)[key[0]];
              }
            });
            console.log('this.ITR_JSON after deleted keys:', this.ITR_JSON)

            break;
          }
        }

        if (!isWIP_ITRFound) {
          sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
          this.dialogRef.close('reviseReturn');

        } else {
          this.createReviseReturn(result);
        }
      } else {
        console.log('At least one ITR should be there')
      }

    }, (error:any) => {
      console.log('Error:', error);
      alert('Failed to create revise return data, please try again')
    });
  }
  async createReviseReturn(currentYearItrs:any) {
    const fyList = await this.utilsService.getStoredFyList();
    const currentFyDetails = fyList.filter((item:any) => item.isFilingActive);
    if (!(currentFyDetails instanceof Array && currentFyDetails.length > 0)) {
      this.utilsService.showSnackBar('There is no any active filing year available')
      return;
    }
    const param = '/copyitr';
    const copy = {
      userId: currentYearItrs[currentYearItrs.length - 1].userId,
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
        alert('Revise return created successfully.')
        sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
        this.dialogRef.close('reviseReturn');
      }, (error:any) => {
        alert('Failed to create revise return data, please try again')
      }
    );
  }

  interestedForNextYearTpa(data:any) {
    let workingItr:any = this.data.itrObjects.filter((item:any) => item.itrId === data.itrId)[0];
    workingItr['nextYearTpa'] = 'INTERESTED';
    console.log(workingItr);
    const param = '/itr/' + workingItr['userId'] + '/' + workingItr['itrId'] + '/' + workingItr['assessmentYear'];
    this.itrMsService.putMethod(param, workingItr).subscribe((result: any) => {
    }, (error:any) => {
      console.log(error);
    });
  }
}

export interface ConfirmModel {
  itrObjects: ITR_JSON[];
}
