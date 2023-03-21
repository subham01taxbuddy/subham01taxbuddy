
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { AppConstants } from 'src/app/modules/shared/constants';

@Component({
  selector: 'app-edit-update-unassigned-sme',
  templateUrl: './edit-update-unassigned-sme.component.html',
  styleUrls: ['./edit-update-unassigned-sme.component.scss']
})
export class EditUpdateUnassignedSmeComponent implements OnInit {
  smeObj:any;

  minDate = new Date(1900, 0, 1);
  maxDate = new Date(new Date().getFullYear() , new Date().getMonth(), new Date().getDate());

  stateDropdown = AppConstants.stateDropdown;

  constructor(
    private  fb:FormBuilder,
  ) { }

  ngOnInit() {
  this.smeObj = JSON.parse(sessionStorage.getItem('smeObject'));
   this.smeFormGroup.patchValue(this.smeObj.data) // all
  this.setFormValues(this.smeObj.data)
  console.log("sme obj",this.smeObj)
  }

  setFormValues(data){
    this.mobileNumber.setValue(data.mobileNumber)
    this.itrTypes.setValue(data.itrTypes)

  }

  smeFormGroup : FormGroup =this.fb.group({
    mobileNumber :new FormControl("",[Validators.required]),
    name: new FormControl("",[Validators.required]),
    email: new FormControl("",[Validators.required]),
    languages: new FormControl("",[Validators.required]),
    referredPerson: new FormControl("",[Validators.required]),
    itrTypes: new FormControl("",[Validators.required]),
    qualification: new FormControl("",[Validators.required]),
    state: new FormControl("",[Validators.required]),
    teamLead: new FormControl("",[Validators.required]),

  })

  get mobileNumber(){
    return this.smeFormGroup.controls['mobileNumber'] as FormControl
  }
  get name(){
    return this.smeFormGroup.controls['name'] as FormControl
  }
  get email(){
    return this.smeFormGroup.controls['email'] as FormControl
  }
  get languages(){
    return this.smeFormGroup.controls['languages'] as FormControl
  }
  get referredPerson(){
    return this.smeFormGroup.controls['referredPerson'] as FormControl
  }
  get itrTypes(){
    return this.smeFormGroup.controls['itrTypes'] as FormControl
  }
  get qualification(){
    return this.smeFormGroup.controls['qualification'] as FormControl
  }
  get state(){
    return this.smeFormGroup.controls['state'] as FormControl
  }
  get teamLead(){
    return this.smeFormGroup.controls['teamLead'] as FormControl
  }

  onContinue(){

  }
}
