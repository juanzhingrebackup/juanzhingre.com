export const generateConfirmationCode = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return code;
};

export const validateConfirmationCode = (code) => {
    return /^[A-Z]{4}$/.test(code);
}; // By John Michael