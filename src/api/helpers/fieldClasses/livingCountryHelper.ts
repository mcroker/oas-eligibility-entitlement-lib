import {
  LivingCountry
} from '../../definitions/enums'
import { AGREEMENT_COUNTRIES } from '../countryUtils'
import { FieldHelper } from './_fieldHelper'

export class LivingCountryHelper extends FieldHelper<string> {
  normalized?: LivingCountry
  canada: boolean
  agreement: boolean
  noAgreement: boolean

  constructor(public override value?: string) {
    super(value);
    this.normalized = LivingCountryHelper.normalizeLivingCountry(value)
    this.canada = this.normalized == LivingCountry.CANADA
    this.agreement = this.normalized == LivingCountry.AGREEMENT
    this.noAgreement = this.normalized == LivingCountry.NO_AGREEMENT
  }

  /**
   * Normalizes a country to the LivingCountry enum, which is either Canada, Agreement, or No Agreement.
   * @param country Country code as a string
   */
  static normalizeLivingCountry(country?: string): LivingCountry | undefined {
    if (country === undefined) return undefined
    if (country === LivingCountry.CANADA) return LivingCountry.CANADA
    return AGREEMENT_COUNTRIES.includes(country)
      ? LivingCountry.AGREEMENT
      : LivingCountry.NO_AGREEMENT
  }
}
