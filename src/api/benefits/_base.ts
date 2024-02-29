import { Translations } from '../i18n'
import {
  BenefitKey,
  ResultKey
} from '../definitions/enums'
import {
  EligibilityResult,
  EntitlementResult,
} from '../definitions/types'
import { ClientAndPartner } from '../client/_clientAndPartner'

export abstract class BaseBenefit<C extends ClientAndPartner = ClientAndPartner, R extends EntitlementResult = EntitlementResult> {

  protected readonly abstract benefitKey: BenefitKey

  protected constructor(
    protected input: C,
    protected translations: Translations
  ) {
  }

  get eligibility(): EligibilityResult {
    return this.getEligibility()
  }

  get entitlement(): R {
    return this.getEntitlement()
  }


  protected abstract getEligibility(asOf?: Date): EligibilityResult;
  protected abstract getEntitlement(asOf?: Date): R;

  /**
   * Just say auto-enroll is true if eligible, because we don't know any better right now.
   * This is overridden by ALW+AFS.
   */
  getAutoEnrollment(): boolean {
    return this.eligibility.result === ResultKey.ELIGIBLE
  }

  get info() {
    return {
      benefitKey: this.benefitKey,
      eligibility: this.eligibility,
      entitlement: this.entitlement
    }
  }
}
