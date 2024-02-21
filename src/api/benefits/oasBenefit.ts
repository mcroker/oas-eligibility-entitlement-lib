import { Translations } from '../i18n'
import {
  BenefitKey,
  EntitlementResultType,
  LegalStatus,
  MaritalStatus,
  ResultKey,
  ResultReason,
} from '../definitions/enums'
import {
  EligibilityResult,
  EntitlementResultOas,
  MonthsYears,
} from '../definitions/types'
import roundToTwo from '../helpers/roundToTwo'
import { getDeferralIncrease } from '../helpers/utils'
import legalValues from '../../scrapers/output'
import { BaseBenefit } from './_base'
import { OasInput } from '../definitions/input'
import { IncomeHelper, LegalStatusHelper, LivingCountryHelper, MaritalStatusHelper } from '../helpers/fieldClasses'

export class OasBenefit extends BaseBenefit<EntitlementResultOas> implements OasInput {

  public everLivedSocialCountry: boolean
  public yearsInCanadaSince18: number
  public oasDeferDuration: string

  public override legalStatus: LegalStatus;

  constructor(
    input: OasInput,
    translations: Translations,
  ) {
    super(input, translations, BenefitKey.oas);
    this.everLivedSocialCountry = input.everLivedSocialCountry;
    this.yearsInCanadaSince18 = input.yearsInCanadaSince18;
    this.oasDeferDuration = input.oasDeferDuration;
    this.legalStatus = input.legalStatus;
  }

  getIncome(forPartner?: boolean): number {
    if (forPartner) {
      const partnerIncome = this.partnerIncome;
      if (partnerIncome === undefined) {
        throw new Error('Partner income not provided');
      }
      return partnerIncome;
    } else {
      return this.income
    }
  }

  /**
   * Cacluate individual's eligability for OAS
   * 
   * @param asOf  Date for which calculation is to be performed
   * @returns 
   */
  protected getEligibility(asOf?: Date, forPartner: boolean = false): EligibilityResult {

    // Default to current date
    const now = new Date();
    asOf = (asOf !== undefined) ? asOf : now;
    const future = (asOf > now);

    // helpers
    const meetsReqAge = this.age >= 65

    // if income is not provided (only check client income), assume they meet the income requirement
    const income = this.getIncome(forPartner);
    const skipReqIncome = income === undefined

    // income limit is higher at age 75
    const incomeLimit =
      this.age >= 75
        ? legalValues.oas.incomeLimit75
        : legalValues.oas.incomeLimit

    // Income is irrelevant therefore next will always be true
    const meetsReqIncome = skipReqIncome || income >= 0

    const requiredYearsInCanada = this._livingCountry.canada ? 10 : 20
    const meetsReqYears =
      this.yearsInCanadaSince18 >= requiredYearsInCanada
    const meetsReqLegal = this._legalStatus.canadian

    // main checks
    if (meetsReqIncome && meetsReqLegal && meetsReqYears) {
      if (meetsReqAge && skipReqIncome)
        return {
          result: ResultKey.INCOME_DEPENDENT,
          reason: ResultReason.INCOME_MISSING,
          detail: this.translations.detail.oas.eligibleIfIncomeIsLessThan,
          incomeMustBeLessThan: incomeLimit,
        }
      else if (meetsReqAge) {
        return {
          result: ResultKey.ELIGIBLE,
          reason:
            income > incomeLimit
              ? ResultReason.INCOME
              : this.age >= 65 && this.age < 70
                ? ResultReason.AGE_65_TO_69
                : ResultReason.AGE_70_AND_OVER,
          detail:
            income > incomeLimit
              ? future
                ? this.translations.detail.oas.futureEligibleIncomeTooHigh
                : this.translations.detail.oas.eligibleIncomeTooHigh
              : future
                ? this.translations.detail.futureEligible
                : this.translations.detail.eligible,
        }
      } else if (this.age >= 64 && this.age < 65) {
        return {
          result: ResultKey.INELIGIBLE,
          reason: ResultReason.AGE_YOUNG_64,
          detail: this.translations.detail.oas.eligibleWhenTurn65,
        }
      } else {
        return {
          result: ResultKey.INELIGIBLE,
          reason: ResultReason.AGE_YOUNG,
          detail: this.translations.detail.oas.eligibleWhenTurn65,
        }
      }
    } else if (!meetsReqIncome) {
      return {
        result: ResultKey.INELIGIBLE,
        reason: ResultReason.INCOME,
        detail: this.translations.detail.mustMeetIncomeReq,
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
        } else {
          return {
            result: ResultKey.INELIGIBLE,
            reason: ResultReason.AGE_YOUNG,
            detail: this.translations.detail.dependingOnAgreementWhen65,
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
      if (!meetsReqAge) {
        return {
          result: ResultKey.INELIGIBLE,
          reason: ResultReason.AGE_YOUNG,
          detail: this.translations.detail.dependingOnLegalWhen65,
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

  // the calculation piece is missing validation, instead, it directly
  // calculate with the legal value. Will revist this piece.
  protected getEntitlement(asOf?: Date, forPartner: boolean = true, forDeferral: boolean = false): EntitlementResultOas {

    // Default to current date
    const now = new Date();
    asOf = (asOf !== undefined) ? asOf : now;
    const future = (asOf > now);

    const autoEnrollment = this.getAutoEnrollment()
    if (
      (this.eligibility.result !== ResultKey.ELIGIBLE &&
        this.eligibility.result !== ResultKey.INCOME_DEPENDENT) ||
      (this.eligibility.result === ResultKey.ELIGIBLE &&
        this.eligibility.reason === ResultReason.INCOME)
    )
      return {
        result: 0,
        result65To74: 0,
        resultAt75: 0,
        clawback: 0,
        deferral: {
          age: 65,
          years: 0,
          increase: 0,
          deferred: forDeferral || !!this.oasDeferDuration,
          length: this.oasDeferDuration,
          residency: this.yearsInCanadaSince18,
        },
        type: EntitlementResultType.NONE,
        autoEnrollment,
      }

    // Monthly clawback amount
    const monthlyClawbackAmount = roundToTwo(this.clawbackAmount(forPartner) / 12)

    // monthly entitlement amount minus monthly clawback amount
    // const resultCurrent = this.currentEntitlementAmount - monthlyClawbackAmount  //Task 114098 original code
    // task 114098 do not substract the amount from the benefit amount
    const resultCurrent = this.currentEntitlementAmount(forPartner) //remove this line when a correct recovery process is in place.

    if (resultCurrent <= 0) {
      return {
        result: 0,
        result65To74: 0,
        resultAt75: 0,
        clawback: 0,
        deferral: {
          age: this.deferralYears + 65,
          years: this.deferralYears,
          increase: 0,
          deferred: forDeferral || !!this.oasDeferDuration,
          length: this.oasDeferDuration,
          residency: this.yearsInCanadaSince18,
        },
        type: EntitlementResultType.NONE,
        autoEnrollment,
      }
    }

    const result65To74 = this.age65to74Amount
    const resultAt75 = this.age75EntitlementAmount
    const type =
      this.yearsInCanadaSince18 < 40
        ? EntitlementResultType.PARTIAL
        : EntitlementResultType.FULL

    if (type === EntitlementResultType.PARTIAL)
      this.eligibility.detail = future
        ? this.translations.detail.futureEligible
        : this.translations.detail.eligiblePartialOas

    return {
      result: resultCurrent,
      result65To74,
      resultAt75,
      clawback: monthlyClawbackAmount,
      deferral: {
        age: this.deferralYears + 65,
        years: this.deferralYears,
        increase: this.deferralIncrease,
        deferred: forDeferral || !!this.oasDeferDuration,
        length: this.oasDeferDuration,
        residency: this.yearsInCanadaSince18,
      },
      type,
      autoEnrollment,
    }
  }

  /**
   * The "base" OAS amount, considering yearsInCanada, ignoring deferral.
   */
  get baseAmount() {
    return (
      Math.min(this.yearsInCanadaSince18 / 40, 1) * legalValues.oas.amount
    )
  }

  /**
   * The number of years the client has chosen to defer their OAS pension.
   */
  get deferralYears(): number {
    let oasAge = 65

    const durationStr = this.oasDeferDuration

    if (durationStr) {
      const duration: MonthsYears = JSON.parse(durationStr)
      const durationFloat = duration.years + duration.months / 12
      oasAge = 65 + durationFloat
    }

    return Math.max(0, oasAge - 65) // the number of years deferred (between zero and five)
  }

  /**
   * The dollar amount by which the OAS entitlement will increase due to deferral.
   */
  get deferralIncrease() {
    return getDeferralIncrease(this.deferralYears * 12, this.baseAmount)
  }

  /**
   * The expected OAS amount at age 65, considering yearsInCanada and deferral.
   */
  get age65EntitlementAmount(): number {
    const baseAmount = this.baseAmount // the base amount before deferral calculations
    const deferralIncrease = this.deferralIncrease
    const amountWithDeferralIncrease = baseAmount + deferralIncrease // the final amount

    return roundToTwo(amountWithDeferralIncrease)
  }

  /**
   * The base OAS amount from 65 to 74 used for GIS calculations.
   */
  get age65to74Amount(): number {
    const baseAmount = this.baseAmount // the base amount before deferral calculations
    return baseAmount
  }

  /**
   * The expected OAS amount at age 75, considering yearsInCanada and deferral.
   *
   * Note that we do not simply take the amount75 from the JSON file because of
   * the above considerations, and this.age65EntitlementAmount handles these.
   */
  get age75EntitlementAmount(): number {
    return roundToTwo(this.age65EntitlementAmount * 1.1)
  }

  /**
   * The expected OAS amount, taking into account the client's age.
   * At age 75, OAS increases by 10%.
   */
  currentEntitlementAmount(forPartner: boolean = true, atAge?: number): number {
    const condition = forPartner
      ? this.age < 75
      : this.age < 75 && (atAge !== undefined && atAge < 75)
    if (condition) return this.age65EntitlementAmount
    else return this.age75EntitlementAmount
  }

  /**
   * The yearly amount of "clawback" aka "repayment tax" the client will have to repay.
   */
  clawbackAmount(forPartner: boolean = false): number {
    const OAS_RT_RATE = 0.15

    const income = this.getIncome(forPartner)
    if (income || income < legalValues.oas.clawbackIncomeLimit)
      return 0

    const incomeOverCutoff = income - legalValues.oas.clawbackIncomeLimit
    const repaymentAmount = incomeOverCutoff * OAS_RT_RATE
    const oasYearly = this.currentEntitlementAmount(forPartner) * 12
    const result = Math.min(oasYearly, repaymentAmount)
    return roundToTwo(result)
  }

}
