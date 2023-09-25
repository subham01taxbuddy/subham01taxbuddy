import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-schedule-fa',
  templateUrl: './schedule-fa.component.html',
  styleUrls: ['./schedule-fa.component.scss'],
})
export class ScheduleFaComponent implements OnInit {
  @Output() saveAndNext = new EventEmitter<any>();
  scheduleFaForm: FormGroup;

  constructor() {}

  ngOnInit(): void {
    console.log();
  }

  add() {}

  goBack() {
    this.saveAndNext.emit(false);
  }

  saveAll() {}
}
