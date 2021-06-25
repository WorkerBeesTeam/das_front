import {Component, OnInit} from '@angular/core';
import {SchemeService} from '../../scheme.service';
import {DropdownSettings} from 'angular2-multiselect-dropdown/lib/multiselect.interface';
import {Device_Item_Group} from '../../scheme';
import {FormControl} from '@angular/forms';
import * as moment from 'moment';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter} from '@angular/material-moment-adapter';
import {SidebarService} from '../../sidebar.service';

type DIG_DropdownData = { folderName: string, label: string, value: number };

function parseDate(date: FormControl, time: string): number {
    let time_arr = time.split(':');
    let date_from = date.value.toDate();
    date_from.setHours(+time_arr[0], +time_arr[1], +time_arr[2] || 0);

    return date_from.getTime();
}

function zero(n: number): string {
    return n >= 10 ? `${n}` : `0${n}`;
}

function parseDateToDateAndTime(date: number, fcRef: FormControl): string {
    const d = new Date(date);

    fcRef.setValue(moment(d));

    return `${zero(d.getHours())}:${zero(d.getMinutes())}:${zero(d.getSeconds())}`;
}

export interface SelectedLogs {
    event: boolean;
    mode: boolean;
    param: boolean;
    status: boolean;
    value: boolean;
}

export interface LogsFilter {
    ts_from: number;
    ts_to: number;
    selectedLogs: SelectedLogs;
    hiddenEvents: Array<boolean>;
    filter: string;
    case_sensitive: boolean;
    selectedGroupsId: Array<number>;
    selectedItemsId: Array<number>;
    selectedParamsId: Array<number>;
}

export interface LogFilter {
    ts_from: LogsFilter['ts_from'];
    ts_to: LogsFilter['ts_to'];
    limit?: number;
    filter?: LogsFilter['filter'];
    case_sensitive?: LogsFilter['case_sensitive'];
    hidden_events?: string;
}

export interface DigLogFilter extends LogFilter {
    dig_id: LogsFilter['selectedGroupsId'];
}

export interface ParamsLogFilter extends LogFilter {
    dig_param_id: LogsFilter['selectedParamsId'];
}

export interface ValuesLogFilter extends LogFilter {
    item_id: LogsFilter['selectedItemsId'];
}

@Component({
    selector: 'app-log-sidebar',
    templateUrl: './log-sidebar.component.html',
    styleUrls: ['./log-sidebar.component.css'],
    providers: [
        // The locale would typically be provided on the root module of your application. We do it at
        // the component level here, due to limitations of our example generation script.
        {provide: MAT_DATE_LOCALE, useValue: 'ru-RU'},

        // `MomentDateAdapter` and `MAT_MOMENT_DATE_FORMATS` can be automatically provided by importing
        // `MatMomentDateModule` in your applications root module. We provide it at the component level
        // here, due to limitations of our example generation script.
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
        },
        {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
    ],
})
export class LogSidebarComponent implements OnInit {
    /* Переменные для выпадающих */
    devItemGroups: DIG_DropdownData[] = [];
    devItems: DIG_DropdownData[] = [];
    devItemParams: DIG_DropdownData[] = [];

    digSelectSettings = {
        enableCheckAll: true,
        enableFilterSelectAll: false,
        enableSearchFilter: true,
        searchBy: ['label', 'folderName'],
        searchPlaceholderText: '',
        groupBy: 'folderName',
        labelKey: 'label',
        primaryKey: 'value',
        singleSelection: false,
    } as DropdownSettings;

    /* Переменные для работы со временем */
    date_from = new FormControl(moment());
    time_from = '00:00:00';
    date_to = new FormControl(moment());
    time_to = '23:59:59';

    /* Переменные для выбранных/введенных значений */

    ts_from: number;
    ts_to: number;

    selectedLogs: SelectedLogs = {
        event: true,
        mode: true,
        param: true,
        status: true,
        value: false,
    };

    hiddenEvents = new Array<boolean>(5);

    filter = '';
    case_sensitive = false;

    selectedGroupsId: DIG_DropdownData[] = [];
    selectedItemsId: DIG_DropdownData[] = [];
    selectedParamsId: DIG_DropdownData[] = [];

    /* Код класса */

    constructor(private schemeService: SchemeService, private sidebar: SidebarService) {
        this.sidebar.resetSidebar();

        this.devItemGroups = this.schemeService.scheme.section
            .reduce((prev: DIG_DropdownData[], curr) => {
                const groups = curr.groups.map(group => ({
                    folderName: curr.name,
                    label: group.title || group.type.title,
                    value: group.id,
                }));

                return prev.concat(groups);
            }, []);
        this.selectedGroupsId = this.devItemGroups.concat([]);

        this.getDropdownDevItemsFromSections();
        this.getDropdownDevItemParamsFromSections();

        this.fetchSelectedLogsFromLS();
        this.setupDatetimeRange();

        this.submit();
    }

    ngOnInit(): void {
    }

    getDropdownDevItemsFromSections() {
        const cb = (group, folderName) =>
            group.items.map(item => ({
                label: item.name || item.type.title,
                value: item.id,
                folderName,
            }));

        this.devItems = this.itemsForDropdownFromSections(cb);
    }

    getDropdownDevItemParamsFromSections() {
        const cb = (group: Device_Item_Group, folderName: string) => {
            return group.params.map(param => ({
                label: param.param.title,
                value: param.id,
                folderName,
            }));
        };

        this.devItemParams = this.itemsForDropdownFromSections(cb);
    }

    itemsForDropdownFromSections(
        callback: (group: Device_Item_Group, folderName: string) => DIG_DropdownData[]
    ): DIG_DropdownData[] {
        return this.schemeService.scheme.section
            .reduce((prev: DIG_DropdownData[], curr) => {
                const sectionName = this.schemeService.scheme.section.length > 1 ? `${curr.name}: ` : '';
                const devItems = curr.groups.reduce((items: DIG_DropdownData[], group) => {
                    const groupItems = callback(group, sectionName);

                    return items.concat(groupItems);
                }, []);

                return prev.concat(devItems);
            }, []);
    }

    submit() {
        this.storeSelectedLogsToLS();

        const ts_from = parseDate(this.date_from, this.time_from);
        const ts_to = parseDate(this.date_to, this.time_to);

        const data: LogsFilter = {
            ts_from,
            ts_to,
            selectedLogs: {...this.selectedLogs},
            hiddenEvents: {...this.hiddenEvents},
            filter: this.filter,
            case_sensitive: this.case_sensitive,
            selectedGroupsId: this.selectedGroupsId.map(g => g.value),
            selectedItemsId: this.selectedItemsId.map(g => g.value),
            selectedParamsId: this.selectedParamsId.map(g => g.value),
        };

        if (data.selectedGroupsId.length > 0) {
            if (data.selectedParamsId.length === 0) {
                data.selectedParamsId = this.devItemParams.map(para => para.value);
            }

            if (data.selectedItemsId.length === 0) {
                data.selectedItemsId = this.devItems.map(para => para.value);
            }
        }

        this.sidebar.performActionToContent({
            type: 'params_changed',
            data,
        });
    }

    private fetchSelectedLogsFromLS() {
        const selectedLogs = localStorage.getItem('selectedLogs');
        try {
            if (selectedLogs) {
                Object.assign(this.selectedLogs, JSON.parse(selectedLogs));
            }
        } catch (e) {}
    }

    private storeSelectedLogsToLS() {
        localStorage.setItem('selectedLogs', JSON.stringify(this.selectedLogs))
    }

    private setupDatetimeRange() {
        const now = Date.now();
        const ts_from = now - 3 * 3600 * 1000; // 3600 -- hour in seconds, 1000 - ms per s
        const ts_to = new Date();
        ts_to.setHours(23, 59, 59);

        this.time_from = parseDateToDateAndTime(ts_from, this.date_from);
        this.time_to = parseDateToDateAndTime(ts_to.getTime(), this.date_to);
    }
}