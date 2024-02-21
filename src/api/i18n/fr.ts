// noinspection SpellCheckingInspection

import {
  BenefitKey,
  FieldCategory,
  Language,
  LegalStatus,
  MaritalStatus,
  PartnerBenefitStatus,
  ResultKey,
  SummaryState,
} from '../definitions/enums'
import { livingCountry } from './countries/fr'
import { Translations } from './index'

const fr: Translations = {
  _language: Language.FR,
  benefit: {
    [BenefitKey.oas]: 'Pension de la Sécurité de la vieillesse',
    [BenefitKey.gis]: 'Supplément de revenu garanti',
    [BenefitKey.alw]: 'Allocation',
    [BenefitKey.alws]: 'Allocation au survivant',
  },
  category: {
    [FieldCategory.AGE]: 'Âge',
    [FieldCategory.INCOME]: 'Revenu',
    [FieldCategory.LEGAL]: 'Statut légal',
    [FieldCategory.RESIDENCE]: 'Historique de résidence',
    [FieldCategory.MARITAL]: 'État matrimonial',
  },
  result: {
    [ResultKey.ELIGIBLE]: 'Admissible',
    [ResultKey.INELIGIBLE]: 'Non\xA0admissible',
    [ResultKey.WILL_BE_ELIGIBLE]: 'Serez\xA0admissible',
    [ResultKey.UNAVAILABLE]: 'Non disponible',
    [ResultKey.MORE_INFO]: "Besoin de plus d'information...",
    [ResultKey.INVALID]: "Votre demande n'est pas valide!",
    [ResultKey.INCOME_DEPENDENT]: 'Revenu manquant',
  },
  detail: {
    eligible: 'Vous êtes probablement admissible à cette prestation.',
    futureEligible60:
      'Vous serez probablement admissible lorsque vous aurez 60 ans.',
    futureEligible:
      'Vous serez probablement admissible lorsque vous aurez {EARLIEST_ELIGIBLE_AGE} ans.',
    eligibleIncomeTooHigh:
      'Vous êtes probablement admissible à cette prestation, mais votre revenu est trop élevé pour recevoir un paiement mensuel pour le moment.',
    futureEligibleIncomeTooHigh:
      'Vous pourriez être admissible lorsque vous aurez 65 ans. Puisque votre revenu est trop élevé, vous ne recevrez peut-être pas de paiement mensuel.',
    futureEligibleIncomeTooHigh2:
      'Vous serez probablement admissible lorsque vous aurez 60 ans. Si votre revenu reste le même, vous ne recevrez peut-être pas de paiement mensuel.',
    eligibleDependingOnIncome:
      'Vous êtes probablement éligible à cette prestation si {INCOME_SINGLE_OR_COMBINED} est inférieur à {INCOME_LESS_THAN}. En fonction de {YOUR_OR_COMPLETE}, vous devriez vous attendre à recevoir environ {ENTITLEMENT_AMOUNT_FOR_BENEFIT} par mois.',
    eligibleDependingOnIncomeNoEntitlement:
      'Vous pourriez probablement recevoir cette prestation si {INCOME_SINGLE_OR_COMBINED} est moins que {INCOME_LESS_THAN}. Fournissez {YOUR_OR_COMPLETE} pour obtenir une estimation de paiement mensuel.',
    eligibleEntitlementUnavailable:
      "Vous êtes probablement admissible à cette prestation, mais une estimation du droit à cette prestation n'est pas disponible. Vous devriez communiquer avec {LINK_SERVICE_CANADA} pour obtenir plus de renseignements sur le montant de vos paiements.",
    eligiblePartialOas:
      'Vous êtes probablement admissible à une pension partielle de la Sécurité de la vieillesse.',
    yourDeferralOptions: 'Vos options de report',
    retroactivePay: 'Paiement rétroactif',
    sinceYouAreSixty:
      'Puisque vous avez {CURRENT_AGE} ans, vous pouvez commencer à recevoir vos paiements immédiatement ou attendre encore {WAIT_MONTHS} mois.',
    futureDeferralOptions:
      "Vous pouvez commencer à recevoir vos paiements à {EARLIEST_ELIGIBLE_AGE} ans ou attendre d'avoir 70 ans.",
    youCanAply:
      'Vous pouvez présenter votre demande 11 mois avant la date à laquelle vous aimeriez recevoir votre premier paiement.',
    delayMonths:
      'Vous pouvez reporter votre pension pour encore {DELAY_MONTHS} mois.',
    eligibleWhen60ApplyNow:
      'Vous pourriez être admissible à votre 60e anniversaire. Par contre, vous pourriez être en mesure de présenter une demande dès maintenant. Veuillez communiquer avec {LINK_SERVICE_CANADA} pour en savoir plus.',
    eligibleWhen65ApplyNow:
      'Vous pourriez être admissible à votre 65e anniversaire. Par contre, vous pourriez être en mesure de présenter une demande dès maintenant. Veuillez communiquer avec {LINK_SERVICE_CANADA} pour en savoir plus.',
    eligibleWhen60:
      "Vous pourriez être admissible lorsque vous aurez 60 ans. Vous pouvez <a class='text-default-text' style='text-decoration: underline' href='/fr/questions#age'>modifier vos réponses</a> pour voir ce que vous pourriez recevoir à un âge futur. <p class='mt-6'>Vous pouvez présenter une demande pour cette prestation 1 mois après votre 59e anniversaire.</p>",
    eligibleWhen65: 'Vous pourriez être admissible à votre 65e anniversaire.',
    mustBeInCanada:
      "Vous devez habiter au Canada pour recevoir cette prestation. Vous pouvez <a class='text-default-text' style='text-decoration: underline' href='/fr/questions#livingCountry'>modifier vos réponses</a> pour voir ce que vous pourriez recevoir si vous habitiez au Canada.",
    mustBeOasEligible:
      'Vous devez être admissible à la pension de la Sécurité de la vieillesse pour être admissible à cette prestation.',
    mustCompleteOasCheck:
      "Vous devez d'abord compléter l'évaluation d'admissibilité à la Sécurité de la vieillesse.",
    mustMeetIncomeReq:
      '{INCOME_SINGLE_OR_COMBINED} est trop élevé pour que vous soyez admissible à cette prestation.',
    mustMeetYearReq:
      "Vous n'avez pas vécu au Canada pendant le nombre d'années requis pour être admissible à cette prestation.",
    conditional:
      'Vous pourriez être admissible à cette prestation. Nous vous invitons à communiquer avec Service Canada pour obtenir une meilleure évaluation.',
    partnerContinues: 'Si votre conjoint continue de recevoir à',
    continueReceiving: 'Si vous continuez de recevoir à',
    dependingOnAgreement:
      "Vous pourriez être admissible à cette prestation, selon l'accord que le Canada a avec ce pays. Nous vous invitons à communiquer avec Service Canada pour obtenir une meilleure évaluation.",
    dependingOnAgreementWhen60:
      "Vous pourriez avoir droit à cette prestation à votre 60e anniversaire, selon l'entente entre le Canada et ce pays. Nous vous invitons à communiquer avec Service Canada  pour obtenir une meilleure évaluation.",
    dependingOnAgreementWhen65:
      "Vous pourriez être admissible à cette prestation à votre 65e anniversaire, selon l'entente entre le Canada et ce pays. Nous vous invitons à communiquer avec Service Canada pour obtenir une meilleure évaluation.",
    dependingOnLegal:
      'Vous pourriez être admissible à cette prestation, selon votre statut légal au Canada. Nous vous invitons à communiquer avec Service Canada pour obtenir une meilleure évaluation.',
    dependingOnLegalWhen60:
      'Vous pourriez être admissible à cette prestation à votre 60e anniversaire, selon votre statut légal au Canada. Nous vous invitons à communiquer avec Service Canada pour obtenir une meilleure évaluation.',
    dependingOnLegalWhen65:
      'Vous pourriez être admissible à cette prestation à votre 65e anniversaire, selon votre statut légal au Canada. Nous vous invitons à communiquer avec Service Canada pour obtenir une meilleure évaluation.',
    youCantGetThisBenefit:
      'Vous ne pouvez pas recevoir cette prestation si vous ne recevez pas la pension de la Sécurité de la vieillesse. Vos paiements du Supplément de revenu garanti n’augmenteront pas si vous reportez votre pension.',
    thisEstimate:
      'Cette estimation est basée sur les informations fournies. Votre montant réel pourrait être différent. Pour confirmer que vos renseignements sont à jour, consultez votre compte {MY_SERVICE_CANADA}.',
    thisEstimateWhenZero:
      'Cette estimation est basée sur les informations fournies. Pour confirmer que vos renseignements sont à jour, consultez votre compte {MY_SERVICE_CANADA}.',
    alwNotEligible:
      "L'Allocation est une prestation pour les personnes âgées de 60 à 64 ans dont le conjoint reçoit le Supplément de revenu garanti.",
    alwEligibleButPartnerAlreadyIs:
      "Pour être admissible à cette prestation, votre partenaire doit recevoir la pension de la Sécurité de la vieillesse et le Supplément de revenu garanti. Vous pouvez <a class='text-default-text' style='text-decoration: underline' href='/fr/questions#partnerBenefitStatus'>modifier vos réponses</a> pour voir ce que vous pourriez recevoir si votre partenaire recevait ces prestations.",
    alwEligibleIncomeTooHigh:
      'Vous êtes probablement admissible à cette prestation, mais le revenu combiné de vous et votre conjoint est trop élevé pour recevoir un paiement mensuel pour le moment.',
    alwIfYouApply:
      'Si vous présentez une demande, Service Canada révisera votre déclaration de revenus chaque année. Vous recevrez automatiquement des paiements si votre revenu combiné est moins que ',
    alwsIfYouApply:
      'Si vous présentez une demande, Service Canada révisera votre déclaration de revenus chaque année. Vous recevrez automatiquement des paiements si votre revenu est moins que ',
    afsNotEligible:
      "L'Allocation au survivant est une prestation pour les personnes veuves âgées de 60 à 64 ans qui ne se sont pas remariées ou engagées dans une nouvelle union de fait.",
    alwsApply:
      'Vous pouvez présenter une demande pour cette prestation 1 mois après votre 59e anniversaire. ',
    autoEnrollTrue:
      "D'après ce que vous nous avez dit, vous <strong>n'avez pas besoin de faire une demande</strong> pour obtenir cette prestation. Vous recevrez une lettre par la poste vous informant de votre <strong>inscription automatique</strong> le mois suivant vos 64 ans.",
    autoEnrollFalse:
      "Selon ce que vous nous avez dit, <strong>vous devrez peut-être demander cette prestation</strong>. Nous ne disposons peut-être pas de suffisamment d'informations pour vous inscrire automatiquement.",
    expectToReceive:
      'Vous pouvez vous attendre à recevoir environ {ENTITLEMENT_AMOUNT_FOR_BENEFIT} par mois.',
    futureExpectToReceive:
      'Si votre revenu reste le même, vous pourriez recevoir environ {ENTITLEMENT_AMOUNT_FOR_BENEFIT} par mois.',
    futureExpectToReceivePartial1: 'Si votre revenu reste le même,',
    futureExpectToReceivePartial2:
      ' et vous vivez au Canada pendant {CALCULATED_YEARS_IN_CANADA} ans,',
    futureExpectToReceivePartial3:
      ' vous pourriez recevoir environ {ENTITLEMENT_AMOUNT_FOR_BENEFIT} par mois.',
    oasClawbackInCanada:
      "Puisque votre revenu est plus grand que {OAS_RECOVERY_TAX_CUTOFF}, vous devrez rembourser une partie ou la totalité de votre pension de la Sécurité de la vieillesse en raison de l'{LINK_RECOVERY_TAX}.",
    futureOasClawbackInCanada:
      "Puisque votre revenu est plus grand que {OAS_RECOVERY_TAX_CUTOFF}, vous ne recevrez pas une partie ou la totalité de votre pension de la Sécurité de la vieillesse en raison de l'{LINK_RECOVERY_TAX}.",
    oasClawbackNotInCanada:
      "Puisque votre revenu est plus grand que {OAS_RECOVERY_TAX_CUTOFF} et que vous vivez à l'extérieur du Canada, vous ne recevrez pas une partie ou la totalité de votre pension de la Sécurité de la vieillesse en raison de : <ul class='list-disc' style='padding-left: 24px;'><li style='padding-left: 2px;'>l'{LINK_RECOVERY_TAX};</li><li style='padding-left: 2px;'>l'{LINK_NON_RESIDENT_TAX}.</li></ul></div>",
    oas: {
      eligibleIfIncomeIsLessThan:
        "Vous êtes probablement admissible à cette prestation si votre revenu est moins que {INCOME_LESS_THAN}. Si votre revenu dépasse {OAS_RECOVERY_TAX_CUTOFF}, vous devrez peut-être payer de l'{LINK_RECOVERY_TAX}.",
      dependOnYourIncome:
        'Selon votre revenu, vous pourriez vous attendre à recevoir environ {ENTITLEMENT_AMOUNT_FOR_BENEFIT} par mois. Fournissez votre revenu pour obtenir une estimation précise.',
      eligibleIncomeTooHigh:
        'Vous êtes probablement admissible à cette prestation, mais votre revenu est trop élevé pour recevoir un paiement mensuel pour le moment.',
      futureEligibleIncomeTooHigh:
        'Vous pourriez être admissible lorsque vous aurez 65 ans. Puisque votre revenu est trop élevé, vous ne recevrez peut-être pas de paiement mensuel.',
      serviceCanadaReviewYourPayment:
        'Si vous présentez une demande, Service Canada révisera le montant de votre paiement chaque année en fonction de votre déclaration de revenus.',
      automaticallyBePaid:
        'Vous recevrez automatiquement des paiements si votre revenu est admissible.',
      youWillReceiveLetter:
        "Vous devriez recevoir une lettre au sujet de votre statut d'inscription le mois après votre 64e anniversaire.",
      youShouldReceiveLetter:
        "Vous devriez recevoir une lettre au sujet de votre statut d'inscription le mois après votre 64e anniversaire.",
      youShouldHaveReceivedLetter:
        "Vous devriez avoir reçu une lettre au sujet de votre statut d'inscription le mois après votre 64e anniversaire.",
      ifYouDidnt:
        "Si vous ne l'avez pas reçue, <a id='oasLink2' class='text-default-text' style='text-decoration: underline' href='https://www.canada.ca/fr/emploi-developpement-social/ministere/coordonnees/sv.html'>communiquez avec nous</a> pour savoir si vous devez présenter une demande.",
      applyOnline:
        "Si vous ne l'avez pas reçue, vous pouvez présenter une demande en ligne.",
      over70:
        'Si vous avez plus de 70 ans et ne recevez pas la pension la Sécurité de la vieillesse, présentez votre demande dès que possible.',
      eligibleWhenTurn65:
        "Vous pourriez être admissible lorsque vous aurez 65 ans. Vous pouvez <a class='text-default-text' style='text-decoration: underline' href='/fr/questions#age'>modifier vos réponses</a> pour voir ce que vous pourriez recevoir à un âge futur.",
      ifNotReceiveLetter64:
        "Si vous ne l'avez pas reçue, <a class='addOpenNew text-default-text' style='text-decoration: underline' target='_blank' href='https://www.canada.ca/fr/emploi-developpement-social/ministere/coordonnees/sv.html'>communiquez avec nous</a> pour savoir si vous devez présenter une demande.",
      chooseToDefer:
        "Vous pouvez choisir de reporter votre pension ou augmenter vos années de résidence au Canada. Pour savoir quelle option serait la meilleure pour vous, <a class='addOpenNew text-default-text' style='text-decoration: underline' target='_blank' href='https://www.canada.ca/fr/emploi-developpement-social/ministere/coordonnees/sv.html'>communiquez avec nous</a>.",
      receivePayment:
        'Vous pourriez recevoir un paiement pour un maximum des 11 derniers mois.',
    },
    gis: {
      eligibleDependingOnIncomeNoEntitlement:
        'Vous pourriez probablement recevoir cette prestation si {INCOME_SINGLE_OR_COMBINED} est moins que {INCOME_LESS_THAN}. Fournissez {YOUR_OR_COMPLETE} pour obtenir une estimation de paiement mensuel.',
      incomeTooHigh:
        'Vous êtes probablement admissible à cette prestation, mais votre revenu est trop élevé pour recevoir un paiement mensuel pour le moment.',
      futureEligibleIncomeTooHigh:
        'Vous pourriez être admissible lorsque vous aurez 65 ans. Si votre revenu reste le même, vous ne recevrez peut-être pas de paiement mensuel.',
      ifYouApply:
        'Si vous présentez une demande, Service Canada révisera votre déclaration de revenus chaque année. Vous recevrez automatiquement des paiements si votre revenu  est admissible.',
      canApplyOnline:
        'Vous pouvez faire une demande pour cette prestation en ligne.',
      ifYouAlreadyApplied:
        'Si vous avez déjà fait une demande pour le Supplément de revenu garanti, vous pouvez confirmer que vos renseignements sont à jour dans votre compte {MY_SERVICE_CANADA}.',
      ifYouAlreadyReceive:
        'Si vous recevez déjà le Supplément de revenu garanti, vous pouvez confirmer que vos renseignements sont à jour dans votre compte {MY_SERVICE_CANADA}.',
    },
  },
  detailWithHeading: {
    ifYouDeferYourPension: {
      heading: 'Si vous reportez votre pension',
      text: 'Vous ne pouvez pas recevoir cette prestation si vous ne recevez pas la pension de la Sécurité de la vieillesse. Vos paiements du Supplément de revenu garanti n’augmenteront pas si vous reportez votre pension.',
    },
    oasDeferralApplied: {
      heading: 'Comment le report affecte vos paiements',
      text: 'Vous avez reporté vos prestations de la SV de {OAS_DEFERRAL_YEARS}. Cela signifie que vos paiements de la SV commenceront une fois que vous aurez {OAS_DEFERRAL_AGE} ans et que vous recevrez {OAS_DEFERRAL_INCREASE} supplémentaires par mois.',
    },
    oasDeferralAvailable: {
      heading: 'Vous pouvez peut-être différer vos paiements',
      text: 'Renseignez-vous sur la {LINK_OAS_DEFER_CLICK_HERE}.',
    },
    oasClawback: {
      heading: 'Vous devrez peut-être rembourser une partie de votre pension',
      text: 'Parce que {INCOME_SINGLE_OR_COMBINED} dépasse {OAS_RECOVERY_TAX_CUTOFF}, vous devrez peut-être rembourser {OAS_CLAWBACK} en {LINK_RECOVERY_TAX}.',
    },
    oasIncreaseAt75: {
      heading: 'Vos paiements augmenteront lorsque vous aurez 75 ans',
      text: 'Lorsque vous aurez 75 ans, vos paiements augmenteront de 10 %.',
    },
    oasIncreaseAt75Applied: {
      heading: 'Vos paiements ont augmenté car vous avez plus de 75 ans',
      text: 'Parce que vous avez plus de 75 ans, vos paiements ont augmenté de 10 %.',
    },
    calculatedBasedOnIndividualIncome: {
      heading:
        'Certains montants ont été calculés à partir du revenu individuel',
      text: 'Parce que vous ne vivez pas avec votre conjoint pour des raisons hors de votre contrôle, vous pouvez recevoir des paiements mensuels plus élevés.',
    },
    partnerEligible: {
      heading: 'Votre conjoint pourrait être admissible',
      text: "Selon vos renseignements, votre conjoint pourrait recevoir {PARTNER_BENEFIT_AMOUNT} par mois. Votre conjoint peut utiliser l'estimateur pour obtenir des résultats détaillés.",
    },
    partnerDependOnYourIncome: {
      heading: 'Votre conjoint pourrait être admissible',
      text: 'Selon votre revenu, vous pourriez vous attendre à recevoir environ {PARTNER_BENEFIT_AMOUNT} par mois. Fournissez votre revenu pour obtenir une estimation précise.',
    },
    partnerEligibleButAnsweredNo: {
      heading: 'Votre conjoint pourrait être admissible',
      text: 'Vous pouvez <a href="/fr/questions#partnerBenefitStatus" class="text-default-text" style="text-decoration: underline">modifier vos réponses</a> pour voir ce que vous et votre partenaire pourriez recevoir si votre partenaire recevait la pension de la Sécurité de la vieillesse.',
    },
  },
  summaryTitle: {
    [SummaryState.MORE_INFO]: 'Plus de renseignements sont nécessaires',
    [SummaryState.UNAVAILABLE]: 'Impossible de fournir une estimation',
    [SummaryState.AVAILABLE_ELIGIBLE]:
      'Probablement admissible aux prestations',
    [SummaryState.AVAILABLE_INELIGIBLE]:
      'Probablement non admissible aux prestations',
    [SummaryState.AVAILABLE_DEPENDING]:
      'Vous pourriez être admissible à des prestations',
  },
  summaryDetails: {
    [SummaryState.MORE_INFO]:
      "Veuillez remplir le formulaire. Selon les renseignements que vous fournirez aujourd'hui, l'application estimera votre admissibilité. Si vous êtes admissible, l'application fournira également une estimation de votre paiement mensuel.",
    [SummaryState.UNAVAILABLE]:
      "Selon les renseignements que vous avez fournis aujourd'hui, nous sommes incapables de déterminer votre admissibilité. Nous vous invitons à {LINK_SERVICE_CANADA}.",
    [SummaryState.AVAILABLE_ELIGIBLE]:
      "Selon les renseignements que vous avez fournis aujourd'hui, vous êtes probablement admissible à un montant mensuel total estimé à {ENTITLEMENT_AMOUNT_SUM}. Notez que les montants ne sont qu'une estimation de votre paiement mensuel. Des changements dans votre situation peuvent affecter vos résultats.",
    [SummaryState.AVAILABLE_INELIGIBLE]:
      "Selon les renseignements que vous avez fournis aujourd'hui, vous n'avez probablement pas droit à des prestations. Voir les détails ci-dessous pour en savoir plus.",
    [SummaryState.AVAILABLE_DEPENDING]:
      "En fonction de vos revenus, vous pouvez être éligible aux prestations de vieillesse. Voir les détails ci-dessous pour plus d'informations.",
  },
  oasDeferralTable: {
    title: 'Montants de report estimés',
    headingAge: "Si vous attendez d'avoir...",
    futureHeadingAge: 'Si vous commencez votre pension à...',
    headingAmount: 'Vous pourriez recevoir chaque mois...',
  },
  incomeSingle: 'votre revenu',
  incomeCombined: 'le revenu combiné de vous et votre conjoint',
  opensNewWindow: 'ouvre une nouvelle fenêtre',
  nextStepTitle: 'Prochaines étapes',
  yes: 'Oui',
  no: 'Non',
  year: 'an',
  month: 'mois',
  months: 'mois',
  your: 'votre revenu',
  complete: 'vos revenus',
  at: 'À',
  atAge: ' ans,',
}
export default fr
