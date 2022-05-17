type CodeGeneratorHelperType = {
    generateCode: () => string;
};
export const CodeGeneratorHelper: CodeGeneratorHelperType = {
    generateCode(): string {
        const randomNumber: number = Math.random() * 10_000;

        return Math.floor(randomNumber).toString();
    },
};
