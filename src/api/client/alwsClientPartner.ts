import { PartnerBenefitStatus } from '../definitions/enums'
import { GisClientPartner, GisInputPartner } from './gisClientPartner'

export interface AlwsInputPartner extends GisInputPartner {
  benefitStatus: PartnerBenefitStatus
}

export class AlwsClientPartner extends GisClientPartner implements AlwsInputPartner {

  // BenefitStatus
  override set benefitStatus(value: PartnerBenefitStatus) {
    super.benefitStatus = value
  }
  override get benefitStatus(): PartnerBenefitStatus {
    if (super.benefitStatus === undefined) throw new Error('benefitStatus is not defined')
    return super.benefitStatus
  }

  constructor(
    input: AlwsInputPartner
  ) {
    super(input);
  }

}
