
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.css']
})
export class ToggleComponent {

	@Input() label!: string;
  @Input() value!: boolean;
  @Input() onMessage!: string;
  @Input() offMessage!: string;

  constructor() { }


}
