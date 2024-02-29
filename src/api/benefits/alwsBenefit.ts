import { Translations } from '../i18n'
import {
  BenefitKey,
  EntitlementResultType,
  MaritalStatus,
  ResultKey,
  ResultReason,
} from '../definitions/enums'
import {
  BenefitResult,
  EligibilityResult,
  EntitlementResultGeneric,
  EntitlementResultOas,
} from '../definitions/types'
import legalValues from '../../scrapers/output'
import { AlwsClientAndPartner } from '../client/alwsClient'
import { EntitlementFormula } from './EntiltementFormula'
import { BaseBenefit } from './_base'

export class AlwsBenefit extends BaseBenefit<AlwsClientAndPartner, EntitlementResultGeneric> {
  protected benefitKey = BenefitKey.alws

  constructor(
    input: AlwsClientAndPartner,
    translations: Translations,
    protected oasResult?: BenefitResult<EntitlementResultOas>
  ) {
    super(input, translations)
  }

  getEligibility(asOf?: Date): EligibilityResult {

    // Default to current date
    const now = new Date();
    asOf = (asOf !== undefined) ? asOf : now;
    const future = (asOf > now);

    // helpers
    const meetsReqMarital =
      this.input.client.maritalStatus == MaritalStatus.WIDOWED
    const meetsReqAge = 60 <= this.input.client.age && this.input.client.age < 65
    const overAgeReq = 65 <= this.input.client.age
    const underAgeReq = this.input.client.age < 60

    // if income is not provided, assume they meet the income requirement
    const skipReqIncome = this.input.client.income === undefined
    const maxIncome = legalValues.alw.afsIncomeLimit
    const meetsReqIncome =
      skipReqIncome || this.input.adjustedRelevantIncome < maxIncome

    const requiredYearsInCanada = 10
    const meetsReqYears =
      this.input.client.yearsInCanadaSince18 >= requiredYearsInCanada
    const meetsReqLegal = this.input.client.hasLegalStatusCanada
    const livingCanada = this.input.client.isLivingInCanada
    const liveOnlyInCanadaMoreThanHalfYear = this.input.client.livedOnlyInCanada

    // main checks
    // if not windowed
    if (!meetsReqMarital) {
      return {
        result: ResultKey.INELIGIBLE,
        reason: ResultReason.MARITAL,
        detail: this.translations.detail.afsNotEligible,
      }
    }
    // if age is less than 60
    else if (underAgeReq) {
      return {
        result: ResultKey.INELIGIBLE,
        reason: ResultReason.AGE_YOUNG,
        detail: this.translations.detail.eligibleWhen60,
      }
    }
    // if age is greater or equals to 65
    else if (overAgeReq) {
      return {
        result: ResultKey.INELIGIBLE,
        reason: ResultReason.AGE,
        detail: this.translations.detail.afsNotEligible,
      }
    }
    // if legal status not valid
    else if (!meetsReqLegal) {
      return {
        result: ResultKey.INELIGIBLE,
        reason: ResultReason.LEGAL_STATUS,
        detail: this.translations.detail.dependingOnLegal,
      }
    } else if (!livingCanada) {
      return {
        result: ResultKey.INELIGIBLE,
        reason: ResultReason.LIVING_COUNTRY,
        detail: this.translations.detail.mustBeInCanada,
      }
    }
    //check residency history
    else if (!livingCanada && !liveOnlyInCanadaMoreThanHalfYear) {
      return {
        result: ResultKey.INELIGIBLE,
        reason: ResultReason.LIVING_COUNTRY,
        detail: this.translations.detail.mustBeInCanada,
      }
    }
    // living in Canada but less than 10 years
    else if (livingCanada && !meetsReqYears) {
      return {
        result: ResultKey.INELIGIBLE,
        reason: ResultReason.YEARS_IN_CANADA,
        detail: this.translations.detail.mustMeetYearReq,
      }
    }

    // Eligible scenarios
    if (skipReqIncome) {
      return {
        result: ResultKey.INCOME_DEPENDENT,
        reason: ResultReason.INCOME_MISSING,
        detail: this.translations.detail.eligibleDependingOnIncomeNoEntitlement,
        incomeMustBeLessThan: maxIncome,
      }
    } else {
      const amount = this.getEntitlementAmount()
      if (amount === 0) {
        return {
          result: ResultKey.ELIGIBLE,
          reason: ResultReason.NONE,
          detail: future
            ? this.translations.detail.futureEligibleIncomeTooHigh2
            : this.translations.detail.eligibleIncomeTooHigh,
        }
      } else {
        return {
          result: ResultKey.ELIGIBLE,
          reason: ResultReason.NONE,
          detail: future
            ? this.translations.detail.futureEligible60
            : this.translations.detail.eligible,
        }
      }
    }
  }

  getEntitlement(): EntitlementResultGeneric {
    const autoEnrollment = this.getAutoEnrollment()
    // client is not eligible, and it's not because income missing? they get nothing.
    if (
      this.eligibility.result !== ResultKey.ELIGIBLE &&
      this.eligibility.result !== ResultKey.INCOME_DEPENDENT
    )
      return {
        result: 0,
        type: EntitlementResultType.NONE,
        autoEnrollment,
      }

    // income is not provided, and they are eligible depending on income? entitlement unavailable.
    if (
      !this.input.client.income !== undefined &&
      this.eligibility.result === ResultKey.INCOME_DEPENDENT
    )
      return {
        result: -1,
        type: EntitlementResultType.UNAVAILABLE,
        autoEnrollment,
      }

    // otherwise, let's do it!

    const type = EntitlementResultType.FULL

    return { result: this.getEntitlementAmount(), type, autoEnrollment }
  }

  getEntitlementAmount(): number {
    // TODO This is almost certainly the wrong use of inputAge parameter, but I don't know what it should be.
    return new EntitlementFormula(this.input, this.oasResult).getEntitlementAmount()
  }

  /**
   * For this benefit, always return false, because we don't know any better as of now.
   */
  override getAutoEnrollment(): boolean {
    return false
  }

  static AlwsEligibility(age: number, yearsInCanada: number) {
    const minAgeEligibility = 60
    const maxAgeEligibility = 64
    const minYearsOfResEligibility = 10

    let ageOfEligibility
    let yearsOfResAtEligibility

    if (age < minAgeEligibility || yearsInCanada < minYearsOfResEligibility) {
      while (
        age < minAgeEligibility ||
        yearsInCanada < minYearsOfResEligibility
      ) {
        age++
        yearsInCanada++
      }
      ageOfEligibility = age > maxAgeEligibility ? null : age
      yearsOfResAtEligibility = yearsInCanada
    }

    return {
      ageOfEligibility,
      yearsOfResAtEligibility,
    }
  }

}