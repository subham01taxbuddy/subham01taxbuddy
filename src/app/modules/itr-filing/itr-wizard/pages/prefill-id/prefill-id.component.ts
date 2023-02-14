import {Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-prefill-id',
  templateUrl: './prefill-id.component.html',
  styleUrls: ['./prefill-id.component.scss']
})
export class PrefillIdComponent implements OnInit {

  @Output() skipPrefill: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  skip() {
    this.skipPrefill.emit(null);
  }
}
