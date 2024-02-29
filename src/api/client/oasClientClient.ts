import { Individual, IndividualInput } from './_individual'

export interface OasInputClient extends IndividualInput {
  age: number
  oasDeferDuration: string
  yearsInCanadaSince18: number
  everLivedSocialCountry: boolean
  livingCountry: string
}

export class OasClientClient extends Individual implements OasInputClient {

  oasDeferDuration: string

  /* age */
  override set age(value: number) {
    super.age = value
  }
  override get age(): number {
    if (super.age === undefined) throw new Error('age is not defined')
    return super.age
  }

  /* income */
  override set income(value: number) {
    super.income = value
  }
  override get income(): number {
    if (super.income === undefined) throw new Error('clientIncome is not defined')
    return super.income
  }

  /* yearsInCanadaSince18 */
  override set yearsInCanadaSince18(value: number) {
    super.yearsInCanadaSince18 = value
  }
  override get yearsInCanadaSince18(): number {
    if (super.yearsInCanadaSince18 === undefined) throw new Error('yearsInCanadaSince18 is not defined')
    return super.yearsInCanadaSince18
  }

  /* everLivedSocialCountry */
  override set everLivedSocialCountry(value: boolean) {
    super.everLivedSocialCountry = value
  }
  override get everLivedSocialCountry(): boolean {
    if (super.everLivedSocialCountry === undefined) throw new Error('everLivedSocialCountry is not defined')
    return super.everLivedSocialCountry
  }

  /* livingCountry */
  override set livingCountry(value: string) {
    super.livingCountry = value
  }
  override get livingCountry(): string {
    if (super.livingCountry === undefined) throw new Error('livingCountry is not defined')
    return super.livingCountry
  }

  constructor(
    input: OasInputClient
  ) {
    super(input);
    this.oasDeferDuration = input.oasDeferDuration
  }

}
