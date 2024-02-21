import {
  LegalStatus,
} from '../../definitions/enums'
import { FieldHelper } from './_fieldHelper'

export class LegalStatusHelper extends FieldHelper<LegalStatus> {

  get canadian(): boolean {
    return this.value === LegalStatus.YES;
  }

  get other(): boolean {
    return this.value === LegalStatus.NO;
  }

  constructor(public override readonly value?: LegalStatus) {
    super(value);
  }

}
