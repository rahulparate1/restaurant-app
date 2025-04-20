import { AbstractControl, ValidatorFn } from '@angular/forms';

export function forbiddenPreviousDayValidator(startDateControl: AbstractControl): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const startDate = new Date(startDateControl.value);
    const endDate = new Date(control.value);

    // Set both dates to the start of the day for comparison
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    // Check if endDate is before startDate
    if (endDate < startDate) {
      return { forbiddenPreviousDay: { value: control.value } };
    }
    return null;
  };
}
