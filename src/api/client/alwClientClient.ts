import { GisClientClient, GisInputClient } from './gisClientClient'

export interface AlwInputClient extends GisInputClient {
  yearsInCanadaSince18: number
  everLivedSocialCountry: boolean
}

export class AlwClientClient extends GisClientClient implements AlwInputClient {

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

  constructor(
    input: AlwInputClient
  ) {
    super(input)
  }

}
