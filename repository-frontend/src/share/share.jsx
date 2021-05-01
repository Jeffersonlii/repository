import './share.scss';
import { getImageFromLinkURL } from '../single-image/shareModal/share.service';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { Button } from 'baseui/button';
import { useHistory } from 'react-router-dom';

function Share() {
    let { id } = useParams(); //  query.get('page');

    const [invalid, setInvalid] = useState(false);
    const history = useHistory();

    return invalid ? (
        <div>
            <Button
                onClick={() => {
                    history.push('/');
                }}
            >
                Link Invalid or Expired
            </Button>
        </div>
    ) : (
        <div className="image-host">
            <img
                className="image"
                onClick={() => {}}
                onError={() => {
                    setInvalid(true);
                }}
                src={getImageFromLinkURL(id)}
                alt=""
            ></img>
        </div>
    );
}

export default Share;
