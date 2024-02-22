import { LegalStatus, MaritalStatus, PartnerBenefitStatus } from '../definitions/enums'
import { AlwInput } from '../definitions/input'
import { BaseClient } from './_client'
import { GisClient } from './gisClient'


export class AlwClient extends GisClient implements AlwInput {

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

  /* partnerLivingCountry */
  override set partnerLivingCountry(value: string) {
    super.partnerLivingCountry = value
  }
  override get partnerLivingCountry(): string {
    if (super.partnerLivingCountry === undefined) throw new Error('partnerLivingCountry is not defined')
    return super.partnerLivingCountry
  }

  constructor(
    input: AlwInput
  ) {
    super(input)
  }

}
