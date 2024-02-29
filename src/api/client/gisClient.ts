import { Translations } from '../i18n'
import { ClientAndPartnerInput, ClientAndPartner } from './_clientAndPartner'
import { GisClientClient, GisInputClient } from './gisClientClient'
import { GisClientPartner, GisInputPartner } from './gisClientPartner'

export type GisInput = ClientAndPartnerInput<GisInputClient, GisInputPartner>

export class GisClientAndPartner<
  CLIENT extends GisClientClient = GisClientClient,
  PARTNER extends GisClientPartner = GisClientPartner
>
  extends ClientAndPartner<CLIENT, PARTNER>
  implements GisInput {

  // adjustedRelevantIncome
  override get adjustedRelevantIncome(): number {
    if (super.adjustedRelevantIncome === undefined) throw new Error('adjustedRelevantIncome is not defined')
    return super.adjustedRelevantIncome
  }

  constructor(clientIndividual: CLIENT, partnerIndividual: PARTNER, tranaslations: Translations) {
    super(clientIndividual, partnerIndividual, tranaslations);
  }

  static fromInput(input: GisInput, translations: Translations): GisClientAndPartner {
    const client = new GisClientClient(input.client)
    const partner = new GisClientPartner(input.partner)
    return new GisClientAndPartner(client, partner, translations)
  }

}
