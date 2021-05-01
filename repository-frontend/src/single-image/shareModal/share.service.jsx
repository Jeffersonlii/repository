import { url } from '../../global';
import axios from 'axios';

export const createLink = (
    imageid,
    limits = {
        maxVisits: undefined,
        expTime: undefined,
    }
) => {
    return axios.post(
        `${url}/share/${imageid}`,
        {
            limits: { temporal: limits.expTime, visits: limits.maxVisits },
        },
        {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true, //! must set this to interact with session
        }
    );
};
