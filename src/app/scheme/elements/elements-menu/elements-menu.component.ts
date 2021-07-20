import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../../authentication.service';
import {SidebarService} from '../../sidebar.service';
import {ControlService} from '../../control.service';

@Component({
    selector: 'app-elements-menu',
    templateUrl: './elements-menu.component.html',
    styleUrls: ['./elements-menu.component.css']
})
export class ElementsMenuComponent implements OnInit {
    isEditorModeEnabled = false;

    get canEditScheme(): boolean {
        return this.authService.canEditScheme();
    }

    get canRestart(): boolean {
        return this.authService.canRestart();
    }

    constructor(
        private authService: AuthenticationService,
        private sidebar: SidebarService,
        private controlService: ControlService,
    ) {
    }

    ngOnInit(): void {
        this.emitEditorMode();
    }

    restart(): void {
        this.controlService.restart();
    }

    setEditorMode($event: boolean) {
        this.isEditorModeEnabled = $event;
        this.emitEditorMode();
    }

    private emitEditorMode() {
        this.sidebar.performActionToContent({
            type: 'editor_mode',
            data: this.isEditorModeEnabled,
        });
    }
}
