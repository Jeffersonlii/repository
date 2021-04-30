import './dashboard.scss';
import { Button } from 'baseui/button';
import Plus from 'baseui/icon/plus';
import ArrowLeft from 'baseui/icon/arrow-left';
import { logoutUser } from '../login/login.service';
import { useHistory } from 'react-router-dom';
import { useState } from 'react';
import UploadModal from './uploadModal/uploadModal';

function Dashboard() {
    const [isOpen, setIsOpen] = useState(false);

    const history = useHistory();

    return (
        <div className="dashboard-host">
            <header id="controls">
                <Button
                    onClick={() => {
                        logoutUser().then(() => {
                            history.push('/');
                        });
                    }}
                >
                    <ArrowLeft />
                </Button>
                <Button
                    onClick={() => {
                        setIsOpen(true);
                    }}
                >
                    <Plus />
                </Button>

                <UploadModal openState={{ isOpen, setIsOpen }}></UploadModal>
            </header>
            <div id="gallery">images </div>
        </div>
    );
}

export default Dashboard;
