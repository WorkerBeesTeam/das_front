import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from "@angular/common";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import {BehaviorSubject, of} from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import 'rxjs/add/operator/map';

import { User } from './user';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class AuthenticationService {

  private isAuthorized_: BehaviorSubject<boolean>;
  private currentUser_: User;
  timeout_handle: any;

  private authUrl = '/api/v2/auth/';
  private tokenUrl = this.authUrl + 'token/';

  get currentUser() {
    return this.currentUser_;
  }

  set currentUser(usr) {
    this.currentUser_ = usr;
    const haveUser = !!usr;

    if (!this.isAuthorized_) {
        this.isAuthorized_ = new BehaviorSubject(haveUser);
    } else {
        this.isAuthorized_.next(haveUser);
    }
  }

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(DOCUMENT) document: any
  ) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  isAdmin(): boolean {
    return this.checkPermission('change_logentry');
  }

  authorized(): Observable<boolean> {
      return this.isAuthorized_.asObservable();
  }

  canEditScheme(): boolean {
    return this.checkPermission('edit_scheme');
  }

  canRestart(): boolean {
    return this.checkPermission('restart');
  }

  isExtraList(): boolean {
    return this.checkPermission('extra_list');
  }

  canChangeMode(): boolean {
    return this.checkPermission('change_dig_mode');
  }

  canChangeParam(): boolean {
    return this.checkPermission('change_dig_param_value');
  }

  canChangeValue(): boolean {
    return this.checkPermission('change_device_item_value');
  }

  checkPermission(item: string): boolean {
    if (!this.currentUser || !this.currentUser.permissions) {
      return false;
    }

    return this.currentUser.permissions.indexOf(item) > -1;
  }

  getCsrf(): void {
    this.http.head<any>('/get_csrf').pipe(
      catchError(error => {
        console.log('1');
        this.goToLogin();
        return of();
      })
    ).subscribe(() => this.refreshToken());
  }

  private setCurrentUser(user: any): User {
    // login successful if there's a jwt token in the response
    if (user && user.token) {
      // store user details and jwt token in local storage to keep user logged in between page refreshes
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUser = user;

      clearTimeout(this.timeout_handle);
      this.timeout_handle = setTimeout(() => {
        this.http.head<any>('/get_csrf').pipe(
          catchError(error => {
            console.log('2');
            this.goToLogin();
            return of();
          })
        ).subscribe(() => this.refreshToken());
      }, 14.7 * 60000);
    }
    return user;
  }

  refreshToken(user: any = undefined): void {
    if (!user) {
      user = this.currentUser;
    }
    if (user && user.token) {
      this.http.post<any>(this.tokenUrl + 'refresh/', { token: user.token }).pipe(
        catchError(error => {
          console.log('3');
          this.goToLogin();
          return of();
        })
      ).subscribe(
        refreshed_user => {
          this.setCurrentUser(refreshed_user);
          if (refreshed_user.need_to_change_password === true) {
            this.router.navigate(['/user/details']);
          }
        }
      );
    }
  }

  goToLogin(): void {
    const url = document.location.href.toString().split(document.location.host)[1];
    this.router.navigate(['/login'], { queryParams: { returnUrl: url }});
  }

  login(username: string, password: string, captcha: string) {
    return this.http.post<any>(this.tokenUrl, { username, password, captcha })
        .map(user => this.setCurrentUser(user));
  }

  needCaptchaOnLogin(): Observable<boolean> {
      const url = this.authUrl + 'captcha/';
      return this.http.head<any>(url, { observe: 'response' }).pipe(
          switchMap(resp => of(resp.status === 200)),
          catchError(() => of(false))
      );
  }

    getCaptcha(force: boolean = false): Observable<any> {
        const url = this.authUrl + `captcha/?force=${force}`;
        return this.http.get(url, { responseType: 'blob' });
    }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    if (this.currentUser) {
      this.currentUser = undefined;
      clearTimeout(this.timeout_handle);
    }
  }

  createUser(user: any) {
      const url = this.authUrl + 'register/';
      return this.http.post(url, user);
  }
}
