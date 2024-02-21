import { Translations } from '../i18n'
import {
  BenefitKey,
  EntitlementResultType,
  ResultKey,
  ResultReason,
  LivingCountry,
  MaritalStatus,
  LegalStatus,
  PartnerBenefitStatus,
} from '../definitions/enums'
import {
  EligibilityResult,
  EntitlementResultGeneric,
} from '../definitions/types'
import legalValues from '../../scrapers/output'
import { BaseBenefit } from './_base'
import { EntitlementFormula } from './entitlementFormula'
import { AlwsInput } from '../definitions/input'

export class AlwBenefit extends BaseBenefit<EntitlementResultGeneric> implements AlwsInput {

  single?: Boolean

  public get relevantIncome(): number {
    return this.single
      ? this._income.adjustedIncome
      : this._income.adjustedRelevant
  }

  public yearsInCanadaSince18: number
  public everLivedSocialCountry: boolean
  public livedOnlyInCanada: boolean
  public override maritalStatus: MaritalStatus
  public override legalStatus: LegalStatus
  public override partnerBenefitStatus: PartnerBenefitStatus 

  constructor(
    input: AlwsInput,
    translations: Translations,
    single?: Boolean // TODO
  ) {
    super(input, translations, BenefitKey.alw)
    this.yearsInCanadaSince18 = input.yearsInCanadaSince18;
    this.everLivedSocialCountry = input.everLivedSocialCountry;
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
    const meetsReqMarital = this._maritalStatus.partnered
    const meetsReqAge = 60 <= this.age && this.age < 65
    const overAgeReq = 65 <= this.age
    const underAgeReq = this.age < 60
    const meetsReqCountry = this._livingCountry.canada

    // Partner must live in Canada to receive GIS
    const meetsReqPartner =
      this._partnerBenefitStatus.gis &&
      this._partnerLivingCountry.value === LivingCountry.CANADA

    // income must be provided, partner cannot be eligible for gis without income
    const incomeNotProvided = !this._income.provided
    const maxIncome = legalValues.alw.alwIncomeLimit
    const meetsReqIncome = this._income.adjustedRelevant <= maxIncome
    const requiredYearsInCanada = 10
    const meetsReqYears =
      this.yearsInCanadaSince18 >= requiredYearsInCanada
    const meetsReqLegal = this._legalStatus.canadian

    // main checks
    if (
      meetsReqLegal &&
      meetsReqYears &&
      meetsReqMarital &&
      meetsReqIncome &&
      meetsReqPartner &&
      meetsReqCountry
    ) {
      if (meetsReqAge && incomeNotProvided) {
        return {
          result: ResultKey.INELIGIBLE,
          reason: ResultReason.INCOME_MISSING,
          detail: this._partnerBenefitStatus.none
            ? this.translations.detail.alwEligibleButPartnerAlreadyIs
            : this.translations.detail.alwNotEligible,
        }
      } else if (
        meetsReqAge &&
        !incomeNotProvided &&
        this._partnerBenefitStatus.none
      ) {
        return {
          result: ResultKey.INELIGIBLE,
          reason: ResultReason.INCOME_MISSING,
          detail: this.translations.detail.alwEligibleButPartnerAlreadyIs,
        }
      } else if (meetsReqAge) {
        const amount = this.formulaResult()

        // client is Eligible however if the amount returned is 0 it requires a different text
        if (amount === 0) {
          return {
            result: ResultKey.ELIGIBLE,
            reason: ResultReason.NONE,
            detail: this.translations.detail.alwEligibleIncomeTooHigh,
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
      } else if (this.age == 59) {
        return {
          result: ResultKey.INELIGIBLE,
          reason: ResultReason.AGE_YOUNG,
          detail: this.translations.detail.eligibleWhen60ApplyNow,
        }
      } else if (underAgeReq) {
        return {
          result: ResultKey.INELIGIBLE,
          reason: ResultReason.AGE_YOUNG,
          detail: this.translations.detail.eligibleWhen60,
        }
      } else {
        return {
          result: ResultKey.INELIGIBLE,
          reason: ResultReason.AGE,
          detail: this.translations.detail.alwNotEligible,
        }
      }
    } else if (meetsReqAge && incomeNotProvided) {
      return {
        result: ResultKey.INELIGIBLE,
        reason: ResultReason.INCOME_MISSING,
        detail: this._maritalStatus.partnered
          ? this.translations.detail.alwNotEligible
          : this.translations.detail.alwEligibleButPartnerAlreadyIs,
      }
    } else if (overAgeReq) {
      return {
        result: ResultKey.INELIGIBLE,
        reason: ResultReason.AGE,
        detail: this.translations.detail.alwNotEligible,
      }
    } else if (underAgeReq && meetsReqMarital) {
      return {
        result: ResultKey.INELIGIBLE,
        reason: ResultReason.AGE_YOUNG,
        detail: this.translations.detail.alwNotEligible,
      }
    } else if (!meetsReqMarital && this._maritalStatus.provided) {
      return {
        result: ResultKey.INELIGIBLE,
        reason: ResultReason.MARITAL,
        detail: this.translations.detail.alwNotEligible,
      }
    } else if (!meetsReqPartner) {
      return {
        result: ResultKey.INELIGIBLE,
        reason: ResultReason.PARTNER,
        //detail: this.translations.detail.alwNotEligible,
        detail: !this._partnerBenefitStatus.provided
          ? this.translations.detail.alwNotEligible
          : this.translations.detail.alwEligibleButPartnerAlreadyIs,
      }
    } else if (!meetsReqIncome && meetsReqYears) {
      return {
        result: ResultKey.ELIGIBLE,
        reason: ResultReason.INCOME,
        detail: future
          ? this.translations.detail.futureEligibleIncomeTooHigh2
          : this.translations.detail.alwEligibleIncomeTooHigh,
      }
    } else if (!meetsReqCountry) {
      return {
        result: ResultKey.INELIGIBLE,
        reason: ResultReason.INCOME,
        detail: this.translations.detail.mustBeInCanada,
      }
    } else if (!meetsReqYears) {
      if (
        this._livingCountry.agreement ||
        this.everLivedSocialCountry
      ) {
        if (meetsReqAge) {
          return {
            result: ResultKey.UNAVAILABLE,
            reason: ResultReason.YEARS_IN_CANADA,
            detail: this.translations.detail.dependingOnAgreement,
          }
        } else if (underAgeReq) {
          return {
            result: ResultKey.INELIGIBLE,
            reason: ResultReason.AGE_YOUNG,
            detail: this.translations.detail.dependingOnAgreementWhen60,
          }
        } else {
          return {
            result: ResultKey.INELIGIBLE,
            reason: ResultReason.AGE,
            detail: this.translations.detail.alwNotEligible,
          }
        }
      } else {
        return {
          result: ResultKey.INELIGIBLE,
          reason: ResultReason.YEARS_IN_CANADA,
          detail: this.translations.detail.mustMeetYearReq,
        }
      }
    } else if (!meetsReqLegal) {
      if (underAgeReq) {
        return {
          result: ResultKey.INELIGIBLE,
          reason: ResultReason.AGE_YOUNG,
          detail: this.translations.detail.dependingOnLegalWhen60,
        }
      } else {
        return {
          result: ResultKey.UNAVAILABLE,
          reason: ResultReason.LEGAL_STATUS,
          detail: this.translations.detail.dependingOnLegal,
        }
      }
    }
    throw new Error('entitlement logic failed to produce a result')
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
        result: 0,
        type: EntitlementResultType.UNAVAILABLE,
        autoEnrollment,
      }

    // otherwise, let's do it!

    const formulaResult = this.formulaResult()

    const type =
      formulaResult === -1
        ? EntitlementResultType.UNAVAILABLE
        : EntitlementResultType.FULL

    return { result: formulaResult, type, autoEnrollment }
  }

  /**
   * Just the formula to get the amount
   */
  protected formulaResult(): number {
    const formulaResult = new EntitlementFormula(
      this.relevantIncome,
      this._maritalStatus,
      this._partnerBenefitStatus,
      this.age
    ).getEntitlementAmount()

    return formulaResult
  }

  /**
   * For this benefit, always return false, because we don't know any better as of now.
   */
  protected override getAutoEnrollment(): boolean {
    return false
  }

}
