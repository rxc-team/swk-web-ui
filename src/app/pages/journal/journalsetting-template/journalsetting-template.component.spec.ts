import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalsettingTemplateComponent } from './journalsetting-template.component';

describe('JournalsettingTemplateComponent', () => {
  let component: JournalsettingTemplateComponent;
  let fixture: ComponentFixture<JournalsettingTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JournalsettingTemplateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JournalsettingTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
