import './image.scss';
import { useLocation, useHistory } from 'react-router-dom';
import { getImageURL } from '../dashboard/dashboard.service';
import { Button } from 'baseui/button';
import { ThemeProvider, createTheme, lightThemePrimitives } from 'baseui';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import ShareIcon from '@material-ui/icons/Share';
import { deleteImage } from '../dashboard/dashboard.service';
import ShareModal from './shareModal/shareModal';
import { useState } from 'react';

function Image() {
    const [isShareOpen, setIsShareOpen] = useState(false);

    const query = new URLSearchParams(useLocation().search);
    const history = useHistory();

    const id = query.get('id') !== null ? query.get('id') : undefined;
    if (!id) {
        history.push('/dashboard');
    }
    return (
        <div className="image-host">
            <div className="controls">
                <Button
                    onClick={() => {
                        history.goBack();
                    }}
                >
                    <ArrowBackIcon />
                </Button>
                <Button
                    onClick={() => {
                        setIsShareOpen(true);
                    }}
                >
                    <ShareIcon />
                </Button>
                <ThemeProvider
                    theme={createTheme(lightThemePrimitives, {
                        colors: { buttonPrimaryHover: '#FF0000' },
                    })}
                >
                    <Button
                        onClick={() => {
                            deleteImage({
                                _id: id,
                            }).then(() => {
                                history.push('/dashboard');
                            });
                        }}
                    >
                        <DeleteForeverIcon />
                    </Button>
                </ThemeProvider>
            </div>
            <img
                className="image"
                onClick={() => {}}
                onError={() => {
                    history.push('/dashboard');
                }}
                src={getImageURL({
                    _id: id,
                })}
                alt=""
            ></img>
            {/* modals */}
            <ShareModal
                isOpen={isShareOpen}
                setIsOpen={setIsShareOpen}
                imageid={id}
            />
        </div>
    );
}

export default Image;
