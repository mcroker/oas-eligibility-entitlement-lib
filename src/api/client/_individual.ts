import { LegalStatus, LivingCountry, MaritalStatus, PartnerBenefitStatus, isLegalStatus, isMaritalStatus, isPartnerBenefitStatus } from "../definitions/enums";
import {
    LivingCountryHelper,
    IncomeHelper
} from "../helpers/fieldClasses";

export interface IndividualInput {
    age?: number;
    income?: number // personal income
    incomeWork?: number
    maritalStatus?: MaritalStatus
    livingCountry?: string // country code
    legalStatus?: LegalStatus
    livedOnlyInCanada?: boolean
    yearsInCanadaSince18?: number
    everLivedSocialCountry?: boolean
    birthDate?: string
    // oasDeferDuration: string
    // oasDefer: boolean
    // oasAge: number
    // invSeparated: boolean
    // yearsInCanadaSinceOAS?: number
    benefitStatus?: PartnerBenefitStatus
    // partnerAge: number
    // partnerBirthDate?: string
    // partnerLivingCountry?: string // country code
    // partnerLegalStatus: LegalStatus
    // partnerLivedOnlyInCanada: boolean
    // partnerYearsInCanadaSince18: number
    // _language?: Language
  }

  export function isClientInput(x: any): x is IndividualInput {
    return x.age === undefined || typeof x.age === 'number'
      && x.income === undefined || typeof x.income === 'number'
      && x.maritalStatus === undefined || isMaritalStatus(x.maritalStatus)
      && x.livingCountry === undefined || typeof x.livingCountry === 'string'
      && x.legalStatus === undefined || isLegalStatus(x.legalStatus)
      && x.livedOnlyInCanada === undefined || typeof x.livedOnlyInCanada === 'boolean'
      && x.yearsInCanadaSince18 === undefined || typeof x.yearsInCanadaSince18 === 'number'
      && x.everLivedSocialCountry === undefined || typeof x.everLivedSocialCountry === 'boolean'
      && x.birthDate === undefined || typeof x.birthDate === 'string'
      && x.benefitStatus === undefined || isPartnerBenefitStatus(x.benefitStatus)
  }

export class Individual {

    /* age */
    protected _age?: number
    set age(value: number | undefined) {
        this._age = value
    }
    get age(): number | undefined {
        return this._age
    }

    /**
     * @description YearsInCanadaSince18
     */
    protected _yearsInCanadaSince18?: number
    set yearsInCanadaSince18(value: number | undefined) {
        this._yearsInCanadaSince18 = value
    }
    get yearsInCanadaSince18(): number | undefined {
        return this._yearsInCanadaSince18
    }

    /**
     * @description personal income
     */
    _income?: number
    set income(value: number | undefined) {
        this._income = value;
    }
    get income(): number | undefined {
        return this._income;
    }

    /**
     * @description personal income from work
     **/
    _incomeWork?: number
    set incomeWork(value: number | undefined) {
        this._incomeWork = value;
    }
    get incomeWork(): number | undefined {
        return this._incomeWork;
    }

    /**
     * Calculate the income after applying deductions.
     * Deduct the first $5,000 entirely, then 50% of the next $10,000.
     */
    get adjustedIncome(): number | undefined {
        return IncomeHelper.calculateDeductedIncome(this.income, this.incomeWork)
    }

    /**
     * @description Ever lived Social Country 
     */
    protected _everLivedSocialCountry?: boolean
    set everLivedSocialCountry(value: boolean | undefined) {
        this._everLivedSocialCountry = value
    }
    get everLivedSocialCountry(): boolean | undefined {
        return this._everLivedSocialCountry
    }

    protected _LivingCountry?: string // country code
    set livingCountry(value: string | undefined) {
        this._LivingCountry = value;
    }
    get livingCountry(): string | undefined {
        return this._LivingCountry
    }
    get isLivingInCanada(): boolean {
        return LivingCountryHelper.isCanada(this.livingCountry || LivingCountry.CANADA)
    }

    /* MaritalStatus */
    protected _maritalStatus?: MaritalStatus
    set maritalStatus(value: MaritalStatus | undefined) {
        this._maritalStatus = value;
    }
    get maritalStatus(): MaritalStatus | undefined {
        return this._maritalStatus;
    }
    private get maritalStatusDefaulted(): MaritalStatus {
        return this._maritalStatus || MaritalStatus.SINGLE;
    }
    get isPartnered(): boolean {
        return this.maritalStatusDefaulted === MaritalStatus.PARTNERED
    }
    get isSingle(): boolean {
        return this.maritalStatusDefaulted === MaritalStatus.SINGLE
            || this.maritalStatusDefaulted === MaritalStatus.WIDOWED
    }
    get isInvSeparated(): boolean {
        return this.maritalStatusDefaulted === MaritalStatus.INV_SEPARATED
    }

    /* LegalStatus */
    protected _legalStatus?: LegalStatus | undefined
    set legalStatus(value: LegalStatus | undefined) {
        this._legalStatus = value;
    }
    get legalStatus(): LegalStatus | undefined {
        return this._legalStatus;
    }
    get hasLegalStatusCanada(): boolean {
        return this.legalStatus === LegalStatus.YES;
    }

    /* BenefitStatus */
    protected _benefitStatus?: PartnerBenefitStatus
    set benefitStatus(value: PartnerBenefitStatus | undefined) {
        this._benefitStatus = value;
    }
    get benefitStatus(): PartnerBenefitStatus | undefined {
        return this._benefitStatus;
    }

    /* livedOnlyInCanada */
    protected _livedOnlyInCanada?: boolean
    set livedOnlyInCanada(value: boolean | undefined) {
        this._livedOnlyInCanada = value;
    }
    get livedOnlyInCanada(): boolean | undefined {
        return this._livedOnlyInCanada;
    }

    constructor(
        input: IndividualInput
    ) {
        this.age = input.age
        this.yearsInCanadaSince18 = input.yearsInCanadaSince18
        this.income = input.income
        this.incomeWork = input.incomeWork
        this.livingCountry = input.livingCountry
        this.maritalStatus = input.maritalStatus
        this.legalStatus = input.legalStatus
        this.everLivedSocialCountry = input.everLivedSocialCountry
        this.livedOnlyInCanada = input.livedOnlyInCanada;
        this.benefitStatus = input.benefitStatus
    }

}