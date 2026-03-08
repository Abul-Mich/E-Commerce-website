import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SortBanner } from './sort-banner';

describe('SortBanner', () => {
  let component: SortBanner;
  let fixture: ComponentFixture<SortBanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SortBanner]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SortBanner);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
