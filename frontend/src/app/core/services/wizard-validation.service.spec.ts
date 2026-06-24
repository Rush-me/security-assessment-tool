import { TestBed } from '@angular/core/testing';
import { WizardValidationService } from './wizard-validation.service';

describe('WizardValidationService', () => {
  let service: WizardValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WizardValidationService);
  });

  it('should be created and set isSaving to false initially', () => {
    expect(service).toBeTruthy();
    expect(service.isSaving()).toBeFalse();
  });

  it('should emit on continueClicked$ when requestContinue is called', (done) => {
    service.continueClicked$.subscribe(() => {
      expect(true).toBeTrue(); // Success assertion
      done();
    });

    service.requestContinue();
  });

  it('should emit true/false on navigationGranted$ when reportResult is called', (done) => {
    let count = 0;
    service.navigationGranted$.subscribe((granted) => {
      count++;
      if (count === 1) {
        expect(granted).toBeTrue();
        service.reportResult(false);
      } else if (count === 2) {
        expect(granted).toBeFalse();
        done();
      }
    });

    service.reportResult(true);
  });

  it('should support updating isSaving signal state', () => {
    service.isSaving.set(true);
    expect(service.isSaving()).toBeTrue();

    service.isSaving.set(false);
    expect(service.isSaving()).toBeFalse();
  });
});
