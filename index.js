'use strict'

const pdfLib = require('pdf-lib')
const fs = require('fs')
const moment = require('moment')
const prospectValidValues = require('./prospectValidValues')

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

const run = async () => {

    const fileData = fs.readFileSync('./client_ticket.pdf')
    const validationErrors = []
    const pdfDoc = await pdfLib.PDFDocument.load(fileData)
    const form = pdfDoc.getForm()

    const validateLength = (text, length) => {
        if (text.length != length){
            validationErrors.push(text + ' is not the correct length of ' + length + ' characters')
        }
    }

    const validateContentType = (text, type) => {
        const ALPHANUMERIC_PATTERN = new RegExp('^[a-zA-Z0-9 ]*$')
        const ALPHA_PATTERN = new RegExp('^[a-zA-Z ]*$')
        const NUMERIC_PATTERN = new RegExp('^[0-9]*$')
        const EMAIL_PATTERN = new RegExp('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$')

        if (type == 'alphanumeric') {
            if(!ALPHANUMERIC_PATTERN.test(text)) {
                validationErrors.push(text + ' is not alphanumeric')
            }
        } else if (type == 'alpha') {
            if(!ALPHA_PATTERN.test(text)) {
                validationErrors.push(text + ' is not alpha')
            }
        } else if (type == 'numeric') {
            if(!NUMERIC_PATTERN.test(text)) {
                validationErrors.push(text + ' is not numeric')
            }
        } else if (type = 'email') {
            if(!EMAIL_PATTERN.test(text)) {
                validationErrors.push(text + ' is not a valid email')
            }
        } else {
            console.log("unknown content type: " + type)
        }
    }

    const validate = (formContent) => {
        
        let primaryClient = formContent.primary_client

        // validate rep_id
        validateLength(formContent.rep_id, 4)
        validateContentType(formContent.rep_id, 'alphanumeric')

        // validate SSN
        validateLength(primaryClient.ssn, 9)
        validateContentType(primaryClient.ssn, 'numeric')

        // validate Name
        validateContentType(primaryClient.first_name, 'alpha')
        validateContentType(primaryClient.last_name, 'alpha')

        // validate City
        validateContentType(primaryClient.city, 'alpha')

        // vaidate State
        if(!prospectValidValues.states.includes(primaryClient.state)){
            validationErrors.push('State code provided is not valid')
        }

        // validate ZIP
        validateLength(primaryClient.zip, 5)
        validateContentType(primaryClient.zip, 'numeric')

        // validate Mobile
        validateLength(primaryClient.mobile, 10)
        validateContentType(primaryClient.mobile, 'numeric')

        // validate Mobile
        validateContentType(primaryClient.email, 'email')

        // validate License State
        if(!prospectValidValues.states.includes(primaryClient.license_state)){
            validationErrors.push('License State code provided is not valid')
        }

    }

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
    
    const reformat = (formContent) => {
        // strip dashes from SSN
        let primaryClient = formContent.primary_client
        primaryClient.ssn = primaryClient.ssn.replaceAll('-','')

        // split name entry into first and last
        const full_name = primaryClient.full_name
        primaryClient.first_name = full_name.split(" ")[0]
        primaryClient.last_name = full_name.split(" ")[1]

        // reformat birthdate
        const birthDate = moment(primaryClient.dob)
        primaryClient.dob = birthDate.format('MM/DD/YYYY')

        // reformat Address Line 2 into indivdual
        primaryClient.city = primaryClient.address2.split(',')[0]
        const stateZip = primaryClient.address2.split(',')[1].trim()
        primaryClient.state = stateZip.split(' ')[0].trim()
        primaryClient.zip = stateZip.split(' ')[1].trim()

        // strip dashes from Mobile Phone
        primaryClient.mobile = primaryClient.mobile.replaceAll('-','')

        // reformat license issue date
        const licenseIssue = moment(primaryClient.license_issue_date)
        primaryClient.license_issue_date = licenseIssue.format('MM/DD/YYYY')

        // reformat net worth
        if(formContent.financial_information.net_worth) {
            formContent.financial_information.net_worth = ((formContent.financial_information.net_worth.split('-')[1]).trim()).replace('$','')
        }
        // reformat liquid net worth
        if(formContent.financial_information.liquid_net_worth) {
            formContent.financial_information.liquid_net_worth = ((formContent.financial_information.liquid_net_worth.split('-')[1]).trim()).replace('$','')
        }
    }

    const getText = (fieldName) => {
        let text = ''
        try {
            const textField = form.getTextField(fieldName)
            text = textField.getText()
        } catch (e) {
            console.log(e)
        }
        return text || null
    }

    const getRadioGroupSelection = (groupName) => {
        let selection = ''
        try {
            const group = form.getRadioGroup(groupName) 
            selection = group.getSelected()
        } catch (e) {
            console.log(e)
        }
        
        return selection || null
    }

    const getDropdownSelection = (dropdown) => {
        let selection = ''
        try {
            const component = form.getDropdown(dropdown) 
            selection = component.getSelected()
        } catch (e) {
            console.log(e)
        }
        return selection[0] || null
    }


    let primary_client = {
        full_name: getText('Client Name'),
        gender: getRadioGroupSelection('GroupGender'),
        dob: getText('DOB'),
        ssn: getText('Social Security'),
        mobile: getText('Mobile'),
        email: getText('Email'),
        address1: getText('Address1'),
        address2: getText('Text5'),
        employer: getText('Employer'),
        industry: getText('Industry'),
        occupation: getText('Occupation'),
        license_number: getText('License/Exp'),
        license_issue_date: getText('Date of Issue'),
        license_state: getText('State'),
        employment_status: getRadioGroupSelection('Status'),
        retirement_age: getText('Retirement Age'),
        mailing_address_same: 'Yes'
    }

    let financial_information = {
        household_income: getText('HouseholdIncome'),
        salary:  getText('Salary'),
        net_worth: getDropdownSelection('Net Worth'),
        liquid_net_worth: getDropdownSelection('Liquid Net Worth'),
        tax_bracket: getRadioGroupSelection('TaxBracket')
    }

    /*
    let secondary_client = {
        type: getRadioGroupSelection('GroupMarriage2'),
        name: getText('Text1'),
        gender: getRadioGroupSelection('GroupGender2'),
        dob: getText('Text2'),
        ssn: getText('Text14'),
        mobile: getText('Text15'),
        email: getText('Text16'),
        address1: getText('Text17'),
        address2: getText('Text13'),
        employer: getText('Employer#1'),
        industry: getText('Industry2'),
        occupation: getText('Occupation2'),
        license_number: getText('License2'),
        license_issue_date: getText('Issue Date)'),
        license_state: getText('State2'),
        employment_status: getRadioGroupSelection('Status2'),
        retirement_age: getText('RetirementAge2')
    }*/

    const formContent = {
        rep_id: getText('Text10'),
        client_type: 'Individual',
        residency: 'U.S. Citizen w/ a U.S. Address',
        citizenship_country: 'US',
        primary_client: primary_client,
        //secondary_client: secondary_client
        financial_information: financial_information
    }

    doTranslations(formContent)
    reformat(formContent)
    validate(formContent)
    console.log(formContent)
    console.log(validationErrors)
}

run()

console.log('ok')