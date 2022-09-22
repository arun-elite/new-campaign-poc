import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MappingsourcePocComponent } from './mappingsource-poc.component';

describe('MappingsourcePocComponent', () => {
  let component: MappingsourcePocComponent;
  let fixture: ComponentFixture<MappingsourcePocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MappingsourcePocComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MappingsourcePocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
