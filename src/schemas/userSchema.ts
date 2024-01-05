import { CashPaiementType } from "@core/interfaces/bankAccount";
import User from "@core/interfaces/user";
import { ObjectId } from "@core/utils";
import userSchema from "@models/userModel";
import TemplateSchema from "./templateSchema";

export default class UserSchema extends TemplateSchema<User> {
    constructor() {
        super(User, "users", userSchema);
    }

    public async addWhiteCash(id: ObjectId, amount: number): Promise<void> {
        await this._model.findByIdAndUpdate(id, { $inc: { whiteCash: amount } });
    }

    public async addBlackCash(id: ObjectId, amount: number): Promise<void> {
        await this._model.findByIdAndUpdate(id, { $inc: { blackCash: amount } });
    }

    public async payCash(from: ObjectId, to: ObjectId, amount: number, cashType: CashPaiementType = 'both'): Promise<void> {
        switch (cashType) {
        case 'white':
            await this._payWhiteCash(from, to, amount);
            break;

        case 'black':
            await this._payBlackCash(from, to, amount);
            break;

        case 'both':
            await this._payBothCash(from, to, amount);
            break;
        }
    }

    private async _payWhiteCash(from: ObjectId, to: ObjectId, amount: number): Promise<void> {
        const session = await this._model.startSession();

        try {
            await session.withTransaction(async () => {
                const fromResult = await this._model.findByIdAndUpdate(from, { $inc: { whiteCash: -amount } }, { new: true, session });

                if (!fromResult || new User(fromResult.toObject()).whiteCash < 0) {
                    await session.abortTransaction();
                    throw "Not enough whiteCash";
                }

                const toResult = await this._model.findByIdAndUpdate(to, { $inc: { whiteCash: amount } }, { session });

                if (!toResult) {
                    await session.abortTransaction();
                    throw new Error("Destination user not found");
                }
            });
        } finally {
            await session.endSession();
        }
    }

    private async _payBlackCash(from: ObjectId, to: ObjectId, amount: number): Promise<void> {
        const session = await this._model.startSession();

        try {
            await session.withTransaction(async () => {
                const fromResult = await this._model.findByIdAndUpdate(from, { $inc: { blackCash: -amount } }, { new: true, session });

                if (!fromResult || new User(fromResult.toObject()).blackCash < 0) {
                    await session.abortTransaction();
                    throw "Not enough blackCash";
                }

                const toResult = await this._model.findByIdAndUpdate(to, { $inc: { blackCash: amount } }, { session });

                if (!toResult) {
                    await session.abortTransaction();
                    throw new Error("Destination user not found");
                }
            });
        } finally {
            session.endSession();
        }
    }

    private async _payBothCash(from: ObjectId, to: ObjectId, amount: number): Promise<void> {
        const session = await this._model.startSession();

        try {
            await session.withTransaction(async () => {
                const fromQuery = await this._model.findById(from).session(session);
                if (!fromQuery)
                    throw new Error("Source user not found");

                let fromUser = new User(fromQuery.toObject());
                const blackAmount = amount < fromUser.blackCash ? amount : fromUser.blackCash;
                const whiteAmount = amount - blackAmount;
                const fromResult = await this._model.findByIdAndUpdate(from, {
                    $inc: {
                        blackCash: -blackAmount,
                        whiteCash: -whiteAmount
                    }
                },
                { new: true, session });

                if (!fromResult) {
                    await session.abortTransaction();
                    throw new Error("Source user not found");
                }
                fromUser = new User(fromResult.toObject());
                if (fromUser.whiteCash < 0 || fromUser.blackCash < 0) {
                    await session.abortTransaction();
                    throw "Not enough cash";
                }

                const toResult = await this._model.findByIdAndUpdate(to, {
                    $inc: {
                        blackCash: blackAmount,
                        whiteCash: whiteAmount
                    }
                },
                { session });

                if (!toResult) {
                    await session.abortTransaction();
                    throw new Error("Destination user not found");
                }
            });
        } finally {
            session.endSession();
        }
    }
}