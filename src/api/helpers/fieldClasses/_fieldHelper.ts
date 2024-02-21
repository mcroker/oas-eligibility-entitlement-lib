export abstract class FieldHelper<T> {

  get provided(): boolean {
    return !(this.value === undefined)
  }

  constructor(public readonly value?: T) {
    // Not empty
  }

}