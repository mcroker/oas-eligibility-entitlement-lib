import {
  EntitlementResultType,
  PartnerBenefitStatus,
  ResultKey,
} from '../../definitions/enums'
import { EligibilityResult, EntitlementResult } from '../../definitions/types'
import { FieldHelper } from './_fieldHelper'

export class PartnerBenefitStatusHelper extends FieldHelper<PartnerBenefitStatus> {

  get helpMe(): boolean {
    return this.value === PartnerBenefitStatus.HELP_ME
  }

  get none(): boolean {
    return this.value === PartnerBenefitStatus.NONE
  }

  oasEligibility: EntitlementResultType
  gisEligibility: EntitlementResultType
  alwEligibility: EntitlementResultType

  constructor(public override value?: PartnerBenefitStatus) {
    super(value)
    this.oasEligibility = EntitlementResultType.NONE
    this.gisEligibility = EntitlementResultType.NONE
    this.alwEligibility = EntitlementResultType.NONE
    switch (this.value) {
      case PartnerBenefitStatus.OAS:
        this.oasEligibility = EntitlementResultType.PARTIAL_OR_FULL
        break
      case PartnerBenefitStatus.ALW:
        this.alwEligibility = EntitlementResultType.FULL
        break
      case PartnerBenefitStatus.OAS_GIS:
        this.oasEligibility = EntitlementResultType.PARTIAL_OR_FULL
        this.gisEligibility = EntitlementResultType.FULL
        break
      case PartnerBenefitStatus.HELP_ME:
        break
      case PartnerBenefitStatus.NONE:
        this.alwEligibility = EntitlementResultType.NONE
        this.oasEligibility = EntitlementResultType.NONE
        this.gisEligibility = EntitlementResultType.NONE
        break
    }
  }

  get fullOas(): boolean {
    return (
      this.oasEligibility === EntitlementResultType.FULL ||
      this.oasEligibility === EntitlementResultType.PARTIAL_OR_FULL
    )
  }
  get partialOas(): boolean {
    return (
      this.oasEligibility === EntitlementResultType.PARTIAL ||
      this.oasEligibility === EntitlementResultType.PARTIAL_OR_FULL
    )
  }
  get anyOas(): boolean {
    return this.fullOas || this.partialOas
  }
  get gis(): boolean {
    return this.gisEligibility === EntitlementResultType.FULL
  }
  get alw(): boolean {
    return this.alwEligibility === EntitlementResultType.FULL
  }

  // when we calculate results for the partner, the below functions will be used to store the results

  set oasResultEntitlement(value: EntitlementResult) {
    this.oasEligibility = value.type
  }
  set gisResultEligibility(value: EligibilityResult) {
    this.gisEligibility =
      value.result === ResultKey.ELIGIBLE
        ? EntitlementResultType.FULL
        : EntitlementResultType.NONE
  }
  set alwResultEligibility(value: EligibilityResult) {
    this.alwEligibility =
      value.result === ResultKey.ELIGIBLE
        ? EntitlementResultType.FULL
        : EntitlementResultType.NONE
  }
}
