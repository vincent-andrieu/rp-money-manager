import { ObjectId, isObjectId, toObjectId } from "@core/utils";
import BankAccount from "./bankAccount";
import TemplateObject, { NonTemplateObjectFunctions } from './templateObject';

export default class Company extends TemplateObject {

    public bank: BankAccount | ObjectId;

    constructor(obj: NonTemplateObjectFunctions<Company>) {
        super(obj);

        if (!(obj.bank instanceof BankAccount) && isObjectId(obj.bank))
            this.bank = toObjectId(obj.bank);
        else if (!(obj.bank instanceof ObjectId))
            this.bank = new BankAccount(obj.bank);
        else
            throw new Error("Bank must be an ObjectId or a BankAccount");

        this._validation();
    }

    protected _validation(): void {
        if (!(this.bank instanceof BankAccount) && !isObjectId(this.bank))
            throw new Error("[Company] Bank must be an ObjectId or a BankAccount");
    }

}