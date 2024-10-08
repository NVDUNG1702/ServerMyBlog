const crypto = require('crypto')

const hmacSecret = crypto.randomBytes(64).toString('hex');

console.log(hmacSecret);
