import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-all-personal-information',
  templateUrl: './all-personal-information.component.html',
  styleUrls: ['./all-personal-information.component.scss']
})
export class AllPersonalInformationComponent implements OnInit {
  step = 0;

  constructor() { }

  ngOnInit(): void {
  }


  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }
}
