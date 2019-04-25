class SessionManager {

    GetSession() {
        return localStorage.getItem("token");
    }

    SetSession(token) {
        localStorage.setItem("token", token);
    }

    CheckSession() {
        return false;
    }

    GetLanguage() {
        var language = localStorage.getItem("lang");
        if(!language){
           language="en";
           localStorage.setItem("lang", language);
        }       
        
        return language;
    }

    SetLanguage(language){
        localStorage.setItem("lang", language);
    }



}

export default SessionManager;