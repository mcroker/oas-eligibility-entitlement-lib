import { Translations } from '../i18n'
import {
  BenefitKey,
  EntitlementResultType,
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
import {
  PartnerBenefitStatusHelper,
  LivingCountryHelper
} from '../helpers/fieldClasses'
import { AlwClientAndPartner } from '../client/alwClient'
import { BaseBenefit } from './_base'
import { EntitlementFormula } from './EntiltementFormula'

export class AlwBenefit extends BaseBenefit<AlwClientAndPartner, EntitlementResultGeneric> {
  protected benefitKey = BenefitKey.alw

  constructor(
    input: AlwClientAndPartner,
    translations: Translations,
    protected oasResult?: BenefitResult<EntitlementResultOas>
  ) {
    super(input, translations)
  }

  protected getEligibility(asOf?: Date, forPartner: boolean = false): EligibilityResult {

    // Default to current date
    const now = new Date();
    asOf = (asOf !== undefined) ? asOf : now;
    const future = (asOf > now);

    // helpers
    const meetsReqMarital = this.input.client.isPartnered
    const meetsReqAge = 60 <= this.input.client.age && this.input.client.age < 65
    const overAgeReq = 65 <= this.input.client.age
    const underAgeReq = this.input.client.age < 60
    const meetsReqCountry = this.input.client.isLivingInCanada

    // Partner must live in Canada to receive GIS
    const meetsReqPartner =
      PartnerBenefitStatusHelper.isGis(this.input.partner.benefitStatus) &&
      this.input.partner.isLivingInCanada

    // income must be provided, partner cannot be eligible for gis without income
    const incomeNotProvided = this.input.client.income === undefined
    const maxIncome = legalValues.alw.alwIncomeLimit
    const meetsReqIncome = this.input.adjustedRelevantIncome === maxIncome
    const requiredYearsInCanada = 10
    const meetsReqYears =
      this.input.client.yearsInCanadaSince18 >= requiredYearsInCanada
    const meetsReqLegal = this.input.client.hasLegalStatusCanada

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
          detail: PartnerBenefitStatusHelper.isNone(this.input.partner.benefitStatus)
            ? this.translations.detail.alwEligibleButPartnerAlreadyIs
            : this.translations.detail.alwNotEligible,
        }
      } else if (
        meetsReqAge &&
        !incomeNotProvided &&
        PartnerBenefitStatusHelper.isNone(this.input.partner.benefitStatus)
      ) {
        return {
          result: ResultKey.INELIGIBLE,
          reason: ResultReason.INCOME_MISSING,
          detail: this.translations.detail.alwEligibleButPartnerAlreadyIs,
        }
      } else if (meetsReqAge) {
        const amount = this.getEntitlementAmount()

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
      } else if (this.input.client.age == 59) {
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
        detail: this.input.client.isPartnered
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
    } else if (!meetsReqMarital && this.input.client.maritalStatus !== undefined) {
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
        detail: this.input.partner.benefitStatus === undefined
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
        LivingCountryHelper.hasAgreement(this.input.client.livingCountry) ||
        this.input.client.everLivedSocialCountry
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
      this.input.client.income === undefined &&
      this.eligibility.result === ResultKey.INCOME_DEPENDENT
    )
      return {
        result: 0,
        type: EntitlementResultType.UNAVAILABLE,
        autoEnrollment,
      }

    // otherwise, let's do it!

    const formulaResult = this.getEntitlementAmount()

    const type =
      formulaResult === -1
        ? EntitlementResultType.UNAVAILABLE
        : EntitlementResultType.FULL

    return { result: formulaResult, type, autoEnrollment }
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

  static yearsUntilALW(age: number, residency: number) {
    if ((age >= 60 && age <= 64 && residency >= 10) || age > 64) {
      return null
    }

    let ageDiff = Math.max(0, 60 - age)
    let residencyDiff = Math.max(0, 10 - residency)

    if (age + residencyDiff > 64) {
      return null
    }

    return Math.max(ageDiff, residencyDiff)
  }

}
