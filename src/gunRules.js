module.exports = {
  "_user":{
    "auth_pin": { "type": "encUser" },
    "calendars":{
      "$calendarId":{
        "key": { "type": "encUser" },
        "months": { 
          "$monthId": { "type": "enc", "keyPair": "_user.calendars.{calendarId}.key"}
        }
      }
    }
  }
}