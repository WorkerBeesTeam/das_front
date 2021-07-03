import { NgModule } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import {
//  MatAutocompleteModule,
//  MatButtonToggleModule,
MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import {
//  MatChipsModule,
//  MatDividerModule,
MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
//  MatGridListModule,
MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import {
//  MatMenuModule,
//  MatProgressBarModule,
//  MatRippleModule,
MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import {
//  MatTabsModule,
MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdkTableModule } from '@angular/cdk/table';

@NgModule({
  exports: [
    MatButtonModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatSelectModule,
    MatInputModule,
    MatDialogModule,
    MatTableModule,
    MatSnackBarModule,

    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatSortModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    MatIconModule,
	  MatToolbarModule,
	  MatSidenavModule,
	  MatListModule,

//    LayoutModule,
//  MatAutocompleteModule,
//  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
//  MatChipsModule,
//  MatDividerModule,
  MatExpansionModule,
//  MatGridListModule,
//  MatMenuModule,
//  MatProgressBarModule,
//  MatRippleModule,
//  MatSnackBarModule,
  MatStepperModule,
//  MatTabsModule,
  ],
  declarations: [],
})
export class MaterialModule {}
