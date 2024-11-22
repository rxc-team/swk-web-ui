import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalsettingListComponent } from './journalsetting-list.component';

describe('JournalsettingListComponent', () => {
  let component: JournalsettingListComponent;
  let fixture: ComponentFixture<JournalsettingListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JournalsettingListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JournalsettingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
