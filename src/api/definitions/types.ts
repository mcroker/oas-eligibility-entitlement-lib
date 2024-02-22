import {
  BenefitKey,
  EntitlementResultType,
  LinkIcon,
  ResultKey,
  ResultReason,
  SummaryState,
} from './enums'

export interface EligibilityResult {
  result: ResultKey
  reason: ResultReason
  detail: string
  incomeMustBeLessThan?: number // for use when income is not provided
}

export interface EntitlementResultGeneric {
  result: number // when type is unavailable, result should be -1
  type: EntitlementResultType
  autoEnrollment: boolean
}

export interface EntitlementResultOas extends EntitlementResultGeneric {
  result65To74: number
  resultAt75: number
  clawback: number
  deferral: {
    age: number
    years: number
    increase: number
    deferred: boolean
    length: any
    residency: number
  }
}

export type EntitlementResult = EntitlementResultGeneric | EntitlementResultOas

export interface BenefitResult<
  T extends EntitlementResult = EntitlementResult
> {
  benefitKey: BenefitKey
  eligibility: EligibilityResult
  entitlement: T
}

export interface BenefitResultsObject {
  [key: string]: (BenefitResult<EntitlementResult> | undefined)
  oas?: BenefitResult<EntitlementResultOas>
  gis?: BenefitResult<EntitlementResultGeneric>
  alw?: BenefitResult<EntitlementResultGeneric>
  alws?: BenefitResult<EntitlementResultGeneric>
}

export interface BenefitResultsObjectWithPartner {
  client?: BenefitResultsObject
  partner?: BenefitResultsObject
}

export interface Link {
  text: string
  url: string
  order: number
  icon?: LinkIcon
}

export interface LinkWithAction extends Link {
  action: string
}

export interface SummaryObject {
  state: SummaryState
  partnerState: SummaryState
  title?: string
  links: Link[]
  details?: string
  entitlementSum: number
  partnerEntitlementSum: number
}

export type TableData = {
  age: number
  amount: number
}

export interface MetaDataObject {
  tableData?: null | TableData[]
  currentAge?: null | number
  monthsTo70?: null | number
  receiveOAS: boolean
}

export interface MonthsYears {
  months: number
  years: number
}

export interface MonthYear {
  month: number
  year: number
}
export function isMonthYear(x: any): x is MonthYear {
  return typeof x.month === 'number' && typeof x.year === 'number'
}