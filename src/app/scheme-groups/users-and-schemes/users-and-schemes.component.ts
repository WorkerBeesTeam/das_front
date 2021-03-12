import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {SchemesService} from '../../schemes/schemes.service';
import {Group_User_Roles, Scheme, User, UserHeaderWithRole} from '../../user';
import {FormBuilder, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {DropdownSettings} from 'angular2-multiselect-dropdown/lib/multiselect.interface';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-users-and-schemes',
    templateUrl: './users-and-schemes.component.html',
    styleUrls: ['./users-and-schemes.component.css']
})
export class UsersAndSchemesComponent implements OnInit, OnChanges {
    readonly Group_User_Roles = Group_User_Roles;
    readonly displayedUsersColumns = ['name', 'username', 'role', 'control'];

    @Input() id: number;

    groupUsers: UserHeaderWithRole[];
    groupSchemes: Pick<Scheme, 'id' | 'name' | 'title'>[];

    userAddFg: FormGroup;
    schemeAddFg: FormGroup;
    invitingUser = false;

    schemes: Pick<Scheme, 'id' | 'name' | 'title'>[] = [];
    users: User[] = [];

    usersLoading: boolean = true;
    schemesLoading: boolean = true;

    private readonly defaultMultiselectSettings: Partial<DropdownSettings> = {
        singleSelection: true,
        enableCheckAll: false,
        enableSearchFilter: true,
        lazyLoading: true,
        classes: 'select',
        labelKey: 'label',
        primaryKey: 'id',
    };
    readonly usersMultiselectSettings: any = {
        ...this.defaultMultiselectSettings,
        text: 'User', // TODO: this.translate.instant('@@SCHEME_GROUPS.USER')
    };
    readonly schemesMultiselectSettings: any = {
        ...this.defaultMultiselectSettings,
        text: 'Scheme', // TODO: this.translate.instant('@@SCHEME_GROUPS.SCHEME'),
    };

    constructor(
        private schemesService: SchemesService,
        private translate: TranslateService,
        fb: FormBuilder,
    ) {
        this.userAddFg = fb.group({
            email: [null, []],
            userId: [null, [Validators.required]],
            role: [null, [Validators.required]],
        }, {
            validators: [this.emailOrUserIdValidator()],
        });

        this.schemeAddFg = fb.group({
            schemeId: [null, [Validators.required]],
        });
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.id && changes.id.currentValue) {
            this.getData();
        }
    }

    fetchMoreUsers(event) {
        if (event.end === this.users.length - 1) {
            this.usersLoading = true;
            this.schemesService.getUsers()
                .subscribe((users) => {
                    this.users = this.users.concat(
                        users.map(user => ({
                            ...user,
                            label: `${user.first_name} ${user.last_name}`,
                        })),
                    );
                    this.usersLoading = false;
                });
        }
    }

    fetchMoreSchemes(event) {
        if (event.end === this.schemes.length - 1) {
            this.schemesLoading = true;
            this.schemesService.getSchemes(10, Math.round(this.schemes.length / 10))
                .subscribe((schemes) => {
                    this.schemes = this.schemes.concat(
                        schemes.results.map(scheme => ({
                            ...scheme,
                            label: scheme.title || scheme.name,
                        })),
                    );
                    this.schemesLoading = false;
                });
        }
    }

    private getData() {
        this.schemesService.getSchemeGroupUsers(this.id).subscribe(users => this.groupUsers = users);
        this.schemesService.getSchemeGroupSchemes(this.id).subscribe(groupSchemes => this.groupSchemes = groupSchemes);
    }

    schemeAddFormSubmit() {
        if (this.schemeAddFg.invalid) return;
        console.dir(this.schemeAddFg.value);
        return;

        this.schemesService.addSchemeToSchemeGroup(this.id, this.schemeAddFg.value)
            .subscribe(() => this.getData());
    }

    userAddFormSubmit() {
        if (this.userAddFg.invalid) return;
        console.dir(this.userAddFg.value);
        return;

        const user = this.userAddFg.value;
        this.schemesService.addUserToSchemeGroup(this.id, user.id, user.role)
            .subscribe(() => this.getData());
    }

    removeUserFromGroup(user: User & { role: Group_User_Roles }) {
        this.schemesService.removeUserFromSchemeGroup(this.id, user.id)
            .subscribe(() => this.getData());
    }

    removeSchemeFromGroup(scheme: Scheme) {
        this.schemesService.removeSchemeFromSchemeGroup(this.id, scheme.id)
            .subscribe(() => this.getData());
    }

    emailOrUserIdValidator(): ValidatorFn {
        return (fg: FormGroup) => {
            const ctrl = this.invitingUser ? fg.controls.email : fg.controls.userId;

            if (ctrl.untouched || ctrl.invalid) {
                return { 'userRequired': true };
            }

            return null;
        };
    }

    toggleInvitingUser() {
        this.invitingUser = !this.invitingUser;

        const { userId, email } = this.userAddFg.controls;

        if (this.invitingUser) {
            userId.clearValidators();
            email.setValidators([Validators.required, Validators.email]);
        } else {
            email.clearValidators();
            userId.setValidators(Validators.required);
        }
    }
}
