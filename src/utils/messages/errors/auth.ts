export enum AuthErrors {
    UserAlreadyExists = 'User already exists',
    UserNotFound = 'User not found',
    CodeInvalid = 'Code is wrong',
    PasswordsNotMatch = 'Passwords does not match for the user',
    AccountNotConfirmed = 'Account is not confirmed',
    EmailNotFound = 'User email not found in the database',
}
