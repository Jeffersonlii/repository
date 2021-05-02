import { toast } from 'react-toastify';

export const notifyResponse = (resp) => {
    if (resp.data.errors) {
        resp.data.errors.forEach((error) => {
            toast.dark(error.msg, {
                position: 'bottom-right',
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        });
    } else if (resp.data.msgs) {
        resp.data.msgs.forEach((msg) => {
            toast.dark(msg, {
                position: 'bottom-right',
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        });
    }
};
