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
import { GisClientAndPartner } from '../client/gisClient'
import {
  PartnerBenefitStatusHelper,
} from '../helpers/fieldClasses'
import { EntitlementFormula } from './EntiltementFormula'
import { BaseBenefit } from './_base'
import { Translations } from '../i18n'

export class GisBenefit extends BaseBenefit<GisClientAndPartner, EntitlementResultGeneric> {
  protected readonly benefitKey = BenefitKey.gis

  /**
* Note that oasResult is optional. If it is provided, then the calculations
* will consider Partial OAS. Meaning, when there is Partial OAS, the output
* here will compensate for the reduction in OAS. Currently this is only used
* for GIS, though it is unconfirmed if ALW/AFS should use this.
*/
  constructor(
    input: GisClientAndPartner,
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
    const meetsReqAge = this.input.client.age >= 65
    const meetsReqLiving = this.input.client.isLivingInCanada
    const meetsReqOas =
      this.oasResult?.eligibility.result === ResultKey.ELIGIBLE ||
      this.oasResult?.eligibility.result === ResultKey.INCOME_DEPENDENT ||
      this.oasResult?.eligibility.result === ResultKey.UNAVAILABLE
    const meetsReqLegal = this.input.client.hasLegalStatusCanada
    /*
      This comment may be out of date, and replaced by the comment below (meetsReqIncome).
      Since I'm not certain if it's still relevant, I'll keep it here.

      Please note that the logic below is currently imperfect.
      Specifically, when partnerBenefitStatus == partialOas, we do not know the correct income limit.
    */
    const maxIncome = this.input.client.isSingle
      ? legalValues.gis.singleIncomeLimit
      : PartnerBenefitStatusHelper.isAnyOas(this.input.partner.benefitStatus)
        ? legalValues.gis.spouseOasIncomeLimit
        : PartnerBenefitStatusHelper.isAlw(this.input.partner.benefitStatus)
          ? legalValues.gis.spouseAlwIncomeLimit
          : legalValues.gis.spouseNoOasIncomeLimit

    // if income is not provided, assume they meet the income requirement
    const skipReqIncome = this.input.client.income === undefined // refers to partner income

    const meetsReqIncome =
      skipReqIncome ||
      this.input.adjustedRelevantIncome < maxIncome ||
      /*
        This exception is pretty weird, but necessary to work around the fact that a client can be entitled to GIS
        while being above the GIS income limit. This scenario can happen when the client gets Partial OAS, as
        GIS "top-up" will come into effect. Later, in RequestHandler.translateResults(), we will correct for
        this if the client is indeed above the true (undocumented) max income.
      */
      this.oasResult?.entitlement.type === EntitlementResultType.PARTIAL

    //
    // Main checks
    //
    if (meetsReqLiving && meetsReqOas && meetsReqLegal) {
      if (meetsReqAge) {
        if (this.oasResult?.eligibility.result == ResultKey.UNAVAILABLE) {
          return {
            result: ResultKey.UNAVAILABLE,
            reason: ResultReason.OAS,
            detail: this.translations.detail.conditional,
          }
        } else if (skipReqIncome) {
          if (this.input.adjustedRelevantIncome >= maxIncome) {
            return {
              result: ResultKey.INCOME_DEPENDENT,
              reason: ResultReason.INCOME,
              detail: this.translations.detail.gis.incomeTooHigh,
            }
          } else {
            return {
              result: ResultKey.INCOME_DEPENDENT,
              reason: ResultReason.INCOME_MISSING,
              detail:
                this.translations.detail.gis
                  .eligibleDependingOnIncomeNoEntitlement,
              incomeMustBeLessThan: maxIncome,
            }
          }
        }

        // move get entitlement amount to here, because when income is not provided, it will cause exception
        const amount = this.getEntitlementAmount()

        if (this.input.client.adjustedIncome >= maxIncome && amount <= 0) {
          return {
            result: ResultKey.ELIGIBLE,
            reason: ResultReason.INCOME,
            detail: future
              ? this.translations.detail.gis.futureEligibleIncomeTooHigh
              : this.translations.detail.gis.incomeTooHigh,
          }
        } else if (this.input.partner.income !== undefined &&
          this.input.partner.income >= maxIncome && amount <= 0) {
          return {
            result: ResultKey.ELIGIBLE,
            reason: ResultReason.INCOME,
            detail: this.translations.detail.gis.incomeTooHigh,
          }
        } else if (
          this.input.adjustedRelevantIncome >= maxIncome &&
          amount <= 0
        ) {
          return {
            result: ResultKey.ELIGIBLE,
            reason: ResultReason.INCOME,
            detail: this.translations.detail.gis.incomeTooHigh,
          }
        } else {
          return {
            result: ResultKey.ELIGIBLE,
            reason: ResultReason.NONE,
            detail: future
              ? this.translations.detail.futureEligible
              : this.translations.detail.eligible,
          }
        }
      } else {
        return {
          result: ResultKey.INELIGIBLE,
          reason: ResultReason.AGE_YOUNG,
          detail: this.translations.detail.eligibleWhen65,
        }
      }
    } else if (!meetsReqLiving && this.input.client.livingCountry !== undefined) {
      return {
        result: ResultKey.INELIGIBLE,
        reason: ResultReason.LIVING_COUNTRY,
        detail: this.translations.detail.mustBeInCanada,
      }
    } else if (this.oasResult?.eligibility.result == ResultKey.INELIGIBLE) {
      return {
        result: ResultKey.INELIGIBLE,
        reason: ResultReason.OAS,
        detail: this.translations.detail.mustBeOasEligible,
      }
    } else if (!meetsReqLegal) {
      return {
        result: ResultKey.UNAVAILABLE,
        reason: ResultReason.LEGAL_STATUS,
        detail: this.translations.detail.dependingOnLegal,
      }
    } else if (this.oasResult?.eligibility.result == ResultKey.MORE_INFO) {
      return {
        result: ResultKey.MORE_INFO,
        reason: ResultReason.MORE_INFO,
        detail: this.translations.detail.mustCompleteOasCheck,
      }
    }
    throw new Error('entitlement logic failed to produce a result')
  }

  getEntitlement(): EntitlementResultGeneric {

    const eligibility = this.getEligibility()
    const autoEnrollment = this.getAutoEnrollment()

    // client is not eligible, and it's not because income missing? they get nothing.
    if (
      eligibility.result !== ResultKey.ELIGIBLE &&
      eligibility.result !== ResultKey.INCOME_DEPENDENT
    )
      return {
        result: 0,
        type: EntitlementResultType.NONE,
        autoEnrollment,
      }
    // income is not provided, and they are eligible depending on income? entitlement unavailable.
    if (
      !this.input.isIncomeProvided &&
      eligibility.result === ResultKey.INCOME_DEPENDENT
    ) {
      return {
        result: -1,
        type: EntitlementResultType.UNAVAILABLE,
        autoEnrollment,
      }
    }

    // marital status is invSeparated? entitlement unavailable.
    if (this.input.client.isInvSeparated) {
      eligibility.detail =
        this.translations.detail.eligibleEntitlementUnavailable
      return {
        result: -1,
        type: EntitlementResultType.UNAVAILABLE,
        autoEnrollment,
      }
    }

    // otherwise, let's do it!
    const formulaResult = this.getEntitlementAmount()

    if (formulaResult === -1)
      throw new Error(
        "EntitlementFormula returned -1, this shouldn't happen, if it does uncomment the handling below"
      )

    const type: EntitlementResultType =
      // commenting this out temporarily, if it proves problematic let's bring it back
      // formulaResult === -1
      //   ? EntitlementResultType.UNAVAILABLE
      //   :
      formulaResult > 0
        ? EntitlementResultType.FULL
        : EntitlementResultType.NONE

    // commenting this out temporarily, if it proves problematic let's bring it back
    // /*
    //  The Entitlement Formula may return -1 (unavailable) so even though we do
    //  some unavailable handling above, we have this just in case
    // */
    // if (type === EntitlementResultType.UNAVAILABLE)
    //   this.eligibility.detail =
    //     this.translations.detail.eligibleEntitlementUnavailable

    return { result: formulaResult, type, autoEnrollment }
  }

  getEntitlementAmount(): number {
    // TODO This is almost certainly the wrong use of inputAge parameter, but I don't know what it should be.
    return new EntitlementFormula(this.input, this.oasResult).getEntitlementAmount()
  }

}