
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'dungkuro1702@gmail.com',
        pass: 'nzjr faec lvlu cjnb'
    }
});


module.exports = {
    transporter
}