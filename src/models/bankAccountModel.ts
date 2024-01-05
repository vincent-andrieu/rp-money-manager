import BankAccount from "@core/interfaces/bankAccount";
import mongoose from "mongoose";

const bankAccountSchema = new mongoose.Schema<BankAccount>({
    balance: { type: Number, default: 0 }
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true
});

export default bankAccountSchema;