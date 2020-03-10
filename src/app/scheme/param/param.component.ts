import {Component, Input, OnInit} from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Location } from '@angular/common';

import { AuthenticationService } from "../../authentication.service";
import { SchemeService } from "../scheme.service";
import { ControlService } from "../control.service";
import { Device_Item_Group, DIG_Param_Value, Section } from '../scheme';

@Component({
  selector: 'app-param',
  templateUrl: './param.component.html',
  styleUrls: ['./param.component.css']
})
export class ParamComponent implements OnInit
{
  sct: Section;
  group: Device_Item_Group = undefined;
  cantChange: boolean;

  changed_values: DIG_Param_Value[] = [];

  @Input() groupId;

  constructor(
    private route: ActivatedRoute,
    private schemeService: SchemeService,
    private authService: AuthenticationService,
    private controlService: ControlService,
    private location: Location
  ) { }

  ngOnInit() {
    if (!this.groupId) {
      this.getGroup();
    }
    this.cantChange = !this.authService.canChangeParam();
  }

  getGroup(): void
  {
    const groupId = +this.route.snapshot.paramMap.get('groupId');
    for (let sct of this.schemeService.scheme.section)
    {
      for (let group of sct.groups)
      {
        if (group.id === groupId)
        {
          this.sct = sct;
          this.group = group;
          return;
        }
      }
    }
  }

  onEnter(e: any): void {
    console.log('dsa');
  }

  onSubmit()
  {
    console.log('inside param form submit', this.changed_values);
    if (this.changed_values)
      this.controlService.changeParamValues(this.changed_values);
    this.goBack();
  }

  goBack(): void {
    console.log('BACK!');
    this.location.back();
  }
}