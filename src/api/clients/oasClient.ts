import { LegalStatus } from '../definitions/enums'
import { OasInput } from '../definitions/input'
import { BaseClient } from './_client'

export class OasClient extends BaseClient implements OasInput {

  public oasDeferDuration: string

  /* Overridee getter and setter to make fields non-optional */

  /* age */
  override set age(value: number) {
    super.age = value
  }
  override get age(): number {
    if (super.age === undefined) throw new Error('age is not defined')
    return super.age
  }

  /* yearsInCanadaSince18 */
  override set yearsInCanadaSince18(value: number) {
    this.yearsInCanadaSince18 = value
  }
  override get yearsInCanadaSince18(): number {
    if (super.yearsInCanadaSince18 === undefined) throw new Error('yearsInCanadaSince18 is not defined')
    return super.yearsInCanadaSince18
  }

  /* clientIncome */
  override set clientIncome(value: number) {
    super.clientIncome = value
  }
  override get clientIncome(): number {
    if (super.clientIncome === undefined) throw new Error('clientIncome is not defined')
    return super.clientIncome
  }

  /* everLivedSocialCountry */
  override set everLivedSocialCountry(value: boolean) {
    super.everLivedSocialCountry = value
  }
  override get everLivedSocialCountry(): boolean {
    if (this.everLivedSocialCountry === undefined) throw new Error('everLivedSocialCountry is not defined')
    return this.everLivedSocialCountry
  }

  /* LegalStatus */
  override set legalStatus(value: LegalStatus) {
    super.legalStatus = value
  }
  override get legalStatus(): LegalStatus {
    if (super.legalStatus === undefined) throw new Error('legalStatus is not defined')
    return super.legalStatus
  }

  /* LivingCounty */
  override set livingCountry(value: string) {
    super.livingCountry = value
  }
  override get livingCountry(): string {
    if (super.livingCountry === undefined) throw new Error('livingCountry is not defined')
    return super.livingCountry
  }


  constructor(
    input: OasInput
  ) {
    super(input);
    this.oasDeferDuration = input.oasDeferDuration;
  }

}
