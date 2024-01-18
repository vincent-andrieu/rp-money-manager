import { ClientSession } from "mongoose";

import { CashPaiementType } from "@core/interfaces/bankAccount";
import User from "@core/interfaces/user";
import { ObjectId } from "@core/utils";
import userSchema from "@models/userModel";
import TemplateSchema from "./templateSchema";

export default class UserSchema extends TemplateSchema<User> {
    constructor() {
        super(User, "users", userSchema);
    }

    public async addWhiteCash(id: ObjectId, amount: number, session?: ClientSession): Promise<User> {
        const result = await this._model.findByIdAndUpdate(id, { $inc: { whiteCash: amount } }, { new: true, session });

        if (!result)
            throw new Error("User not found");
        return new User(result.toObject());
    }

    public async addBlackCash(id: ObjectId, amount: number): Promise<void> {
        const result = await this._model.findByIdAndUpdate(id, { $inc: { blackCash: amount } });

        if (!result)
            throw new Error("User not found");
    }

    public async removeWhiteCash(id: ObjectId, amount: number, session?: ClientSession): Promise<User> {
        const result = await this._model.findByIdAndUpdate(id, { $inc: { whiteCash: -amount } }, { new: true, session });

        if (!result)
            throw new Error("User not found");
        return new User(result.toObject());
    }

    public async removeBothCash(id: ObjectId, amount: number, session?: ClientSession): Promise<{
        user: User,
        removedBlackCash: number,
        removedWhiteCash: number
    }> {
        const userResult = await this._model.findById(id, 'blackCash').session(session || null);
        if (!userResult)
            throw new Error("Source user not found");

        let user = new User(userResult.toObject());
        const blackAmount = amount < user.blackCash ? amount : user.blackCash;
        const whiteAmount = amount - blackAmount;
        const editedUserResult = await this._model.findByIdAndUpdate(id, {
            $inc: {
                blackCash: -blackAmount,
                whiteCash: -whiteAmount
            }
        },
        { new: true, session });

        if (!editedUserResult) {
            await session?.abortTransaction();
            throw new Error("Source user not found");
        }
        user = new User(editedUserResult.toObject());
        if (user.whiteCash < 0 || user.blackCash < 0) {
            await session?.abortTransaction();
            throw "Not enough cash";
        }
        return {
            user,
            removedBlackCash: blackAmount,
            removedWhiteCash: whiteAmount
        };
    }

    public async pay(from: ObjectId, to: ObjectId, amount: number, cashType: CashPaiementType = 'both'): Promise<void> {
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
                const { removedBlackCash, removedWhiteCash } = await this.removeBothCash(from, amount, session);

                const toResult = await this._model.findByIdAndUpdate(to, {
                    $inc: {
                        blackCash: removedBlackCash,
                        whiteCash: removedWhiteCash
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