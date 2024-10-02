import { Directive, HostListener, ElementRef } from '@angular/core';
import { NgControl } from '@angular/forms';


@Directive({
  selector: 'input[type=text][trim],[type=email][trim] [type=number][trim], textarea[trim]'
})
export class InputDataMaskDirective {
  constructor(private el: ElementRef, private control: NgControl) { }

  @HostListener('blur', ['$event']) onEvent($event: any) {
    console.log(this.el.nativeElement.value);
    const trim = this.el.nativeElement.value.trim();
    this.control['control']?.setValue(trim);
  }
}


@Directive({
  selector: 'input[type=text][upperCase]'
})
export class UpperCaseDirective {
  constructor(private el: ElementRef, private control: NgControl) { }

  @HostListener('keyup', ['$event']) onKeyup($event: any) {
    if (this.el.nativeElement.value) {
      const upper = this.el.nativeElement.value.toUpperCase().trim();
      this.control['control']?.setValue(upper);
    }
  }
}
@Directive({
  selector: 'input[type=text][capitalizeFirst]'
})
export class CapitalizeFirstDirective {
  constructor(private el: ElementRef, private control: NgControl) { }

  @HostListener('blur', ['$event']) onEvent($event: any) {
    if (this.el.nativeElement.value) {
      const capitalizeFirst = this.el.nativeElement.value.charAt(0).toUpperCase() + this.el.nativeElement.value.slice(1).toLowerCase();
      console.log(capitalizeFirst, ':capitalizeFirst')
      this.control['control']?.setValue(capitalizeFirst.trim());
    }
  }
  // @HostListener('blur', ['$event']) onEvent($event: any) {
  //   console.log(this.el.nativeElement.value);
  //   const trim = this.el.nativeElement.value.trim();
  //   this.control['control']?.setValue(trim);
  // }
}

@Directive({
  selector: '[appTwoDigitDecimaNumber]'
})
export class TwoDigitDecimaNumberDirective {
  // Allow decimal numbers and negative values
  private regex: RegExp = new RegExp(/^\d*\.?\d{0,2}$/g);
  // Allow key codes for special events. Reflect :
  // Backspace, tab, end, home
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', '-', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete'];

  constructor(private el: ElementRef) {
  }
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }
  }

  // Validate after each input
  @HostListener('input', ['$event'])
  onInput(event: Event) {
    let currentValue: string = this.el.nativeElement.value;

    // Check if the current value matches the regex (up to two decimal places)
    if (currentValue && !currentValue.match(this.regex)) {
      // If invalid, remove invalid characters and restore the valid part of the value
      this.el.nativeElement.value = this.cleanInput(currentValue);
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    event.preventDefault();

    let pastedData = event.clipboardData?.getData('text/plain') || '';
    const cleanedValue = this.cleanInput(pastedData);

    if (cleanedValue) {
      this.insertTextAtCursor(cleanedValue);
    }
  }

  private cleanInput(input: string): string {
    const cleaned = input.replace(/[^0-9.]/g, ''); // Allow only digits and a decimal point
    const parts = cleaned.split('.');

    // Ensure only one decimal and two digits after it
    return parts.length > 1 ? parts[0] + '.' + parts[1].substring(0, 2) : cleaned;
  }

  private insertTextAtCursor(value: string) {
    const inputElement = this.el.nativeElement;
    const start = inputElement.selectionStart;
    const end = inputElement.selectionEnd;
    const currentValue = inputElement.value;

    inputElement.value = currentValue.slice(0, start) + value + currentValue.slice(end);
    inputElement.setSelectionRange(start + value.length, start + value.length);

    // Trigger input event to update the field value
    inputElement.dispatchEvent(new Event('input'));
  }
}

/* @Directive({
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
      this.control.control'].setValue(lower);
    } else {
      this.control.control'].setValue(trim);
    }
  }
} */
