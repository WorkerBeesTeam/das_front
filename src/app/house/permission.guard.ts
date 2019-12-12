import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthenticationService} from '../authentication.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate, CanActivateChild {
  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  getResolvedUrl(route: ActivatedRouteSnapshot): string {
    return route.pathFromRoot
      .map(v => v.url.map(segment => segment.toString()).join('/'))
      .join('/');
  }

  getConfiguredUrl(route: ActivatedRouteSnapshot): string {
    return '/' + route.pathFromRoot
      .filter(v => v.routeConfig)
      .map(v => v.routeConfig!.path)
      .join('/');
  }

  hasPermission(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const req_perms = route.data.req_perms as Array<string>;

    if (req_perms === undefined) {
      // allow if no permissions are required
      return true;
    }

    const userPerms = {
      'isAdmin': this.authService.isAdmin(),
      'isFullAccess': this.authService.isFullAccess(),
      'isSupervisor': this.authService.isSupervisor(),
      'isCleaner': this.authService.isCleaner(),
      'isKegReplacer': this.authService.isKegReplacer(),
      'Netherland': this.authService.isNetherland(),
    };

    const allow = req_perms.map((perm) => userPerms[perm]).reduceRight((a, b) => a || b);

    if (!allow) {
      // navigate to details in case of access denied
      /*
      console.log(route);

      const curName = route.parent.params.name;
      this.router.navigate(['/' ]);
       */

      // hack
      let loc = route.pathFromRoot[3].url[0].toString();
      console.log(loc);
      window.location.href = '/ru/house/'+loc+'/detail';
    }

    return allow;
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.hasPermission(next, state);
  }
  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.hasPermission(next, state);
  }

}
