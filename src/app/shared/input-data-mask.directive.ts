import { Directive, HostListener, ElementRef } from '@angular/core';
import { NgControl, FormGroupDirective, FormControlDirective } from '@angular/forms';


@Directive({
  selector: 'input[type=text][trim],[type=email][trim] [type=number][trim], textarea[trim]'
})
export class InputDataMaskDirective {
  constructor(private el: ElementRef, private control: NgControl) { }

  @HostListener('blur', ['$event']) onEvent($event) {
    console.log(this.el.nativeElement.value);
    const trim = this.el.nativeElement.value.trim();
    this.control.control.setValue(trim);
  }
}


@Directive({
  selector: 'input[type=text][upperCase]'
})
export class UpperCaseDirective {
  constructor(private el: ElementRef, private control: NgControl) { }

  @HostListener('blur', ['$event']) onEvent($event) {
    if (this.el.nativeElement.value) {
      console.log(this.el.nativeElement.value);
      const upper = this.el.nativeElement.value.toUpperCase().trim();
      this.control.control.setValue(upper);
    }
  }
}


@Directive({
  selector: 'input[tolowerCase],'
})
export class converToLowerCaseDirective {
  constructor(private el: ElementRef, private control: NgControl) { }
  @HostListener('blur', ['$event']) onEvent($event) {
    console.log(this.el.nativeElement.value);
    //  let value  = this.el.nativeElement.value.trim();
    const trim = this.el.nativeElement.value.trim();
    if (typeof trim === 'string') {
      const lower = trim.toLowerCase();
      this.control.control.setValue(lower);
    } else {
      this.control.control.setValue(trim);
    }
  }
}
