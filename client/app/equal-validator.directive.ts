import {Attribute, Directive, forwardRef} from '@angular/core';
import {AbstractControl, Validator, NG_VALIDATORS } from '@angular/forms';

@Directive({
    selector: '[appValidateEqual][formControlName],[appValidateEqual][formControl],[appValidateEqual][ngModel]',
    providers: [
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => EqualValidatorDirective),
            multi: true
        }
    ]
})
export class EqualValidatorDirective implements Validator {

    constructor(@Attribute('appValidateEqual') public appValidateEqual: string) { }

    validate(c: AbstractControl): { [key: string]: any } {
        const v = c.value;
        const e = c.root.get(this.appValidateEqual);
        console.log(e);

        if (e && v !== e.value) {
            return {appValidateEqual: false};
        }
        return null;
    };

}
