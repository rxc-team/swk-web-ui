import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalSendComponent } from './journal-send.component';

describe('JournalSendComponent', () => {
  let component: JournalSendComponent;
  let fixture: ComponentFixture<JournalSendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JournalSendComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JournalSendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
