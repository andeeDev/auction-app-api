type CodeGeneratorHelperType = {
    generateCode: () => string;
};
export const CodeGeneratorHelper: CodeGeneratorHelperType = {
    generateCode(): string {
        const randomNumber: number = Math.floor(1000 + Math.random() * 9000);

        return Math.floor(randomNumber).toString();
    },
};
