import { ToastMessageService } from './../../../../services/toast-message.service';
import { ToastMessage } from './../../../../classes/toast';
import { Component, OnInit, enableProdMode } from '@angular/core';

import { UserMsService } from './../../../../services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-assignment',
  templateUrl: './assignment.component.html',
  styleUrls: ['./assignment.component.scss']
})
export class AssignmentComponent implements OnInit {

  assignmentToggleData: any

  constructor(
    // private utilsService: UtilsService,
    private userMsService: UserMsService,
    private toastMessageService: ToastMessageService,
  ) { }

  ngOnInit() {
    this.getAssignmentToggle();
  }

  titles = [
    {
      title: 'Assign To'
    }
  ];
  cards = [];

  updateAssignmentToggle(serviceType, value){
    const param = '/sme/assignment-logic-toggle';
    const selectionRequest = {
      serviceType: serviceType,
      userAssignmentLogicSmeType: value
    };
    console.log(value);
    this.userMsService.postMethod(param, selectionRequest).subscribe((assignmentToggleResponse: any) => {
      console.log(assignmentToggleResponse);
      if(assignmentToggleResponse.success) {
        this.toastMessageService.alert("success", "Assignment for " + serviceType + " updated successfully");
      }
    });
    if(serviceType === 'ITR') {
      this.updateAssignmentToggle('TPA', value);
    }
  }

  async getAssignmentToggle(){
    const param = '/sme/assignment-logic-toggle'
    this.userMsService.getMethod(param).subscribe((assignmentToggleResponse: any) => {
      console.log(assignmentToggleResponse.data);
      if(assignmentToggleResponse.success == true){
        this.assignmentToggleData = assignmentToggleResponse.data;
        this.assignmentToggleData.forEach(toggleData => {
          if(toggleData.serviceType !== 'TPA') {
            this.cards.push(
              {
                option1: 'INTERNAL_SME',
                option2: 'EXTERNAL_SME',
                option3: 'BOTH',
                serviceType: toggleData.serviceType,
                selected: toggleData.userAssignmentLogicSmeType
              }
            );
          }
        });
      }
      else{
        this.toastMessageService.alert("error", assignmentToggleResponse.message);
      }
    })
  }
}
