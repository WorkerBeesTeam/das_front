import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from '../../authentication.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ISchemeService} from '../../ischeme.service';
import {catchError, tap} from 'rxjs/operators';
import {of} from 'rxjs';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {TranslateService} from '@ngx-translate/core';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent implements OnInit {
  currentUser: any;

  changePasswordGroup: FormGroup;
  changeUserDetailsGroup: FormGroup;
  newPassErrors = [];
  oldPassErrors = [];
  success = false;
  success2 = false;
  phonemask = ['+', '7', '(', /\d/, /\d/, /\d/, ')', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/];

  constructor(
    public authService: AuthenticationService,
    private formBuilder: FormBuilder,
    protected http: HttpClient,
    public translate: TranslateService,
  ) { }

  ngOnInit() {
    this.changePasswordGroup = this.formBuilder.group({
      cur_password: ['', Validators.required],
      new_password: ['', Validators.required],
      confirm_password: ['', Validators.required],
    }, {validator: this.confirmValidator});

    this.changeUserDetailsGroup = this.formBuilder.group({
      first_name: [this.authService.currentUser.first_name],
      last_name: [this.authService.currentUser.last_name],
      phone_number: [this.authService.currentUser.phone_number || '',
        [Validators.required, Validators.pattern('\\+7\\(\\d{3}\\)\\d{3}-\\d{2}-\\d{2}')]]
      // email: [{value: this.authService.currentUser.email, disabled: true}],
    });
  }

  confirmValidator(group: FormGroup) {
    // tslint:disable-next-line:triple-equals
    if (group.controls['new_password'].value == group.controls['confirm_password'].value) {
      return null;
    }

    return {
      mismatch: true
    };
  }

  changePassword() {
    if (this.changePasswordGroup.invalid) {
    } else {
      const pwd = {
        'old_password': this.changePasswordGroup.value.cur_password,
        'new_password':  this.changePasswordGroup.value.new_password,
        'need_to_change_password': false
      };

      this.newPassErrors = [];
      this.oldPassErrors = [];

      this.http.put('/api/v1/change_password/', pwd, httpOptions).subscribe(resp => {
        if (typeof resp === 'object' && resp !== null && 'new_password' in resp) {
          // show new password errors
          this.newPassErrors = (resp['new_password'] as string[]).map(e => this.translate.instant(e));
        }

        if (typeof resp === 'object' && resp !== null && 'old_password' in resp) {
          // show old password errors
          this.oldPassErrors = (resp['old_password'] as string[]).map(e => this.translate.instant(e));
        }

        console.log(resp);
        // tslint:disable-next-line:triple-equals
        if (resp == 'New password is the same of old_password') {
          this.newPassErrors.push(this.translate.instant('New password is the same of old_password'));
        }

        // tslint:disable-next-line:triple-equals
        if (resp == 'Success.') {
          // show success messge
          console.log('TRYU!!!');
          this.success = true;
          const i = setInterval(() => {
            this.success = false;
          }, 2000);
        }
      }, error => {
        console.log(error);
      });
    }
  }

  changeUserDetails() {
    if (this.changeUserDetailsGroup.invalid) {
      alert('Поле "Телефон" обязательное для заполнения!');
    } else {
      let req = this.changeUserDetailsGroup.value;

      this.http.put('/api/v1/change_user_details/', req, httpOptions).subscribe(resp => {
        // tslint:disable-next-line:triple-equals
        if (resp == 'Success.') {
          // show success messge
          console.log('TRYU!!!');
          this.success2 = true;
          const i = setInterval(() => {
            this.success2 = false;
          }, 2000);

          this.authService.refreshToken();
          // this.currentUser = this.authService.currentUser;
        }
      }, error => {
        console.log(error);
      });
    }
  }
}
