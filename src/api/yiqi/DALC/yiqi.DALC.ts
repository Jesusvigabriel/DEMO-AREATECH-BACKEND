import axios from "axios";
import qs from 'qs';

export const getTokenYiqi_DALC = async (user:string, pass:string) => {
    return axios ({
        method: 'POST',
        url: 'https://me.yiqi.com.ar/token',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: qs.stringify({
            username: `${user}`,
            password: `${pass}`,
            grant_type: 'password'
        })
    })
}
