import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {UntypedFormBuilder, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {DomSanitizer} from '@angular/platform-browser';

import {MessageService} from '../message.service';
import {AuthenticationService} from '../authentication.service';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
    fg: UntypedFormGroup = this.fb.group({
        'username': ['', [ Validators.required ]],
        'email': ['', [ Validators.email ]],
        'password': ['', [ Validators.required, Validators.minLength(8) ]],
        'passwordConfirm': ['', [ Validators.required ]],
        'captcha': ['', [ Validators.required ]],
    }, {
        validators: [ this.passwordsEqual() ]
    });

    loading = false;

    captcha: any;

    constructor(
        private router: Router,
        private authService: AuthenticationService,
        private messageService: MessageService,
        private fb: UntypedFormBuilder,
        private sanitizer: DomSanitizer,
    ) {
        this.fg.controls['email'].valueChanges.subscribe(this.copyFromEmailToLogin());
    }

    ngOnInit() {
        this.authService.getCaptcha(true)
            .subscribe(img => {
                let objectURL = URL.createObjectURL(img);
                this.captcha = this.sanitizer.bypassSecurityTrustUrl(objectURL);
            }, () => this.captcha = 'Error');
    }

    register(): void {
        this.loading = true;
        this.authService.createUser(this.fg.value) // TODO: change to register request
            .subscribe(
                data => {
                    // set success message and pass true paramater to persist the message after redirecting to the login page
                    this.messageService.add('Registration successful');
                    this.router.navigate(['/user/details?hide-change-password=true']); // TODO: set authentication credentials
                },
                error => {
                    this.messageService.add(error);
                    this.loading = false;
                });
    }

    private copyFromEmailToLogin(): (value: string) => void {
        return (value: string) => {
            const usernameControl = this.fg.controls['username'];
            if (usernameControl.touched) return;

            usernameControl.setValue(value);
        };
    }

    private passwordsEqual(): ValidatorFn {
        return (formGroup: UntypedFormGroup): ValidationErrors | null => {
            const { password, passwordConfirm } = formGroup.value;
            return password !== passwordConfirm ? { passwordsEqual: true } : null;
        };
    }
}
