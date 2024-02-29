import { Translations } from '../i18n'
import { ClientAndPartnerInput } from './_clientAndPartner'
import { AlwsClientClient } from './alwsClientClient'
import { AlwsClientPartner } from './alwsClientPartner'
import { GisClientAndPartner, GisInput } from './gisClient'
import { GisClientClient } from './gisClientClient'
import { GisClientPartner } from './gisClientPartner'

export type AlwsInput = ClientAndPartnerInput<AlwsClientClient, AlwsClientPartner>

export class AlwsClientAndPartner
  extends GisClientAndPartner<AlwsClientClient, AlwsClientPartner>
  implements AlwsInput {

  constructor(clientIndividual: AlwsClientClient, partnerIndividual: AlwsClientPartner, tranaslations: Translations) {
    super(clientIndividual, partnerIndividual, tranaslations);
  }

  static override fromInput(input: AlwsInput, translations: Translations): AlwsClientAndPartner {
    const client = new AlwsClientClient(input.client)
    const partner = new AlwsClientPartner(input.partner)
    return new AlwsClientAndPartner(client, partner, translations)
  }

}
