import { ClientAndPartnerInput, ClientAndPartner } from './_clientAndPartner'
import { Individual, IndividualInput } from './_individual'
import { OasClientClient, OasInputClient } from './oasClientClient'
import { Translations } from '../i18n'

export type OasInput = ClientAndPartnerInput<OasInputClient, undefined | IndividualInput>

export class OasClientAndPartner
  extends ClientAndPartner<OasClientClient, Individual | undefined>
  implements OasInput {

  constructor(
    clientIndividual: OasClientClient,
    partnerIndividual: Individual | undefined,
    translations: Translations
  ) {
    super(clientIndividual, partnerIndividual, translations);
  }

  static fromInput(input: OasInput, translations: any): OasClientAndPartner {
    const clientIndividual = new OasClientClient(input.client)
    const partnerIndividual = input.partner ? new Individual(input.partner) : undefined
    return new OasClientAndPartner(clientIndividual, partnerIndividual, translations)
  }

}
