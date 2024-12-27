'use strict'

import fs from 'fs'
import {doTranslations, reformat, getPdfForm, getText, getRadioGroupSelection, getDropdownSelection} from './pdfHelper.js'
import {validate} from './pdfValidator.js'

const pdfFileName = process.argv[2]

const processForm = async (form, counter) => {

    const validationErrors = []
    let output = ''
    
    let primaryClient = {
        fullName: getText(form, 'Client Name'),
        gender: getRadioGroupSelection(form, 'GroupGender'),
        dob: getText(form, 'DOB'),
        ssn: getText(form, 'Social Security'),
        mobile: getText(form, 'Mobile'),
        email: getText(form, 'Email'),
        address1: getText(form, 'Address1'),
        address2: getText(form, 'Text5'),
        employer: getText(form, 'Employer'),
        industry: getText(form, 'Industry'),
        occupation: getText(form, 'Occupation'),
        licenseNumber: getText(form, 'License/Exp'),
        licenseIssueDate: getText(form, 'Date of Issue'),
        licenseState: getText(form, 'State'),
        employmentStatus: getRadioGroupSelection(form, 'Status'),
        retirementAge: getText(form, 'Retirement Age'),
        mailingAddress_same: 'Yes'
    }
    
    let financialInformation = {
        householdIncome: getText(form, 'HouseholdIncome'),
        salary:  getText(form, 'Salary'),
        netWorth: getDropdownSelection(form, 'Net Worth'),
        liquidNetWorth: getDropdownSelection(form, 'Liquid Net Worth'),
        taxBracket: getRadioGroupSelection(form, 'TaxBracket'),
        annuityYears: getText(form, 'Text35'),
        mutualYears: getText(form, 'Text36'),
        stockYears: getText(form, 'Text37'),
        bondYears: getText(form, 'Text38'),
        realEstateYears: getText(form, 'Real Estate Year'),
        checkSavingsYears: getText(form, 'Check Year'),
        insuranceYears: getText(form, 'Text40'),
        otherYears: getText(form, 'Text41'),
    }
    
    const formContent = {
        repId: getText(form, 'Text10'),
        clientType: 'Individual',
        residency: 'U.S. Citizen w/ a U.S. Address',
        citizenship_country: 'US',
        primaryClient: primaryClient,
        //secondary_client: secondary_client
        financialInformation: financialInformation
    }

    doTranslations(formContent)
    reformat(formContent)
    validate(formContent, validationErrors)

    output+=(counter || '1') + ','
    output+=(formContent.repId || '') + ','
    output+=(formContent.clientType || '') + ','
    output+=(formContent.primaryClient.firstName || '') + ','
    output+= ',' // skip field(s)
    output+=(formContent.primaryClient.lastName || '' ) + ','
    output+=',,' // skip field(s)
    output+=(formContent.primaryClient.mobile || '' ) + ','
    output+=',' // skip field(s)
    output+=(formContent.primaryClient.email || '' ) + ','
    output+=(formContent.residency || '' )+ ','
    output+=(formContent.primaryClient.ssn || '' ) + ','
    output+=',' // skip field(s)
    output+=(formContent.primaryClient.dob || '' ) + ','
    output+=(formContent.primaryClient.address1 || '' ) + ','
    output+=',' // skip field(s)
    output+=(formContent.primaryClient.city || '' ) + ','
    output+=(formContent.primaryClient.state || '' ) + ','
    output+=(formContent.primaryClient.zip || '' ) + ','
    output+=(formContent.citizenshipCountry || '' )+ ','
    output+=',,,,,,' // skip field(s)
    output+=',' // TODO: LICENSE ISSUE TYPE
    output+=(formContent.primaryClient.licenseState || '' ) + ','
    output+=(formContent.primaryClient.licenseNumber || '' ) + ','
    output+=(formContent.primaryClient.licenseIssueDate || '' ) + ','
    output+=',' // TODO: LICENSE EXIPRATION
    output+=',' // TODO: INDUSTRY AFFILIATION
    output+=(formContent.primaryClient.employmentStatus || '' ) + ','
    output+=(formContent.primaryClient.employerName || '' ) + ','
    output+=(formContent.primaryClient.industry || '' ) + ','
    output+=(formContent.primaryClient.occupation || '' ) + ','
    output+=',,,,,' // skip field(s)
    output+=(formContent.financialInformation.householdIncome || '' ) + ','
    output+=(formContent.financialInformation.netWorth || '' ) + ','
    output+=(formContent.financialInformation.liquidNetWorth || '' ) + ','
    output+=',,' // skip field(s)
    output+=(formContent.financialInformation.taxBracket || '' ) + ','
    output+=',' // skip field(s)
    output+=(formContent.financialInformation.annuityYears || '' ) + ','
    output+=(formContent.financialInformation.bondYears || '' ) + ','
    output+=',' // skip field(s)
    output+=(formContent.financialInformation.mutualYears || '' ) + ','
    output+=',,' // skip field(s)
    output+=(formContent.financialInformation.stockYears || '' ) + ','
    output+=(formContent.financialInformation.otherYears || '' ) + ','

    output+='\n'

    return {output: output, validationErrors: validationErrors}
    

}

const run = async (pdfFileName) => {

    let template = fs.readFileSync('./templates/ProspectContactsTemplate.csv', 'utf8')

    if(pdfFileName) {
        const fileData = await fs.readFileSync(pdfFileName)
        const form = await getPdfForm(fileData)
        console.log("processing file: " + pdfFileName)
        const result = await processForm(form)
        if(result.validationErrors.length > 0){
            console.log(result.validationErrors)
        }
        template += result.output

    } else {
        let fileNameArray = fs.readdirSync('./input')
        
        for(let i=0; i < fileNameArray.length; i++) {
            const form = await getPdfForm('./input/'+fileNameArray[i])
            console.log("processing " + fileNameArray[i])
            const result = await processForm(form, i+1)
            template += result.output
            if(result.validationErrors.length > 0){
                console.log(result.validationErrors)
            }
        }
    }

    fs.writeFileSync('./output/prospectImportFile.csv', template)
}


run(pdfFileName)

