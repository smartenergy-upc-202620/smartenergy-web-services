export class EmailAlreadyRegisteredException extends Error {
  constructor(email: string) {
    super(`A user with email "${email}" is already registered`);
    this.name = 'EmailAlreadyRegisteredException';
  }
}
