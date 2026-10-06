export class AlertNotFoundException extends Error {
  constructor(id: string) {
    super(`Alert "${id}" was not found`);
    this.name = 'AlertNotFoundException';
  }
}
