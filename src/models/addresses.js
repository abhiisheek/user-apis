import mongoose from "mongoose";

const addressSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  pincode: { type: Number, required: true },
  contactNumber: { type: Number, required: true },
});

const addressesSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  default: { type: addressSchema },
  addresses: [{ type: addressSchema }],
});

export const Address = mongoose.model("Address", addressSchema);
export const Addresses = mongoose.model("Addresses", addressesSchema);
