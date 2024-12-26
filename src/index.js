'use strict'

const pdfHelper = require('./pdfHelper')
const pdfValidations = require('./pdfValidator')
const fs = require('fs')

const pdfFileName = process.argv[2]

const run = async () => {

    let fileNameArray = fs.readdirSync('./input')
    let template = fs.readFileSync('./templates/ProspectContactsTemplate.csv', 'utf8')

    for(let i=0; i<fileNameArray.length; i++) {

        const validationErrors = []
        
        console.log("processing file: " + fileNameArray[i])
        const form = await pdfHelper.getPdfFromLocation('./input/'+fileNameArray[i])
    
        let primary_client = {
            full_name: pdfHelper.getText(form, 'Client Name'),
            gender: pdfHelper.getRadioGroupSelection(form, 'GroupGender'),
            dob: pdfHelper.getText(form, 'DOB'),
            ssn: pdfHelper.getText(form, 'Social Security'),
            mobile: pdfHelper.getText(form, 'Mobile'),
            email: pdfHelper.getText(form, 'Email'),
            address1: pdfHelper.getText(form, 'Address1'),
            address2: pdfHelper.getText(form, 'Text5'),
            employer: pdfHelper.getText(form, 'Employer'),
            industry: pdfHelper.getText(form, 'Industry'),
            occupation: pdfHelper.getText(form, 'Occupation'),
            license_number: pdfHelper.getText(form, 'License/Exp'),
            license_issue_date: pdfHelper.getText(form, 'Date of Issue'),
            license_state: pdfHelper.getText(form, 'State'),
            employment_status: pdfHelper.getRadioGroupSelection(form, 'Status'),
            retirement_age: pdfHelper.getText(form, 'Retirement Age'),
            mailing_address_same: 'Yes'
        }
    
        let financial_information = {
            household_income: pdfHelper.getText(form, 'HouseholdIncome'),
            salary:  pdfHelper.getText(form, 'Salary'),
            net_worth: pdfHelper.getDropdownSelection(form, 'Net Worth'),
            liquid_net_worth: pdfHelper.getDropdownSelection(form, 'Liquid Net Worth'),
            tax_bracket: pdfHelper.getRadioGroupSelection(form, 'TaxBracket'),
            annuity_years: pdfHelper.getText(form, 'Text35'),
            mutual_years: pdfHelper.getText(form, 'Text36'),
            stock_years: pdfHelper.getText(form, 'Text37'),
            bond_years: pdfHelper.getText(form, 'Text38'),
            re_years: pdfHelper.getText(form, 'Real Estate Year'),
            chk_sav_years: pdfHelper.getText(form, 'Check Year'),
            insurance_years: pdfHelper.getText(form, 'Text40'),
            other_years: pdfHelper.getText(form, 'Text41'),

        }
    
        const formContent = {
            rep_id: pdfHelper.getText(form, 'Text10'),
            client_type: 'Individual',
            residency: 'U.S. Citizen w/ a U.S. Address',
            citizenship_country: 'US',
            primary_client: primary_client,
            //secondary_client: secondary_client
            financial_information: financial_information
        }
    
        pdfHelper.doTranslations(formContent)
        pdfHelper.reformat(formContent)
        pdfValidations.validate(formContent, validationErrors)
    
        if(validationErrors.length > 0) {
            console.log(validationErrors)
        }

        template+=(i+1)+','
        template+=(formContent.rep_id || '') + ','
        template+=(formContent.client_type || '') + ','
        template+=(formContent.primary_client.first_name || '') + ','
        template+= ',' // skip field(s)
        template+=(formContent.primary_client.last_name || '' ) + ','
        template+=',,' // skip field(s)
        template+=(formContent.primary_client.mobile || '' ) + ','
        template+=',' // skip field(s)
        template+=(formContent.primary_client.email || '' ) + ','
        template+=(formContent.residency || '' )+ ','
        template+=(formContent.primary_client.ssn || '' ) + ','
        template+=',' // skip field(s)
        template+=(formContent.primary_client.dob || '' ) + ','
        template+=(formContent.primary_client.address1 || '' ) + ','
        template+=',' // skip field(s)
        template+=(formContent.primary_client.city || '' ) + ','
        template+=(formContent.primary_client.state || '' ) + ','
        template+=(formContent.primary_client.zip || '' ) + ','
        template+=(formContent.citizenship_country || '' )+ ','
        template+=',,,,,,' // skip field(s)
        template+=',' // TODO: LICENSE ISSUE TYPE
        template+=(formContent.primary_client.license_state || '' ) + ','
        template+=(formContent.primary_client.license_number || '' ) + ','
        template+=(formContent.primary_client.license_issue_date || '' ) + ','
        template+=',' // TODO: LICENSE EXIPRATION
        template+=',' // TODO: INDUSTRY AFFILIATION
        template+=(formContent.primary_client.employment_status || '' ) + ','
        template+=(formContent.primary_client.employer_name || '' ) + ','
        template+=(formContent.primary_client.industry || '' ) + ','
        template+=(formContent.primary_client.occupation || '' ) + ','
        template+=',,,,,' // skip field(s)
        template+=(formContent.financial_information.household_income || '' ) + ',' // TODO: SHOULD THIS BE HOUSEHOLD INCOME OR SALARY?
        template+=(formContent.financial_information.net_worth || '' ) + ','
        template+=(formContent.financial_information.liquid_net_worth || '' ) + ','
        template+=',,' // skip field(s)
        template+=(formContent.financial_information.tax_bracket || '' ) + ','
        template+=',' // skip field(s)
        template+=(formContent.financial_information.annuity_years || '' ) + ','
        template+=(formContent.financial_information.bond_years || '' ) + ','
        template+=',' // skip field(s)
        template+=(formContent.financial_information.mutual_years || '' ) + ','
        template+=',,' // skip field(s)
        template+=(formContent.financial_information.stock_years || '' ) + ','
        template+=(formContent.financial_information.other_years || '' ) + ','




        template+='\n'
    }
    

    fs.writeFileSync('./output/prospectImportFile.csv', template)
        
}

run()
