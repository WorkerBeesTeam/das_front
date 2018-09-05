import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material.module';
import { BeerboxRoutingModule } from "./beerbox-routing.module";

import { WashComponent } from './wash/wash.component';
import { ReplaceKegComponent, ConfirmDialogReplaceKegComponent } from './replace-keg/replace-keg.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    BeerboxRoutingModule,
  ],
  declarations: [
    WashComponent, ReplaceKegComponent, ConfirmDialogReplaceKegComponent,
  ],
  entryComponents: [
    ConfirmDialogReplaceKegComponent,
  ],
})
export class BeerboxModule { }
