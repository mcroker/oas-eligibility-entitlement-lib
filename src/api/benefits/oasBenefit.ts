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
import { AgeHelper } from '../helpers/fieldClasses'
import legalValues from '../../scrapers/output'
import { BaseBenefit } from './_base'
import { OasInput } from '../definitions/input'
import { OasClient } from '../clients/oasClient'
import { LivingCountryHelper } from '../helpers/fieldClasses'

export class OasBenefit extends BaseBenefit<OasClient, EntitlementResultOas> {
  protected benefitKey: BenefitKey = BenefitKey.oas

  constructor(
    input: OasInput,
    translations: Translations,
  ) {
    super(new OasClient(input), translations)
  }

  /**
   * Cacluate individual's eligability for OAS
   * 
   * @param asOf  Date for which calculation is to be performed
   * @param forPartner  Flag to indicate if the calculation is for partner
   * 
   * @returns EligibilityResult
   */
  protected getEligibility(asOf?: Date): EligibilityResult {
    // Default to current date
    const now = new Date();
    asOf = (asOf !== undefined) ? asOf : now;
    const future = (asOf > now);

    // helpers
    const meetsReqAge = this.client.age >= 65

    // if income is not provided (only check client income), assume they meet the income requirement
    const income = this.client.clientIncome;
    const skipReqIncome = income === undefined

    // income limit is higher at age 75
    const incomeLimit =
      this.client.age >= 75
        ? legalValues.oas.incomeLimit75
        : legalValues.oas.incomeLimit

    // Income is irrelevant therefore next will always be true
    const meetsReqIncome = skipReqIncome || income >= 0

    const requiredYearsInCanada = this.client.isLivingInCanada ? 10 : 20
    const meetsReqYears =
      this.client.yearsInCanadaSince18 >= requiredYearsInCanada
    const meetsReqLegal = this.client.hasLegalStatusCanada

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
              : this.client.age >= 65 && this.client.age < 70
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
      } else if (this.client.age >= 64 && this.client.age < 65) {
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
        LivingCountryHelper.hasAgreement(this.client.livingCountry) ||
        this.client.everLivedSocialCountry
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
  protected getEntitlement(asOf?: Date): EntitlementResultOas {

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
          deferred: !!this.client.oasDeferDuration,
          length: this.client.oasDeferDuration,
          residency: this.client.yearsInCanadaSince18,
        },
        type: EntitlementResultType.NONE,
        autoEnrollment,
      }

    // Monthly clawback amount
    const monthlyClawbackAmount = roundToTwo(this.clawbackAmount() / 12)

    // monthly entitlement amount minus monthly clawback amount
    // const resultCurrent = this.currentEntitlementAmount - monthlyClawbackAmount  //Task 114098 original code
    // task 114098 do not substract the amount from the benefit amount
    const resultCurrent = this.currentEntitlementAmount //remove this line when a correct recovery process is in place.

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
          deferred: !!this.client.oasDeferDuration,
          length: this.client.oasDeferDuration,
          residency: this.client.yearsInCanadaSince18,
        },
        type: EntitlementResultType.NONE,
        autoEnrollment,
      }
    }

    const result65To74 = this.age65to74Amount
    const resultAt75 = this.age75EntitlementAmount
    const type =
      this.client.yearsInCanadaSince18 < 40
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
        deferred: !!this.client.oasDeferDuration,
        length: this.client.oasDeferDuration,
        residency: this.client.yearsInCanadaSince18,
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
      Math.min(this.client.yearsInCanadaSince18 / 40, 1) * legalValues.oas.amount
    )
  }

  /**
   * The number of years the client has chosen to defer their OAS pension.
   */
  get deferralYears(): number {
    let oasAge = 65

    const durationStr = this.client.oasDeferDuration

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
    const deferralIncreaseByMonth = 0.006 // the increase to the monthly payment per month deferred
    // the extra entitlement received because of the deferral
    return roundToTwo(this.deferralYears * 12 * deferralIncreaseByMonth * this.baseAmount)
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
    return this.baseAmount // the base amount before deferral calculations
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
   * 
   * @param age The age of the client
   * @returns The expected OAS amount
   */
  private entitlementAmount(age: number): number {
    return age < 75
      ? this.age65EntitlementAmount
      : this.age75EntitlementAmount
  }

  /**
   * The expected OAS amount, taking into account the client's age.
   * At age 75, OAS increases by 10%.
   * 
   * @returns The OAS amount the individual is entitled to based on current age
   */
  get currentEntitlementAmount(): number {
    return this.entitlementAmount(this.client.age)
  }

  /**
   * The yearly amount of "clawback" aka "repayment tax" the client will have to repay.
   */
  clawbackAmount(): number {
    const OAS_RT_RATE = 0.15

    if (this.client.clientIncome === undefined || this.client.clientIncome < legalValues.oas.clawbackIncomeLimit)
      return 0

    const incomeOverCutoff = this.client.clientIncome - legalValues.oas.clawbackIncomeLimit
    const repaymentAmount = incomeOverCutoff * OAS_RT_RATE
    const oasYearly = this.currentEntitlementAmount * 12
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

  static OasEligibility(
    ageAtStart: number,
    yearsInCanadaAtStart: number,
    livedOnlyInCanada = false,
    livingCountry = 'CAN'
  ) {
    let age = ageAtStart
    let yearsInCanada = yearsInCanadaAtStart
    const minAgeEligibility = 65
    const minYearsOfResEligibility = livingCountry === 'CAN' ? 10 : 20

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
        livingCountry == 'CAN'
          ? Math.round(ageOfEligibility - ageAtStart + yearsInCanadaAtStart)
          : yearsInCanadaAtStart
    }
    return {
      ageOfEligibility,
      yearsOfResAtEligibility: livedOnlyInCanada
        ? 40
        : Math.floor(yearsOfResAtEligibility || 0), // MCR Defalt to zero if undefined
    }
  }

  static evaluateOASInput(input: OasInput & { livedOnlyInCanada: boolean, receiveOAS: boolean }) {
    let canDefer = false
    let justBecameEligible = false
    const age = input.age // 66.42
    const ageJuly2013 = AgeHelper.calculate2013Age(age, input.birthDate)
    const yearsInCanada = input.yearsInCanadaSince18
    let eliObj = OasBenefit.OasEligibility(
      age,
      yearsInCanada,
      input.livedOnlyInCanada,
      input.livingCountry
    )

    let newInput: { [key: string]: any } = { ...input }

    let deferralMonths
    if (
      eliObj.ageOfEligibility === undefined ||  // MCR Added undefined check
      ageJuly2013 >= 70 ||
      eliObj.ageOfEligibility >= 70 ||
      age < eliObj.ageOfEligibility
    ) {
      deferralMonths = 0
    } else {
      // Eligibility age is between 65-70 here
      if (ageJuly2013 >= eliObj.ageOfEligibility) {
        // Cannot defer from the time they became eligible but only from July 2013 (must use residency and age from July 2013 to calculate OAS with deferral)
        const ageDiff = ageJuly2013 - eliObj.ageOfEligibility
        const newRes = Math.floor(eliObj.yearsOfResAtEligibility + ageDiff)
        eliObj = {
          ageOfEligibility: ageJuly2013,
          yearsOfResAtEligibility: newRes,
        }
        deferralMonths = (70 - ageJuly2013) * 12
      } else {
        // They became eligible after July 2013 -> use age and residency as is (at the time they became eligible for OAS)
        deferralMonths = (Math.min(70, age) - eliObj.ageOfEligibility) * 12
      }
    }

    if (age === eliObj.ageOfEligibility && age < 70) {
      justBecameEligible = true
    }

    if (age === eliObj.ageOfEligibility && age < 70) {
      justBecameEligible = true
    }

    if (deferralMonths !== 0 && !input.receiveOAS) {
      canDefer = true
      newInput['inputAge'] = input.age
      newInput['age'] = eliObj.ageOfEligibility
      newInput['receiveOAS'] = true
      newInput['yearsInCanadaSince18'] = input.livedOnlyInCanada
        ? 40
        : Math.min(40, Math.floor(eliObj.yearsOfResAtEligibility))
      newInput['oasDeferDuration'] = JSON.stringify({
        months: Math.max(Math.round(deferralMonths), 0),
        years: 0,
      })
      console.log(  // MCR
        '#5 oasDefer',
        newInput['oasDeferDuration'],
        'months',
        deferralMonths
      )
    }

    return {
      canDefer,
      newInput,
      justBecameEligible,
    }
  }

}
