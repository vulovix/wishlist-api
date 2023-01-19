const router = require("express-promise-router")();
const { validateBody, schemas } = require("../helpers/route.helper");
const AccountController = require("../controllers/account.controller");
const tokenMiddleware = require("../middlewares/token.middleware");
const { login, register, update } = require("../schemas/account.schema");

router.route("/login").post([validateBody(login)], AccountController.loginWithEmailAndPassword);
router.route("/register")
  .post([validateBody(register)], AccountController.register);

router.use(tokenMiddleware);

router.route("/logout").post([], AccountController.logout);
router.route("/info").get([], AccountController.getInfo);
router.route("/update").patch([validateBody(update)], AccountController.update);

module.exports = router;