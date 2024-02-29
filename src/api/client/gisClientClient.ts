import { LegalStatus, MaritalStatus } from '../definitions/enums'
import { BenefitResult, EntitlementResultOas } from '../definitions/types';
import { Individual, IndividualInput } from './_individual'

export interface GisInputClient extends IndividualInput {
  age: number
  income: number // personal income
  maritalStatus: MaritalStatus
  livingCountry: string
  oasResult?: BenefitResult<EntitlementResultOas>
}

export class GisClientClient extends Individual implements GisInputClient {

  /* age */
  override set age(value: number) {
    super.age = value
  }
  override get age(): number {
    if (super.age === undefined) throw new Error('age is not defined')
    return super.age
  }

  // income 
  override set income(value: number) {
    super.income = value
  }
  override get income(): number {
    if (super.income === undefined) throw new Error('clientIncome is not defined')
    return super.income
  }
  override get adjustedIncome(): number {
    if (super.adjustedIncome === undefined) throw new Error('adjustedClientIncome is not defined')
    return super.adjustedIncome
  }

  // LivingCounty 
  override set livingCountry(value: string) {
    super.livingCountry = value
  }
  override get livingCountry(): string {
    if (super.livingCountry === undefined) throw new Error('livingCountry is not defined')
    return super.livingCountry
  }

  // LegalStatus 
  override set legalStatus(value: LegalStatus) {
    super.legalStatus = value
  }
  override get legalStatus(): LegalStatus {
    if (super.legalStatus === undefined) throw new Error('legalStatus is not defined')
    return super.legalStatus
  }

  /* MaritalStatus */
  override set maritalStatus(value: MaritalStatus) {
    super.maritalStatus = value
  }
  override get maritalStatus(): MaritalStatus {
    if (super.maritalStatus === undefined) throw new Error('maritalStatus is not defined')
    return super.maritalStatus
  }

  constructor(
    input: GisInputClient
  ) {
    super(input);
  }

}
