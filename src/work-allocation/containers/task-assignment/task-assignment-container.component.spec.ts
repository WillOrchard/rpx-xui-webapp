import { CdkTableModule } from '@angular/cdk/table';
import { HttpClientModule } from '@angular/common/http';
import { Component, Input, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs';

import { ErrorMessageComponent } from '../../../app/components';
import { WorkAllocationComponentsModule } from '../../components/work-allocation.components.module';
import { TaskAssignmentContainerComponent, TaskListComponent } from '../../containers';
import { Assignee } from '../../models/dtos';
import { Task } from '../../models/tasks';
import { WorkAllocationTaskService } from '../../services';
import { getMockCaseworkers, getMockTasks } from '../../tests/utils.spec';

@Component({
  template: `<exui-task-container-assignment></exui-task-container-assignment>`
})
class WrapperComponent {
  @ViewChild(TaskAssignmentContainerComponent) public appComponentRef: TaskAssignmentContainerComponent;
  @Input() public tasks: Task[];
}

describe('TaskAssignmentContainerComponent', () => {
  let component: TaskAssignmentContainerComponent;
  let wrapper: WrapperComponent;
  let fixture: ComponentFixture<WrapperComponent>;
  let router: Router;

  const mockTasks = getMockTasks();
  const mockCaseworkers = getMockCaseworkers();
  const mockLocation = {
    back: jasmine.createSpy('back')
  };
  const mockWorkAllocationService = {
    assignTask: jasmine.createSpy('assignTask').and.returnValue(Observable.of({}))
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TaskAssignmentContainerComponent, WrapperComponent, ErrorMessageComponent, TaskListComponent
      ],
      imports: [
        WorkAllocationComponentsModule, CdkTableModule, FormsModule, HttpClientModule, RouterTestingModule
      ],
      providers: [
        { provide: WorkAllocationTaskService, useValue: mockWorkAllocationService },
        { provide: Location, useValue: mockLocation },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                task: { task: mockTasks[0] }
              }
            },
            params: Observable.of({ task: mockTasks[0] })
          }
        }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(WrapperComponent);
    wrapper = fixture.componentInstance;
    component = wrapper.appComponentRef;
    router = TestBed.get(Router);

    wrapper.tasks = null;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should allow changing the caseworker', () => {
    expect(component.caseworker).toBe(undefined);
    component.onCaseworkerChanged(mockCaseworkers[0]);
    fixture.detectChanges();
    expect(component.caseworker).toBe(mockCaseworkers[0]);

    component.onCaseworkerChanged(mockCaseworkers[1]);
    fixture.detectChanges();
    expect(component.caseworker).toBe(mockCaseworkers[1]);

    component.onCaseworkerChanged(null);
    fixture.detectChanges();
    expect(component.caseworker).toBe(null);
  });

  it('should send an error message when a caseworker is not selected and there is an attempt to assign', () => {
    expect(component.caseworker).toBeUndefined();
    expect(component.showProblem).toBeFalsy();
    expect(component.errorTitle).toBeUndefined();
    expect(component.errorDesc).toBeUndefined();

    component.reassign();
    fixture.detectChanges();
    expect(component.showProblem).toBeTruthy();
    expect(component.errorTitle).toEqual('There is a problem');
    expect(component.errorDesc).toEqual('You must select a name');

  });

  it('should assign succesfully', () => {
    const caseworker = mockCaseworkers[0];
    component.caseworker = caseworker;
    fixture.detectChanges();

    component.reassign();
    fixture.detectChanges();
    const assignee: Assignee = {
      id: caseworker.idamId,
      userName: `${caseworker.firstName} ${caseworker.lastName}`
    };
    expect(mockWorkAllocationService.assignTask).toHaveBeenCalledWith(mockTasks[0].id, assignee);
  });
  // TODO: Need to write tests regarding template
});
