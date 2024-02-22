import { LegalStatus, MaritalStatus, PartnerBenefitStatus } from '../definitions/enums'
import { AlwsInput } from '../definitions/input'
import { BaseClient } from './_client'
import { GisClient } from './gisClient'


export class AlwsClient extends GisClient implements AlwsInput {
  
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

  /* livedOnlyInCanada */
  override set livedOnlyInCanada(value: boolean) {
    super.livedOnlyInCanada = value
  }
  override get livedOnlyInCanada(): boolean {
    if (super.livedOnlyInCanada === undefined) throw new Error('livedOnlyInCanada is not defined')
    return super.livedOnlyInCanada
  }

  constructor(
    input: AlwsInput
  ) {
    super(input)
  }

}
