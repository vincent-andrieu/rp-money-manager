import { ObjectId, isObjectId, toObjectId } from "@core/utils";
import BankAccount from "./bankAccount";
import TemplateObject, { NonTemplateObjectFunctions } from "./templateObject";

export default class User extends TemplateObject {

    public bank: BankAccount | ObjectId;
    public whiteCash: number;
    public blackCash: number;

    constructor(obj: NonTemplateObjectFunctions<User>) {
        super(obj);

        if (!(obj.bank instanceof BankAccount) && isObjectId(obj.bank))
            this.bank = toObjectId(obj.bank);
        else if (!(obj.bank instanceof ObjectId))
            this.bank = new BankAccount(obj.bank);
        else
            throw new Error("Bank must be an ObjectId or a BankAccount");
        this.whiteCash = obj.whiteCash;
        this.blackCash = obj.blackCash;

        this._validation();
    }

    protected _validation(): void {
        if (!(this.bank instanceof BankAccount) && !isObjectId(this.bank))
            throw new Error("[User] Bank must be an ObjectId or a BankAccount");
        if (typeof this.whiteCash !== "number")
            throw new Error("[User] White balance must be a number");
        if (typeof this.blackCash !== "number")
            throw new Error("[User] Black balance must be a number");
    }

}