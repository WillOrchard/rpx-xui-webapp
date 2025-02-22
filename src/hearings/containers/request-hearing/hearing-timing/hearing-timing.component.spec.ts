import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import * as moment from 'moment';
import { of } from 'rxjs';
import { ErrorMessage } from '../../../../app/models';
import { initialState } from '../../../hearing.test.data';
import { ACTION, HearingDatePriorityEnum, RadioOptions, UnavailabilityType } from '../../../models/hearings.enum';
import { LovRefDataModel } from '../../../models/lovRefData.model';
import { UnavailabilityRangeModel } from '../../../models/unavailabilityRange.model';
import { HearingsService } from '../../../services/hearings.service';
import { ValidatorsUtils } from '../../../utils/validators.utils';
import { HearingTimingComponent } from './hearing-timing.component';

@Component({
  selector: 'exui-hearing-parties-title',
  template: ''
})
class MockHearingPartiesComponent {
  @Input() public error: ErrorMessage;
}

describe('HearingTimingComponent', () => {
  const mockedHttpClient = jasmine.createSpyObj('HttpClient', ['get', 'post']);
  const hearingsService = new HearingsService(mockedHttpClient);
  hearingsService.navigateAction$ = of(ACTION.CONTINUE);

  let component: HearingTimingComponent;
  let fixture: ComponentFixture<HearingTimingComponent>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let router: Router;
  const priorities: LovRefDataModel[] = [
    {
      key: 'urgent',
      value_en: 'Urgent',
      value_cy: '',
      hint_text_en: 'Urgent',
      hint_text_cy: '',
      lov_order: 1,
      parent_key: null,
      category_key: 'HearingPriority',
      parent_category: '',
      active_flag: 'Y',
      child_nodes: null
    },
    {
      key: 'standard',
      value_en: 'Standard',
      value_cy: '',
      hint_text_en: 'Standard',
      hint_text_cy: '',
      lov_order: 2,
      parent_key: null,
      category_key: 'HearingPriority',
      parent_category: '',
      active_flag: 'Y',
      child_nodes: null
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule,
        HttpClientTestingModule],
      declarations: [HearingTimingComponent, MockHearingPartiesComponent],
      providers: [
        provideMockStore({ initialState }),
        { provide: HearingsService, useValue: hearingsService },
        ValidatorsUtils,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                hearingPriorities: priorities
              }
            },
            fragment: of('point-to-me')
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();
    fixture = TestBed.createComponent(HearingTimingComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should check initForm', () => {
    component.priorityFormInfo.startDate = new Date('02-03-2021');
    component.initForm();
    expect(component.firstHearingFormGroup.get('firstHearingDate_day').value).toBeNull();
  });

  it('should set checkedHearingAvailability', () => {
    const hearingAvailability = component.priorityForm.controls.specificDate;
    component.showDateAvailability();
    expect(component.checkedHearingAvailability).toBe(RadioOptions.CHOOSE_DATE_RANGE);
    hearingAvailability.setValue(RadioOptions.YES);
    component.showDateAvailability();
    expect(component.checkedHearingAvailability).toBe(RadioOptions.YES);
    hearingAvailability.setValue(RadioOptions.CHOOSE_DATE_RANGE);
    component.showDateAvailability();
    expect(component.checkedHearingAvailability).toBe(RadioOptions.CHOOSE_DATE_RANGE);
  });

  it('should set showHearingDateError', () => {
    component.showHearingDateError();
    expect(component.hearingPriorityDateError).toBe(null);
  });

  it('should check unavailable dates list', () => {
    component.partiesNotAvailableDates = [];
    const unavailabilityDates: UnavailabilityRangeModel[] = [
      {
        unavailableFromDate: '2021-12-10T09:00:00.000Z',
        unavailableToDate: '2021-12-31T09:00:00.000Z',
        unavailabilityType: UnavailabilityType.ALL_DAY
      },
      {
        unavailableFromDate: '2021-12-10T09:00:00.000Z',
        unavailableToDate: '2021-12-31T09:00:00.000Z',
        unavailabilityType: UnavailabilityType.ALL_DAY
      }
    ];
    component.checkUnavailableDatesList(unavailabilityDates);
    expect(component.partiesNotAvailableDates[2]).toBe('14 December 2021');
    expect(component.partiesNotAvailableDates.length).toBe(16);
  });

  it('should set unavailable dates', () => {
    component.partiesNotAvailableDates = [];
    const unavailabilityDate: UnavailabilityRangeModel = {
      unavailableFromDate: '2021-12-10T09:00:00.000Z',
      unavailableToDate: '2021-12-11T09:00:00.000Z',
      unavailabilityType: UnavailabilityType.ALL_DAY
    };
    component.checkUnavailableDatesList([unavailabilityDate]);
    expect(component.partiesNotAvailableDates[0]).toBe('10 December 2021');
  });

  it('should check isWeekDay', () => {
    expect(component.isWeekDay(moment('9-12-2021'))).toBe(false);
  });

  it('should get Formatted Date', () => {
    const form = new FormGroup({
      given_day: new FormControl(),
      given_month: new FormControl(),
      given_year: new FormControl()
    });
    form.controls.given_day.setValue('12');
    expect((component as any).getDateFormatted(form, 'given')).toBe('12-null-null');
  });

  it('should get empty Formatted Date', () => {
    const form = new FormGroup({
      given_day: new FormControl(),
      given_month: new FormControl(),
      given_year: new FormControl()
    });
    form.controls.given_day.setValue('');
    form.controls.given_month.setValue('');
    form.controls.given_year.setValue('');
    expect((component as any).getDateFormatted(form, 'given')).toBe(null);
  });

  it('should get getFormData', () => {
    component.hearingRequestMainModel.hearingDetails.duration = 70;
    component.hearingRequestMainModel.hearingDetails.hearingPriorityType = 'Urgent';
    component.hearingRequestMainModel.hearingDetails.hearingWindow = null;
    component.getFormData();
    expect(component.priorityFormInfo.hours).toBe('1');
    expect(component.priorityFormInfo.minutes).toBe('10');
    expect(component.priorityFormInfo.priority).toBe('Urgent');
    expect(component.checkedHearingAvailability).toBe(RadioOptions.NO);
    component.hearingRequestMainModel.hearingDetails.hearingWindow = { dateRangeStart: '01-01-2021' };
    component.getFormData();
    expect(component.checkedHearingAvailability).toBe(RadioOptions.CHOOSE_DATE_RANGE);
    component.hearingRequestMainModel.hearingDetails.hearingWindow = { dateRangeEnd: '01-01-2021' };
    component.getFormData();
    expect(component.checkedHearingAvailability).toBe(RadioOptions.CHOOSE_DATE_RANGE);
  });

  it('should check Hearing Length', () => {
    const durationLengthControls = component.priorityForm.controls.durationLength;
    durationLengthControls.get('days').setValue('day');
    component.showHearingLengthError();
    expect(component.hearingLengthErrorValue).toBe(HearingDatePriorityEnum.LengthError);
    durationLengthControls.markAsDirty();
    durationLengthControls.get('days').setValue('-10');
    component.showHearingLengthError();
    expect(component.hearingLengthErrorValue).toBe(HearingDatePriorityEnum.LengthError);
    durationLengthControls.get('hours').setValue('hour');
    component.showHearingLengthError();
    expect(component.hearingLengthErrorValue).toBe(HearingDatePriorityEnum.LengthError);
    durationLengthControls.markAsDirty();
    durationLengthControls.get('days').setValue('1');
    durationLengthControls.get('hours').setValue('10');
    component.showHearingLengthError();
    expect(component.hearingLengthErrorValue).toBe(HearingDatePriorityEnum.LengthHoursError);
    durationLengthControls.markAsDirty();
    durationLengthControls.get('days').setValue('1');
    durationLengthControls.get('hours').setValue('1');
    durationLengthControls.get('minutes').setValue('qer');
    component.showHearingLengthError();
    expect(component.hearingLengthErrorValue).toBe(HearingDatePriorityEnum.LengthError);
    durationLengthControls.markAsTouched();
    durationLengthControls.get('days').setValue('1');
    durationLengthControls.get('hours').setValue('1');
    durationLengthControls.get('minutes').setValue('3000');
    component.showHearingLengthError();
    expect(component.hearingLengthErrorValue).toBe(HearingDatePriorityEnum.LengthError);
  });

  it('should check date selection invalid', () => {
    component.firstDateOfHearingError = null;
    component.firstHearingFormGroup.get('firstHearingDate_day').setValue('12');
    component.showChosenDateError();
    expect(component.firstDateOfHearingError.isInvalid).toBeTruthy();
  });

  it('should check date selection valid', () => {
    component.firstDateOfHearingError = null;
    component.firstHearingFormGroup.get('firstHearingDate_day').setValue('25');
    component.firstHearingFormGroup.get('firstHearingDate_month').setValue('10');
    component.firstHearingFormGroup.get('firstHearingDate_year').setValue(Number(moment().format('YYYY')) + 1);
    component.showChosenDateError();
    expect(component.firstDateOfHearingError).toBe(null);
  });

  it('should check date selection weekend', () => {
    component.firstDateOfHearingError = null;
    component.firstHearingFormGroup.get('firstHearingDate_day').setValue('15');
    component.firstHearingFormGroup.get('firstHearingDate_month').setValue('10');
    component.firstHearingFormGroup.get('firstHearingDate_year').setValue('2022');
    component.showChosenDateError();
    expect(component.firstDateOfHearingError.isInvalid).toBeTruthy();
  });

  it('should check date selection past date', () => {
    component.firstDateOfHearingError = null;
    component.firstHearingFormGroup.get('firstHearingDate_day').setValue('15');
    component.firstHearingFormGroup.get('firstHearingDate_month').setValue('10');
    component.firstHearingFormGroup.get('firstHearingDate_year').setValue('2020');
    component.showChosenDateError();
    expect(component.firstDateOfHearingError.isInvalid).toBeTruthy();
  });

  it('should check date selection format', () => {
    component.firstDateOfHearingError = null;
    component.firstHearingFormGroup.get('firstHearingDate_day').setValue('ewr');
    component.firstHearingFormGroup.get('firstHearingDate_month').setValue('10');
    component.firstHearingFormGroup.get('firstHearingDate_year').setValue('2020');
    component.showChosenDateError();
    expect(component.firstDateOfHearingError.isInvalid).toBeTruthy();
  });

  it('should check showChosenDateRangeError', () => {
    component.earliestDateOfHearingError = null;
    component.earliestHearingFormGroup.get('earliestHearingDate_day').setValue('10');
    component.earliestHearingFormGroup.get('earliestHearingDate_month').setValue('12');
    component.earliestHearingFormGroup.get('earliestHearingDate_year').setValue('2020');
    component.latestHearingFormGroup.get('latestHearingDate_day').setValue('11');
    component.latestHearingFormGroup.get('latestHearingDate_month').setValue('12');
    component.latestHearingFormGroup.get('latestHearingDate_year').setValue('2022');
    component.showChosenDateRangeError();
    expect(component.earliestDateOfHearingError.isInvalid).toBeTruthy();
  });

  it('should check showChosenDateRangeError before date check', () => {
    component.earliestDateOfHearingError = null;
    component.earliestHearingFormGroup.get('earliestHearingDate_day').setValue('13');
    component.earliestHearingFormGroup.get('earliestHearingDate_month').setValue('12');
    component.earliestHearingFormGroup.get('earliestHearingDate_year').setValue(Number(moment().format('YYYY')) + 1);
    component.latestHearingFormGroup.get('latestHearingDate_day').setValue('11');
    component.latestHearingFormGroup.get('latestHearingDate_month').setValue('12');
    component.latestHearingFormGroup.get('latestHearingDate_year').setValue(Number(moment().format('YYYY')) + 1);
    component.showChosenDateRangeError();
    expect(component.earliestDateOfHearingError.isInvalid).toBeTruthy();
  });

  it('should check showChosenDateRangeError valid earliest date check', () => {
    component.earliestDateOfHearingError = null;
    component.earliestHearingFormGroup.get('earliestHearingDate_day').setValue('12');
    component.earliestHearingFormGroup.get('earliestHearingDate_month').setValue('12');
    component.earliestHearingFormGroup.get('earliestHearingDate_year').setValue('2016');
    component.latestHearingFormGroup.get('latestHearingDate_day').setValue('11');
    component.latestHearingFormGroup.get('latestHearingDate_month').setValue('12');
    component.latestHearingFormGroup.get('latestHearingDate_year').setValue('2016');
    component.showChosenDateRangeError();
    expect(component.earliestDateOfHearingError.isInvalid).toBeTruthy();
  });

  it('should set prepareHearingRequestData', () => {
    component.priorityForm.controls.durationLength.get('days').setValue('1');
    component.priorityForm.controls.durationLength.get('hours').setValue('1');
    component.priorityForm.controls.durationLength.get('minutes').setValue('5');
    component.firstHearingFormGroup.get('firstHearingDate_day').setValue('10');
    component.firstHearingFormGroup.get('firstHearingDate_month').setValue('10');
    component.firstHearingFormGroup.get('firstHearingDate_year').setValue(Number(moment().format('YYYY')) + 1);
    const hearingAvailability = component.priorityForm.controls.specificDate;
    hearingAvailability.setValue(RadioOptions.YES);
    component.showDateAvailability();
    component.prepareHearingRequestData();
    expect(component.hearingRequestMainModel.hearingDetails.duration).toBe(425);
    expect(component.hearingRequestMainModel.hearingDetails.hearingWindow.dateRangeStart).toBe(undefined);
    hearingAvailability.setValue(RadioOptions.CHOOSE_DATE_RANGE);
    component.showDateAvailability();
    component.prepareHearingRequestData();
    fixture.detectChanges();
    expect(component.hearingRequestMainModel.hearingDetails.hearingWindow.dateRangeEnd).toBe('2021-01-01T00:00:00.000Z');
  });

  it('should check date selection format for form data', () => {
    component.priorityForm.controls.durationLength.get('days').setValue('1');
    component.firstHearingFormGroup.get('firstHearingDate_day').setValue('15');
    component.firstHearingFormGroup.get('firstHearingDate_month').setValue('10');
    component.firstHearingFormGroup.get('firstHearingDate_year').setValue('2022');
    component.hearingRequestMainModel.hearingDetails.hearingPriorityType = 'Urgent';
    component.checkFormData();
    expect(component.priorityForm.valid).toBe(true);
  });

  it('should check if form is valid', () => {
    component.validationErrors = [];
    expect(component.isFormValid()).toBeTruthy();
  });

  afterEach(() => {
    fixture.destroy();
  });
});
