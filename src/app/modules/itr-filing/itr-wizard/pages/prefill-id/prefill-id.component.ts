import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-prefill-id',
  templateUrl: './prefill-id.component.html',
  styleUrls: ['./prefill-id.component.scss'],
})
export class PrefillIdComponent implements OnInit {
  @Output() skipPrefill: EventEmitter<any> = new EventEmitter();

  constructor(private router: Router) {}

  ngOnInit(): void {
    console.log();
  }

  skip() {
    this.skipPrefill.emit(null);
  }

  addClient() {
    this.router.navigate(['/itr-filing/itr/eri']);
  }
}
