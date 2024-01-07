import PaiementLog from "@core/interfaces/paiementLog";
import paiementLogSchema from "@models/paiementLogModel";
import TemplateSchema from "./templateSchema";

export default class PaiementLogSchema extends TemplateSchema<PaiementLog> {
    constructor() {
        super(PaiementLog, "paiement-logs", paiementLogSchema);
    }
}