import { Translations } from '../i18n'
import {
  BenefitKey,
  EntitlementResultType,
  ResultKey,
  ResultReason,
} from '../definitions/enums'
import {
  EligibilityResult,
  EntitlementResultOas,
  MonthsYears,
} from '../definitions/types'
import roundToTwo from '../helpers/roundToTwo'
import legalValues from '../../scrapers/output'
import { OasClientAndPartner } from '../client/oasClient'
import { LivingCountryHelper } from '../helpers/fieldClasses'
import { BaseBenefit } from './_base'

export class OasBenefit extends BaseBenefit<OasClientAndPartner, EntitlementResultOas> {
  protected readonly benefitKey = BenefitKey.oas

  constructor(
    input: OasClientAndPartner,
    translations: Translations
  ) {
    super(input, translations)
  }

  /**
   * Cacluate individual's eligability for OAS
   * 
   * @param asOf  Date for which calculation is to be performed
   * 
   * @returns EligibilityResult
   */
  getEligibility(asOf?: Date): EligibilityResult {
    // Default to current date
    const now = new Date();
    asOf = (asOf !== undefined) ? asOf : now;
    const future = (asOf > now);

    // helpers
    const meetsReqAge = this.input.client.age >= 65

    // if income is not provided (only check client income), assume they meet the income requirement
    const income = this.input.client.income
    const skipReqIncome = income === undefined

    // income limit is higher at age 75
    const incomeLimit =
      this.input.client.age >= 75
        ? legalValues.oas.incomeLimit75
        : legalValues.oas.incomeLimit

    // Income is irrelevant therefore next will always be true
    const meetsReqIncome = skipReqIncome || income >= 0

    const requiredYearsInCanada = this.input.client.isLivingInCanada ? 10 : 20
    const meetsReqYears =
      this.input.client.yearsInCanadaSince18 >= requiredYearsInCanada
    const meetsReqLegal = this.input.client.hasLegalStatusCanada

    // main checks
    if (meetsReqIncome && meetsReqLegal && meetsReqYears) {
      if (meetsReqAge) {
        if (skipReqIncome)
          return {
            result: ResultKey.INCOME_DEPENDENT,
            reason: ResultReason.INCOME_MISSING,
            detail: this.translations.detail.oas.eligibleIfIncomeIsLessThan,
            incomeMustBeLessThan: incomeLimit,
          }
        else {
          return {
            result: ResultKey.ELIGIBLE,
            reason:
              income > incomeLimit
                ? ResultReason.INCOME
                : this.input.client.age >= 65 && this.input.client.age < 70
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
        }
      } else if (this.input.client.age >= 64 && this.input.client.age < 65) {
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
        LivingCountryHelper.hasAgreement(this.input.client.livingCountry) ||
        this.input.client.everLivedSocialCountry
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
  getEntitlement(asOf?: Date): EntitlementResultOas {

    // Default to current date
    const now = new Date();
    asOf = (asOf !== undefined) ? asOf : now;
    const future = (asOf > now);


    const eligibility = this.getEligibility(asOf)
    const autoEnrollment = this.getAutoEnrollment()
    if (
      (eligibility.result !== ResultKey.ELIGIBLE &&
        eligibility.result !== ResultKey.INCOME_DEPENDENT) ||
      (eligibility.result === ResultKey.ELIGIBLE &&
        eligibility.reason === ResultReason.INCOME)
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
          deferred: !!this.input.client.oasDeferDuration,
          length: this.input.client.oasDeferDuration,
          residency: this.input.client.yearsInCanadaSince18,
        },
        type: EntitlementResultType.NONE,
        autoEnrollment,
      }

    // Monthly clawback amount
    const monthlyClawbackAmount = roundToTwo(this.clawbackAmount / 12)

    // monthly entitlement amount minus monthly clawback amount
    // const resultCurrent = this.currentEntitlementAmount - monthlyClawbackAmount  //Task 114098 original code
    // task 114098 do not substract the amount from the benefit amount
    const resultCurrent = this.amounts.entitlementAmount //remove this line when a correct recovery process is in place.

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
          deferred: !!this.input.client.oasDeferDuration,
          length: this.input.client.oasDeferDuration,
          residency: this.input.client.yearsInCanadaSince18,
        },
        type: EntitlementResultType.NONE,
        autoEnrollment,
      }
    }

    const result65To74 = this.amounts.age65to74Amount
    const resultAt75 = this.amounts.age75EntitlementAmount
    const type =
      this.input.client.yearsInCanadaSince18 < 40
        ? EntitlementResultType.PARTIAL
        : EntitlementResultType.FULL

    if (type === EntitlementResultType.PARTIAL)
      eligibility.detail = future
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
        increase: this.amounts.deferralIncrease,
        deferred: !!this.input.client.oasDeferDuration,
        length: this.input.client.oasDeferDuration,
        residency: this.input.client.yearsInCanadaSince18,
      },
      type,
      autoEnrollment,
    }
  }

  /**
   * Calcuate OAS rates
   * 
   * @param input 
   * @returns Amounts to be used in calcuation.
   */

  get amounts(): {
    baseAmount: number,               // The "base" OAS amount, considering yearsInCanada, ignoring deferral.
    deferralIncrease: number,         // The dollar amount by which the OAS entitlement will increase due to deferral.
    age65EntitlementAmount: number,   // The expected OAS amount at age 65, considering yearsInCanada and deferral.
    age65to74Amount: number           // The base OAS amount from 65 to 74 used for GIS calculations.
    age75EntitlementAmount: number    // The expected OAS amount at age 75, considering yearsInCanada and deferral
    entitlementAmount: number         // The expected OAS amount, taking into account the client's age.
  } {
    const baseAmount = Math.min(this.input.client.yearsInCanadaSince18 / 40, 1) * legalValues.oas.amount

    const deferralIncreaseByMonth = 0.006 // the increase to the monthly payment per month deferred
    const deferralIncrease = roundToTwo(this.deferralYears * 12 * deferralIncreaseByMonth * baseAmount)

    const age65EntitlementAmount = roundToTwo(baseAmount + deferralIncrease)

    const age65to74Amount = baseAmount

    /**
    * Note that we do not simply take the amount75 from the JSON file because of
    * yearsInCanada and deferral considerations, age65EntitlementAmount handles these.
    */
    const age75EntitlementAmount = roundToTwo(age65EntitlementAmount * 1.1)

    /**
    * At age 75, OAS increases by 10%.
    */
    const entitlementAmount = this.input.client.age < 75 ? age65EntitlementAmount : age75EntitlementAmount

    return {
      baseAmount,
      deferralIncrease,
      age65EntitlementAmount,
      age65to74Amount,
      age75EntitlementAmount,
      entitlementAmount
    }
  }

  /**
   * The number of years the client has chosen to defer their OAS pension.
   */
  private get deferralYears(): number {
    let oasAge = 65

    const durationStr = this.input.client.oasDeferDuration

    if (durationStr) {
      const duration: MonthsYears = JSON.parse(durationStr)
      const durationFloat = duration.years + duration.months / 12
      oasAge = 65 + durationFloat
    }

    return Math.max(0, oasAge - 65) // the number of years deferred (between zero and five)
  }

  /**
   * The yearly amount of "clawback" aka "repayment tax" the client will have to repay.
   */
  private get clawbackAmount(): number {
    const OAS_RT_RATE = 0.15

    if (this.input.client.income === undefined || this.input.client.income < legalValues.oas.clawbackIncomeLimit)
      return 0

    const amounts = this.amounts

    const incomeOverCutoff = this.input.client.income - legalValues.oas.clawbackIncomeLimit
    const repaymentAmount = incomeOverCutoff * OAS_RT_RATE
    const oasYearly = amounts.entitlementAmount * 12
    const result = Math.min(oasYearly, repaymentAmount)
    return roundToTwo(result)
  }

  static yearsUntilOAS(age: number, residency: number) {
    if (age >= 65 && residency >= 10) {
      return null
    }

    let ageDiff = Math.max(0, 65 - age)
    let residencyDiff = Math.max(0, 10 - residency)
    return Math.max(ageDiff, residencyDiff)
  }

  /**
   * When will the client become eligible for OAS?
   * 
   * @returns The age and years of residency at which the client will be eligible for OAS
   */

  static getWhenWillBeEligible(input: OasClientAndPartner) {
    let age = input.client.age
    let yearsInCanada = input.client.yearsInCanadaSince18
    const minAgeEligibility = 65
    const minYearsOfResEligibility = input.client.isLivingInCanada ? 10 : 20

    let ageOfEligibility
    let yearsOfResAtEligibility

    if (age >= minAgeEligibility && yearsInCanada >= minYearsOfResEligibility) {
      const yearsPastEligibility = Math.min(
        age - minAgeEligibility,
        yearsInCanada - minYearsOfResEligibility
      )
      ageOfEligibility = age - yearsPastEligibility
      yearsOfResAtEligibility = yearsInCanada - yearsPastEligibility
    } else if (
      age < minAgeEligibility ||
      yearsInCanada < minYearsOfResEligibility
    ) {
      while (
        age < minAgeEligibility ||
        yearsInCanada < minYearsOfResEligibility
      ) {
        age++
        yearsInCanada++
      }
      ageOfEligibility = Math.floor(age)
      yearsOfResAtEligibility =
        input.client.isLivingInCanada
          ? Math.round(ageOfEligibility - input.client.age + input.client.yearsInCanadaSince18)
          : input.client.yearsInCanadaSince18
    }
    return {
      ageOfEligibility,
      yearsOfResAtEligibility: input.client.livedOnlyInCanada
        ? 40
        : Math.floor(yearsOfResAtEligibility || 0), // MCR Defalt to zero if undefined
    }
  }

}