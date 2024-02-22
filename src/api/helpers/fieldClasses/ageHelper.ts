import { MonthYear, isMonthYear } from '../../definitions/types'

export namespace AgeHelper {

  /**
   * Calculate the year and month when the individual will be at the given age
   *
   * @param forAge The age to calculate the future year and month for
   * @returns The year/month when the individual will be at the given age
   */
  export function willReachAgeAtYearMonth(forAge: number, birthYearMonth: MonthYear): MonthYear | null | undefined {
    if (birthYearMonth === undefined || birthYearMonth === null) return birthYearMonth

    // Calculate the number of full years and additional months
    var fullYears = Math.floor(forAge)
    var additionalMonths = Math.floor((forAge - fullYears) * 12)

    // Calculate the future year and month
    var futureYear = birthYearMonth.year + fullYears
    var futureMonth = birthYearMonth.month + additionalMonths

    // Adjust for month overflow (if futureMonth > 12)
    if (futureMonth > 12) {
      futureYear += Math.floor(futureMonth / 12)
      futureMonth = futureMonth % 12
    }

    // If futureMonth is 0, it means the month is December of the previous year
    if (futureMonth === 0) {
      futureYear -= 1
      futureMonth = 12
    }

    return {
      year: futureYear,
      month: futureMonth,
    }
  }

  export function calculate2013Age(currentAge: number, birthDate?: string) {
    if (birthDate) {
      const parts = birthDate.split(';')
      const birthYear = parseInt(parts[0], 10)
      const birthMonth = parseInt(parts[1], 10)

      const comparisonYear = 2013
      const comparisonMonth = 7 // July

      let age = comparisonYear - birthYear
      const monthDifference = comparisonMonth - birthMonth

      const monthAge = monthDifference / 12
      age += monthAge

      return parseFloat(age.toFixed(2))
    } else {
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear()
      const currentMonth = currentDate.getMonth() + 1

      const birthYear = currentYear - Math.floor(currentAge)
      const birthMonth =
        currentMonth - Math.round((currentAge - Math.floor(currentAge)) * 12)

      let adjustedYear = birthYear
      let adjustedMonth = birthMonth
      if (birthMonth <= 0) {
        adjustedYear -= 1
        adjustedMonth += 12
      }

      const ageInJuly2013 = 2013 - adjustedYear + (7 - adjustedMonth) / 12
      return parseFloat(ageInJuly2013.toFixed(2))
    }
  }

  /**
   * Accepts a numerical month+year, and returns the number of years since then.
   * This can and will return a decimal value, such as "65.5"!
   */
  export function calculateAge(dob: string): number | null;
  export function calculateAge(birthMY: MonthYear): number | null;
  export function calculateAge(dobOrbirthMonth: string | MonthYear): number | null {

    const birthMY = (() => {
      if (typeof dobOrbirthMonth === 'string') {
        return getYearMonth(dobOrbirthMonth as string)
      } else {
        return dobOrbirthMonth;
      }
    })()
    if (!isMonthYear(birthMY)) return null

    const today = new Date()
    const currentMonth = today.getMonth() + 1
    const currentYear = today.getFullYear()

    let ageMonths: number
    let ageYears = currentYear - birthMY.year

    if (currentMonth >= birthMY.month) {
      ageMonths = currentMonth - birthMY.month
    } else {
      ageYears -= 1
      ageMonths = 12 + (currentMonth - birthMY.month)
    }

    return ageYears + Number((ageMonths / 12).toFixed(2))
  }

  /**
   * Accepts a numerical month+year, and returns the number of years since then.
   * This can and will return a decimal value, such as "65.5"!
   */
  export function getYearMonth(dob: string): MonthYear | null;
  export function getYearMonth(birthMonth: number, birthYear: number): MonthYear | null;
  export function getYearMonth(dobOrbirthMonth: number | string, birthYear?: number): MonthYear | null {

    const birthYM = {
      year: birthYear,
      month: dobOrbirthMonth
    }

    if (typeof dobOrbirthMonth === 'string') {
      const parts = dobOrbirthMonth.split('-')
      birthYM.year = parseInt(parts[0], 10)
      birthYM.month = parseInt(parts[1], 10)
    }

    if (isMonthYear(birthYM)) return birthYM
    return null;
  }

}
