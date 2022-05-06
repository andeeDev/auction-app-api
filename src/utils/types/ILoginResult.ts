export interface ILoginResult {
    id: number;
    email: string;
    name?: string | null;
    isVerified: boolean;
    accessToken: string;
}
