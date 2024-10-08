
const renderOtp = () => {

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // OTP expires in 10 minutes

    return {
        code: otpCode,
        time: expiresAt
    }
}

module.exports = renderOtp;