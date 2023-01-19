const jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const attemptLimiters = require("../middlewares/limiter.middleware").limiter;
const AccountModel = require("../models/account.model");
const { secret } = require("../config");
const { NotFound, Ok, TooManyIncorrectLoginAttempts, UsernameOccupied, EmailOccupied } = require("../helpers/response.helper");
const { dateAdd } = require("../helpers/date.helper");

module.exports = {
  register: async (req, res) => {
    const obj = new AccountModel(req.value.body);
    const user = await AccountModel.findOne({ email: obj.email });
    if (user) {
      return res.status(403).send(EmailOccupied);
    }
    bcrypt.genSalt(8, (err, salt) => {
      bcrypt.hash(obj.password, salt, async (err, hash) => {
        obj.password = hash;
        obj.createdAt = new Date().getTime();
        obj.modifiedAt = new Date().getTime();
        obj.emailConfirmed = false;
        const user = await obj.save();
        const token = jwt.sign({ user: user._id }, secret, { expiresIn: "12h" });
        const isSecureCookie = process.env.NODE_ENV === "production";
        res.cookie('Authorization', token, { expires: dateAdd(new Date(), 'hour', 8), path: "/", sameSite: "Strict", httpOnly: isSecureCookie, secure: isSecureCookie });
        res.status(200).send(Ok);
      });
    });
  },
  logout: async (req, res) => {
    const isSecureCookie = process.env.NODE_ENV === "production";
    res.cookie('Authorization', '', { expires: dateAdd(new Date(), 'hour', -8), path: "/", sameSite: "Strict", httpOnly: isSecureCookie, secure: isSecureCookie });
    res.status(200).send(Ok);
  },
  loginWithEmailAndPassword: async (req, res) => {
    if (!req.body.email || !req.body.password) {
      res.status(404).send(NotFound);
    }

    const usernameIPkey = `${req.body.email}_${req.ip}`;
    // rl = rateLimiter
    const rl = await attemptLimiters.loginAttemptLimiterRedis.get(usernameIPkey);
    await attemptLimiters.loginAttemptLimiterRedis.delete(usernameIPkey);
    if (rl !== null && rl.consumedPoints > 3) {
      const retrySecs = Math.round(rl.msBeforeNext / 1000) || 1;
      res.set('Retry-After', String(retrySecs));
      res.status(429).json(TooManyIncorrectLoginAttempts(Math.ceil(Math.round(retrySecs) / 60)));
      return;
    }
    let user = await AccountModel.findOne({ email: req.body.email });//.populate("role");
    if (user && user.emailConfirmed) {
      bcrypt.compare(req.body.password, user.password, async (err, success) => {
        if (success) {
          const token = jwt.sign({ user: user._id }, secret, { expiresIn: "8h" });
          await attemptLimiters.loginAttemptLimiterRedis.delete(usernameIPkey);
          user.password = undefined;
          const isSecureCookie = process.env.NODE_ENV === 'production';
          res.cookie('Authorization', token, { expires: dateAdd(new Date(), 'hour', 8), path: "/", sameSite: "Strict", httpOnly: isSecureCookie, secure: isSecureCookie });
          res.status(200).send(user)
        } else {
          try {
            await attemptLimiters.loginAttemptLimiterRedis.consume(usernameIPkey);
            res.status(404).send(NotFound);
          }
          catch (err) {
            if (err instanceof Error) {
              res.status(404).send(NotFound);
            } else {
              res.set('Retry-After', String(Math.round(err.msBeforeNext / 1000)) || 1);
              res.status(429).json(TooManyIncorrectLoginAttempts(Math.ceil(Math.round(err.msBeforeNext / 1000) / 60)));
            }
          }
        }
      })
    } else {
      res.status(404).send(NotFound);
    }
  },
  getInfo: async (req, res) => {
    const user = await AccountModel.findOne({ _id: req.decoded.user }, { password: 0 });
    if (user) {
      const { firstName, lastName, email, username} = user;
      const token = jwt.sign({ user: user._id }, secret, { expiresIn: "8h" });
      const isSecureCookie = process.env.NODE_ENV === 'production';
      res.cookie('Authorization', token, { expires: dateAdd(new Date(), 'hour', 8), path: "/", sameSite: "Strict", httpOnly: isSecureCookie, secure: isSecureCookie });
      res.status(200).send({ firstName, lastName, email, username });
    } else {
      res.status(404).send(NotFound);
    }
  },
  update: async (req, res) => {
    const userId = req.decoded.user;
    const content = req.value.body;
    const existingUser = await AccountModel.findOne({ username: content.username });

    if(!existingUser || (existingUser && userId === existingUser._id.toString())){
      content.modifiedAt = new Date().getTime();
      const objToSave = await AccountModel.findByIdAndUpdate(userId, content);
      const { firstName, lastName, email, username } = objToSave._doc;
      res.status(200).send({ firstName, lastName, email, username, ...content});
    } else {
      res.status(403).send(UsernameOccupied);
    }
  },
};