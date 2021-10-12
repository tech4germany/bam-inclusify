import { isFunction } from "../type-helpers";

export class LocalStorageService<T extends object> {
  constructor(
    private readonly storageKey: string,
    private readonly defaultValue: T,
    private readonly normalizers: Partial<{ [Property in keyof T]: (value: T[Property]) => T[Property] }>
  ) {}

  load(): T {
    const loadedValue = localStorage.getItem(this.storageKey);
    if (loadedValue === null) return this.defaultValue;
    return this.normalize(JSON.parse(loadedValue));
  }

  save(value: T): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.normalize(value)));
  }

  private normalize(value: T): T {
    const normalizedEntries = (Object.keys(this.defaultValue) as (keyof T)[]).map((k) => {
      let propValue = value[k];
      if (k in this.normalizers) {
        const normalizer = this.normalizers[k];
        if (isFunction(normalizer)) {
          propValue = normalizer(propValue);
        }
      }
      return [k, propValue];
    });
    const normalizedValue = Object.fromEntries(normalizedEntries) as T;
    return normalizedValue;
  }
}
