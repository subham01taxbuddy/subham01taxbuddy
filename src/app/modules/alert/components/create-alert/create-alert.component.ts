import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserMsService } from 'src/app/services/user-ms.service';

@Component({
  selector: 'app-create-alert',
  templateUrl: './create-alert.component.html',
  styleUrls: ['./create-alert.component.scss']
})
export class CreateAlertComponent {

  alertForm: FormGroup;
  alertTypes = ['INFORMATION', 'UPDATES', 'CRITICAL'];
  channels = ['EMAIL', 'PUSHMESSAGE'];
  errorMessage: string | null = null;

  constructor(private userMsService: UserMsService, private fb: FormBuilder) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.alertForm = this.fb.group({
      type: ['', Validators.required],
      title: ['', Validators.required],
      message: ['', Validators.required],
      applicableFrom: [new Date().toISOString(), Validators.required],
      applicableTo: [new Date().toISOString(), Validators.required]
    });
  }

  createAlert() {
    if (this.alertForm.valid) {
      const formattedData = {
        ...this.alertForm.value,
        applicableFrom: new Date(this.alertForm.value.applicableFrom).toISOString(),
        applicableTo: new Date(this.alertForm.value.applicableTo).toISOString()
      };
      
      this.userMsService.postMethodAlert(formattedData).subscribe(
        response => {
          console.log('Alert created successfully:', response);
          this.errorMessage = null;
          this.resetForm();
        },
        error => {
          console.error('Error creating alert:', error);
          this.errorMessage = 'Failed to create alert. Please try again later.';
        }
      );
    } else {
      this.errorMessage = 'Please fill in all required fields.';
    }
  }

  resetForm() {
    this.alertForm.reset({
      type: '',
      title: '',
      message: '',
      applicableFrom: new Date().toISOString(),
      applicableTo: new Date().toISOString()
    });
  }
  getAlert()
  {
    this.userMsService.getAllAlert().subscribe(
      response =>{
        console.log('All Alert list get:'+ response);
      }

    )
  }

  
}

