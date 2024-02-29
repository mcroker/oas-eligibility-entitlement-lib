import {
  BenefitKey,
  Language,
  ResultKey,
  SummaryState,
} from '../definitions/enums'
import en from './en'
import fr from './fr'

const apiTranslationsDict = { en, fr }

export interface KeyAndText {
  key: string
  text: string
}

export interface TypedKeyAndText<T> {
  key: T
  text: string
  shortText: string
}

export interface Translations {
  _language: Language
  benefit: { [key in BenefitKey]: string }
  result: { [key in ResultKey]: string }
  detail: {
    eligible: string
    futureEligible60: string
    futureEligible: string
    eligibleIncomeTooHigh: string
    futureEligibleIncomeTooHigh: string
    futureEligibleIncomeTooHigh2: string
    eligibleDependingOnIncome: string
    eligibleDependingOnIncomeNoEntitlement: string
    eligibleEntitlementUnavailable: string
    eligiblePartialOas: string
    yourDeferralOptions: string
    retroactivePay: string
    sinceYouAreSixty: string
    futureDeferralOptions: string
    youCanAply: string
    delayMonths: string
    eligibleWhen60ApplyNow: string
    eligibleWhen65ApplyNow: string
    eligibleWhen60: string
    eligibleWhen65: string
    mustBeInCanada: string
    mustBeOasEligible: string
    mustCompleteOasCheck: string
    mustMeetIncomeReq: string
    mustMeetYearReq: string
    conditional: string
    partnerContinues: string
    continueReceiving: string
    dependingOnAgreement: string
    dependingOnAgreementWhen60: string
    dependingOnAgreementWhen65: string
    dependingOnLegal: string
    dependingOnLegalWhen60: string
    dependingOnLegalWhen65: string
    youCantGetThisBenefit: string
    thisEstimate: string
    thisEstimateWhenZero: string
    alwNotEligible: string
    alwEligibleButPartnerAlreadyIs: string
    alwEligibleIncomeTooHigh: string
    alwIfYouApply: string
    alwsIfYouApply: string
    afsNotEligible: string
    alwsApply: string
    autoEnrollTrue: string
    autoEnrollFalse: string
    expectToReceive: string
    futureExpectToReceive: string
    futureExpectToReceivePartial1: string
    futureExpectToReceivePartial2: string
    futureExpectToReceivePartial3: string
    oasClawbackInCanada: string
    futureOasClawbackInCanada: string
    oasClawbackNotInCanada: string
    oas: {
      eligibleIfIncomeIsLessThan: string
      dependOnYourIncome: string
      eligibleIncomeTooHigh: string
      futureEligibleIncomeTooHigh: string
      serviceCanadaReviewYourPayment: string
      automaticallyBePaid: string
      youWillReceiveLetter: string
      youShouldReceiveLetter: string
      youShouldHaveReceivedLetter: string
      ifYouDidnt: string
      applyOnline: string
      over70: string
      eligibleWhenTurn65: string
      ifNotReceiveLetter64: string
      chooseToDefer: string
      receivePayment: string
    }
    gis: {
      eligibleDependingOnIncomeNoEntitlement: string
      incomeTooHigh: string
      futureEligibleIncomeTooHigh: string
      ifYouApply: string
      canApplyOnline: string
      ifYouAlreadyApplied: string
      ifYouAlreadyReceive: string
    }
  }
  detailWithHeading: {
    ifYouDeferYourPension: { heading: string; text: string }
    oasDeferralApplied: { heading: string; text: string }
    oasDeferralAvailable: { heading: string; text: string }
    oasClawback: { heading: string; text: string }
    oasIncreaseAt75: { heading: string; text: string }
    oasIncreaseAt75Applied: { heading: string; text: string }
    calculatedBasedOnIndividualIncome: { heading: string; text: string }
    partnerEligible: { heading: string; text: string }
    partnerDependOnYourIncome: { heading: string; text: string }
    partnerEligibleButAnsweredNo: { heading: string; text: string }
  }
  summaryTitle: { [key in SummaryState]?: string }
  summaryDetails: { [key in SummaryState]?: string }
  oasDeferralTable: {
    title: string
    headingAge: string
    futureHeadingAge: string
    headingAmount: string
  }
  incomeSingle: string
  incomeCombined: string
  opensNewWindow: string
  nextStepTitle: string
  yes: string
  no: string
  year: string
  month: string
  months: string
  your: string
  complete: string
  at: string
  atAge: string
}

export function getTranslations(language?: Language): Translations {
  switch (language) {
    case Language.EN:
      return apiTranslationsDict.en
    case Language.FR:
      return apiTranslationsDict.fr
    default:
      return apiTranslationsDict.en
  }
}
