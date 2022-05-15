export class RandomStringGenerate {
    static generateRandomString(): string {
        return Math.random().toString(36).slice(2);
    }

    static getToken(): string {
        return this.generateRandomString() + this.generateRandomString();
    }
}