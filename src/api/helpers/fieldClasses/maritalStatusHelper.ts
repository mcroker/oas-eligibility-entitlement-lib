import {
  MaritalStatus,
} from '../../definitions/enums'
import { FieldHelper } from './_fieldHelper'

export class MaritalStatusHelper extends FieldHelper<MaritalStatus> {

  get partnered(): boolean {
    return this.value === MaritalStatus.PARTNERED
  }

  get single(): boolean {
    return this.value === MaritalStatus.SINGLE || this.value === MaritalStatus.WIDOWED
  }

  get invSeparated(): boolean {
    return this.value === MaritalStatus.INV_SEPARATED
  }

  constructor(public override readonly value?: MaritalStatus) {
    super(value)
  }
  
}
