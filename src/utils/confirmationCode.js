export const generateConfirmationCode = () => {
    // Use 5 characters for more unique combinations (26^5 = 11,881,376)
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let code = "";
    for (let i = 0; i < 5; i++) {
        code += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return code;
};

export const validateConfirmationCode = (code) => {
    return /^[A-Z]{5}$/.test(code);
};

// Helper to check if confirmation code already exists in database
export const checkCodeUniqueness = async (code) => {
    try {
        const response = await fetch(`/api/database/appointments/check-code?code=${code}`);
        const result = await response.json();
        return !result.exists; // Return true if code is unique
    } catch (error) {
        console.error("Error checking code uniqueness:", error);
        return true; // Assume unique if check fails
    }
}; // By John Michael
