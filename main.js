import key from './topsecret/secret.json' assert { type: "json" };

export function get_appID() {
    return atob(key.secret).length > 0 ? atob(key.secret) : null;
}
