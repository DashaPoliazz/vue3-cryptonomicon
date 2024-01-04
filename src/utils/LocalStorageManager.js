export class LocalStorageManager {
  constructor(key) {
    this.key = key;
  }

  read() {
    const values = window.localStorage.getItem(this.key);
    const parsedValues = JSON.parse(values);
    return parsedValues ? parsedValues : null;
  }

  update(values) {
    const stringifiedValues = JSON.stringify(values);
    window.localStorage.setItem(this.key, stringifiedValues);
  }

  clear() {
    window.localStorage.clear();
  }
}
