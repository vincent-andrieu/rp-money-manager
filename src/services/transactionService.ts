import { CashPaiementType } from "@core/interfaces/bankAccount";
import PaiementLog from "@core/interfaces/paiementLog";
import { ObjectId, getObjectId } from "@core/utils";
import BankAccountSchema from "@schemas/bankAccountSchema";
import CompanySchema from "@schemas/companySchema";
import PaiementLogSchema from "@schemas/paiementLogSchema";
import UserSchema from "@schemas/userSchema";
import mongoose from "mongoose";

export default class TransactionService {
    public paiementLogSchema: PaiementLogSchema = new PaiementLogSchema();
    public userSchema: UserSchema = new UserSchema();
    public companySchema: CompanySchema = new CompanySchema();
    public bankAccountSchema: BankAccountSchema = new BankAccountSchema();

    public async depositCashToCompany(userId: ObjectId, companyId: ObjectId, amount: number): Promise<void> {
        const session = await mongoose.startSession();

        try {
            let bankId: ObjectId | undefined = undefined;

            await session.withTransaction(async () => {
                const [, company] = await Promise.all([
                    this.userSchema.removeBothCash(userId, amount, session),
                    this.companySchema.get(companyId, 'bank')
                ]);

                bankId = getObjectId(company.bank);
                await this.bankAccountSchema.addBalance(bankId, amount, session);
            });

            if (bankId)
                this.paiementLogSchema.add(new PaiementLog({
                    destination: bankId,
                    amount
                }));
        } finally {
            session.endSession();
        }
    }

    public async depositCash(userId: ObjectId, amount: number): Promise<void> {
        const session = await mongoose.startSession();

        try {
            let bankId: ObjectId | undefined = undefined;

            await session.withTransaction(async () => {
                const user = await this.userSchema.removeWhiteCash(userId, amount, session);

                if (user.whiteCash < 0) {
                    await session.abortTransaction();
                    throw "Not enough whiteCash";
                }

                bankId = getObjectId(user.bank);
                await this.bankAccountSchema.addBalance(bankId, amount);
            });

            if (bankId)
                this.paiementLogSchema.add(new PaiementLog({
                    destination: bankId,
                    amount
                }));
        } finally {
            session.endSession();
        }
    }

    public async withdrawCash(userId: ObjectId, amount: number): Promise<void> {
        const session = await mongoose.startSession();

        try {
            await session.withTransaction(async () => {
                const user = await this.userSchema.addWhiteCash(userId, amount, session);
                const bankAccount = await this.bankAccountSchema.removeBalance(getObjectId(user.bank), amount, session);

                if (bankAccount.balance < 0) {
                    await session.abortTransaction();
                    throw "Not enough money";
                }
            });
        } finally {
            session.endSession();
        }
    }

    public async payByCash(userSource: ObjectId, userDestination: ObjectId, amount: number, type?: CashPaiementType): Promise<void> {
        await this.userSchema.pay(userSource, userDestination, amount, type);
    }

    public async payByCard(bankSource: ObjectId, bankDestination: ObjectId, amount: number): Promise<void> {
        await this.bankAccountSchema.pay(bankSource, bankDestination, amount);
        this.paiementLogSchema.add(new PaiementLog({
            source: bankSource,
            destination: bankDestination,
            amount
        }));
    }
}