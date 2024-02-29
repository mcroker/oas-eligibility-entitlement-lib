import { GisClientPartner, GisInputPartner } from './gisClientPartner'

export interface AlwInputPartner extends GisInputPartner {
  livingCountry: string
}

export class AlwClientPartner
  extends GisClientPartner
  implements AlwInputPartner {

  // livingCountry
  override set livingCountry(value: string) {
    super.livingCountry = value
  }
  override get livingCountry(): string {
    if (super.livingCountry === undefined) throw new Error('livingCountry is not defined')
    return super.livingCountry
  }

  constructor(
    input: AlwInputPartner
  ) {
    super(input);
  }

}
