
const jwt = require('jsonwebtoken');
const { RefreshToken, AccessToken } = require('../../models/index');
const createError = require('http-errors');

const signAccessToken = async (uID) => {
    await AccessToken.destroy({ where: { uID } });
    return new Promise((resolve, reject) => {
        const payload = {
            uID
        };

        const secret = process.env.KEY_ACCESS;

        const options = {
            expiresIn: '1h'
        }

        jwt.sign(payload, secret, options, async (error, token) => {
            if (error) reject(error);
            const expiresAt = new Date(Date.now() + (60 * 60 * 1000));
            const expiresAtFormatted = expiresAt.toISOString().slice(0, 19).replace('T', ' ');
            const newAccessToken = await AccessToken.create({
                token,
                uID,
            });
            resolve({
                token,
                timeExpired: Date.now() + 60 * 60 * 1000
            });
        });
    });
}

const signRefreshToken = async (uID) => {
    try {
        const payload = {
            uID
        };
        const secret = process.env.KEY_REFRESH;
        await RefreshToken.destroy({ where: { uID: uID } });
        const options = {
            expiresIn: '1y'
        }

        return new Promise((resolve, reject) => {
            jwt.sign(payload, secret, options, async (err, token) => {
                if (err) reject(err);

                try {
                    const expiresAt = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000));
                    const expiresAtFormatted = expiresAt.toISOString().slice(0, 19).replace('T', ' ');
                    const newRefreshToken = await RefreshToken.create({
                        token,
                        uID,
                    });
                    resolve({
                        token,
                        timeExpired: Date.now() + (30 * 24 * 60 * 60 * 1000)
                    });
                } catch (error) {
                    console.log("Error add refresh token: ", error);
                    reject(error);
                }


            })
        });
    } catch (error) {
        console.log("error delete refresh_token", error);
    }
}

const veryfyAccessToken = async (req, res, next) => {
    try {

        // const { token } = req.body;
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) return res.status(401).json({
            code: 2000,
            name: 'Token error',
            message: 'Thiếu mã JWT trong yêu cầu'
        });
        const checkTokenWithDB = await AccessToken.findOne({ where: { token } });
        if (!checkTokenWithDB) return res.status(401).json({
            code: 2007,
            name: 'token error',
            message: 'Không tìm thấy token trong cơ sở dữ liệu'
        });
        const secret = process.env.KEY_ACCESS;
        const user = await jwt.verify(token, secret, async (err, payload) => {
            if (err?.name == 'TokenExpiredError') {
                return res.status(401).json({
                    code: 2002,
                    name: err.name,
                    message: err.message
                });
            }

            // console.log(payload);
            if (!payload.uID) {
                return res.status(401).json({
                    code: 2001,
                    name: 'Token error',
                    message: 'Token không hợp lệ'
                })
            };

            const checkToken = await AccessToken.findOne({ where: { uID: payload.uID } });
            if (!checkToken) return res.status(401).json({
                code: 2001,
                name: 'Token error',
                message: 'Token không hợp lệ'
            });
            req.user = payload;
            // console.log("hello: ", payload);
            next();
        });
    } catch (error) {
        console.log("veryfy accesstoken error: ", error);
        return next(error);
    }
}

const verifyRefreshToken = async (refresh_token) => {
    return new Promise(async (resolve, reject) => {
        const checkNull = await RefreshToken.findOne({ where: { token: refresh_token } });

        if (!checkNull) reject(createError.Unauthorized());

        const verifyToken = await jwt.verify(refresh_token, process.env.KEY_REFRESH, (err, payload) => {
            if (err) reject(createError(401, err));

            return resolve(payload);
        })

    })

}





module.exports = {
    signAccessToken,
    signRefreshToken,
    veryfyAccessToken,
    verifyRefreshToken
}