import { PartnerBenefitStatus } from '../definitions/enums'
import { Individual, IndividualInput } from './_individual'

export interface GisInputPartner extends IndividualInput {
  benefitStatus: PartnerBenefitStatus
}

export class GisClientPartner extends Individual implements GisInputPartner {

  // BenefitStatus
  override set benefitStatus(value: PartnerBenefitStatus) {
    super.benefitStatus = value
  }
  override get benefitStatus(): PartnerBenefitStatus {
    if (super.benefitStatus === undefined) throw new Error('benefitStatus is not defined')
    return super.benefitStatus
  }

  constructor(
    input: GisInputPartner
  ) {
    super(input);
  }

}
