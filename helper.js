const uuid = require("uuid");
/**
 * 
 * @param  firstName - The first name sent from the client
 * @param lastName - The last name sent from the client
 * This function returns a propagated object
 * @returns 
 */
 exports.propagateData = async (firstName, lastName) => {
    let dataObject = {
        "id": uuid.v4(),
        "firstName": firstName,
        "lastName": lastName,
        "dateCreated": new Date,
        "registrationUrl": "/register"
    }
    return dataObject
    

}