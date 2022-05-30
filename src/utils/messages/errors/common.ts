export enum CommonErrors {
    InternalServerError = 'Internal server error',
    Unauthorized = 'UNAUTHORIZED',
    BadCodeError = 'Code provided is wrong',
    InvalidateCodeError = 'Code was invalidated',
    InvalidToken = "Token isn't valid",
    TokenNotExists = "Token doesn't exists",
    InternalPrismaError = 'Prisma not found error',
    InternalUnknownError = 'Unknown error',
}
