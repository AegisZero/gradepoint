'use strict'

import {states, countries, getProspectIndustryOccupations} from './prospectValidValues.js'

// validate for specific length
const validateExactLength = (object, validationErrors, property, length) => {
        if (object[property] && object[property].length != length){
            validationErrors.push(property + ' is not the correct length of ' + length + ' characters')
        }
    }

// validate for max length
const validateMaxLength = (object, validationErrors, property, maxLength) => {
    if (object[property] && object[property].length > maxLength){
        validationErrors.push(property + ' is not the correct length of ' + maxLength + ' characters')
    }
}

// validate that the input content type matches what is expected
const validateContentType = (object, validationErrors, property, type) => {
    const ALPHANUMERIC_PATTERN = new RegExp('^[a-zA-Z0-9 ]*$')
    const ALPHA_PATTERN = new RegExp('^[a-zA-Z ]*$')
    const NUMERIC_PATTERN = new RegExp('^[0-9]*$')
    const EMAIL_PATTERN = new RegExp('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$')

    const text = object[property]

    if (type == 'alphanumeric') {
        if(!ALPHANUMERIC_PATTERN.test(text)) {
            validationErrors.push('entry for property ' + property + ' ('+text+') is not alphanumeric')
        }
    } else if (type == 'alpha') {
        if(!ALPHA_PATTERN.test(text)) {
            validationErrors.push('entry for property ' + property + ' ('+text+') is not alpha')
        }
    } else if (type == 'numeric') {
        if(!NUMERIC_PATTERN.test(text)) {
            validationErrors.push('entry for property ' + property + ' ('+text+') is not numeric')
        }
    } else if (type = 'email') {
        if(!EMAIL_PATTERN.test(text)) {
            validationErrors.push('entry for property ' + property + ' ('+text+') is not a valid email')
        }
    } else {
        console.log("unknown content type: " + type)
    }
}

const validateRequired = (object, validationErrors, property) => {

}

// validate the form content
export const validate = (formContent, validationErrors) => {
    
    let primaryClient = formContent.primaryClient
    
    const industryOccupations = getProspectIndustryOccupations()

    // validate rep id
    validateRequired(formContent, validationErrors, 'repId')
    validateExactLength(formContent, validationErrors, 'repId', 4)
    validateContentType(formContent, validationErrors,  'repId', 'alphanumeric')

    // validate SSN
    validateExactLength(primaryClient, validationErrors, 'ssn', 9)
    validateContentType(primaryClient, validationErrors, 'ssn', 'numeric')

    // validate Name
    validateRequired(primaryClient, validationErrors, 'firstName')
    validateContentType(primaryClient, validationErrors, 'firstName', 'alpha')
    validateMaxLength(primaryClient, validationErrors, 'firstName', 30)
    validateRequired(primaryClient, validationErrors, 'lastName')
    validateContentType(primaryClient, validationErrors, 'lastName', 'alpha')
    validateMaxLength(primaryClient, validationErrors, 'lastName', 30)

    // Address Line 1
    validateMaxLength(primaryClient, validationErrors, 'address1', 64)

    // validate City
    validateContentType(primaryClient, validationErrors, 'city', 'alpha')

    // vaidate State
    if(!states.includes(primaryClient.state)){
        validationErrors.push('State code provided is not valid')
    }

    // validate ZIP
    validateExactLength(primaryClient, validationErrors, 'zip', 5)
    validateContentType(primaryClient, validationErrors, 'zip', 'numeric')

    // validate Mobile
    validateRequired(primaryClient, validationErrors, 'mobile')
    validateExactLength(primaryClient, validationErrors, 'mobile', 10)
    validateContentType(primaryClient, validationErrors, 'mobile', 'numeric')

    // validate Email
    validateRequired(primaryClient, validationErrors, 'email')
    validateContentType(primaryClient, validationErrors, 'email', 'email')
    validateMaxLength(primaryClient, validationErrors, 'email', 70)

    // validate ID
    validateMaxLength(primaryClient, validationErrors, 'email', 25)

    // validate ID State
    if(!states.includes(primaryClient.licenseState)){
        validationErrors.push('License State code provided is not valid')
    }

    // validate Industry / Occupation
    if(primaryClient.industry) {
        let match = false
        if(primaryClient.occupation) {
            for(var key in industryOccupations) {
                if(key == primaryClient.industry) {
                    const industry = industryOccupations[key]
                    if(industry.includes(primaryClient.occupation)) {
                        match = true
                    }
                    break
                }
            }
        }
        if(match == false) {
            validationErrors.push('Industry / Occupation combination is not valid')
        }
    }

}
