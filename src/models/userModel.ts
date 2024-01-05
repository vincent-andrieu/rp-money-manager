import User from "@core/interfaces/user";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema<User>({
    bank: { type: mongoose.Schema.Types.ObjectId, ref: 'bank', required: true },
    whiteCash: { type: Number, default: 0 },
    blackCash: { type: Number, default: 0 }
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true
});

export default userSchema;