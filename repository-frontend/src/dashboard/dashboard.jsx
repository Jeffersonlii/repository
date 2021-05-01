import './dashboard.scss';
import './masonry.scss';

import { Button } from 'baseui/button';
import Upload from 'baseui/icon/upload';
import ArrowLeft from 'baseui/icon/arrow-left';
import { logoutUser } from '../login/login.service';
import { useHistory, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import UploadModal from './uploadModal/uploadModal';
import { getImageIds, getImageURL } from './dashboard.service';
import Masonry from 'react-masonry-css';
import { Pagination } from 'baseui/pagination';
import { Spinner } from 'baseui/spinner';
import RefreshIcon from '@material-ui/icons/Refresh';
function Dashboard() {
    const query = new URLSearchParams(useLocation().search);

    const [isUploadOpen, setIsUploadOpen] = useState(false);

    const [galleryImages, setGalleryImages] = useState([]);

    const pageSize = 10;
    const numPages = Math.ceil(galleryImages.length / pageSize);
    const [currentPage, setCurrentPage] = useState(
        query.get('page') !== null ? parseInt(query.get('page')) : 1
    );
    const [imagesLoaded, setImagesLoaded] = useState(0);

    const history = useHistory();

    let refreshGallery = () => {
        getImageIds().then((resp) => {
            setGalleryImages(resp.data.images);
        });
    };
    useEffect(() => {
        refreshGallery(); //init gallery
    }, []);

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
                        setIsUploadOpen(true);
                    }}
                >
                    <Upload />
                </Button>
                <Button
                    onClick={() => {
                        refreshGallery();
                    }}
                >
                    <RefreshIcon />
                </Button>
                <div style={{ 'flex-grow': 999 }}></div>
                <div>
                    <div id="global-logo">Repository</div>
                </div>
            </header>
            <div id="gallery">
                <Masonry
                    breakpointCols={{
                        default: 4,
                        1100: 3,
                        700: 2,
                        500: 1,
                    }}
                    className="my-masonry-grid"
                    columnClassName="my-masonry-grid_column"
                >
                    {galleryImages
                        .slice(
                            (currentPage - 1) * pageSize,
                            currentPage * pageSize
                        )
                        .map((image) => {
                            return (
                                <div class="img-parent">
                                    <img
                                        key={image._id}
                                        className="image"
                                        onLoad={() => {
                                            setImagesLoaded(imagesLoaded + 1);
                                        }}
                                        onClick={() => {
                                            history.push(
                                                `/img/?id=${image._id}`
                                            );
                                        }}
                                        src={getImageURL(image)}
                                        alt=""
                                    ></img>
                                </div>
                            );
                        })}
                </Masonry>
                {imagesLoaded <
                    Math.min(currentPage * pageSize, galleryImages.length) -
                        (currentPage - 1) * pageSize && (
                    <div id="loading-facade">
                        <Spinner size={96} />
                    </div>
                )}
            </div>
            <div id="paginate">
                <Pagination
                    numPages={numPages}
                    currentPage={currentPage}
                    onPageChange={({ nextPage, prevPage }) => {
                        console.log(nextPage, prevPage);
                        let newpage = Math.min(Math.max(nextPage, 1), numPages);
                        history.push(`/dashboard?page=${newpage}`);

                        setImagesLoaded(0);
                        setCurrentPage(newpage);
                    }}
                />
            </div>

            {/* modals */}
            <UploadModal
                isOpen={isUploadOpen}
                setIsOpen={setIsUploadOpen}
                onFinishedUpload={refreshGallery}
            ></UploadModal>
        </div>
    );
}

export default Dashboard;
