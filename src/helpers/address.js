import { Addresses } from "../models/addresses.js";

export const getAddressByUserId = async (userId) =>
  await Addresses.findOne({ userId }).lean();

export const getAddressRecordByName = (addressList, name) =>
  addressList.find((item) => item.name === name);

export const getAddressRecordById = (addressList, id) =>
  addressList.find((item) => item._id == id);
