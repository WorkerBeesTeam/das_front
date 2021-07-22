import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Connection_State, Scheme_Message} from '../../user';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-scheme-state',
  templateUrl: './scheme-state.component.html',
  styleUrls: ['./scheme-state.component.css', '../schemes-list.css']
})
export class SchemeStateComponent {
  status_class = {
    '1': 'ok',
    '2': 'undef',
    '3': 'warn',
    '4': 'err'
  };

  isModalOpen = false;

  get most_bad_status() {
    return this.messages?.reduce((acc, cur) => cur.status > acc ? cur.status : acc, 1);
  }

  get isSchemeConnected(): boolean {
      switch (this.connect_state & 0b111) {
          case Connection_State.CS_CONNECTED:
          case Connection_State.CS_CONNECTED_JUST_NOW:
          case Connection_State.CS_CONNECTED_SYNC_TIMEOUT:
              return true;
      }
      return false;
  }

  @Input() status_checked: boolean;
  @Input() loses_state: boolean;
  @Input() mod_state: boolean;
  @Input() connect_state: Connection_State;

    @Input() messages: Scheme_Message<number>[];

  constructor(
      private translate: TranslateService,
  ) { }

    toggleModal(e: any) {
      this.isModalOpen = !this.isModalOpen;
      e.stopPropagation();
  }

  public status_desc(): string {
        let result = '';

        if (this.mod_state) {
            result += this.translate.instant('MODIFIED') + '. ';
        }


        if (this.loses_state) {
            result += 'С потерями пакетов. '; // TODO: translation
        }

        if (this.status_checked) {
            switch (this.connect_state) {
                case Connection_State.CS_SERVER_DOWN:
                    return this.translate.instant('SERVER_DOWN');
                case Connection_State.CS_DISCONNECTED:
                    return result + this.translate.instant('OFFLINE');
                case Connection_State.CS_CONNECTED:
                    return result + this.translate.instant('ONLINE');
                case Connection_State.CS_CONNECTED_MODIFIED:
                    return result + this.translate.instant('MODIFIED');
                case Connection_State.CS_DISCONNECTED_JUST_NOW:
                    return result + this.translate.instant('DISCONNECTED_JUST_NOW');
                case Connection_State.CS_CONNECTED_JUST_NOW:
                    return result + this.translate.instant('CONNECTED_JUST_NOW');
                case Connection_State.CS_CONNECTED_SYNC_TIMEOUT:
                    return result + this.translate.instant('CONNECTED_SYNC_TIMEOUT');
            }
        }
        return this.translate.instant('WAIT') + '...';
    }

    public get_status_class(): string {
        if (!this.status_checked) {
            return 'status_check';
        }

        if (this.mod_state) {
            return 'status_modified';
        }

        switch (this.connect_state) {
            case Connection_State.CS_CONNECTED_SYNC_TIMEOUT:
            //  return 'status_sync_fail';
            case Connection_State.CS_CONNECTED_MODIFIED:
                return 'status_modified';
            case Connection_State.CS_DISCONNECTED_JUST_NOW:
                return 'status_bad_just';
            case Connection_State.CS_CONNECTED_JUST_NOW:
                return 'status_sync';
        }
    }
}
