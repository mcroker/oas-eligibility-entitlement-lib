import { EntitlementResultType, ResultKey } from "../definitions/enums";
import { EligibilityResult, EntitlementResult } from "../definitions/types";
import { Translations } from "../i18n";
import { Individual, IndividualInput } from "./_individual";

export interface ClientAndPartnerInput<
    C extends IndividualInput = IndividualInput,
    P extends (IndividualInput | undefined) = IndividualInput | undefined
> {
    client: C
    partner: P
}

export abstract class ClientAndPartner<
    CLIENT extends Individual = Individual,
    PARTNER extends (Individual | undefined) = Individual | undefined
>
    implements ClientAndPartnerInput {

    protected _client: CLIENT
    get client(): CLIENT {
        return this._client
    }
    protected _partner: PARTNER
    get partner(): PARTNER {
        return this._partner
    }

    /**
     * Returns true if both client income and any applicable partner income is provided.
     */
    get isIncomeProvided(): boolean {
        return this.client.income !== undefined && (
            this.client.isSingle ||
            (this.client.isPartnered && this.partner?.income !== undefined)
        )
    }

    /**
     * Returns the sum of client and partner income, or 0 if either is undefined.
     * @returns The sum of client and partner income, or 0 if either is undefined.
     */
    protected get sumIncome(): number {
        const a = this.client.income ?? 0
        const b = this.partner?.income ?? 0
        return a + b
    }

    /**
     * Returns the relevant income, depending on marital status.
     * Returns the client's income when single, or the sum of client+partner when partnered.
     */
    get relevantIncome(): number | undefined {
        if (this.client.isPartnered && this.client.income !== undefined) {
            return this.sumIncome
        }
        return this.client.income
    }

    /**
     * Returns the relevant income after salary exemption, depending on marital status.
     * Uses the calculated income considering deductions from work income.
     */
    get adjustedRelevantIncome(): number | undefined {
        if (this.client.adjustedIncome === undefined) return undefined
        if (this.client.isPartnered && this.partner?.income !== undefined) {
            return this.client.adjustedIncome + (this.partner.adjustedIncome || 0)
        }
        return this.client.adjustedIncome
    }

    /* oasResultEntitlement */
    protected _partnerOasEligibility?: EntitlementResultType
    set partnerOasEligibility(value: EntitlementResultType | undefined) {
        this._partnerOasEligibility = value
    }
    get partnerOasEligibility(): EntitlementResultType | undefined {
        return this._partnerOasEligibility
    }
    set partnerOasResultEntitlement(value: EntitlementResult) {
        this.partnerOasEligibility = value.type
    }

    /* partnerGisResultEligibility */
    protected _partnerGisEligibility?: EntitlementResultType
    set partnerGisEligibility(value: EntitlementResultType | undefined) {
        this._partnerGisEligibility = value
    }
    get partnerGisEligibility(): EntitlementResultType | undefined {
        return this._partnerGisEligibility
    }
    set partnerGisResultEligibility(value: EligibilityResult) {
        this.partnerGisEligibility =
            value.result === ResultKey.ELIGIBLE
                ? EntitlementResultType.FULL
                : EntitlementResultType.NONE
    }

    /* partnerAlwEligibility */
    protected _partnerAlwEligibility?: EntitlementResultType
    set partnerAlwEligibility(value: EntitlementResultType | undefined) {
        this._partnerAlwEligibility = value
    }
    get partnerAlwEligibility(): EntitlementResultType | undefined {
        return this._partnerAlwEligibility
    }
    set partnerAlwResultEligibility(value: EligibilityResult) {
        this.partnerAlwEligibility =
            value.result === ResultKey.ELIGIBLE
                ? EntitlementResultType.FULL
                : EntitlementResultType.NONE
    }

    constructor(client: CLIENT, partner: PARTNER, translations: Translations);
    constructor(
        client: CLIENT,
        partner: PARTNER,
        protected translations: Translations
    ) {
        this._client = client
        this._partner = partner
    }

}


