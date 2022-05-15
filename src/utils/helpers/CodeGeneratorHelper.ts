export class CodeGeneratorHelper {
    static generateCode(): string {
        const randomNumber: number = Math.random() * 10_000;

        return Math.floor(randomNumber).toString();
    }
}
