module.exports = {
  "_user":{
    "auth_pin": { "type": "encUser" },
    "activeCalendars":{"type": "encUser"},
    "selectedCalendar":{"type": "encUser"},
    "calendars":{
      "$calendarId":{
        "key": { "type": "encUser" },
        "name": { "type": "enc", "keyPair": "_user/calendars/{calendarId}/key"},
        "months": { 
          "$monthId": { "type": "enc", "keyPair": "_user/calendars/{calendarId}/key"}
        }
      }
    }
  }
}