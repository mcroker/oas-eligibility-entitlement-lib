import { Translations } from '../i18n'
import { ClientAndPartnerInput } from './_clientAndPartner'
import { AlwClientClient } from './alwClientClient'
import { AlwClientPartner } from './alwClientPartner'
import { GisClientAndPartner } from './gisClient'

export type AlwInput = ClientAndPartnerInput<AlwClientClient, AlwClientPartner>

export class AlwClientAndPartner
  extends GisClientAndPartner<AlwClientClient, AlwClientPartner>
  implements AlwInput {

    constructor(clientIndividual: AlwClientClient, partnerIndividual: AlwClientPartner, tranaslations: Translations) {
      super(clientIndividual, partnerIndividual, tranaslations)
    }
  
    static override fromInput(input: AlwInput, translations: Translations): AlwClientAndPartner {
      const client = new AlwClientClient(input.client)
      const partner = new AlwClientPartner(input.partner)
      return new AlwClientAndPartner(client, partner, translations)
    }

}
