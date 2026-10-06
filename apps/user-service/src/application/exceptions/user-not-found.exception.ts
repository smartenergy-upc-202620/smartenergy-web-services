export class UserNotFoundException extends Error {
  constructor(id: string) {
    super(`User "${id}" was not found`);
    this.name = 'UserNotFoundException';
  }
}
