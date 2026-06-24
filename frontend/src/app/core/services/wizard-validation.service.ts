import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Mediates between the project-layout "Save & Continue" button and each
 * wizard-step child component. Layout calls requestContinue(); child validates
 * (and saves) then calls reportResult(true/false); layout subscribes to
 * navigationGranted$ and only navigates when it receives true.
 */
@Injectable({ providedIn: 'root' })
export class WizardValidationService {
  private readonly _continueClicked$ = new Subject<void>();
  private readonly _navigationGranted$ = new Subject<boolean>();

  /** Child components subscribe to this to know when to validate. */
  readonly continueClicked$ = this._continueClicked$.asObservable();

  /** Project-layout subscribes to this to know whether to navigate. */
  readonly navigationGranted$ = this._navigationGranted$.asObservable();

  /** Reflects the save-in-progress state of the active child component. */
  isSaving = signal<boolean>(false);

  /** Called by project-layout when the user clicks "Save & Continue". */
  requestContinue(): void {
    this._continueClicked$.next();
  }

  /** Called by each child component with the result of its validation/save. */
  reportResult(canNavigate: boolean): void {
    this._navigationGranted$.next(canNavigate);
  }
}
