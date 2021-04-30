import { url } from '../global';
import axios from 'axios';

export const loginUser = ({ username, password }) => {
    return axios.post(
        `${url}/login/`,
        {
            username,
            password,
        },
        {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true, //! must set this to interact with session
        }
    );
};
export const logoutUser = () => {
    return axios.get(`${url}/logoff/`, {
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true, //! must set this to interact with session
    });
};
export const registerUser = ({ username, password }) => {
    return axios.post(
        `${url}/register/`,
        {
            username,
            password,
        },
        {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true, //! must set this to interact with session
        }
    );
};
export const checkAuthenticated = () => {
    return axios.get(`${url}/getSessionId/`, {
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true, //! must set this to interact with session
    });
};
