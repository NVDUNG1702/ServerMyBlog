function generateRandomPassword() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';
    const passwordLength = Math.floor(Math.random() * (12 - 8 + 1)) + 8; // Độ dài từ 8 đến 12 ký tự
    let password = '';

    for (let i = 0; i < passwordLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        password += characters[randomIndex];
    }

    return password;
}

module.exports = {
    generateRandomPassword
}