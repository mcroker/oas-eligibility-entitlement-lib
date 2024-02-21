import { Translations } from '../i18n'
import {
  BenefitKey,
  EntitlementResultType,
  LegalStatus,
  MaritalStatus,
  PartnerBenefitStatus,
  ResultKey,
  ResultReason,
} from '../definitions/enums'
import {
  EligibilityResult,
  EntitlementResultGeneric,
} from '../definitions/types'
import legalValues from '../../scrapers/output'
import { BaseBenefit } from './_base'
import { EntitlementFormula } from './entitlementFormula'
import { AlwsInput } from '../definitions/input'

export class AlwsBenefit extends BaseBenefit<EntitlementResultGeneric> implements AlwsInput {

  public everLivedSocialCountry: boolean
  public yearsInCanadaSince18: number
  public livedOnlyInCanada: boolean

  public override maritalStatus: MaritalStatus
  public override legalStatus: LegalStatus
  public override partnerBenefitStatus: PartnerBenefitStatus

  constructor(
    input: AlwsInput,
    translations: Translations
  ) {
    super(input, translations, BenefitKey.alws)
    this.everLivedSocialCountry = input.everLivedSocialCountry;
    this.yearsInCanadaSince18 = input.yearsInCanadaSince18;
    this.livedOnlyInCanada = input.livedOnlyInCanada;
    this.maritalStatus = input.maritalStatus;
    this.legalStatus = input.legalStatus;
    this.partnerBenefitStatus = input.partnerBenefitStatus;
  }

  protected getEligibility(asOf?: Date, forPartner: boolean = false): EligibilityResult {

    // Default to current date
    const now = new Date();
    asOf = (asOf !== undefined) ? asOf : now;
    const future = (asOf > now);

    // helpers
    const meetsReqMarital =
      this._maritalStatus.value == MaritalStatus.WIDOWED
    const meetsReqAge = 60 <= this.age && this.age < 65
    const overAgeReq = 65 <= this.age
    const underAgeReq = this.age < 60

    // if income is not provided, assume they meet the income requirement
    const skipReqIncome = !this._income.provided
    const maxIncome = legalValues.alw.afsIncomeLimit
    const meetsReqIncome =
      skipReqIncome || this._income.adjustedRelevant < maxIncome

    const requiredYearsInCanada = 10
    const meetsReqYears =
      this.yearsInCanadaSince18 >= requiredYearsInCanada
    const meetsReqLegal = this._legalStatus.canadian
    const livingCanada = this._livingCountry.canada
    const liveOnlyInCanadaMoreThanHalfYear = this.livedOnlyInCanada

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
      const amount = this.formulaResult()
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

  protected getEntitlement(): EntitlementResultGeneric {
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
      !this._income.provided &&
      this.eligibility.result === ResultKey.INCOME_DEPENDENT
    )
      return {
        result: -1,
        type: EntitlementResultType.UNAVAILABLE,
        autoEnrollment,
      }

    // otherwise, let's do it!

    const type = EntitlementResultType.FULL

    return { result: this.formulaResult(), type, autoEnrollment }
  }

  protected formulaResult(): number {
    return new EntitlementFormula(
      this._income.adjustedRelevant,
      this._maritalStatus,
      this._partnerBenefitStatus,
      this.age
    ).getEntitlementAmount()
  }
  /**
   * For this benefit, always return false, because we don't know any better as of now.
   */
  protected override getAutoEnrollment(): boolean {
    return false
  }

}
