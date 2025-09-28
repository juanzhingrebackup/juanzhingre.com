/**
 * Generate a random 4-letter confirmation code
 * @returns {string} 4-letter uppercase code
 */
export const generateConfirmationCode = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return code;
};

/**
 * Validate confirmation code format
 * @param {string} code - Code to validate
 * @returns {boolean} True if valid format
 */
export const validateConfirmationCode = (code) => {
    return /^[A-Z]{4}$/.test(code);
};


