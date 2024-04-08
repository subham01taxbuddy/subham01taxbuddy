import {Pipe, PipeTransform} from "@angular/core";
import {AbstractControl, FormControl} from "@angular/forms";

@Pipe({
  name: 'formControlType',
})
export class FormControlTypePipe implements PipeTransform {
  transform(value: AbstractControl): FormControl {
    return value as FormControl;
  }
}
