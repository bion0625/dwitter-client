export default class HttpClient {
    constructor(baseURL, authErrorEventBus, getCsrtToken){
        this.baseURL = baseURL
        this.authErrorEventBus = authErrorEventBus;
        this.getCsrtToken = getCsrtToken;
    }

    async fetch(url, options){
        const res = await fetch(`${this.baseURL}${url}`,{
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
                '_csrf-token': this.getCsrtToken(),
            },
            credentials: 'include',
        });
        let data;
        try{
            data = await res.json();
        }catch(error){
            console.error(error);
        }

        if(res.status > 299 || res.status < 200){
            const message = data && data.message ? data.message : 'Something went wrong!';
            const error = Error(message);
            if(res.status === 401){
                this.authErrorEventBus.notify(error);
                return;
            }
            throw error;
        }
        return data;
    }
}