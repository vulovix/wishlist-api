const router = require("express-promise-router")();
const { validateBody, validateParams } = require("../helpers/route.helper");
const wishSchema = require("../schemas/wishlist.schema");
const commonSchema = require("../schemas/common.schema");
const tokenMiddleware = require("../middlewares/token.middleware");
const WishlistController = require("../controllers/wishlist.controller");


router
  .route("/:id")
  .get(
    [validateParams(commonSchema.username, "id")],
    WishlistController.listForUser
  );

router.use(tokenMiddleware);

router
  .route("/")
  .get(WishlistController.list)
  .post([validateBody(wishSchema.create)], WishlistController.create);

router
  .route("/fetch")
  .post([validateBody(wishSchema.fetch)], WishlistController.fetch);

router.route("/all").get(WishlistController.listAll);

router
  .route("/:id")
  .patch(
    [
      validateParams(commonSchema.objectId, "id"),
      validateBody(wishSchema.update),
    ],
    WishlistController.update
  )
  .delete(
    [validateParams(commonSchema.objectId, "id")],
    WishlistController.remove
  );

module.exports = router;
