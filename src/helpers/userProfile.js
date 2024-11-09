import User from "../models/user.js";

export const getUserDetailsById = async (userId) => {
  const details = await User.findOne({
    _id: userId,
  }).lean();

  return details;
};

export const isUserPresent = async (userId) =>
  await getUserDetailsById(userId) ? true : false;
