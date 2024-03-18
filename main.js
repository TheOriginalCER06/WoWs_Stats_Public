import key from './topsecret/secret.json' assert { type: "json" }; //Her hentes API-keyen min fra en gjemt fil (:

export function get_appID() {
    return atob(key.secret).length > 0 ? atob(key.secret) : null; //Enten dekrypteres filen, ellers retuner den "null", noe error handeling gjør noe med.
}
