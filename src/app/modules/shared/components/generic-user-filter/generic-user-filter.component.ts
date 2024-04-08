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
  searchValue = new FormControl('');
  searchKey: any;
  @Input() searchParameter: any[] = [];

  private _clearUserFilter: number;

  @Input() set clearUserFilter(value: number) {

    this._clearUserFilter = value;
    this.clear();
  }

  get clearUserFilter(): number {

    return this._clearUserFilter;

  }
  constructor() {

  }

  ngOnInit(): void {
  }
  clearValue(){
    this.searchValue.setValue('');
  }
  changeInput() {
    switch (this.searchKey) {
      case 'name':
        this.searchValue.setValidators([Validators.required, Validators.pattern(AppConstants.charRegex)]);
        this.searchValue.updateValueAndValidity();
        break;
      case 'mobileNo':
        this.searchValue.setValidators([Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern(AppConstants.numericRegex)]);
        this.searchValue.updateValueAndValidity();
        break;
      case 'email':
        this.searchValue.setValidators([Validators.required, Validators.pattern(AppConstants.emailRegex)]);
        this.searchValue.updateValueAndValidity();
        break;
      case 'pan':
        this.searchValue.setValidators([Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern(AppConstants.panNumberRegex)]);
        this.searchValue.updateValueAndValidity();
        break;
      case 'mobileNumber':
        this.searchValue.setValidators([Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern(AppConstants.numericRegex)]);
        this.searchValue.updateValueAndValidity();
        break;
      case 'txbdyInvoiceId':
        this.searchValue.setValidators([Validators.required, Validators.maxLength(10), Validators.pattern(AppConstants.numericRegex)]);
        this.searchValue.updateValueAndValidity();
        break;
      case 'invoiceNo':
        this.searchValue.setValidators([Validators.required ]);
        this.searchValue.updateValueAndValidity();
        break;
      case 'emailId':
        this.searchValue.setValidators([Validators.required, Validators.pattern(AppConstants.emailRegex)]);
        this.searchValue.updateValueAndValidity();
        break;


    }
    var searchBy = {};
    if (this.searchKey) {
      var key2 = this.searchKey.toString();
      searchBy[key2] = this.searchValue.value;
    }
    this.onChange.emit(searchBy);

  }

  clear() {
    this.searchKey = '';
    this.searchValue = new FormControl('');
    this.changeInput();
  }

}
