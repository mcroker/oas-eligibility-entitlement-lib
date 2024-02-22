import {
  LegalStatus,
  MaritalStatus,
  PartnerBenefitStatus,
  isLegalStatus,
  isMaritalStatus
} from './enums'
import { BenefitResult, EntitlementResultOas } from './types'

export interface Input {
  clientIncome: number // personal income
  clientIncomeWork: number // personal income from work
  age: number
  birthDate?: string
  // oasDeferDuration: string
  // oasDefer: boolean
  // oasAge: number
  maritalStatus: MaritalStatus
  // invSeparated: boolean
  livingCountry: string // country code
  legalStatus: LegalStatus
  livedOnlyInCanada: boolean
  yearsInCanadaSince18: number
  // yearsInCanadaSinceOAS?: number
  everLivedSocialCountry: boolean
  partnerBenefitStatus: PartnerBenefitStatus
  partnerIncome: number // partner income
  partnerIncomeWork: number // partner income from work
  // partnerAge: number
  // partnerBirthDate?: string
  partnerLivingCountry: string // country code
  // partnerLegalStatus: LegalStatus
  // partnerLivedOnlyInCanada: boolean
  // partnerYearsInCanadaSince18: number
  // _language?: Language
}

export interface IncomeInput {
  clientIncome?: number // personal income
  clientIncomeWork?: number,
  partnerIncome?: number,
  partnerIncomeWork?: number
}
export function isIncomeInput(x: any): x is IncomeInput {
  return (x.clientIncome === undefined || typeof x.clientIncome === 'number')
    && (x.clientIncomeWork === undefined || typeof x.clientIncomeWork === 'number')
    && (x.partnerIncome === undefined || typeof x.partnerIncome === 'number')
    && (x.partnerIncomeWork === undefined || typeof x.partnerIncomeWork === 'number')
}

export interface AgeResidencyInput {
  age?: number;
  birthDate?: string;
  livedOnlyInCanada?: boolean;
  yearsInCanadaSince18?: number;
}
export function isAgeResidencyInput(x: any): x is AgeResidencyInput {
  return (typeof x.age === 'number' || typeof x.birthDate === 'string')
    && (x.livedOnlyInCanada === true || typeof x.yearsInCanadaSince18 === 'number');
}

export interface BaseInput {
  age: number;
  livingCountry: string, // country code
  maritalStatus?: MaritalStatus
  legalStatus: LegalStatus,
  clientIncome: number // personal income
  clientIncomeWork?: number,
  partnerIncome?: number,
  partnerIncomeWork?: number
}
export function isBaseInput(x: any): x is BaseInput {
  return typeof x.age === 'number'
    && typeof x.livingCountry === 'string'
    && (typeof x.maritalStatus === 'undefined' || isMaritalStatus(x.maritalStatus))
    && (typeof x.legalStatus === 'undefined' || isLegalStatus(x.legalStatus))
    && isIncomeInput(x)
}

export interface OasInput extends BaseInput {
  oasDeferDuration: string
  yearsInCanadaSince18: number
  everLivedSocialCountry: boolean
  birthDate?: string
  // receiveOAS: boolean
  // livedOnlyInCanada: boolean
}
export function isOasInput(x: any): x is OasInput {
  return typeof x.oasDeferDuration === 'string'
    && typeof x.yearsInCanadaSince18 === 'number'
    && typeof x.everLivedSocialCountry === 'boolean'
    && (typeof x.birthDate === 'string' || typeof x.birthDate === 'undefined')
    && isBaseInput(x)
}

export interface GisInput extends BaseInput {
  age: number;
  clientIncome: number // personal income
  maritalStatus: MaritalStatus
  partnerBenefitStatus: PartnerBenefitStatus
  oasResult?: BenefitResult<EntitlementResultOas>
}

export interface AlwInput extends GisInput {
  yearsInCanadaSince18: number
  everLivedSocialCountry: boolean
  partnerLivingCountry: string // country code
}

export interface AlwsInput extends GisInput {
  yearsInCanadaSince18: number
  everLivedSocialCountry: boolean
  livedOnlyInCanada: boolean
}




/*

export interface InputWithPartner {
  client: Input
  partner: Input
  _translations: Translations
}

*/