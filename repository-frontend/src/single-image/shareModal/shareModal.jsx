import './shareModal.scss';
import { Modal, ModalHeader, ModalBody, SIZE, ROLE } from 'baseui/modal';
import { Tabs, Tab } from 'baseui/tabs-motion';
import { useState, useEffect } from 'react';
import { Button } from 'baseui/button';
import { Input } from 'baseui/input';
import { TimePicker } from 'baseui/timepicker';
import { DatePicker } from 'baseui/datepicker';
import { createLink } from './share.service';
function ShareModal(props) {
    const [activeKey, setActiveKey] = useState('0');

    return (
        <Modal
            onClose={() => {
                props.setIsOpen(false);
            }}
            closeable
            isOpen={props.isOpen}
            animate
            autoFocus
            size={SIZE.default}
            role={ROLE.dialog}
        >
            <ModalHeader>Share Image</ModalHeader>
            <ModalBody>
                <Tabs
                    activeKey={activeKey}
                    onChange={({ activeKey }) => {
                        setActiveKey(activeKey);
                    }}
                    activateOnFocus
                >
                    <Tab title="No Limit">
                        <NoLimitLink imageid={props.imageid} />
                    </Tab>
                    <Tab title="Limit by Visits">
                        <VisitsLimitLink imageid={props.imageid} />
                    </Tab>
                    <Tab title="Limit by Time">
                        <TimeLimitLink imageid={props.imageid} />
                    </Tab>
                </Tabs>
            </ModalBody>
        </Modal>
    );
}

function LinkBox(props) {
    return (
        <div class="linkbox">
            <Input value={props.value} readonly={true} />
            <Button
                onClick={() => {
                    navigator.clipboard.writeText(props.value);
                }}
                isLoading={props.value === ''}
            >
                {'Copy'}
            </Button>
        </div>
    );
}

// LINK TYPES (seperated into components for easy expansion in the future)
function NoLimitLink(props) {
    const [link, setLink] = useState('');
    useEffect(() => {
        createLink(props.imageid).then((link) => {
            setLink(`${window.location.origin}/share/${link.data._id}`);
        });
    }, []);

    return <LinkBox value={link}></LinkBox>;
}
function VisitsLimitLink(props) {
    const [link, setLink] = useState('');
    const initVisits = 5;
    const [maxVisits, setMaxVisits] = useState(initVisits);

    let onChange = (visits) => {
        setLink('');
        setMaxVisits(visits);

        createLink(props.imageid, { maxVisits: visits }).then((link) => {
            setLink(`${window.location.origin}/share/${link.data._id}`);
        });
    };
    useEffect(() => {
        onChange(initVisits);
    }, []);
    return (
        <>
            Maximum Visits
            <Input
                value={maxVisits}
                onChange={(e) => {
                    onChange(e.target.value);
                }}
                type="number"
                min={1}
            />
            <LinkBox value={link}></LinkBox>
        </>
    );
}
function TimeLimitLink(props) {
    const [link, setLink] = useState('');
    const [expTime, setExpTime] = useState(new Date());
    const [expDate, setExpDate] = useState([new Date()]);

    let onChange = (value, mode) => {
        setLink('');
        let combinedTemporal;
        //mode = time | date
        switch (mode) {
            case 'time':
                setExpTime(value);
                combinedTemporal = new Date(
                    expDate[0].getFullYear(),
                    expDate[0].getMonth(),
                    expDate[0].getDate(),
                    value.getHours(),
                    value.getMinutes(),
                    value.getSeconds()
                );
                break;
            case 'date':
                setExpDate(Array.isArray(value) ? value : [value]);

                combinedTemporal = new Date(
                    value.getFullYear(),
                    value.getMonth(),
                    value.getDate(),
                    expTime.getHours(),
                    expTime.getMinutes(),
                    expTime.getSeconds()
                );
                break;
            default:
        }
        createLink(props.imageid, { expTime: combinedTemporal }).then(
            (link) => {
                setLink(`${window.location.origin}/share/${link.data._id}`);
            }
        );
    };
    useEffect(() => {
        onChange(new Date(), 'date');
    }, []);
    return (
        <>
            <div className="date-and-time">
                <div className="box">
                    Expiring Time
                    <TimePicker
                        value={expTime}
                        onChange={(time) => {
                            onChange(time, 'time');
                        }}
                        minTime={new Date()}
                    />
                </div>
                <div className="box">
                    Expiring Date
                    <DatePicker
                        value={expDate}
                        onChange={({ date }) => onChange(date, 'date')}
                    />
                </div>
            </div>

            <LinkBox value={link}></LinkBox>
        </>
    );
}
export default ShareModal;
