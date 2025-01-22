import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalConditionComponent } from './journal-condition.component';

describe('JournalConditionComponent', () => {
  let component: JournalConditionComponent;
  let fixture: ComponentFixture<JournalConditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JournalConditionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JournalConditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
