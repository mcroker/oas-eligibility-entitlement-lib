import { BaseInput, IncomeInput } from '../../definitions/input'
import { FieldHelper } from './_fieldHelper'
import { MaritalStatusHelper } from './maritalStatusHelper'

export class IncomeHelper extends FieldHelper<undefined> {

  get client(): number {
    return this.input.income;
  }

  get clientIncomeWork(): number | undefined {
    return this.input.incomeWork;
  }

  get partner(): number | undefined {
    return this.input.partnerIncome;
  }

  get partnerIncomeWork(): number | undefined {
    return this.input.partnerIncomeWork;
  }

  override get provided(): boolean {
    return this.client !== undefined && (
        this.maritalStatus === undefined ||
        this.maritalStatus.single ||
        (this.maritalStatus.partnered && this.partner !== undefined)
      )
  }

  constructor(
    public readonly input: IncomeInput,
    public readonly maritalStatus: MaritalStatusHelper
  ) {
    super(undefined); // send undefined, as we should never use this `value` property
  }

  /**
   * Calculate the income after applying deductions.
   * Deduct the first $5,000 entirely, then 50% of the next $10,000.
   */
  calculateDeductedIncome(income: number, incomeWork?: number): number {
    if (incomeWork === undefined) {
      return income;
    }
    if (incomeWork <= 5000) {
      return income - incomeWork
    } else if (incomeWork <= 15000) {
      return income - (5000 + (incomeWork - 5000) * 0.5)
    } else {
      return income - 10000 // Maximum deduction is $10,000
    }
  }

  get adjustedIncome(): number {
    return this.calculateDeductedIncome(this.client, this.clientIncomeWork)
  }

  get adjustedIncomePartner(): number | undefined {
    if (this.partner === undefined) {
      return undefined;
    }
    return this.calculateDeductedIncome(this.partner, this.partnerIncomeWork)
  }

  /**
   * Returns the relevant income, depending on marital status.
   * Returns the client's income when single, or the sum of client+partner when partnered.
   */
  get relevant(): number {
    if (
      this.maritalStatus !== undefined &&
      this.maritalStatus.provided &&
      this.maritalStatus.partnered &&
      this.partner !== undefined
    ) {
      return this.sum
    }
    return this.client
  }

  private get sum(): number {
    const a = this.client ?? 0
    const b = this.partner ?? 0
    return a + b
  }

  /**
   * Returns the relevant income after salary exemption, depending on marital status.
   * Uses the calculated income considering deductions from work income.
   */
  get adjustedRelevant(): number {
    let clientAdjustedIncome = this.adjustedIncome
    if (
      this.maritalStatus.provided &&
      this.maritalStatus.partnered &&
      this.partner !== undefined
    ) {
      let partnerAdjustedIncome = this.adjustedIncomePartner
      return clientAdjustedIncome + ( partnerAdjustedIncome || 0)
    }
    return clientAdjustedIncome
  }
}

