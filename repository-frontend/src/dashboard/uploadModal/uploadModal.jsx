import './uploadModal.scss';
import { Button } from 'baseui/button';
import { useState } from 'react';
import { FileUploader } from 'baseui/file-uploader';
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalButton,
    SIZE,
    ROLE,
} from 'baseui/modal';
import { KIND as ButtonKind } from 'baseui/button';
import { ThemeProvider, createTheme, lightThemePrimitives } from 'baseui';
import { uploadImages } from '../dashboard.service';
function UploadModal(props) {
    const [errorMessage, setErrorMessage] = useState('');
    const [filesToUpload, setFilesToUpload] = useState([]);

    return (
        <Modal
            onClose={() => props.setIsOpen(false)}
            closeable
            isOpen={props.isOpen}
            animate
            autoFocus
            size={SIZE.default}
            role={ROLE.dialog}
        >
            <ModalHeader>Add Images</ModalHeader>
            <ModalBody>
                <div id="modal-parent">
                    <FileUploader
                        accept=".png, .jpg, .jpeg"
                        maxSize={20971520} //max image size is 20 mb
                        multiple
                        errorMessage={errorMessage}
                        onDrop={(files) => {
                            setFilesToUpload(files);
                        }}
                        onDropRejected={(files) => {
                            setErrorMessage(
                                'File Not Within Allowed Formats (.jpg, png, jpeg)'
                            );
                        }}
                        onRetry={() => {
                            setErrorMessage('');
                        }}
                    />
                    {filesToUpload.length !== 0 && (
                        <div id="file-names">
                            <ThemeProvider
                                theme={createTheme(lightThemePrimitives, {
                                    colors: {
                                        buttonPrimaryHover: '#FF0000',
                                    },
                                })}
                            >
                                {filesToUpload.map((file, index) => {
                                    return (
                                        <Button
                                            key={index}
                                            onClick={() => {
                                                let copy = [...filesToUpload];
                                                copy.splice(index, 1);
                                                setFilesToUpload(copy);
                                            }}
                                        >
                                            {file.name}
                                        </Button>
                                    );
                                })}
                            </ThemeProvider>
                        </div>
                    )}
                </div>
            </ModalBody>

            <ModalFooter>
                <ModalButton
                    kind={ButtonKind.tertiary}
                    onClick={() => {
                        props.setIsOpen(false);
                    }}
                >
                    Cancel
                </ModalButton>
                <ModalButton
                    disabled={filesToUpload.length === 0}
                    onClick={() => {
                        uploadImages(filesToUpload).then(() => {
                            props.onFinishedUpload();
                            setFilesToUpload([]);
                            props.setIsOpen(false);
                        });
                    }}
                >
                    Add
                </ModalButton>
            </ModalFooter>
        </Modal>
    );
}

export default UploadModal;
