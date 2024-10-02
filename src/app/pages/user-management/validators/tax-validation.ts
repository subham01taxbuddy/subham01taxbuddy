import { AbstractControl, ValidatorFn } from '@angular/forms';

// Function to enforce that at least one of the given form fields must be filled
export function atLeastOneRequired(fields: string[]): ValidatorFn {
  return (formGroup: AbstractControl): { [key: string]: boolean } | null => {
    const isAtLeastOneFilled = fields.some((field) => {
      const control = formGroup.get(field);
      return control && control.value;
    });

    return isAtLeastOneFilled ? null : { atLeastOneRequired: true };
  };
}
