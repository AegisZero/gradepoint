'use strict'

const prospectValidValues = require('./prospectValidValues')

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
const validate = (formContent, validationErrors) => {
    
    let primaryClient = formContent.primary_client
    
    const industryOccupations = prospectValidValues.getProspectIndustryOccupations()

    // validate rep_id
    validateRequired(formContent, validationErrors, 'rep_id')
    validateExactLength(formContent, validationErrors, 'rep_id', 4)
    validateContentType(formContent, validationErrors,  'rep_id', 'alphanumeric')

    // validate SSN
    validateExactLength(primaryClient, validationErrors, 'ssn', 9)
    validateContentType(primaryClient, validationErrors, 'ssn', 'numeric')

    // validate Name
    validateRequired(primaryClient, validationErrors, 'first_name')
    validateContentType(primaryClient, validationErrors, 'first_name', 'alpha')
    validateMaxLength(primaryClient, validationErrors, 'first_name', 30)
    validateRequired(primaryClient, validationErrors, 'last_name')
    validateContentType(primaryClient, validationErrors, 'last_name', 'alpha')
    validateMaxLength(primaryClient, validationErrors, 'last_name', 30)

    // Address Line 1
    validateMaxLength(primaryClient, validationErrors, 'address1', 64)

    // validate City
    validateContentType(primaryClient, validationErrors, 'city', 'alpha')

    // vaidate State
    if(!prospectValidValues.states.includes(primaryClient.state)){
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
    if(!prospectValidValues.states.includes(primaryClient.license_state)){
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

module.exports = {validate}
