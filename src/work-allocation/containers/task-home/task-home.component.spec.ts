import { CdkTableModule } from '@angular/cdk/table';
import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ExuiCommonLibModule } from '@hmcts/rpx-xui-common-lib';

import { WorkAllocationComponentsModule } from './../../components/work-allocation.components.module';
import { WorkAllocationTaskService } from './../../services/work-allocation-task.service';
import { TaskHomeComponent } from './task-home.component';

@Component({
  template: `<exui-task-home></exui-task-home>`
})
class WrapperComponent {
  @ViewChild(TaskHomeComponent) public appComponentRef: TaskHomeComponent;
}

describe('TaskHomeComponent', () => {
  let component: TaskHomeComponent;
  let wrapper: WrapperComponent;
  let fixture: ComponentFixture<WrapperComponent>;
  let router: Router;
  const mockTaskService = jasmine.createSpyObj('mockTaskService', ['searchTask']);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CdkTableModule,
        ExuiCommonLibModule,
        RouterTestingModule,
        WorkAllocationComponentsModule
      ],
      declarations: [TaskHomeComponent, WrapperComponent],
      providers: [
        { provide: WorkAllocationTaskService, useValue: mockTaskService },
        { provide: Location, useValue: location }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WrapperComponent);
    wrapper = fixture.componentInstance;
    component = wrapper.appComponentRef;
    router = TestBed.get(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  describe('routeActive', () => {
    it('should correctly identify an active route without a hash', () => {
      expect(component.routeActive('/tasks/list', '/tasks/list')).toBeTruthy();
    });
    it('should correctly identify an active route with a hash', () => {
      expect(component.routeActive('/tasks/list', '/tasks/list#manage_123456')).toBeTruthy();
    });
    it('should correctly identify an inactive route without a hash', () => {
      expect(component.routeActive('/tasks/list', '/tasks/available')).toBeFalsy();
    });
    it('should correctly identify an inactive route with a hash', () => {
      expect(component.routeActive('/tasks/list', '/tasks/available#manage_123456')).toBeFalsy();
    });
  });
});
