class SessionManager {

    


    GetSession() {
        var user = localStorage.getItem("user");
        if (user)
            return JSON.parse(user);
        else
            return null;
    }

    SetSession(user) {
        localStorage.setItem("user", JSON.stringify(user));
    }

    Logout() {
        localStorage.removeItem("user");
    }

    CheckSession() {
        return false;
    }

    GetLanguage() {
        var language = localStorage.getItem("lang");
        if (!language) {
            language = "en";
            localStorage.setItem("lang", language);
        }

        return language;
    }

    SetLanguage(language) {
        localStorage.setItem("lang", language);
    }



}

export default SessionManager;