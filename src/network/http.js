import axios from "axios";
import axiosRetry from "axios-retry";

const defaultRetryConfig = {
    retries: 5,
    initialDelaysMs: 100,
}
export default class HttpClient {
    constructor(baseURL, authErrorEventBus, getCsrtToken, config = defaultRetryConfig){
        this.authErrorEventBus = authErrorEventBus;
        this.getCsrtToken = getCsrtToken;
        this.client = axios.create({
            baseURL: baseURL,
            headers: {'Content-Type': 'application/json'},
            withCredentials: true,
        });
        axiosRetry(this.client, {
            retries: config.retries,
            retryDelay: (retry) => {
                const delay = Math.pow(2, retry) * config.initialDelaysMs; // 100, 200, 400, 800, 1600
                const jitter = delay * 0.1 * Math.random(); // 10, 20, ... 160
                return delay + jitter;
            },
            retryCondition: (err) => 
                axiosRetry.isNetworkOrIdempotentRequestError(err) || 
                err.response.status === 429,
        });
    }

    async fetch(url, options){
        const {body, method, headers} = options;
        const req = {
            url,
            method,
            headers:{
                ...headers,
                '_csrf-token': this.getCsrtToken(),
            },
            data: body,
        };

        try{
            const res = await this.client(req);
            return res.data;
        }catch(err){
            if(err.response){
                const data = err.response.data;
                const message = data && data.message ? data.message : 'Something went wrong!';
                throw new Error(message);
            }
            throw new Error('connection error');
        }
    }
}