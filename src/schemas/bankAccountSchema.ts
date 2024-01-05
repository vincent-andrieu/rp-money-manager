import BankAccount from "@core/interfaces/bankAccount";
import { ObjectId } from "@core/utils";
import bankAccountSchema from "@models/bankAccountModel";
import TemplateSchema from "./templateSchema";

export default class BankAccountSchema extends TemplateSchema<BankAccount> {
    constructor() {
        super(BankAccount, "bankAccounts", bankAccountSchema);
    }

    public async pay(from: ObjectId, to: ObjectId, amount: number): Promise<void> {
        const session = await this._model.startSession();

        try {
            await session.withTransaction(async () => {
                const fromResult = await this._model.findByIdAndUpdate(from, { $inc: { balance: -amount } }, { new: true, session });

                if (!fromResult || new BankAccount(fromResult.toObject()).balance < 0) {
                    await session.abortTransaction();
                    throw "Not enough money";
                }

                const toResult = await this._model.findByIdAndUpdate(to, { $inc: { balance: amount } }, { session });

                if (!toResult) {
                    await session.abortTransaction();
                    throw new Error("Destination bank account not found");
                }
            });
        } finally {
            session.endSession();
        }
    }
}