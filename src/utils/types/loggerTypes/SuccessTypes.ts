export enum UsersSuccessTypes {
    FetchAllUsersSuccess = 'FetchAllUsersSuccess',
}

export enum AuthSuccessTypes {
    LoginSuccess = 'LoginSuccess',
    RegisterSuccess = 'RegisterSuccess',
    VerifiedSuccess = 'VerifiedSuccess',
}

export enum PasswordSuccessTypes {
    SendVerificationCodeSuccess = 'SendVerificationCodeSuccess',
    GetTokenSuccess = 'GetTokenSuccess',
    ResetPasswordSuccess = 'ResetPasswordSuccess',
}

const SuccessCombined: any = {
    ...UsersSuccessTypes,
    ...AuthSuccessTypes,
    ...PasswordSuccessTypes,
};

export type SuccessType = typeof SuccessCombined;
