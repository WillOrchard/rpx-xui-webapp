import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { caseFlagsRefData, initialState } from '../../hearing.test.data';
import { EXUIDisplayStatusEnum } from '../../models/hearings.enum';
import { HearingsPipesModule } from '../../pipes/hearings.pipes.module';
import { ListingInformationSummaryComponent } from './listing-information-summary.component';

describe('ListingInformationSummaryComponent', () => {
  let component: ListingInformationSummaryComponent;
  let fixture: ComponentFixture<ListingInformationSummaryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListingInformationSummaryComponent],
      imports: [RouterTestingModule, HearingsPipesModule, HttpClientTestingModule],
      providers: [
        provideMockStore({ initialState }),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                caseFlags: caseFlagsRefData
              }
            },
            fragment: of('point-to-me')
          }
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ListingInformationSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should case status listed be true', () => {
    component.caseStatusName = EXUIDisplayStatusEnum.LISTED;
    expect(component.isCaseStatusListed()).toEqual(true);
  });

  it('should destroy subscription', () => {
    component.serviceValueSub = of().subscribe();
    const unsubscribeSpy = spyOn(component.serviceValueSub, 'unsubscribe');
    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
