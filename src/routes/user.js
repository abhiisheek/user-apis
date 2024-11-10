import express from "express";

import auth from "../middleware/auth.js";

import userController from "../controllers/user.controller.js";

const router = express.Router();

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.post("/change-password", userController.changePassword);
router.get("/:userId", auth, userController.getUser);
router.put("/:userId", auth, userController.updateUser);
router.get("/:userId/address", auth, userController.getAddresses);
router.get("/:userId/address/:addressId", auth, userController.getAddress);
router.put("/:userId/address/:addressId", auth, userController.updateAddress);
router.delete(
  "/:userId/address/:addressId",
  auth,
  userController.deleteAddress
);
router.post("/:userId/address", auth, userController.addAddress);
router.get("/:userId/orders", auth, userController.getOrders);
router.get("/:userId/wishlist", auth, userController.getWishlist);
router.put("/:userId/wishlist", auth, userController.addItemToWishlist);
router.delete(
  "/:userId/wishlist/:productId",
  auth,
  userController.removeItemFromWishlist
);

export default router;
