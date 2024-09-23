import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appDateInput]'
})
export class DateInputDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    let input = this.el.nativeElement;
    let value = input.value.replace(/[^0-9]/g, '');

    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    if (value.length >= 5) {
      value = value.slice(0, 5) + '/' + value.slice(5, 9);
    }

    input.value = value;
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    const input = this.el.nativeElement;
    const value = input.value;


    if ((event.key === 'Backspace' || event.key === 'Delete') && (value.endsWith('/') || value.endsWith(' '))) {
      event.preventDefault();
      input.value = value.slice(0, -1);
    }
  }
}
