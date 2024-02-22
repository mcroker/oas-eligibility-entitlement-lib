import { func } from 'joi'
import {
  EntitlementResultType,
  PartnerBenefitStatus,
  ResultKey,
} from '../../definitions/enums'

export namespace PartnerBenefitStatusHelper {

  export function isHelpMe(value: PartnerBenefitStatus): boolean {
    return value === PartnerBenefitStatus.HELP_ME
  }

  export function isNone(value: PartnerBenefitStatus): boolean {
    return value === PartnerBenefitStatus.NONE
  }

  export function isFullOas(value: PartnerBenefitStatus): boolean {
    const eligibility = partnerBenefitEligibility(value).oasEligibility
    return eligibility === EntitlementResultType.FULL || eligibility === EntitlementResultType.PARTIAL_OR_FULL
  }

  export function isPartialOas(value: PartnerBenefitStatus): boolean {
    const eligibility = partnerBenefitEligibility(value).oasEligibility
    return eligibility === EntitlementResultType.PARTIAL || eligibility === EntitlementResultType.PARTIAL_OR_FULL
  }

  export function isAnyOas(value: PartnerBenefitStatus): boolean {
    const eligibility = partnerBenefitEligibility(value).oasEligibility
    return eligibility === EntitlementResultType.FULL
      || eligibility === EntitlementResultType.PARTIAL
      || eligibility === EntitlementResultType.PARTIAL_OR_FULL
  }

  export function isAlw(value: PartnerBenefitStatus): boolean {
    return partnerBenefitEligibility(value).alwEligibility === EntitlementResultType.FULL
  }

  export function isGis(value: PartnerBenefitStatus): boolean {
    return partnerBenefitEligibility(value).gisEligibility === EntitlementResultType.FULL
  }

  function partnerBenefitEligibility(value: PartnerBenefitStatus): {
    oasEligibility: EntitlementResultType
    gisEligibility: EntitlementResultType
    alwEligibility: EntitlementResultType
  } {
    let result = {
      oasEligibility: EntitlementResultType.NONE,
      gisEligibility: EntitlementResultType.NONE,
      alwEligibility: EntitlementResultType.NONE
    }
    switch (value) {
      case PartnerBenefitStatus.OAS:
        result.oasEligibility = EntitlementResultType.PARTIAL_OR_FULL
        break
      case PartnerBenefitStatus.ALW:
        result.alwEligibility = EntitlementResultType.FULL
        break
      case PartnerBenefitStatus.OAS_GIS:
        result.oasEligibility = EntitlementResultType.PARTIAL_OR_FULL
        result.gisEligibility = EntitlementResultType.FULL
        break
      case PartnerBenefitStatus.HELP_ME:
        break
      case PartnerBenefitStatus.NONE:
        result.alwEligibility = EntitlementResultType.NONE
        result.oasEligibility = EntitlementResultType.NONE
        result.gisEligibility = EntitlementResultType.NONE
        break
    }
    return result
  }

}

/*

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

*/