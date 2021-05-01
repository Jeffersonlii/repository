import './image.scss';
import { useLocation, useHistory } from 'react-router-dom';
import { getImageURL } from '../dashboard/dashboard.service';
import { Button } from 'baseui/button';
import ArrowLeft from 'baseui/icon/arrow-left';
import Delete from 'baseui/icon/delete';
import { ThemeProvider, createTheme, lightThemePrimitives } from 'baseui';
import ShareIcon from '@material-ui/icons/Share';
function Image() {
    const query = new URLSearchParams(useLocation().search);
    const history = useHistory();
    return (
        <div className="image-host">
            <div className="controls">
                <Button
                    onClick={() => {
                        history.goBack();
                    }}
                >
                    <ArrowLeft />
                </Button>
                <Button
                    onClick={() => {
                        history.goBack();
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
                            history.goBack();
                        }}
                    >
                        <Delete />
                    </Button>
                </ThemeProvider>
            </div>
            <img
                className="image"
                onClick={() => {}}
                src={getImageURL({
                    _id: query.get('id') !== null ? query.get('id') : 1,
                })}
                alt=""
            ></img>
        </div>
    );
}

export default Image;
