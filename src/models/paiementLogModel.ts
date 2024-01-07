import mongoose from "mongoose";

import PaiementLog from "@core/interfaces/paiementLog";

const paiementLogSchema = new mongoose.Schema<PaiementLog>({
    source: { type: mongoose.Schema.Types.ObjectId, ref: 'bank' },
    destination: { type: mongoose.Schema.Types.ObjectId, ref: 'bank', required: true },
    amount: { type: Number, required: true }
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: {
        createdAt: true,
        updatedAt: false
    }
});

export default paiementLogSchema;