import Axios from 'axios';
import serverdata from '../data/serverdata.json';

class Comm {

    instance = null;

    Instance() {
        if (this.instance === null)
            this.instance = Axios.create({
                baseURL: serverdata.url,
                headers: { 'Access-Control-Allow-Origin': '*', },
                timeout: 15000
            });
        return this.instance;
    }


}

export default new Comm();