import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalConfimComponent } from './journal-confim.component';

describe('JournalConfimComponent', () => {
  let component: JournalConfimComponent;
  let fixture: ComponentFixture<JournalConfimComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JournalConfimComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JournalConfimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
