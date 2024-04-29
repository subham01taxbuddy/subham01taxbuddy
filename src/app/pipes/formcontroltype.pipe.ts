import {Pipe, PipeTransform} from "@angular/core";
import {AbstractControl, UntypedFormControl} from "@angular/forms";

@Pipe({
  name: 'formControlType',
})
export class FormControlTypePipe implements PipeTransform {
  transform(value: AbstractControl): UntypedFormControl {
    return value as UntypedFormControl;
  }
}
