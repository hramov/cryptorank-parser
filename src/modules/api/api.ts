import {AxiosInstance} from "axios";

const enum ApiMethods {
    EXCHANGES = '/exchanges',
    CURRENCIES = '/currencies',
}

export class Api {
    constructor(private readonly instance: AxiosInstance, private readonly token: string) {}

    async exchanges() {
        const response = await this.instance.get(ApiMethods.EXCHANGES + '?api_key=' + this.token);
        if (response.status >= 400) {
            console.log('Error ' + response.status);
        }
        return response.data;
    }

    async currencies() {
        const response = await this.instance.get(ApiMethods.CURRENCIES + '?api_key=' + this.token);
        if (response.status >= 400) {
            console.log('Error ' + response.status);
        }
        return response.data;
    }
}