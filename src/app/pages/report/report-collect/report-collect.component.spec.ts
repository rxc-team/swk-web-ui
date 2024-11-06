import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ReportCollectComponent } from './report-collect.component';

describe('ReportCollectComponent', () => {
  let component: ReportCollectComponent;
  let fixture: ComponentFixture<ReportCollectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportCollectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportCollectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
