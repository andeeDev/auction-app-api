export enum GenericErrorTypes {
    GenericError = 'GenericError',
}
export enum UsersErrorTypes {
    GetAllUsersTypes = 'GetAllUsersTypes',
}

export enum AuthErrorTypes {
    LoginUserNotExistsError = 'LoginUserNotExistsError',
    LoginUserNotVerifiedError = 'LoginUserNotVerifiedError',
    LoginPasswordMatchesError = 'LoginPasswordMatchesError',
    RegisterUserNotFoundError = 'RegisterUserNotFoundError',
    RegisterError = 'RegisterError',
    LoginError = 'LoginError',
    VerifiedNotFoundUserError = 'VerifiedNotFoundUserError',
    VerifiedCodeWrongError = 'VerifiedCodeWrongError',
    VerifiedError = 'VerifiedError',
}

export enum PasswordErrorTypes {
    SentResetVerificationError = 'SentResetVerificationError',
    GetTokenError = 'GetTokenError',
    GetTokenUserNotVerifiedError = 'GetTokenUserNotVerifiedError',
    MaxAttemptsError = 'MaxAttemptsError',
    WrongCodeProvidedError = 'WrongCodeProvidedError',
    PasswordTokenNotFoundError = 'PasswordTokenNotFoundError',
    PasswordTokenNotValidError = 'PasswordTokenNotValidError',
    ResetPasswordError = 'ResetPasswordError',
}
const ErrorCombined: any = {
    ...GenericErrorTypes,
    ...UsersErrorTypes,
    ...AuthErrorTypes,
    ...PasswordErrorTypes,
};

export type ErrorType = typeof ErrorCombined;
