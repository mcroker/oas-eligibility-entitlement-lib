import { LegalStatus, LivingCountry, MaritalStatus, PartnerBenefitStatus } from "../definitions/enums";
import { BaseInput, Input } from "../definitions/input";
import {
    LivingCountryHelper,
    IncomeHelper,
    AgeHelper
} from "../helpers/fieldClasses";

export abstract class BaseClient {

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
    _clientIncome?: number
    set clientIncome(value: number | undefined) {
        this._clientIncome = value;
    }
    get clientIncome(): number | undefined {
        return this._clientIncome;
    }

    /**
     * @description personal income from work
     **/
    _clientIncomeWork?: number
    set clientIncomeWork(value: number | undefined) {
        this._clientIncomeWork = value;
    }
    get clientIncomeWork(): number | undefined {
        return this._clientIncomeWork;
    }

    /**
     * @description partner income
     */
    _partnerIncome?: number
    set partnerIncome(value: number | undefined) {
        this._partnerIncome = value;
    }
    get partnerIncome(): number | undefined {
        return this._partnerIncome;
    }

    /**
     * @description partner income from work
     */
    _partnerIncomeWork?: number
    set partnerIncomeWork(value: number | undefined) {
        this._partnerIncomeWork = value;
    }
    get partnerIncomeWork(): number | undefined {
        return this._partnerIncomeWork;
    }

    /**
     * Returns true if both client income and any applicable partner income is provided.
     */
    get isIncomeProvided(): boolean {
        return this.clientIncome !== undefined && (
            this.isSingle ||
            (this.isPartnered && this.partnerIncome !== undefined)
        )
    }

    /**
     * Returns the sum of client and partner income, or 0 if either is undefined.
     * @returns The sum of client and partner income, or 0 if either is undefined.
     */
    protected get sumIncome(): number {
        const a = this.clientIncome ?? 0
        const b = this.partnerIncome ?? 0
        return a + b
    }

    /**
     * Calculate the income after applying deductions.
     * Deduct the first $5,000 entirely, then 50% of the next $10,000.
     */
    get adjustedClientIncome(): number | undefined {
        return IncomeHelper.calculateDeductedIncome(this.clientIncome, this.clientIncomeWork)
    }

    /**
     * Calculate the income after applying deductions.
     * Deduct the first $5,000 entirely, then 50% of the next $10,000.
     */
    get adjustedIncomePartner(): number | undefined {
        return IncomeHelper.calculateDeductedIncome(this.partnerIncome, this.partnerIncomeWork)
    }

    /**
     * Returns the relevant income, depending on marital status.
     * Returns the client's income when single, or the sum of client+partner when partnered.
     */
    get relevantIncome(): number | undefined {
        if (this.isPartnered && this.clientIncome !== undefined) {
            return this.sumIncome
        }
        return this.clientIncome
    }

    /**
     * Returns the relevant income after salary exemption, depending on marital status.
     * Uses the calculated income considering deductions from work income.
     */
    get adjustedRelevantIncome(): number | undefined {
        if (this.adjustedClientIncome === undefined) return undefined
        if (this.isPartnered && this.partnerIncome !== undefined) {
            return this.adjustedClientIncome + (this.adjustedIncomePartner || 0)
        }
        return this.adjustedClientIncome
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

    protected _livingCountry?: string // country code
    set livingCountry(value: string) {
        this._livingCountry = value;
    }
    get livingCountry(): string {
        return this._livingCountry || LivingCountry.CANADA
    }
    get isLivingInCanada(): boolean {
        return LivingCountryHelper.isCanada(this.livingCountry)
    }

    /* MaritalStatus */
    protected _maritalStatus?: MaritalStatus
    set maritalStatus(value: MaritalStatus) {
        this._maritalStatus = value;
    }
    get maritalStatus(): MaritalStatus {
        return this._maritalStatus || MaritalStatus.SINGLE;
    }
    get isPartnered(): boolean {
        return this.maritalStatus === MaritalStatus.PARTNERED
    }
    get isSingle(): boolean {
        return this.maritalStatus === MaritalStatus.SINGLE
            || this.maritalStatus === MaritalStatus.WIDOWED
    }
    get isInvSeparated(): boolean {
        return this.maritalStatus === MaritalStatus.INV_SEPARATED
    }

    /* LegalStatus */
    protected _legalStatus?: LegalStatus | undefined
    set legalStatus(value: LegalStatus) {
        this._legalStatus = value;
    }
    get legalStatus(): LegalStatus {
        return this._legalStatus || LegalStatus.YES;
    }
    get hasLegalStatusCanada(): boolean {
        return this.legalStatus === LegalStatus.YES;
    }

    /* PartnerBenefitStatus */
    protected _partnerBenefitStatus?: PartnerBenefitStatus
    set partnerBenefitStatus(value: PartnerBenefitStatus | undefined) {
        this._partnerBenefitStatus = value;
    }
    get partnerBenefitStatus(): PartnerBenefitStatus | undefined {
        return this._partnerBenefitStatus;
    }

    /* partnerLivingCountry */
    protected _partnerLivingCountry?: string
    set partnerLivingCountry(value: string | undefined) {
        this._partnerLivingCountry = value;
    }
    get partnerLivingCountry(): string | undefined {
        return this._partnerLivingCountry
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
        input: BaseInput & Partial<Input>,
    ) {
        this.age = input.age;
        this.yearsInCanadaSince18 = input.yearsInCanadaSince18;
        this.clientIncome = input.clientIncome;
        this.clientIncomeWork = input.clientIncomeWork;
        this.partnerIncome = input.partnerIncome;
        this.partnerIncomeWork = input.partnerIncomeWork;
        this.livingCountry = input.livingCountry;
        this._maritalStatus = input.maritalStatus;
        this.legalStatus = input.legalStatus;
        this.partnerBenefitStatus = input.partnerBenefitStatus;
        this.partnerLivingCountry = input.partnerLivingCountry;
        this.everLivedSocialCountry = input.everLivedSocialCountry;
        this.livedOnlyInCanada = input.livedOnlyInCanada;
    }
}