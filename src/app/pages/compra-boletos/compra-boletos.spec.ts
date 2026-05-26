import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompraBoletos } from './compra-boletos';

describe('CompraBoletos', () => {
  let component: CompraBoletos;
  let fixture: ComponentFixture<CompraBoletos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompraBoletos],
    }).compileComponents();

    fixture = TestBed.createComponent(CompraBoletos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
