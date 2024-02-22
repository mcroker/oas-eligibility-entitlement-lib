export namespace IncomeHelper {

  /**
   * Calculate the income after applying deductions.
   * Deduct the first $5,000 entirely, then 50% of the next $10,000.
   * 
   * @param income The total income of the client //TODO More detaisl needed
   * @param incomeWork The income from work
   * 
   * @returns The income after applying deductions
   */
  export function calculateDeductedIncome(income?: number, incomeWork?: number): number | undefined {
    if (income === undefined) return undefined

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

}