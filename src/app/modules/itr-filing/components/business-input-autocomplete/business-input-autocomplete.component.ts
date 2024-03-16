import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ItrMsService } from "../../../../services/itr-ms.service";
import { UtilsService } from "../../../../services/utils.service";
import { UntypedFormControl } from "@angular/forms";

@Component({
  selector: 'app-business-input-autocomplete',
  templateUrl: './business-input-autocomplete.component.html',
  styleUrls: ['./business-input-autocomplete.component.scss']
})
export class BusinessInputAutocompleteComponent implements OnInit, OnChanges {

  @ViewChild('input') input: ElementRef<HTMLInputElement>;
  myControl = new UntypedFormControl('');
  filteredOptions: any[];
  natureOfBusinessList: any;
  inputSelection = false;
  @Input() selectedInput: string;
  @Input() businessType: string;

  @Output() businessSelected = new EventEmitter<string>();

  constructor(
    public itrMsService: ItrMsService,
    public utilsService: UtilsService,
  ) {
    this.getMastersData();
  }

  ngOnInit(): void {
    let natureOfBusiness = JSON.parse(
      sessionStorage.getItem('NATURE_OF_BUSINESS')
    );
    if (natureOfBusiness) {
      if (this.businessType !== 'ALL') {
        this.natureOfBusinessList = natureOfBusiness.filter(
          (item: any) => item.section === this.businessType
        );
      } else {
        this.natureOfBusinessList = natureOfBusiness;
      }
      this.filteredOptions = this.natureOfBusinessList;
    } else {
      console.log('business list not found');
      this.getMastersData();
    }
    if (this.selectedInput) {
      this.myControl.setValue(this.selectedInput);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedInput']) {
      this.myControl.setValue(this.selectedInput);
    }
  }

  getMastersData() {
    const param = '/itrmaster';
    this.itrMsService.getMethod(param).subscribe(
      (result: any) => {
        let natureOfBusinessAll = result.natureOfBusiness;
        sessionStorage.setItem(
          'NATURE_OF_BUSINESS',
          JSON.stringify(natureOfBusinessAll)
        );
        if (this.businessType !== 'ALL') {
          this.natureOfBusinessList = natureOfBusinessAll.filter(
            (item: any) => item.section === this.businessType
          );
        } else {
          this.natureOfBusinessList = natureOfBusinessAll;
        }
        sessionStorage.setItem('MASTER', JSON.stringify(result));
      },
      (error) => {
        this.utilsService.showSnackBar(
          'Failed to get nature of Business list, please try again.'
        );
        this.utilsService.smoothScrollToTop();
      }
    );
  }

  optionSelected(event) {
    console.log(event);
    this.inputSelection = true;
    this.selectedInput = event.option.value;
    this.businessSelected.emit(this.selectedInput);
  }

  closed(event) {
    if (!this.inputSelection) {
      this.inputSelection = false;
      this.selectedInput = null;
      this.businessSelected.emit(this.selectedInput);
    }
  }

  focusIn(event) {
    if (!this.inputSelection) {
      this.input.nativeElement.value = "";
      this.inputSelection = false;
    }
  }

  filter(event): void {
    const filterValue = this.input.nativeElement.value.toLowerCase();
    this.filteredOptions = this.natureOfBusinessList.filter(
      o => o.label.toLowerCase().includes(filterValue) || o.code.includes(filterValue));
  }

  displayFn = (business: any): string => {
    if (business) {
      let b = this.filteredOptions?.filter(o => o.code === business)[0];
      return b ? `${b?.label} - ${b?.code}` : '';
    } else {
      return '';
    }
  }

}
