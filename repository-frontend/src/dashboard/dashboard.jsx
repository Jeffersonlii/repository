import './dashboard.scss';
import './masonry.scss';

import { Button } from 'baseui/button';
import Upload from 'baseui/icon/upload';
import ArrowLeft from 'baseui/icon/arrow-left';
import ChevronDown from 'baseui/icon/chevron-down';
import { logoutUser } from '../login/login.service';
import { useHistory } from 'react-router-dom';
import { useState, useEffect } from 'react';
import UploadModal from './uploadModal/uploadModal';
import { getImageIds, getImageURL } from './dashboard.service';
import Masonry from 'react-masonry-css';
import { Pagination } from 'baseui/pagination';
import { Spinner } from 'baseui/spinner';

function Dashboard() {
    const [isOpen, setIsOpen] = useState(false);
    const [galleryImages, setGalleryImages] = useState([]);

    const pageSize = 10;
    const numPages = Math.ceil(galleryImages.length / pageSize);
    const [currentPage, setCurrentPage] = useState(1);
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
                        setIsOpen(true);
                    }}
                >
                    <Upload />
                </Button>
                <Button
                    onClick={() => {
                        refreshGallery();
                    }}
                >
                    <ChevronDown />
                </Button>

                <UploadModal
                    openState={{ isOpen, setIsOpen }}
                    onFinishedUpload={refreshGallery}
                ></UploadModal>
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
                                <img
                                    key={image._id}
                                    className="image"
                                    onLoad={() => {
                                        setImagesLoaded(imagesLoaded + 1);
                                    }}
                                    src={getImageURL(image)}
                                    alt=""
                                ></img>
                            );
                        })}
                </Masonry>
                {imagesLoaded !==
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
                    onPageChange={({ nextPage }) => {
                        setImagesLoaded(0);
                        setCurrentPage(
                            Math.min(Math.max(nextPage, 1), numPages)
                        );
                    }}
                />
            </div>
        </div>
    );
}

export default Dashboard;
