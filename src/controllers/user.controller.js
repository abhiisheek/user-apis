import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import User from "../models/user.js";
import { Addresses, Address } from "../models/addresses.js";
import secret from "../utils/secret.js";
import { errorHandler } from "../utils/index.js";
import { getUserDetailsById, isUserPresent } from "../helpers/userProfile.js";

const signup = async (req, res) => {
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  const dob = req.body.dob;
  const gender = req.body.gender;
  const avatarURL = req.body.avatarURL;

  if (!email || !name || !password || !dob || !gender) {
    errorHandler(res, { message: "Bad Request - Payload not matching" }, 400);
    return;
  }

  User.find({ email })
    .exec()
    .then(
      async (docs) => {
        if (docs?.length) {
          errorHandler(
            res,
            { message: "User already exists. Please try loging in" },
            400
          );
        } else {
          const newUser = new User({
            _id: new mongoose.Types.ObjectId(),
            name,
            email,
            password,
            dob,
            gender,
            avatarURL,
          });

          await newUser.save();

          const token = jwt.sign(
            {
              exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
              data: { name: newUser.name, email: newUser.email },
            },
            secret.key
          );

          res.send(token);
        }
      },
      (err) => {
        errorHandler(res, err);
      }
    );
};

const login = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    errorHandler(res, { message: "Bad Request - Payload not matching" }, 400);
    return;
  }

  User.find({ email, password })
    .select("name email")
    .exec()
    .then(
      (docs) => {
        if (!docs?.length) {
          errorHandler(res, { message: "Login Failed!" }, 400);
        } else {
          const token = jwt.sign(
            {
              exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
              data: docs[0],
            },
            secret.key
          );

          res.send(token);
        }
      },
      (err) => {
        errorHandler(res, err);
      }
    );
};

const changePassword = async (req, res) => {
  const newPassword = req.body.newPassword;
  const oldPassword = req.body.oldPassword;
  const authorization = req.get("Authorization");

  const token = authorization.startsWith("Bearer ") && authorization.slice(7);

  if (!newPassword || !oldPassword) {
    errorHandler(res, { message: "Bad Request - Payload not matching" }, 400);
    return;
  }

  try {
    const data = jwt.verify(token, secret.key);

    const details = await User.findOne({
      email: data.data.email,
      password: oldPassword,
    }).lean();

    if (!details) {
      errorHandler(res, { message: "User details not matching" }, 400);
      return;
    }

    await User.findOneAndUpdate(
      { email: data.data.email },
      {
        password: newPassword,
      },
      {
        new: true,
      }
    );

    res.send("Success");
  } catch (err) {
    errorHandler(res, err);
  }
};

const getUser = async (req, res) => {
  const userId = req.params["userId"];

  if (!userId) {
    errorHandler(res, { message: "Bad Request - Payload not matching" }, 400);
    return;
  }

  User.find({ _id: userId })
    .select("name email dob gender avatarURL")
    .exec()
    .then(
      (docs) => {
        if (!docs?.length) {
          errorHandler(res, { message: "User not found!" }, 400);
        } else {
          res.send(docs[0]);
        }
      },
      (err) => {
        errorHandler(res, err);
      }
    );
};

const updateUser = async (req, res) => {
  const userId = req.params["userId"];

  const dob = req.body.dob;
  const gender = req.body.gender;
  const avatarURL = req.body.avatarURL;

  if (!userId) {
    errorHandler(res, { message: "Bad Request - Payload not matching" }, 400);
    return;
  }

  try {
    const details = await getUserDetailsById(userId);

    const updated = await User.findOneAndUpdate(
      { _id: userId },
      {
        dob: dob || details.dob,
        gender: gender || details.gender,
        avatarURL: avatarURL || details.avatarURL,
      },
      {
        new: true,
      }
    );

    res.send(updated);
  } catch (err) {
    errorHandler(res, err, 500);
  }
};

const addAddress = async (req, res) => {
  const userId = req.params["userId"];

  const street = req.body.street;
  const city = req.body.city;
  const pincode = req.body.pincode;
  const contactNumber = req.body.contactNumber;
  const name = req.body.name;

  if (!userId || !street || !city || !pincode || !contactNumber || !name) {
    errorHandler(res, { message: "Bad Request - Payload not matching" }, 400);
    return;
  }

  try {
    if (!isUserPresent(userId)) {
      errorHandler(res, { message: "User not found!" }, 400);
      return;
    }

    const userAddressRecord = await Addresses.findOne({ userId }).lean();

    const address = new Address({
      _id: new mongoose.Types.ObjectId(),
      street,
      city,
      pincode,
      contactNumber,
      name,
    });

    if (userAddressRecord) {
      if (userAddressRecord.addresses.find((item) => item.name === name)) {
        errorHandler(
          res,
          { message: "Address already exists for the user" },
          400
        );
        return;
      }

      const updatedRecord = await Addresses.findOneAndUpdate(
        { userId },
        {
          addresses: [...userAddressRecord.addresses, address],
          default: userAddressRecord.default || address,
        },
        {
          new: true,
        }
      );

      res.send(updatedRecord);
    } else {
      const newRecord = new Addresses({
        userId,
        default: address,
        addresses: [address],
      });

      await newRecord.save();

      res.send(newRecord);
    }
  } catch (err) {
    errorHandler(res, err, 500);
  }
};

const updateAddress = async (req, res) => {
  const userId = req.params["userId"];
  const addressId = req.params["addressId"];

  const street = req.body.street;
  const city = req.body.city;
  const pincode = req.body.pincode;
  const contactNumber = req.body.contactNumber;

  if (!userId || !street || !city || !pincode || !contactNumber || !addressId) {
    errorHandler(res, { message: "Bad Request - Payload not matching" }, 400);
    return;
  }

  try {
    if (!isUserPresent(userId)) {
      errorHandler(res, { message: "User not found!" }, 400);
      return;
    }

    const userAddressRecord = await Addresses.findOne({ userId }).lean();

    if (userAddressRecord) {
      if (!userAddressRecord.addresses.find((item) => item._id == addressId)) {
        errorHandler(res, { message: "User's Address not found!" }, 400);
        return;
      }

      const updatedAddresses = userAddressRecord.addresses.map((item) => {
        if (item._id == addressId) {
          return {
            ...item,
            street: street || item.street,
            city: city || item.city,
            pincode: pincode || item.pincode,
            contactNumber: contactNumber || item.contactNumber,
          };
        } else {
          return item;
        }
      });

      if (userAddressRecord.default._id == addressId) {
        userAddressRecord.default = updatedAddresses.find(
          (item) => item._id == addressId
        );
      }

      const updatedRecord = await Addresses.findOneAndUpdate(
        { userId },
        {
          addresses: updatedAddresses,
          default: userAddressRecord.default,
        },
        {
          new: true,
        }
      );

      res.send(updatedRecord);
    } else {
      errorHandler(res, { message: "User's Address not found!" }, 400);
      return;
    }
  } catch (err) {
    errorHandler(res, err, 500);
  }
};

const getAddresses = async (req, res) => {
  const userId = req.params["userId"];

  if (!userId) {
    errorHandler(res, { message: "Bad Request - Payload not matching" }, 400);
    return;
  }

  try {
    if (!isUserPresent(userId)) {
      errorHandler(res, { message: "User not found!" }, 400);
      return;
    }

    const userAddressRecord = await Addresses.findOne({ userId }).lean();

    if (userAddressRecord) {
      res.send(userAddressRecord);
    } else {
      errorHandler(res, { message: "User's Address not found!" }, 400);
      return;
    }
  } catch (err) {
    errorHandler(res, err, 500);
  }
};

const getAddress = async (req, res) => {
  const userId = req.params["userId"];
  const addressId = req.params["addressId"];

  if (!userId || !addressId) {
    errorHandler(res, { message: "Bad Request - Payload not matching" }, 400);
    return;
  }

  try {
    if (!isUserPresent(userId)) {
      errorHandler(res, { message: "User not found!" }, 400);
      return;
    }

    const userAddressRecord = await Addresses.findOne({ userId }).lean();

    if (userAddressRecord) {
      const address = userAddressRecord.addresses.find(
        (item) => item._id == addressId
      );

      if (address) {
        res.send(address);
      } else {
        errorHandler(res, { message: "User's Address not found!" }, 400);
        return;
      }
    } else {
      errorHandler(res, { message: "User's Address not found!" }, 400);
      return;
    }
  } catch (err) {
    errorHandler(res, err, 500);
  }
};

const deleteAddress = async (req, res) => {
  const userId = req.params["userId"];
  const addressId = req.params["addressId"];

  if (!userId || !addressId) {
    errorHandler(res, { message: "Bad Request - Payload not matching" }, 400);
    return;
  }

  try {
    if (!isUserPresent(userId)) {
      errorHandler(res, { message: "User not found!" }, 400);
      return;
    }

    const userAddressRecord = await Addresses.findOne({ userId }).lean();

    if (userAddressRecord) {
      if (!userAddressRecord.addresses.find((item) => item._id != addressId)) {
        errorHandler(res, { message: "User's Address not found!" }, 400);
        return;
      }

      const updatedAddresses = userAddressRecord.addresses.filter(
        (item) => item._id != addressId
      );

      if (userAddressRecord.default._id == addressId) {
        userAddressRecord.default = null;
      }

      const updatedRecord = await Addresses.findOneAndUpdate(
        { userId },
        {
          addresses: updatedAddresses,
          default: userAddressRecord.default,
        },
        {
          new: true,
        }
      );

      res.send(updatedRecord);
    } else {
      errorHandler(res, { message: "User's Address not found!" }, 400);
      return;
    }
  } catch (err) {
    errorHandler(res, err, 500);
  }
};

export default {
  signup,
  login,
  changePassword,
  getUser,
  updateUser,
  addAddress,
  getAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
};
