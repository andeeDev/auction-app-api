type RandomStringGenerateType = {
    generateRandomString: () => string;
    getToken: () => string;
};

export const RandomStringGenerate: RandomStringGenerateType = {
    generateRandomString(): string {
        return Math.random().toString(36).slice(2);
    },

    getToken(): string {
        return this.generateRandomString() + this.generateRandomString();
    },
};
