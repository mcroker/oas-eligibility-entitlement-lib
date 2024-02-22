import { LivingCountry } from '../../definitions/enums'
import { AGREEMENT_COUNTRIES } from '../countryUtils'

export namespace LivingCountryHelper {

  export function isCanada(value: string): boolean {
    return normalizeLivingCountry(value) === LivingCountry.CANADA
  }

  export function hasAgreement(value: string): boolean {
    return normalizeLivingCountry(value) === LivingCountry.AGREEMENT
  }

  export function hasNoAgreement(value: string): boolean {
    return normalizeLivingCountry(value) === LivingCountry.NO_AGREEMENT
  }

  function normalizeLivingCountry(country?: string): LivingCountry.CANADA | LivingCountry.AGREEMENT | LivingCountry.NO_AGREEMENT | undefined {
    if (country === undefined) return undefined
    if (country === LivingCountry.CANADA) return LivingCountry.CANADA
    return AGREEMENT_COUNTRIES.includes(country)
      ? LivingCountry.AGREEMENT
      : LivingCountry.NO_AGREEMENT
  }

}
