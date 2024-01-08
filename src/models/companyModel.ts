import Company from "@core/interfaces/company";
import mongoose from "mongoose";

const companySchema = new mongoose.Schema<Company>({
    bank: { type: mongoose.Schema.Types.ObjectId, ref: "bank", required: true }
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true
});

export default companySchema;