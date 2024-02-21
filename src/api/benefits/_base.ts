import { Translations } from '../i18n'
import {
  BenefitKey,
  LegalStatus,
  MaritalStatus,
  PartnerBenefitStatus,
  ResultKey
} from '../definitions/enums'
import {
  EligibilityResult,
  EntitlementResult,
} from '../definitions/types'
import { IncomeHelper, LegalStatusHelper, LivingCountryHelper, MaritalStatusHelper, PartnerBenefitStatusHelper } from '../helpers/fieldClasses'
import { BaseInput } from '../definitions/input'

export abstract class BaseBenefit<T extends EntitlementResult> {
  private _eligibility?: EligibilityResult
  private _entitlement?: T

  public age: number;

  public income: number // personal income
  public incomeWork?: number // personal income
  public partnerIncome?: number // partner income
  public partnerIncomeWork?: number // partner income
  protected get _income(): IncomeHelper {
    return new IncomeHelper({
      income: this.income,
      incomeWork: this.incomeWork,
      partnerIncome: this.partnerIncome,
      partnerIncomeWork: this.partnerIncomeWork
    }, this._maritalStatus);
  }

  public livingCountry: string // country code
  protected get _livingCountry(): LivingCountryHelper {
    return new LivingCountryHelper(this.livingCountry);
  }

  public maritalStatus?: MaritalStatus // country code
  protected get _maritalStatus(): MaritalStatusHelper {
    return new MaritalStatusHelper(this.maritalStatus);
  }

  public legalStatus?: LegalStatus // country code
  protected get _legalStatus(): LegalStatusHelper {
    return new LegalStatusHelper(this.legalStatus);
  }

  public partnerBenefitStatus?: PartnerBenefitStatus // country code
  protected get _partnerBenefitStatus(): PartnerBenefitStatusHelper {
    return new PartnerBenefitStatusHelper(this.partnerBenefitStatus);
  }

  public partnerLivingCountry?: string // country code
  protected get _partnerLivingCountry(): LivingCountryHelper {
    return new LivingCountryHelper(this.partnerLivingCountry);
  }

  protected constructor(
    input: BaseInput,
    protected translations: Translations,
    protected benefitKey: BenefitKey
  ) {
    this.age = input.age;
    this.income = input.income;
    this.incomeWork = input.incomeWork;
    this.partnerIncome = input.partnerIncome;
    this.partnerIncomeWork = input.partnerIncomeWork;
    this.livingCountry = input.livingCountry;
    this.maritalStatus = input.maritalStatus;
    this.legalStatus = input.legalStatus;
    this.partnerLivingCountry = input.partnerLivingCountry;
  }

  get eligibility(): EligibilityResult {
    if (this._eligibility === undefined)
      this._eligibility = this.getEligibility()
    return this._eligibility
  }

  get entitlement(): T {
    if (this._entitlement === undefined)
      this._entitlement = this.getEntitlement()
    return this._entitlement
  }

  protected abstract getEligibility(asOf?: Date): EligibilityResult;

  protected abstract getEntitlement(asOf?: Date): T;

  /**
   * Just say auto-enroll is true if eligible, because we don't know any better right now.
   * This is overridden by ALW+AFS.
   */

  protected getAutoEnrollment(): boolean {
    return this.eligibility.result === ResultKey.ELIGIBLE
  }

  get info() {
    return {
      benefitKey: this.benefitKey,
      eligibility: this.eligibility,
      entitlement: this.entitlement
    }
  }
}
