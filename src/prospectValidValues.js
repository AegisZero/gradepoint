'use strict'

const path = require('path')
const xlsx = require('xlsx')

const states = ['AA', 'AE', 'AK', 'AL', 'AP', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC', 
    'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 
    'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 
    'NY', 'OH', 'OK', 'OR', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 
    'VI', 'VT', 'WA', 'WI', 'WV', 'WY']

const countries = ['AA', 'AC', 'AE', 'AF', 'AG', 'AJ', 'AL', 'AM', 'AN', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AV', 'AX', 'AY', 'BA', 
'BB', 'BC', 'BD', 'BE', 'BF', 'BG', 'BH', 'BK', 'BL', 'BM', 'BN', 'BO', 'BP', 'BQ', 'BR', 'BS', 'BT', 'BU', 'BV', 
'BX', 'BY', 'CA', 'CB', 'CD', 'CE', 'CF', 'CG', 'CH', 'CI', 'CJ', 'CK', 'CM', 'CN', 'CO', 'CQ', 'CR', 'CS', 'CT', 
'CU', 'CV', 'CW', 'CY', 'DA', 'DJ', 'DO', 'DQ', 'DR', 'EC', 'EG', 'EI', 'EK', 'EN', 'ER', 'ES', 'ET', 'EU', 'EZ', 
'FG', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FP', 'FQ', 'FR', 'FS', 'GA', 'GB', 'GG', 'GH', 'GI', 'GJ', 'GK', 'GL', 'GM', 
'GO', 'GP', 'GQ', 'GR', 'GT', 'GV', 'GY', 'GZ', 'HA', 'HK', 'HM', 'HO', 'HQ', 'HR', 'HU', 'IC', 'ID', 'IM', 'IN', 
'IO', 'IP', 'IR', 'IS', 'IT', 'IV', 'IZ', 'JA', 'JE', 'JM', 'JN', 'JO', 'JQ', 'JU', 'KE', 'KG', 'KN', 'KQ', 'KR', 
'KS', 'KT', 'KU', 'KV', 'KZ', 'LA', 'LE', 'LG', 'LH', 'LI', 'LO', 'LQ', 'LS', 'LT', 'LU', 'LY', 'MA', 'MB', 'MC', 
'MD', 'MF', 'MG', 'MH', 'MI', 'MK', 'ML', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 
'NC', 'NE', 'NF', 'NG', 'NH', 'NI', 'NL', 'NN', 'NO', 'NP', 'NR', 'NS', 'NU', 'NZ', 'OC', 'OD', 'PA', 'PC', 'PE', 
'PF', 'PG', 'PK', 'PL', 'PM', 'PO', 'PP', 'PS', 'PU', 'QA', 'RE', 'RM', 'RO', 'RP', 'RQ', 'RS', 'RW', 'SA', 'SB', 
'SC', 'SE', 'SF', 'SG', 'SH', 'SI', 'SL', 'SM', 'SN', 'SO', 'SP', 'SR', 'ST', 'SU', 'SV', 'SW', 'SX', 'SY', 'SZ', 
'TD', 'TE', 'TH', 'TI', 'TK', 'TL', 'TN', 'TO', 'TP', 'TS', 'TT', 'TU', 'TV', 'TW', 'TX', 'TZ', 'UC', 'UG', 'UK', 
'UP', 'UV', 'UY', 'UZ', 'VC', 'VE', 'VI', 'VM', 'VP', 'VQ', 'VT', 'WA', 'WE', 'WF', 'WI', 'WQ', 'WS', 'WZ', 'YM', 
'YO', 'YS', 'ZA', 'ZI', 'ZZ']

const getProspectIndustryOccupations = () => {
    const wb = xlsx.readFile(path.join(__dirname, '../templates', 'Import_Prospect_Data_Values.xlsx'))
    const validValueSheet = wb.Sheets['LookUp Training']
    const returnObj = {}

    for(let i = 2; i < 729; i++) {
        
        if(!returnObj[validValueSheet[xlsx.utils.encode_cell({c: 12, r: i})].v]) {
            returnObj[validValueSheet[xlsx.utils.encode_cell({c: 12, r: i})].v] = []
        }
        returnObj[validValueSheet[xlsx.utils.encode_cell({c: 12, r: i})].v].push(validValueSheet[xlsx.utils.encode_cell({c: 13, r: i})].v)
    }

    return returnObj
}


module.exports = {states, countries, getProspectIndustryOccupations} 
