var fs = require('fs');

const accountsMap = {}
const personMap = {}

function parseInput(filename){
    try {
        var file = fs.readFileSync(filename)
        return JSON.parse(file)
    
    } catch (err){
        console.log(err)
    }
}

function mergeNewAccountIntoExisting(emails, id, account) {
    if (!personMap[id]) return
    for (let x=0; x<emails.length; x++){
        if (personMap[id].emails.indexOf(emails[x]) < 0){
            personMap[id].emails.push(emails[x])
        }

        if(!accountsMap[emails[x]]){
            accountsMap[emails[x]] = id
        }
    }

    if (account.name.length > personMap[id].name.length){
        personMap[id].name = account.name
    }

    if (personMap[id].applications.indexOf(account.application) < 0){
        personMap[id].applications.push(account.application)
    }
}

function mergeExistingAccountsIntoNew(email, id, account) {
    let personToUpdateKey;
        
    if (accountsMap[email]){
        personToUpdateKey = accountsMap[email]
    }

    accountsMap[email] = id

    if (!personMap[id]){
        personMap[id] = {
            applications: [account.application],
            emails: account.emails,
            name: account.name
        }
    }

    if (personToUpdateKey){
        const currentPersonToUpdate = personMap[personToUpdateKey]
        if (!currentPersonToUpdate) return
        
        if (currentPersonToUpdate.name.length > account.name.length){
            personMap[id].name = currentPersonToUpdate.name
        }

        for (let y=0; y<currentPersonToUpdate.applications.length; y++){
            if (personMap[id].applications.indexOf(currentPersonToUpdate.applications[y]) < 0){
                personMap[id].applications.push(currentPersonToUpdate.applications[y])
            }
        }

        for (let y=0; y<currentPersonToUpdate.emails.length; y++){
            if (personMap[id].emails.indexOf(currentPersonToUpdate.emails[y]) < 0){
                personMap[id].emails.push(currentPersonToUpdate.emails[y])
            }
        }
        delete personMap[personToUpdateKey]
    }
}

function formatDataAndPrintResult(){
    const resultsArray = []

    for (const property in personMap) {
        resultsArray.push(personMap[property]);
    }

    console.log(resultsArray)
}

function processAccounts(){

    const accounts = parseInput('accounts.json')

    for (let i=0; i<accounts.length; i++){
        const emails = accounts[i].emails
        let emailAlreadyExists = false
        let id;
        const unifierKey = i + 1

        for (let x=0; x<emails.length; x++){
            id = accountsMap[emails[x]]
            if (id){
                emailAlreadyExists = true
                mergeExistingAccountsIntoNew(emails[x], unifierKey, accounts[i])
            } 
        }

        if (emailAlreadyExists){
            mergeNewAccountIntoExisting(emails, id, accounts[i])
        } else {
            for (let x=0; x<emails.length; x++){
                accountsMap[emails[x]] = unifierKey
            }
            personMap[unifierKey] = {
                applications: [accounts[i].application],
                emails: accounts[i].emails,
                name: accounts[i].name
            }
        }
    }

    formatDataAndPrintResult()
}

processAccounts()


