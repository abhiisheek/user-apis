import express from "express";

import userController from "../controllers/user.controller.js";

const router = express.Router();

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.post("/change-password", userController.changePassword);
router.get("/:userId", userController.getUser);
router.put("/:userId", userController.updateUser);
router.get("/:userId/address", userController.getAddresses);
router.get("/:userId/address/:addressId", userController.getAddress);
router.put("/:userId/address/:addressId", userController.updateAddress);
router.delete("/:userId/address/:addressId", userController.deleteAddress);
router.post("/:userId/address", userController.addAddress);

export default router;
