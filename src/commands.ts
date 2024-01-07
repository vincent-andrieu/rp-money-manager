import BankAccount, { CashPaiementType } from "@core/interfaces/bankAccount";
import User from "@core/interfaces/user";
import { toObjectId } from "@core/utils";
import BankAccountSchema from "@schemas/bankAccountSchema";
import UserSchema from "@schemas/userSchema";
import TransactionService from "./services/transactionService";

export async function parseCommand(command: string): Promise<void> {
    const [cmd, ...args] = command.split(' ');
    const transactionService = new TransactionService();
    const userSchema = new UserSchema();
    const bankAccountSchema = new BankAccountSchema();

    try {
        switch (cmd.toLowerCase()) {
        case 'help':
            console.log('Available commands:');
            console.log('\thelp - show this help');
            console.log('\taddUser - add a user');
            console.log("\tdepositCash <userId> <amount> - deposit cash to a user's bank account");
            console.log('\twithdrawCash <userId> <amount> - withdraw cash from a user\'s bank account');
            console.log('\taddWhiteCash <userId> <amount> - add white cash to a user');
            console.log('\taddBlackCash <userId> <amount> - add black cash to a user');
            console.log('\tpayCash <fromUserId> <toUserId> <amount> [white|black|both] - pay cash from a user to another');
            console.log('\taddBalance <bankId> <amount> - add balance to a bank account');
            console.log('\tpay <bankSourceId> <bankDestinationId> <amount> - pay by card from a bank account to another');
            break;

        case 'adduser': {
            const userBank = await bankAccountSchema.add(new BankAccount({
                balance: 0
            }));

            if (!userBank._id)
                throw new Error("Failed to create bank account");
            const user = await userSchema.add(new User({
                bank: userBank._id,
                whiteCash: 0,
                blackCash: 0
            }));
            console.log("User created");
            console.log("\tUser", user._id?.toString());
            console.log("\tBank", user.bank.toString());
            break;
        }

        case 'depositcash':
            await transactionService.depositCash(toObjectId(args[0]), parseInt(args[1]));
            console.log("User", args[0], "deposited", args[1] + "$ at the bank");
            break;
        case 'withdrawcash':
            await transactionService.withdrawCash(toObjectId(args[0]), parseInt(args[1]));
            console.log("User", args[0], "withdrew", args[1] + "$ from the bank");
            break;
        case 'addwhitecash':
            await userSchema.addWhiteCash(toObjectId(args[0]), parseInt(args[1]));
            console.log("White cash added to user", args[0]);
            break;
        case 'addblackcash':
            await userSchema.addBlackCash(toObjectId(args[0]), parseInt(args[1]));
            console.log("Black cash added to user", args[0]);
            break;
        case 'paycash':
            await transactionService.payByCash(toObjectId(args[0]), toObjectId(args[1]), parseInt(args[2]), args[3] as CashPaiementType);
            console.log("User", args[0], "paid cash", args[2] + "$", "to user", args[1]);
            break;

        case 'addbalance':
            await bankAccountSchema.addBalance(toObjectId(args[0]), parseInt(args[1]));
            console.log(args[1] + "$ added to bank account", args[0]);
            break;
        case 'pay':
            await transactionService.payByCard(toObjectId(args[0]), toObjectId(args[1]), parseInt(args[2]));
            console.log("User", args[0], "paid by card", args[2] + "$", "to user", args[1]);
            break;

        default:
            console.log("Unknown command:", cmd);
            console.log("Type 'help' to see the available commands");
            break;
        }
    } catch (error) {
        console.error("Command failure:", error);
    }
}