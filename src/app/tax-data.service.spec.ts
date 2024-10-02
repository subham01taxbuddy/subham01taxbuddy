import { TestBed } from '@angular/core/testing';

import { TaxDataService } from './tax-data.service';

describe('TaxDataService', () => {
  let service: TaxDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaxDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
