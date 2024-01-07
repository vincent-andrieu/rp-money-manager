import Compagny from "@core/interfaces/compagny";
import mongoose from "mongoose";

const compagnySchema = new mongoose.Schema<Compagny>({
    bank: { type: mongoose.Schema.Types.ObjectId, ref: "bank", required: true }
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true
});

export default compagnySchema;