import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HttpClient } from '@angular/common/http';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MatMomentDateModule} from '@angular/material-moment-adapter';


import { TranslateModule, TranslateLoader} from '@ngx-translate/core';
import { TranslateHttpLoader} from '@ngx-translate/http-loader';

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
}

import { ChartsModule } from 'ng2-charts';

import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';

import { NgColorModule } from 'ng-color';

import { MaterialModule } from '../../material.module';

import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports.component';
import { ChartsComponent } from './charts/charts.component';
import { ExportComponent } from './export/export.component';
import { ColorPickerDialog } from './charts/color-picker-dialog/color-picker-dialog';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ReportsRoutingModule,
    MaterialModule,
    MatMomentDateModule,
    ChartsModule,
    AngularMultiSelectModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    NgColorModule,
  ],
  declarations: [
    ColorPickerDialog,
    ReportsComponent,
    ChartsComponent,
    ExportComponent,
  ],
  entryComponents: [
      ColorPickerDialog
  ],
  providers: [
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } }
  ]
})
export class ReportsModule { }
