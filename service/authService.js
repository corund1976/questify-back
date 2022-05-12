const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const sgMail = require("@sendgrid/mail");
const uuid = require("uuid");

const UserModel = require("../models/userModel");
const TokenModel = require("../models/tokenModel");

const UserDto = require("../dtos/user-dto");
const ApiError = require("../helper/apiError");
const tokenService = require("./tokenService");
const {
  confirmEmail,
  forgotPasswordEmail,
  checkNewHostEmail,
} = require("../helper/mailService");

class AuthService {
  async signup(name, email, password, host) {
    const candidate = await UserModel.findOne({ email });

    if (candidate) throw ApiError.Conflict(`Email ${email} in use!`);

    const hashPassword = await bcrypt.hash(password, 10);
    const activationLink = uuid.v4(); // v34fa-asfasf-142saf-sa-asf

    const user = await UserModel.create({
      name,
      email,
      password: hashPassword,
      activationLink,
      host,
    });

    const TO_ADDRESS = email;
    const FROM_NAME = 'Questify Support Team'
    const FROM_ADDRESS = process.env.SENDGRID_SENDER_EMAIL;
    const SUBJECT = 'Confirm your Email!';
    const TEXT_VERSION = `Here is your activation link - ${process.env.API_URL}/api/users/activate/${activationLink}`;
    const HTML_VERSION = confirmEmail(
      `${process.env.API_URL}/api/users/activate/${activationLink}`,
      name
    );

    const msg = {
      to: TO_ADDRESS,
      from: {
        name: FROM_NAME,
        email: FROM_ADDRESS,
      },
      subject: SUBJECT,
      text: TEXT_VERSION,
      html: HTML_VERSION,
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    await sgMail.send(msg);

    // const userDto = new UserDto(user); // id, email, isActivated
    // const tokens = tokenService.generateTokens({ ...userDto });
    // await tokenService.saveToken(userDto.id, tokens.refreshToken);
    const newUser = await UserModel.findOne({ email });

    return {
      name: newUser.name,
      email: newUser.email,
      id: newUser.id,
      isActivated: user.isActivated,
    };
  }

  async activate(activationLink) {
    const user = await UserModel.findOne({ activationLink });

    if (!user) throw ApiError.BadRequest("Wrong activation link!");

    user.isActivated = true;

    await user.save();
  }

  async login(email, password, host) {
    const user = await UserModel.findOne({ email });

    if (!user) throw ApiError.Forbidden(`User with email ${email} not found!`);

    const isPassEquals = await bcrypt.compare(password, user.password);

    if (!isPassEquals) throw ApiError.Forbidden("Wrong password!");

    if (!user.isActivated) throw ApiError.Forbidden(`Account ${email} is not activated yet!`);

    if (user.host.length && !user.host.includes(host)) {
      user.tmpHost = host;
      await user.save();

      const confirm = jwt.sign(
        `${email}-confirm`,
        process.env.JWT_CONFIRM_HOST_SECRET
      );

      const decline = jwt.sign(
        `${email}-decline`,
        process.env.JWT_CONFIRM_HOST_SECRET
      );

      const TO_ADDRESS = email;
      const FROM_NAME = 'Questify Support Team'
      const FROM_ADDRESS = process.env.SENDGRID_SENDER_EMAIL;
      const SUBJECT = 'New IP!';
      const TEXT_VERSION = `We detected autorize in your account from new IP. 
        <a href="${process.env.API_URL}/api/users/confirm-host/${confirm}">It was Me!</a> or 
        <a href="${process.env.API_URL}/api/users/confirm-host/${decline}">I didn't autorize, logout and change password!</a>`;
      const HTML_VERSION = checkNewHostEmail(
        `${process.env.API_URL}/api/users/confirm-host/${confirm}`,
        `${process.env.API_URL}/api/users/confirm-host/${decline}`
      );

      const msg = {
        to: TO_ADDRESS,
        from: {
          name: FROM_NAME,
          email: FROM_ADDRESS,
        },
        subject: SUBJECT,
        text: TEXT_VERSION,
        html: HTML_VERSION,
      }

      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      await sgMail.send(msg);
    }

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);

    return token;
  }

  async refresh(refreshToken) {
    console.log('service\authService.js:146 REFRESHTOKEN', refreshToken);

    if (!refreshToken) {
      console.log('service\authService.js:147 NO REFRESHTOKEN');
      throw ApiError.UnauthorizedError();
    }

    const userData = tokenService.validateRefreshToken(refreshToken);
    console.log('service\authService.js:152 userData =', userData);
    const tokenFromDb = await tokenService.findToken(refreshToken);
    console.log('service\authService.js:154 tokenFromDb =', tokenFromDb);

    if (!userData || !tokenFromDb) {
      console.log('service\authService.js:157 NO userData OR NO tokenFromDb');
      throw ApiError.UnauthorizedError();
    }

    const user = await UserModel.findById(userData.id);
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  async resetPassword(email) {
    const user = await UserModel.findOne({ email });

    if (!user) throw ApiError.BadRequest(`User with email: ${email} not found!`);

    const resetLink = uuid.v4(); // v34fa-asfasf-142saf-sa-asf

    user.resetLink = resetLink;

    await user.save();

    const TO_ADDRESS = email;
    const FROM_NAME = 'Questify Support Team'
    const FROM_ADDRESS = process.env.SENDGRID_SENDER_EMAIL;
    const SUBJECT = 'Reset Password!';
    const TEXT_VERSION = `Here is Your verification link - ${process.env.CLIENT_URL}/api/users/change-password/${resetLink}`;
    const HTML_VERSION = forgotPasswordEmail(
      `${process.env.CLIENT_URL}/api/users/change-password/${resetLink}`,
      user.name
    );

    const msg = {
      to: TO_ADDRESS,
      from: {
        name: FROM_NAME,
        email: FROM_ADDRESS,
      },
      subject: SUBJECT,
      text: TEXT_VERSION,
      html: HTML_VERSION,
    };

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    await sgMail.send(msg);

    return resetLink;
  }

  async changePassword(password, resetLink) {
    const user = await UserModel.findOne({ resetLink });

    if (!user) throw ApiError.BadRequest("User not found!");

    const hashPassword = await bcrypt.hash(password, 10);

    user.password = hashPassword;
    user.resetLink = null;

    await user.save();
  }

  async confirmHost(link) {
    const confirmation = jwt.decode(link, process.env.JWT_AGREE_SECRET);
    const email = confirmation.split("-")[0];
    const answer = confirmation.split("-")[1];
    console.log("email", email);

    const user = await UserModel.findOne({ email });
    console.log("user", user);

    if (answer === "decline") {
      console.log("user.id", user.id);
      const tokenFromDB = await TokenModel.findOne({ user: user.id });
      console.log("fitokenFromDBrst", tokenFromDB);
      tokenFromDB ? await this.logout(tokenFromDB.refreshToken) : false;
      user.tmpHost = null;

      const resetLink = uuid.v4(); // v34fa-asfasf-142saf-sa-asf

      user.resetLink = resetLink;

      await user.save();

      return resetLink;
    }

    user.host.push(user.tmpHost);
    user.tmpHost = null;
    user.save();

    return null;
  }
}

module.exports = new AuthService();
