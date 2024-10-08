const { where } = require("sequelize");
const { transporter } = require("../config/common/mail");
const renderOtp = require("../helpers/render_otp");
const { User, OTP, AccessToken, RefreshToken, Follow, sequelize } = require("../models/index");
const createError = require('http-errors');
const { Op } = require('sequelize');
const bcrypt = require("bcrypt");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../middlewares/auth/jwt_service");


const userController = {
    senOTP: async (req, res) => {
        try {
            const { email, userName } = req.body;

            // const uid = req.user.uID
            const checkUniqueEmail = await User.findOne({ where: { email } });
            if (checkUniqueEmail) {
                return res.status(500).json({
                    error: "Email đã tồn tại"
                })
            }

            const checkUniqueUserName = await User.findOne({ where: { userName } });
            if (checkUniqueUserName) {
                return res.status(500).json({
                    error: "User đã tồn tại"
                })
            }
            if (!email) {
                console.log(email);

                return res.status(400).json({ error: 'Email is required.' });
            }

            const { code, time } = renderOtp();

            const mailOptions = {
                from: '"BLOG PAGE 👻"', // sender address
                to: `${email}`, // list of receivers
                subject: "OTP ✔", // Subject line
                // text: `Hello ${name}!, register !`, // plain text body
                html: `<p>Your OTP is: ${code}</p>`, // html body
            }
            // Gửi email OTP
            await transporter.sendMail(mailOptions)
                .then(async (info) => {
                    console.log("Email sent successfully:", info.messageId);

                    // Lưu OTP vào cơ sở dữ liệu
                    const newOTP = await OTP.create({ email, used: false, otp: code, expiresAt: time });
                    // console.log("newOTP: ", newOTP);


                    return res.status(200).json({ message: 'OTP has been sent to your email.' });
                })
                .catch((emailError) => {
                    console.error('Error sending OTP email:', emailError);
                    return res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
                });;

            // Lưu OTP vào cơ sở dữ liệu
            // await Otp.create({ email, otp: otpCode, expiresAt });

            // res.status(200).json({ message: 'OTP has been sent to your email.' });
        } catch (error) {
            console.error('Error sending OTP:', error);
            res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
        }
    },
    register: async (req, res) => {
        try {
            const { userName, password, email, otp } = req.body;


            const checkOTP = await OTP.findOne({
                where: {
                    otp,
                    email: email,
                    used: false,
                    expiresAt: { [Op.gt]: new Date() },
                }
            }
            )

            if (!checkOTP) {
                return res.status(400).json({ message: 'Invalid or expired OTP.' });
            }

            const salt = bcrypt.genSaltSync(10);
            const hashPass = bcrypt.hashSync(password, salt);
            const role = 0;
            const newUser = await User.create({
                userName,
                password: hashPass,
                email,
                role,
            });

            if (!newUser) return createError(501, "register error");

            const mailOptions = {
                from: '"ADMIN BLOG PAGE 👻"', // sender address
                to: `${email}`, // list of receivers
                subject: "Hello ✔", // Subject line
                // text: `Hello ${name}!, register !`, // plain text body
                html: `<p>We are pleased to inform you that your account registration has been successfully completed. Welcome to Server trái đất!</p>`, // html body
            };

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    // console.log("Error send mail: ", err);
                    return;
                };
                console.log("Send mail: ", info);
            });

            res.status(201).json({
                status: 201,
                message: "register success",
            });
        } catch (error) {
            console.log("signup error: ", error);
            res.json({
                status: 501,
                message: error,
            });
        }
    },
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const userLogin = await User.findOne({ where: { email } });
            if (!userLogin) throw createError(404, "Login faild, user not found!");

            const validationPass = await userLogin.validationPassword(password);
            if (!validationPass) throw createError(500, "Password incorrect");

            const ACCESS_TOKEN = await signAccessToken(userLogin.id);
            const REFRESH_TOKEN = await signRefreshToken(userLogin.id);
            const { id, fullName, userName, avatar, phoneNumber, createdAt, updatedAt } = userLogin;
            res.status(200).json({
                status: 200,
                ACCESS_TOKEN: ACCESS_TOKEN,
                REFRESH_TOKEN: REFRESH_TOKEN,
                user: {
                    id, fullName, userName, email, avatar, phoneNumber, createdAt, updatedAt
                }
            });
        } catch (error) {
            console.log("Error login: ", error);
            res.json({
                status: error.status,
                error: error.message
            });
        }
    },

    loginWithToken: async (req, res) => {
        try {
            const { user } = req;
            if (!user) throw createError.UnprocessableEntity();
            const userLogin = await User.findOne({ where: { id: user.uID } });
            if (!userLogin) {
                throw createError.Unauthorized();
            }

            const { id, fullName, userName, email, avatar, phoneNumber, createdAt, updatedAt } = userLogin;

            res.json({
                status: 200,
                user: {
                    id, fullName, userName, email, avatar: avatar, phoneNumber, createdAt, updatedAt
                }
            })
        } catch (error) {
            res.json({
                status: error.status,
                error: error.message
            })
        }
    },

    refreshToken: async (req, res) => {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) throw createError.BadRequest();
            const payload = await verifyRefreshToken(refreshToken);
            const findUser = await User.findOne({ where: { id: payload.uID } });
            if (!findUser) {
                res.json({
                    status: 404,
                    message: 'user not found'
                });
            }
            const ACCESS_TOKEN = await signAccessToken(payload.uID);
            res.status(201).json({
                status: 201,
                ACCESS_TOKEN: ACCESS_TOKEN,
            });
        } catch (error) {
            console.log("refresh token error: ", error);
            res.json({
                status: 401,
                message: error.message
            })
        }
    },

    logOut: async (req, res) => {
        try {
            const uID = req.user.uID;
            await AccessToken.destroy({ where: { uID } });
            await RefreshToken.destroy({ where: { uID } });
            res.status(200).json({
                status: 200,
                message: "Logout Success!"
            })
        } catch (error) {
            res.status(500).json({
                error: "Delete Token Error!"
            })
        }
    },

    update: async (req, res) => {
        try {
            const { file } = req;
            const { uID } = req.user;
            const { fullName, userName, bio, phoneNumber } = req.body
            const user = await User.findOne({ where: { id: uID } });
            if (!uID || !user) {
                return res.status(404).json({
                    status: 404,
                    error: "User not found!"
                })
            }
            if (file) {
                const linkImg = `http://localhost:1306/${file.path}`;
                const newLink = linkImg.replace('/public', '');
                user.avatar = newLink
            }

            user.fullName = fullName;
            user.userName = userName;
            user.bio = bio;
            user.phoneNumber = phoneNumber;

            await user.save()
            res.status(200).json({
                status: 200,
                data: user,
                message: "update successfull!"
            })
        } catch (error) {
            console.log(error);

            res.status(500).json({
                error: error
            })

        }
    },

    getProfile: async (req, res) => {
        try {
            const { userName } = req.params;

            const user = await User.findOne({ where: { userName } });
            if (!userName || !user) {
                return res.status(404).json({
                    error: "User not found",
                    status: 404
                });
            }
            const { fullName, avatar, bio, id } = user;
            return res.status(200).json({
                status: 200,
                data: {
                    id,
                    fullName,
                    userName,
                    bio,
                    avatar
                },
            })

        } catch (error) {
            res.status(500).json({
                status: 500,
                error: "Get profile error"
            })
        }
    },

    checkFollow: async (req, res) => {



        try {
            const { uID } = req.user;
            const { following } = req.body;

            // Kiểm tra xem followerID đã follow followingID chưa
            const followRecord = await sequelize.query(`
                    SELECT id, followerID, following, createdAt, updatedAt FROM Follows AS Follow WHERE Follow.followerID = ${uID} AND Follow.following = ${following} LIMIT 1;
                `);

            if (followRecord[0] != '') {
                return res.status(200).json({ status: 200, isFollowing: true });
            } else {
                return res.status(200).json({ status: 200, isFollowing: false });
            }
        } catch (error) {
            console.log("error check follow: ", error);
            
            return res.status(500).json({ status: 500, error: 'Internal Server Error' });
        }
    },

    follow: async (req, res) => {
        const { following } = req.body;
        const { uID } = req.user;

        try {
            // Kiểm tra xem followerID đã follow followingID chưa
            const [followRecord] = await sequelize.query(`
                SELECT * FROM Follows WHERE followerID = ? AND following = ? LIMIT 1
            `, {
                replacements: [uID, following]
            });

            if (followRecord.length > 0) {
                // Nếu đã follow thì hủy follow (destroy)
                await sequelize.query(`
                    DELETE FROM Follows WHERE id = ?
                `, {
                    replacements: [followRecord[0].id]
                });
                return res.status(200).json({ status: 200, message: 'Unfollowed successfully' });
            } else {
                // Nếu chưa follow thì tạo mới
                await sequelize.query(`
                    INSERT INTO Follows (followerID, following, createdAt, updatedAt) VALUES (?, ?, NOW(), NOW())
                `, {
                    replacements: [uID, following]
                });
                return res.status(201).json({ status: 201, message: 'Followed successfully' });
            }
        } catch (error) {
            console.error(error); // In ra lỗi để dễ theo dõi
            return res.status(500).json({ status: 500, error: 'Internal Server Error' });
        }
    }

}

module.exports = userController