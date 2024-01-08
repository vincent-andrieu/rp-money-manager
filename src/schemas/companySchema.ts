import Company from "@core/interfaces/company";
import companySchema from "@models/companyModel";
import TemplateSchema from "./templateSchema";

export default class CompanySchema extends TemplateSchema<Company> {
    constructor() {
        super(Company, "companies", companySchema);
    }
}