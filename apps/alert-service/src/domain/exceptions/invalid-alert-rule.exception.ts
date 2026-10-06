export class InvalidAlertRuleException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidAlertRuleException';
  }
}
