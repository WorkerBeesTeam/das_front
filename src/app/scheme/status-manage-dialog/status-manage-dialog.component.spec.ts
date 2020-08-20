import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusManageDialogComponent } from './status-manage-dialog.component';

describe('StatusManageDialogComponent', () => {
  let component: StatusManageDialogComponent;
  let fixture: ComponentFixture<StatusManageDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatusManageDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusManageDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
