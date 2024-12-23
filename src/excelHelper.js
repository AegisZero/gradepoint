'use strict'

const xlsx = require('xlsx')
const wb = xlsx.readFile('templates/Import_Prospect_Data_Values.xlsx')

const createProspectImportDocument = (formContent) => {

    const importSheet = wb.Sheets['Final CSV 0630']
    console.log(importSheet)
} 

module.exports = {createProspectImportDocument}
