import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-all-personal-information',
  templateUrl: './all-personal-information.component.html',
  styleUrls: ['./all-personal-information.component.scss']
})
export class AllPersonalInformationComponent implements OnInit {
  step = 0;
  hide: boolean=true;

  constructor() { }

  ngOnInit(): void {
  }
  setStep(index: number) {
    this.step = index;
  }

  closed() {
    this.hide = !this.hide;
  }
  editForm(type) {
    // this.customerProfileForm.enable();
  }


}
