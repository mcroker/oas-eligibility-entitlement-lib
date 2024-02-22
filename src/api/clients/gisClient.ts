import { LegalStatus, MaritalStatus, PartnerBenefitStatus } from '../definitions/enums'
import { GisInput } from '../definitions/input'
import { BaseClient } from './_client'


export class GisClient extends BaseClient implements GisInput {

  /* age */
  override set age(value: number) {
    super.age = value
  }
  override get age(): number {
    if (super.age === undefined) throw new Error('age is not defined')
    return super.age
  }

  /* clientIncome */
  override set clientIncome(value: number) {
    super.clientIncome = value
  }
  override get clientIncome(): number {
    if (super.clientIncome === undefined) throw new Error('clientIncome is not defined')
    return super.clientIncome
  }
  override get adjustedClientIncome(): number {
    if (super.adjustedClientIncome === undefined) throw new Error('adjustedClientIncome is not defined')
    return super.adjustedClientIncome
  }
  override get adjustedRelevantIncome(): number {
    if (super.adjustedRelevantIncome === undefined) throw new Error('adjustedRelevantIncome is not defined')
    return super.adjustedRelevantIncome
  }

  /* PartnerBenefitStatus */
  override set partnerBenefitStatus(value: PartnerBenefitStatus) {
    super.partnerBenefitStatus = value
  }
  override get partnerBenefitStatus(): PartnerBenefitStatus {
    if (super.partnerBenefitStatus === undefined) throw new Error('partnerBenefitStatus is not defined')
    return super.partnerBenefitStatus
  }

  /* LivingCounty */
  override set livingCountry(value: string) {
    super.livingCountry = value
  }
  override get livingCountry(): string {
    if (super.livingCountry === undefined) throw new Error('livingCountry is not defined')
    return super.livingCountry
  }

  /* LegalStatus */
  override set legalStatus(value: LegalStatus) {
    super.legalStatus = value
  }
  override get legalStatus(): LegalStatus {
    if (super.legalStatus === undefined) throw new Error('legalStatus is not defined')
    return super.legalStatus
  }


  constructor(
    input: GisInput
  ) {
    super(input)
  }

}