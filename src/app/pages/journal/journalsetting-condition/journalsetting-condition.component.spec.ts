import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalsettingConditionComponent } from './journalsetting-condition.component';

describe('JournalConditionComponent', () => {
  let component: JournalsettingConditionComponent;
  let fixture: ComponentFixture<JournalsettingConditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [JournalsettingConditionComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JournalsettingConditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
