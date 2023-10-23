import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { AppConstants } from '../../constants';

@Component({
  selector: 'app-generic-user-filter',
  templateUrl: './generic-user-filter.component.html',
  styleUrls: ['./generic-user-filter.component.scss']
})
export class GenericUserFilterComponent implements OnInit {
  @Output() onChange = new EventEmitter();
  searchValue: FormControl;
  searchKey: any;
  @Input() searchParameter: any[] = [];

  constructor() {

  }

  ngOnInit(): void {
  }

  changeInput(hasClear) {
    debugger
    if (this.searchKey === 'name') {
      this.searchValue = new FormControl('', [Validators.required, Validators.pattern(AppConstants.charRegex)]);
    } else if (this.searchKey === 'mobileNo') {
      this.searchValue = new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern(AppConstants.numericRegex)]);
    } else if (this.searchKey === 'email') {
      this.searchValue = new FormControl('', [Validators.required, Validators.pattern(AppConstants.emailRegex)]);
    } else if (this.searchKey === 'pan') {
      this.searchValue = new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern(AppConstants.panNumberRegex)]);
    }
    // if (!this.searchValue && hasClear) {
    //   this.searchValue = 1;
    // }
    var searchBy = {};
    // if (this.searchKey) {
    //   // var key1 = 'level';
    //   // sortBy[key1] = 0;
    //   var key2 = this.searchKey.toString();
    //   sortBy[key2] = Number(this.searchValue);
    // }
    this.onChange.emit(searchBy);

  }

  clear() {
    this.searchKey = '';
    this.searchValue = null;
    this.changeInput(false);
  }

}
