import {
  EntitlementResultType,
  GisSituation,
  MaritalStatus,
  PartnerBenefitStatus,
} from '../definitions/enums'
import {
  BenefitResult,
  EntitlementResultOas,
} from '../definitions/types'
import legalValues from '../../scrapers/output'
import { GisClientAndPartner } from '../client/gisClient'
import {
  PartnerBenefitStatusHelper,
} from '../helpers/fieldClasses'
import roundToTwo from '../helpers/roundToTwo'

enum CalcuationMethod {
  LOW = 'LOW',
  HIGH = 'HIGH',
  STATIC = 'STATIC'
}

enum TopUpMethod {
  BASIC = 'BASIC',
  CALCULATED = 'CALCULATED'
}

type GisStatus = 1 | 2

/**
 * Class GisBase provides the getGitEntitlementAmount method, which is the main entrypoint for all the processing. 
 * All other methods are private and are used to calculate the entitlement amount.
 */
export class EntitlementFormula {

  private readonly gisIncrements: number = 24

  private get gisStatus(): GisStatus {
    return (this.maritalStatus === MaritalStatus.SINGLE || this.maritalStatus === MaritalStatus.WIDOWED) ? 1 : 2
  }

  // The variables below are admittedly extremely weird.
  // I don't understand the naming or logic behind them, this is simply what was provided to me.

  // 7824
  private incuta3: number =
    Math.round(legalValues.oas.amount / 4 + 0.5) * (this.gisIncrements * 2)

  // 10416
  private incuta5: number =
    Math.round(legalValues.oas.amount / 3 + 0.5) * (this.gisIncrements * 2)

  // 224.11
  private covpam = roundToTwo(
    legalValues.gis.singleAmount -
    legalValues.topUp.single -
    (legalValues.gis.spouseOasAmount - legalValues.topUp.married) -
    (Math.round(legalValues.oas.amount / 3 + 0.5) -
      Math.round(legalValues.oas.amount / 4 + 0.5))
  )

  // 25632
  private covpin: number =
    Math.round(
      legalValues.gis.singleAmount -
      legalValues.topUp.single -
      2 * this.covpam +
      0.5
    ) *
    (this.gisIncrements * 2) +
    this.incuta3

  // 36384
  private covpin5: number =
    this.incuta5 +
    Math.round(
      legalValues.gis.spouseOasAmount - legalValues.topUp.married + 0.5
    ) *
    (this.gisIncrements * 2)

  // 669.73
  private covp5: number = roundToTwo(
    legalValues.alw.afsAmount -
    legalValues.topUp.single -
    legalValues.oas.amount
  )

  private readonly income: number
  private readonly maritalStatus: MaritalStatus
  private readonly partnerBenefitStatus: PartnerBenefitStatus
  private readonly age: number
  private readonly oasResult?: BenefitResult<EntitlementResultOas>
  private readonly inputAge?: number
  /**
   * Note that oasResult is optional. If it is provided, then the calculations
   * will consider Partial OAS. Meaning, when there is Partial OAS, the output
   * here will compensate for the reduction in OAS. Currently this is only used
   * for GIS, though it is unconfirmed if ALW/AFS should use this.
   */
  constructor(
    income: number,
    maritalStatus: MaritalStatus,
    partnerBenefitStatus: PartnerBenefitStatus,
    age: number,
    oasResult?: BenefitResult<EntitlementResultOas> | undefined,
    inputAge?: number
  )
  constructor(
    input: GisClientAndPartner,
    oasResult?: BenefitResult<EntitlementResultOas>,
    inputAge?: number // TODO I DO NOT UNDERSTAND WHAT THIS IS, OR HOW IT DIFFERS FROM CLIENT AGE
  )
  constructor(
    a1: number | GisClientAndPartner,
    a2: MaritalStatus | BenefitResult<EntitlementResultOas> | undefined = undefined,
    a3: PartnerBenefitStatus | number | undefined = undefined,
    a4: number | undefined = undefined,
    a5: BenefitResult<EntitlementResultOas> | undefined = undefined,
    a6: number | undefined = undefined
  ) {
    if (a1 instanceof GisClientAndPartner) {
      this.income = a1.client.income
      this.maritalStatus = a1.client.maritalStatus
      this.partnerBenefitStatus = a1.partner.benefitStatus
      this.age = a1.client.age
      this.inputAge = a3 as number | undefined
      this.oasResult = a2 as BenefitResult<EntitlementResultOas> | undefined
    } else {
      this.income = a1 as number
      this.maritalStatus = a2 as MaritalStatus
      this.partnerBenefitStatus = a3 as PartnerBenefitStatus
      this.age = a4 as number
      this.oasResult = a5 as BenefitResult<EntitlementResultOas> | undefined
      this.inputAge = a6 as number | undefined
    }

    /*
      Don't simply remove this line below, it needs proper handling if to be
      implemented properly. I think the idea is that we would consider them
      single for one scenario, consider them partnered for another scenario,
      and then return whichever scenario is higher.
    */
    if (this.maritalStatus === MaritalStatus.INV_SEPARATED)
      throw new Error(
        'involuntarily separated is not implemented in the entitlement logic yet'
      )
  }

  /**
   * The main entrypoint for all the processing.
   */
  getEntitlementAmount(): number {
    const preOasAmount =
      this.calculationMethod === CalcuationMethod.STATIC
        ? this.staticResult
        : roundToTwo(this.actualAmount() + this.actualTopup)

    // This covers the impact of Partial OAS on GIS entitlement.
    // When a client has Partial OAS and is eligible for GIS, the GIS will compensate for any reduction in the OAS amount.
    // It is assumed that this does not affect ALW/AFS, though this is not confirmed.
    if (this.oasResult?.entitlement.type === EntitlementResultType.PARTIAL) {
      const oasCoverageAmount =
        legalValues.oas.amount - this.oasResult.entitlement.result65To74

      // GIS Partial pensioner < 40 yrs in Canada and 75+ yrs, gets 10% more.
      const superGIS = (typeof this.inputAge === 'number' && this.inputAge >= 75) ? oasCoverageAmount * 0.1 : 0

      // Always return 0 when result is negative
      return preOasAmount + oasCoverageAmount > 0
        ? roundToTwo(preOasAmount + oasCoverageAmount + superGIS)
        : 0
    } else return preOasAmount > 0 ? preOasAmount : 0
  }

  /**
   * There are six clear "situations" a client can fall into, depending on their partner.
   */
  private get gisSituation(): GisSituation {
    if (this.maritalStatus === MaritalStatus.SINGLE || this.maritalStatus === MaritalStatus.WIDOWED) {
      if (
        this.maritalStatus === MaritalStatus.WIDOWED &&
        this.age >= 60 &&
        this.age < 65
      )
        return GisSituation.AFS
      else return GisSituation.SINGLE
    } else {
      if (PartnerBenefitStatusHelper.isAnyOas(this.partnerBenefitStatus))
        return this.age >= 65 ? GisSituation.PARTNER_OAS : GisSituation.ALW
      else if (PartnerBenefitStatusHelper.isAlw(this.partnerBenefitStatus)) return GisSituation.PARTNER_ALW
      else return GisSituation.PARTNER_NO_OAS
    }
  }

  /**
   * Returns the method used for calculation.
   * This is because the calculation variables will change depending on the income.
   * As well, in the STATIC case, all logic will be skipped and a predefined amount will be used instead.
   */
  private get calculationMethod(): CalcuationMethod {
    if (this.income < this.incomeBrackets.low) return CalcuationMethod.LOW
    else if (this.income >= this.incomeBrackets.high) return CalcuationMethod.HIGH
    else return CalcuationMethod.STATIC
  }

  /**
   * The client's income will affect the calculation behaviors.
   * This returns the low/high points to determine which bracket the income falls under.
   */
  private get incomeBrackets(): { low: number; high: number } {
    switch (this.gisSituation) {
      case GisSituation.PARTNER_ALW:
        return { low: this.covpin, high: this.covpin5 }
      case GisSituation.ALW:
      case GisSituation.AFS:
        return {
          low: this.incuta5,
          high: this.incuta5 + this.gisIncrements * this.gisStatus,
        }
      case GisSituation.SINGLE:
      case GisSituation.PARTNER_OAS:
      case GisSituation.PARTNER_NO_OAS:
        // these cases don't have different behavior based on income, so use -1
        return { low: -1, high: -1 }
      default:
        throw new Error('marital status or gis situation is not handled')
    }
  }

  /**
   * When calculationMethod is STATIC, this will be used instead of the calculations.
   */
  private get staticResult(): number {
    switch (this.gisSituation) {
      case GisSituation.PARTNER_ALW:
        return this.covpam
      case GisSituation.ALW:
        return this.actualMaxAmount
      case GisSituation.AFS:
        return this.covp5
      case GisSituation.SINGLE:
      case GisSituation.PARTNER_OAS:
      case GisSituation.PARTNER_NO_OAS:
        throw new Error('static amount not defined')
    }
  }

  /**
   * The final GIS amount, before the topup is applied.
   * This is not used if the client's income is between the low and high range -
   * in that case, the static amount is used instead.
   */
  private actualAmount() {
    const differentialMultiplier =
      (this.gisSituation === GisSituation.ALW ||
        this.gisSituation === GisSituation.AFS) &&
        this.calculationMethod === CalcuationMethod.LOW
        ? 3
        : 1
    const calculated = roundToTwo(
      this.actualMaxAmount - this.incomeDifferential * differentialMultiplier
    )
    return calculated
  }

  /**
   * The final topup amount.
   * This number will be added to the final entitlement amount.
   */
  private get actualTopup() {
    const topupMethod: TopUpMethod =
      this.income < 2000 * this.gisStatus ? TopUpMethod.BASIC : TopUpMethod.CALCULATED
    switch (topupMethod) {
      case TopUpMethod.BASIC:
        return this.basicTopupAmount
      case TopUpMethod.CALCULATED:
        const gisTopupCalculatedAmount =
          this.basicTopupAmount -
          Math.floor(
            (this.income - 2000 * this.gisStatus) /
            (this.gisIncrements * this.gisStatus * 2)
          )
        return Math.max(0, gisTopupCalculatedAmount)
    }
  }

  /**
   * The max amount someone can receive.
   */
  private get actualMaxAmount() {
    if (
      this.gisSituation === GisSituation.PARTNER_ALW &&
      this.calculationMethod === CalcuationMethod.HIGH
    ) {
      return roundToTwo(legalValues.gis.singleAmount - legalValues.topUp.single)
    } else if (
      this.gisSituation === GisSituation.ALW &&
      this.calculationMethod === CalcuationMethod.LOW
    ) {
      return roundToTwo(
        legalValues.gis.spouseAlwAmount -
        legalValues.topUp.married +
        legalValues.oas.amount
      )
    } else if (
      this.gisSituation === GisSituation.AFS &&
      this.calculationMethod === CalcuationMethod.HIGH
    ) {
      return roundToTwo(this.covp5)
    } else {
      const gisMaxAmountAfterTopup = this.basicMaxAmount
      const gisTopup = this.basicTopupAmount
      return roundToTwo(gisMaxAmountAfterTopup - gisTopup)
    }
  }

  /**
   * Direct from government data.
   * This is the "default" max amount someone can receive.
   */
  private get basicMaxAmount() {
    switch (this.gisSituation) {
      case GisSituation.SINGLE:
        return legalValues.gis.singleAmount // high
      case GisSituation.PARTNER_OAS:
        return legalValues.gis.spouseOasAmount // low
      case GisSituation.PARTNER_NO_OAS:
        return legalValues.gis.spouseNoOasAmount // high
      case GisSituation.PARTNER_ALW:
        return legalValues.gis.spouseAlwAmount // low
      case GisSituation.ALW:
        return legalValues.gis.spouseAlwAmount // low
      case GisSituation.AFS:
        return legalValues.alw.afsAmount // highest
    }
  }

  /**
   * Direct from government data.
   * This is the "default" topup amount, however in low-income cases,
   * the topup will be calculated instead.
   */
  private get basicTopupAmount() {
    switch (this.gisSituation) {
      case GisSituation.SINGLE:
      case GisSituation.AFS:
      case GisSituation.PARTNER_NO_OAS:
        return legalValues.topUp.single
      case GisSituation.PARTNER_OAS:
      case GisSituation.PARTNER_ALW:
      case GisSituation.ALW:
        return legalValues.topUp.married
    }
  }

  /**
   * This number will be subtracted from the maximum entitlement amount,
   * which will determine the client's true entitlement amount.
   */
  private get incomeDifferential() {
    return Math.max(
      0,
      Math.floor(
        (this.income - this.subFromIncome) /
        (this.gisIncrements * this.incomeIncrementMultiplier)
      )
    )
  }

  /**
   * Helper for incomeDifferential().
   * This number will be subtracted from the client's income.
   */
  private get subFromIncome() {
    switch (this.gisSituation) {
      case GisSituation.SINGLE:
      case GisSituation.PARTNER_OAS:
        return 0
      case GisSituation.PARTNER_NO_OAS:
        return this.incuta3
      case GisSituation.PARTNER_ALW:
        if (this.calculationMethod === CalcuationMethod.LOW) return this.incuta5
        else if (this.calculationMethod === CalcuationMethod.HIGH) return this.incuta3
        else return 0
      case GisSituation.ALW:
      case GisSituation.AFS:
        return this.calculationMethod === CalcuationMethod.HIGH ? this.incuta5 : 0
    }
  }
  /**
   * Helper for incomeDifferential().
   * This number will be multiplied by gisIncrements (24).
   */
  private get incomeIncrementMultiplier() {
    switch (this.gisSituation) {
      case GisSituation.SINGLE:
        return 1
      case GisSituation.PARTNER_OAS:
      case GisSituation.PARTNER_NO_OAS:
      case GisSituation.PARTNER_ALW:
      case GisSituation.ALW:
        return 2
      case GisSituation.AFS:
        return this.calculationMethod === CalcuationMethod.HIGH ? 1 : 2
    }
  }

}
