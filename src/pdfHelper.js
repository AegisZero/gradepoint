'use strict'

import {PDFDocument} from 'pdf-lib'
import fs from 'fs'
import moment from 'moment'
import _ from 'lodash'
import {getProspectIndustryOccupations} from './prospectValidValues.js'

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

// current state, just get the file from the location provided
export const getPdfForm = async (file) => {
    
    let fileData = null

    if(typeof file == 'string') {
        fileData = fs.readFileSync(file)
    } else if (typeof file == 'object') {
        fileData = file
    }

    const pdfDoc = await PDFDocument.load(fileData)
    const form = pdfDoc.getForm()

    return form
}

// future state as a utility, will be calling this , rather than a location on
// the local system
export const getPdfFromFileData = async (fileData) => {
    const pdfDoc = await PDFDocument.load(fileData)
    const form = pdfDoc.getForm()
    return form
}

export const getText = (form, fieldName) => {
    let text = ''
    try {
        const textField = form.getTextField(fieldName)
        text = textField.getText()
    } catch (e) {
        console.log(e)
    }
    return text || null
}

export const getRadioGroupSelection = (form, groupName) => {
    let selection = ''
    try {
        const group = form.getRadioGroup(groupName) 
        selection = group.getSelected()
    } catch (e) {
        console.log(e)
    }
    
    return selection || null
}

export const getDropdownSelection = (form, dropdown) => {
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
export const doTranslations = (formContent) => {
    let primaryClient = formContent.primaryClient
    let financialInformation = formContent.financialInformation

    // Convert Gender from radio codes
    if(primaryClient.gender){
        primaryClient.gender = (genderTranslation.find((element) => element.pdfCode = primaryClient.gender)).value
    }

    // Convert Employment Status from Radio Codes
    if(primaryClient.employmentStatus) {
        primaryClient.employmentStatus = (employmentTranslation.find((element) => element.pdfCode = primaryClient.employmentStatus)).value
    }

    // convert Tax Bracket from Radio Codes
    if(financialInformation.taxBracket) {
        financialInformation.taxBracket = (taxBracketTranslation.find((element) => element.pdfCode == financialInformation.taxBracket)).value
    }
}

// format inputs into acceptable format for upload
export const reformat = (formContent) => {
    // strip dashes from SSN
    let primaryClient = formContent.primaryClient
    let financialInfo = formContent.financialInformation
    const industryOccupations = getProspectIndustryOccupations()

    primaryClient.ssn = primaryClient.ssn.replaceAll('-','')

    // split name entry into first and last
    const fullName = primaryClient.fullName
    primaryClient.firstName = _.startCase(_.lowerCase(fullName.split(" ")[0]))
    primaryClient.lastName = _.startCase(_.lowerCase(fullName.split(" ")[1]))

    // reformat birthdate
    const birthDateDt = new Date(primaryClient.dob)
    const birthDate = moment(birthDateDt)
    primaryClient.dob = birthDate.format('MM/DD/YYYY')

    //update email to lowercase
    primaryClient.email = primaryClient.email.toLowerCase()

    // Uppercase Address Line 1
    primaryClient.address1 = _.startCase(_.lowerCase(primaryClient.address1))
    // reformat Address Line 2 into indivdual
    primaryClient.city = _.startCase(_.lowerCase(primaryClient.address2.split(',')[0]))
    const stateZip = primaryClient.address2.split(',')[1].trim()
    primaryClient.state = (stateZip.split(' ')[0].trim()).toUpperCase()
    primaryClient.zip = stateZip.split(' ')[1].trim()

    // strip dashes from Mobile Phone
    primaryClient.mobile = primaryClient.mobile.replaceAll('-','')

    // reformat license issue date
    const licenseIssueDt = new Date(primaryClient.licenseIssueDate)
    const licenseIssue = moment(licenseIssueDt)
    primaryClient.licenseIssueDate = licenseIssue.format('MM/DD/YYYY')

    // reformat annual income
    if(financialInfo.householdIncome){ 

        financialInfo.householdIncome = financialInfo.householdIncome.replaceAll(',','')

        if(financialInfo.householdIncome.indexOf('K') > -1 || financialInfo.householdIncome.indexOf ('k') > -1){
            financialInfo.householdIncome = financialInfo.householdIncome.replace('K','').replace('k','').replace('.','').trim()
            financialInfo.householdIncome = (financialInfo.householdIncome+='000').slice(0,5)
        }
        
        if(financialInfo.householdIncome.indexOf('M') > -1 || financialInfo.householdIncome.indexOf ('m') > -1){
            financialInfo.householdIncome = financialInfo.householdIncome.replace('M','').replace('m','').replace('.','').trim()
            financialInfo.householdIncome = (financialInfo.householdIncome+='000000').slice(0,7)
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
    if(financialInfo.netWorth) {
        if(financialInfo.netWorth == '$1mm+'){
            financialInfo.netWorth = 1000000
        } else {
            financialInfo.netWorth = ((financialInfo.netWorth.split('-')[1]).trim()).replace('$','').replaceAll(',','')
        }
        
    }

    // reformat liquid net worth
    if(financialInfo.liquidNetWorth) {
        if(financialInfo.liquidNetWorth == '$1mm+'){
            financialInfo.liquidNetWorth = 1000000
        } else {
            financialInfo.liquidNetWorth = ((financialInfo.liquidNetWorth.split('-')[1]).trim()).replace('$','').replaceAll(',','')
        }
    }

    // reformat industry and occupation
    if(primaryClient.industry) {
        for(var key in industryOccupations) {
            if(key.toUpperCase() == primaryClient.industry.toUpperCase()) {
                primaryClient.industry = key
                const industry = industryOccupations[key]
                if(primaryClient.occupation) {
                    for(let i = 0; i < industry.length; i++) {
                        if(industry[i].toUpperCase() == primaryClient.occupation.toUpperCase()) {
                            primaryClient.occupation = industry[i]
                            break
                        }
                    }
                }
                break
            }
        }
    }
}