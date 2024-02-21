// import Joi from 'joi'
import { Translations } from '../i18n'
import {
  IncomeHelper,
  LegalStatusHelper,
  LivingCountryHelper,
  MaritalStatusHelper,
  PartnerBenefitStatusHelper,
} from '../helpers/fieldClasses'
import {
  Language,
  LegalStatus,
  MaritalStatus,
  PartnerBenefitStatus
} from './enums'
import { BenefitResult, EntitlementResultOas } from './types'

/**
 * What the API expects to receive. This is passed to Joi for validation.
 */
export interface Input {
  income: number // personal income
  incomeWork: number // personal income from work
  age: number
  clientBirthDate?: string
  receiveOAS: boolean
  oasDeferDuration: string
  oasDefer: boolean
  oasAge: number
  maritalStatus: MaritalStatus
  invSeparated: boolean
  livingCountry: string // country code
  legalStatus: LegalStatus
  livedOnlyInCanada: boolean
  yearsInCanadaSince18: number
  yearsInCanadaSinceOAS?: number
  everLivedSocialCountry: boolean
  partnerBenefitStatus: PartnerBenefitStatus
  partnerIncome: number // partner income
  partnerIncomeWork: number // partner income from work
  partnerAge: number
  partnerBirthDate?: string
  partnerLivingCountry: string // country code
  partnerLegalStatus: LegalStatus
  partnerLivedOnlyInCanada: boolean
  partnerYearsInCanadaSince18: number
  _language?: Language
}

export interface IncomeInput extends Partial<Input> {
  income: number // personal income
  incomeWork?: number,
  partnerIncome?: number,
  partnerIncomeWork?: number,
}

export interface BaseInput extends IncomeInput {
  age: number;
  livingCountry: string, // country code
  maritalStatus?: MaritalStatus
}

export interface OasInput extends BaseInput {
  oasDeferDuration: string
  legalStatus: LegalStatus
  yearsInCanadaSince18: number
  everLivedSocialCountry: boolean
}

export interface GisInput extends BaseInput {
  maritalStatus: MaritalStatus
  legalStatus: LegalStatus
  partnerBenefitStatus: PartnerBenefitStatus
}

export interface AlwsInput extends BaseInput {
  maritalStatus: MaritalStatus
  legalStatus: LegalStatus
  partnerBenefitStatus: PartnerBenefitStatus
  yearsInCanadaSince18: number
  livedOnlyInCanada: boolean
}

export interface AlwsInput extends BaseInput {
  maritalStatus: MaritalStatus
  partnerBenefitStatus: PartnerBenefitStatus
  everLivedSocialCountry: boolean
}

export interface EntitementFormulaInput extends Partial<Input> {
  age: number;
  income: number // personal income
  maritalStatus: MaritalStatus
  partnerBenefitStatus: PartnerBenefitStatus
  oasResult?: BenefitResult<EntitlementResultOas>
}



export interface ProcessedInput {
  income: IncomeHelper
  age: number
  clientBirthDate: string
  receiveOAS: boolean
  oasDeferDuration: string
  oasDefer: boolean
  oasAge: number
  maritalStatus: MaritalStatusHelper
  livingCountry: LivingCountryHelper
  legalStatus: LegalStatusHelper
  livedOnlyInCanada: boolean
  yearsInCanadaSince18: number
  yearsInCanadaSinceOAS?: number
  everLivedSocialCountry: boolean
  partnerBenefitStatus: PartnerBenefitStatusHelper
  partnerLivingCountry: LivingCountryHelper
  invSeparated: boolean
}



export interface InputWithPartner {
  client: Input
  partner: Input
  _translations: Translations
}
