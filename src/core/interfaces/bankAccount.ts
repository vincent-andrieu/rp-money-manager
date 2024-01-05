import TemplateObject, { NonTemplateObjectFunctions } from './templateObject';

export type CashPaiementType = 'white' | 'black' | 'both';

export default class BankAccount extends TemplateObject {

    public balance: number;

    constructor(obj: NonTemplateObjectFunctions<BankAccount>) {
        super(obj);

        this.balance = obj.balance;

        this._validation();
    }

    protected _validation(): void {
        if (typeof this.balance !== "number")
            throw new Error("[BankAccount] Balance must be a number");
    }

}