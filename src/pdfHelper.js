'use strict'
const pdfLib = require('pdf-lib')
const fs = require('fs')
const moment = require('moment')

const genderTranslation = [
    {pdfCode: 3, value: 'F'},
    {pdfCode: 4, value: 'M'}
]

const employmentTranslation = [
    {pdfCode: 'Choice9', value: 'Retired'},
    {pdfCode: 13, value: 'Employed'}
]

const taxBracketTranslation = [
    {pdfCode: 26, value: 10},
    {pdfCode: 27, value: 12},
    {pdfCode: 28, value: 24},
    {pdfCode: 29, value: 32},
    {pdfCode: 30, value: 21},
    {pdfCode: 31, value: 35},
    {pdfCode: 32, value: 22},
    {pdfCode: 32, value: 37},
]

const getPdfForm = async (fileLocation) => {
    const fileData = fs.readFileSync(fileLocation)
    const pdfDoc = await pdfLib.PDFDocument.load(fileData)
    const form = pdfDoc.getForm()

    return form
}

const getText = (form, fieldName) => {
    let text = ''
    try {
        const textField = form.getTextField(fieldName)
        text = textField.getText()
    } catch (e) {
        console.log(e)
    }
    return text || null
}

const getRadioGroupSelection = (form, groupName) => {
    let selection = ''
    try {
        const group = form.getRadioGroup(groupName) 
        selection = group.getSelected()
    } catch (e) {
        console.log(e)
    }
    
    return selection || null
}

const getDropdownSelection = (form, dropdown) => {
    let selection = ''
    try {
        const component = form.getDropdown(dropdown) 
        selection = component.getSelected()
    } catch (e) {
        console.log(e)
    }
    return selection[0] || null
}

// translate values from the PDF values to values expected by the sheet
const doTranslations = (formContent) => {
    let primaryClient = formContent.primary_client
    let financialInformation = formContent.financial_information

    // Convert Gender from radio codes
    if(primaryClient.gender){
        primaryClient.gender = (genderTranslation.find((element) => element.pdfCode = primaryClient.gender)).value
    }

    // Convert Employment Status from Radio Codes
    if(primaryClient.employment_status) {
        primaryClient.employment_status = (employmentTranslation.find((element) => element.pdfCode = primaryClient.employment_status)).value
    }

    // convert Tax Bracket from Radio Codes
    if(financialInformation.tax_bracket) {
        financialInformation.tax_bracket = (taxBracketTranslation.find((element) => element.pdfCode == financialInformation.tax_bracket)).value
    }
}

// format inputs into acceptable format for upload
const reformat = (formContent) => {
    // strip dashes from SSN
    let primaryClient = formContent.primary_client
    let financialInfo = formContent.financial_information

    primaryClient.ssn = primaryClient.ssn.replaceAll('-','')

    // split name entry into first and last
    const full_name = primaryClient.full_name
    primaryClient.first_name = full_name.split(" ")[0]
    primaryClient.last_name = full_name.split(" ")[1]

    // reformat birthdate
    const birthDateDt = new Date(primaryClient.dob)
    const birthDate = moment(birthDateDt)
    primaryClient.dob = birthDate.format('MM/DD/YYYY')

    // reformat Address Line 2 into indivdual
    primaryClient.city = primaryClient.address2.split(',')[0]
    const stateZip = primaryClient.address2.split(',')[1].trim()
    primaryClient.state = stateZip.split(' ')[0].trim()
    primaryClient.zip = stateZip.split(' ')[1].trim()

    // strip dashes from Mobile Phone
    primaryClient.mobile = primaryClient.mobile.replaceAll('-','')

    // reformat license issue date
    const licenseIssueDt = new Date(primaryClient.license_issue_date)
    const licenseIssue = moment(licenseIssueDt)
    primaryClient.license_issue_date = licenseIssue.format('MM/DD/YYYY')

    // reformat annual income
    if(financialInfo.household_income){ 

        financialInfo.household_income.replaceAll(',','')

        if(financialInfo.household_income.indexOf('K') > -1 || financialInfo.household_income.indexOf ('k') > -1){
            financialInfo.household_income = financialInfo.household_income.replace('K','').replace('k','').replace('.','').trim()
            financialInfo.household_income = (financialInfo.household_income+='000').slice(0,5)
        }
        
        if(financialInfo.household_income.indexOf('M') > -1 || financialInfo.household_income.indexOf ('m') > -1){
            financialInfo.household_income = financialInfo.household_income.replace('M','').replace('m','').replace('.','').trim()
            financialInfo.household_income = (financialInfo.household_income+='000000').slice(0,7)
        }
    
    }

    // reformat salary
    if(financialInfo.salary) {

        financialInfo.salary.replaceAll(',','')

        if(financialInfo.salary.indexOf('K') > -1 || financialInfo.salary.indexOf ('k') > -1){
            financialInfo.salary = financialInfo.salary.replace('K','').replace('k','').replace('.','').trim()
            financialInfo.salary = (financialInfo.salary+='000').slice(0,5)
        }
        
        if(financialInfo.salary.indexOf('M') > -1 || financialInfo.salary.indexOf ('m') > -1){
            financialInfo.salary = financialInfo.salary.replace('M','').replace('m','').replace('.','').trim()
            financialInfo.salary = (financialInfo.salary+='000000').slice(0,7)
        }

    }

    // reformat net worth
    if(financialInfo.net_worth) {
        financialInfo.net_worth = ((financialInfo.net_worth.split('-')[1]).trim()).replace('$','').replaceAll(',','')
    }
    // reformat liquid net worth
    if(financialInfo.liquid_net_worth) {
        financialInfo.liquid_net_worth = ((financialInfo.liquid_net_worth.split('-')[1]).trim()).replace('$','').replaceAll(',','')
    }
}

module.exports = {getPdfForm, getText, getRadioGroupSelection, getDropdownSelection, reformat, doTranslations}