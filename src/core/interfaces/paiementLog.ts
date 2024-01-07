import { ObjectId, isObjectId } from "@core/utils";
import BankAccount from "./bankAccount";
import TemplateObject, { NonTemplateObjectFunctions } from './templateObject';

export default class PaiementLog extends TemplateObject {

    public source?: BankAccount | ObjectId;
    public destination: BankAccount | ObjectId;
    public amount: number;

    constructor(obj: NonTemplateObjectFunctions<PaiementLog>) {
        super(obj);

        if (obj.source)
            if (!(obj.source instanceof BankAccount) && isObjectId(obj.source))
                this.source = new ObjectId(obj.source);
            else if (!(obj.source instanceof ObjectId))
                this.source = new BankAccount(obj.source);
            else
                throw new Error("The source must be an ObjectId or a BankAccount");

        if (!(obj.destination instanceof BankAccount) && isObjectId(obj.destination))
            this.destination = new ObjectId(obj.destination);
        else if (!(obj.destination instanceof ObjectId))
            this.destination = new BankAccount(obj.destination);
        else
            throw new Error("The destination must be an ObjectId or a BankAccount");

        this.amount = obj.amount;

        this._validation();
    }

    protected _validation(): void {
        if (this.source && !(this.source instanceof BankAccount) && !isObjectId(this.source))
            throw new Error("[PaiementLog] The source must be an ObjectId or a BankAccount");
        if (!(this.destination instanceof BankAccount) && !isObjectId(this.destination))
            throw new Error("[PaiementLog] The destination must be an ObjectId or a BankAccount");
        if (typeof this.amount !== 'number' || this.amount < 0)
            throw new Error("[PaiementLog] Amount must be a positive number");
    }

}