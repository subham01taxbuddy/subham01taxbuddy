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
    this.getAssignmentToggle()
  }

  titles = [
    {
      title: 'Assign To'
    }
  ]
  cards = [
    {
      option1: 'Internal Users',
      option2: 'External Users',
      option3: 'Both',
      serviceType: 'ITR'
      
     
    },
    {
      
      option1: 'Internal Users',
      option2: 'External Users',
      option3: 'Both',
      serviceType: 'Notice'
    },
    {

      option1: 'Internal Users',
      option2: 'External Users',
      option3: 'Both',
      serviceType: 'GST'
    },
  ];

  
    
  

    updateAssignmentToggle(serviceType, value){
      const param = '/sme/assignment-logic-toggle'
      const selectionRequest={
        serviceType: serviceType,
        userAssignmentLogicSmeType: value.value
      }
      this.userMsService.postMethod(param, selectionRequest).subscribe((assignmentToggleResponse) => {
        console.log(assignmentToggleResponse)
        console.log(selectionRequest)
      })
    }

    getAssignmentToggle(){
      const param = '/sme/assignment-logic-toggle'
      this.userMsService.getMethod(param).subscribe((assignmentToggleResponse: any) => {
        console.log(assignmentToggleResponse)

        
        // console.log(this.assignmentToggleData.success)

        if(assignmentToggleResponse.success == true){
          this.assignmentToggleData = assignmentToggleResponse
        }
        else{
          this.toastMessageService.alert("error", assignmentToggleResponse.message)
        }
      })
    }
}
