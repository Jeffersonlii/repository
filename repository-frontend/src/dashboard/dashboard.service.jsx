import { url } from '../global';
import axios from 'axios';

export const uploadImages = (images) => {
    let fd = new FormData();
    images.forEach((file) => {
        fd.append('file', file);
    });
    return axios.post(`${url}/image/`, fd, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        withCredentials: true, //! must set this to interact with session
    });
};
export const getImageIds = (images) => {
    return axios.get(`${url}/image/`, {
        withCredentials: true, //! must set this to interact with session
    });
};
export const getImageURL = (image) => {
    return `${url}/image/${image._id}`;
};
