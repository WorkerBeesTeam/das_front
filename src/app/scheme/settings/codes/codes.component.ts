import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { forkJoin } from 'rxjs';

import { SchemeService } from '../../scheme.service';
import { Codes } from '../../scheme';

import { ByteTools, WebSocketBytesService } from '../../../web-socket.service';

import { StructType, ChangeState, ChangeInfo, ChangeTemplate } from '../settings';
import { SettingsService } from '../settings.service';

import * as ace from 'brace';
import 'brace/mode/javascript';
import 'brace/mode/typescript';
import './dracula-mod';
import 'brace/ext/searchbox';
import 'brace/ext/language_tools';
import {WebSockCmd} from '../../control.service';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-codes',
  templateUrl: './codes.component.html',
  styleUrls: ['../settings.css', '../../../../assets/anonymous/stylesheet.css', './codes.component.css']
})
export class CodesComponent extends ChangeTemplate<Codes> implements OnInit, AfterViewInit {
  codes: Codes[];

  editorOptions = {theme: 'vs-dark', language: 'javascript'};
  editorApi = '';

  tmp: string;

  options = {
    fontSize: '11pt',
    enableBasicAutocompletion: true
  };

  @ViewChild('editor', {static: true}) editor;
  private newOpened = false;

  ngAfterViewInit() {
    this.editor.getEditor().setAutoScrollEditorIntoView(true);
  }

  onEditorInit(editor) {
    if (!this.editorApi) {
      return;
    }
    (<any>window).monaco.languages.typescript.javascriptDefaults.addExtraLib([
      'declare class Dai_Api { static next():string }',
    ].join('\n'), 'filename/facts.d.ts');

    (<any>window).monaco.languages.typescript.javascriptDefaults.addExtraLib(this.editorApi, 'filename/api.d.ts');
    this.editorApi = null;
  }

  constructor(
    wsbService: WebSocketBytesService,
    schemeService: SchemeService,
    private settingsService: SettingsService,
  ) {
    super(StructType.Scripts, wsbService, schemeService, Codes);
  }

  getObjects(): Codes[] {
    return this.codes;
  }

  ngOnInit() {
    this.generate_api();

    this.settingsService.getCodes().subscribe(codes => {
      this.codes = codes;
      this.fillItems();
    });
  }

  generate_api(): void {
    const types: any = { item: {}, group: {} };
    for (const t of this.schemeService.scheme.device_item_type) {  types.item[t.name] = t.id; }
    for (const t of this.schemeService.scheme.dig_type) { types.group[t.name] = t.id; }

    const api_lines = ['var api = {',
    '  actDevice: function(group, type, newState, user_id) {},',
    '  findItem: function(items, func) {},',
    '  status: {}, checker: [],',
    '  mng: { sections: [], devices: [] },',
    '  type: ' + JSON.stringify(types) + ',',
    '  handlers: {',
    '      changed: {',
    '          mode: undefined,',
    '          item: undefined,',
    '          sensor: undefined,',
    '          control: undefined,',
    '          day_part: undefined,',
    '      },',
    '      database: { initialized: undefined },',
    '      section: { initialized: undefined },',
    '      group: { initialized: {}, changed: {} },',
    '      control_change_check: undefined,',
    '      normalize: undefined,',
    '      check_value: undefined,',
    '      group_status: undefined,',
    '      initialized: undefined,',
    '  },',
    '};', ];

    this.editorApi = api_lines.join('\n');
  }

  initItem(obj: Codes): void {
    obj.name = '';
  }

  saveObject(obj: Codes): Uint8Array {
    const name = ByteTools.saveQString(obj.name);
    const text = ByteTools.saveQString(obj.text, false);
    const view = new Uint8Array(8 + name.length + text.length);
    let pos = 0;
    ByteTools.saveInt32(obj.id, view, pos); pos += 4;
    view.set(name, pos); pos += name.length;
    ByteTools.saveInt32(obj.global_id, view, pos); pos += 4;
    view.set(text, pos); pos += text.length;
    return view;
  }

  name(obj: Codes): string {
    if (obj.name.length) {
      return obj.name;
    }
    return (<any>obj).d_name !== undefined ? (<any>obj).d_name : '<Empty>';
  }

  code_select(item: ChangeInfo<Codes>): void {
    if (this.sel_item !== item && !item.obj.text) {
      this.getCode(item);
    } else {
      this.select(item);
    }
  }

  select(item: ChangeInfo<Codes>): void {
    super.select(item);

    if (item.obj.text) {
      this.editor.setText(this.sel_item.obj.text);
      this.editor._editor.session.setUndoManager(new ace.UndoManager());

      this.newOpened = true;
    }
  }

  getCode(code: ChangeInfo<Codes>): void {
    this.settingsService.getCode(code.obj.id).subscribe(full_code => {
      const state = code.state;
      code.obj.text = full_code.text;
      this.select(code);
      code.state = state;
    });
  }

  code_save(evnt): void {
    const code_arr: Observable<any>[] = [];

    for (const item of this.items) {
      if (item.state === ChangeState.Upsert) {
        if (item.obj.id) {
          code_arr.push(this.settingsService.updateCode(item.obj));
        } else {
          console.error('Insert code isn\'t implemented');
        }
      } else if (item.state === ChangeState.Delete) {
        console.error('Delete code isn\'t implemented');
      }
    }

    if (code_arr.length) {
      forkJoin(...code_arr).subscribe(() => {
        this.save2(evnt);
      });
    } else {
      console.warn('code_arr empty');
      this.save2(evnt);
    }

    const elem = document.getElementById('editor-pane');
    elem.classList.remove('editor-pane-fullscreen');
    this.editor.getEditor().resize();
    setTimeout(() => { this.editor.getEditor().resize(); }, 200);
  }

  fullscreenToggle() {
    const elem = document.getElementById('editor-pane');

    elem.classList.toggle('editor-pane-fullscreen');

    const ed = this.editor.getEditor();
    ed.resize();

    setTimeout(() => { this.editor.getEditor().resize(); }, 200);

    /*
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
    */
  }

  adjust_size() {
    const ed = this.editor.getEditor();
    ed.resize();
  }

  wasChanged() {
    if (this.newOpened) {
      this.newOpened = false;
      return;
    }

    this.sel_item.obj.text = this.editor.text;
    this.itemChanged();
  }
}
