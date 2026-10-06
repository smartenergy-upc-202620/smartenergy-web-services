export enum UserRole {
  HOME_USER = 'HOME_USER',
  BUSINESS_ADMIN = 'BUSINESS_ADMIN',
}

export function isUserRole(value: string): value is UserRole {
  return (Object.values(UserRole) as string[]).includes(value);
}
