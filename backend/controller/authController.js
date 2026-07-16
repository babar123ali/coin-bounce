const Joi = require(`joi`);
const User = require(`../models/user`);
const bcrypt = require(`bcryptjs`);
const UserDto = require(`../dto/user`);
const JWTservice = require(`../services/JWTservice`);
const RefreshToken = require(`../models/token`);

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,25}$/;
const authController = {
  async register(req, res, next) {
    // 1. validate user input(we will use joi for validation)
    const userRegisterSchema = Joi.object({
      username: Joi.string().min(5).max(30).required(),
      name: Joi.string().max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().pattern(passwordPattern).required(),
      confirmPassword: Joi.string()
        .valid(Joi.ref("password"))
        .required()
        .messages({ "any.only": "Confirm password must match password" }),
    });

    const { error } = userRegisterSchema.validate(req.body);
    // 2. if error in validation -> return via middleware
    // note : if we do not do error handling than our node server will crash
    if (error) {
      return next(error);
    }
    // if email or username is already registered->return an error
    const { username, name, email, password } = req.body;
    try {
      const emailInUse = await User.exists({ email });
      const usernameInUse = await User.exists({ username });
      if (emailInUse) {
        const error = {
          status: 409,
          message: `email already registered`,
        };
        return next(error);
      }
      if (usernameInUse) {
        const error = {
          status: 409,
          message: `username already taken`,
        };
        return next(error);
      }
    } catch (error) {
      return next(error);
    }
    // 3. password hash
    const hashPassword = await bcrypt.hash(password, 10);
    // password -> abc123 => with bcrypt => df32u4r09fhkjsadlj~?>
    // once bycrpt -> irrversible
    //user login again -> we will coompare bycrpt with new bycrypt if same login if not , no login!
    // 4. store user data in db
    let accessToken;
    let refreshToken;
    let user;
    try {
      const userToRegister = new User({
        name,
        username,
        email,
        password: hashPassword,
      });
      user = await userToRegister.save();

      //token generation
      accessToken = JWTservice.signAccessToken({ _id: user._id }, `30m`);
      refreshToken = JWTservice.signRefreshToken({ _id: user._id }, `60m`);
    } catch (error) {
      return next(error);
    }
    //store refresh token
    await JWTservice.storeRefreshToken(refreshToken, user._id);
    // send token by cookie
    res.cookie(`accessToken`, accessToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });

    res.cookie(`refreshToken`, refreshToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });

    // 5. response send
    const userDto = new UserDto(user);
    return res.status(201).json({ user: userDto, auth: true });
  },

  //login work here
  async login(req, res, next) {
    //validation through joi
    const userLoginSchema = Joi.object({
      username: Joi.string().min(5).max(30).required(),
      password: Joi.string().pattern(passwordPattern).required(),
    });
    const { error } = userLoginSchema.validate(req.body);

    if (error) {
      return next(error);
    }

    const { username, password } = req.body;

    //match username

    let user;
    try {
      user = await User.findOne({ username: username });
      if (!user) {
        const error = {
          status: 401,
          message: `invalid username`,
        };
        return next(error);
      }
      // match password
      // match password with the hash password
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        const error = {
          status: 401,
          message: `incorrect password`,
        };
        return next(error);
      }
    } catch (error) {
      return next(error);
    }
    // generate tokens

    const accessToken = JWTservice.signAccessToken({ _id: user._id }, `30m`);
    const refreshToken = JWTservice.signRefreshToken({ _id: user._id }, `60m`);

    //update refresh token

    try {
      await RefreshToken.updateOne(
        {
          userId: user._id,
        },
        { token: refreshToken },
        { upsert: true },
      );
    } catch (error) {
      return next(error);
    }
    //send cookie
    res.cookie(`accessToken`, accessToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });

    res.cookie(`refreshToken`, refreshToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });

    const userDto = new UserDto(user);
    return res.status(200).json({ user: userDto, auth: true });
  },

  // logout

  async logout(req, res, next) {
    const { refreshToken } = req.cookies;
    //delete refresh token from db
    try {
      await RefreshToken.deleteOne({
        token: refreshToken,
      });
    } catch (error) {
      return next(error);
    }

    //delete cookies
    res.clearCookie(`accessToken`);
    res.clearCookie(`refreshToken`);
    //response

    res.status(200).json({ user: null, auth: false });
  },

  // refresh

  async refresh(req, res, next) {
    // get refresh token from cookies
    // verify refresh token
    // generate new token
    // update db, response

    const originalRefreshToken = req.cookies.refreshToken;

    let id;
    try {
      id = JWTservice.verifyRefreshToken(originalRefreshToken)._id;
    } catch (e) {
      const error = {
        status: 401,
        message: "Unauthorized",
      };
      return next(error);
    }

    try {
      const match = await RefreshToken.findOne({
        userId: id,
        token: originalRefreshToken,
      });

      if (!match) {
        const error = {
          status: 401,
          message: `Unauthorized`,
        };

        return next(error);
      }
    } catch (e) {
      return next(e);
    }

    try {
      const accessToken = JWTservice.signAccessToken({ _id: id }, `30m`);
      const refreshToken = JWTservice.signRefreshToken({ _id: id }, `60m`);

      await RefreshToken.updateOne(
        { userId: id, token: originalRefreshToken }, // Find the specific one
        { token: refreshToken }, // Replace with new one
      );

      res.cookie(`accessToken`, accessToken, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
      });

      res.cookie(`refreshToken`, refreshToken, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
      });
    } catch (e) {
      return next(e);
    }

    const user = await User.findOne({ _id: id });

    const userDto = new UserDto(user);

    return res.status(200).json({ user: userDto, auth: true });
  },
};

module.exports = authController;
