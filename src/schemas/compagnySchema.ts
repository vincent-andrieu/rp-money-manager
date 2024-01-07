import Compagny from "@core/interfaces/compagny";
import compagnySchema from "@models/compagnyModel";
import TemplateSchema from "./templateSchema";

export default class CompagnySchema extends TemplateSchema<Compagny> {
    constructor() {
        super(Compagny, "compagnies", compagnySchema);
    }
}