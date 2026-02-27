import React from "react";
import axiosInstance from "../../../utils/API/API";
import {Button} from "reactstrap";
import * as PropTypes from "prop-types";
import {toast} from "react-toastify";
import {useNavigate} from "react-router-dom";
import urls from "../../../utils/API/endpoint";


function ConfigRow({remote, remoteName, refreshHandle, sequenceNumber}) {
    const navigate = useNavigate();
    const remoteWithName = {...remote, name: remoteName};

    const onUpdateClicked = () => {
        navigate("/newdrive/edit/" + remoteWithName.name);
    };

    const onDeleteClicked = () => {
        const {name} = remoteWithName;

        if (window.confirm(`Are you sure you wish to delete ${name}? You cannot restore it once it is deleted.`)) {
            axiosInstance.post(urls.deleteConfig, {name: name}).then(
                () => {
                    refreshHandle();
                    toast.info('Config deleted');
                },
                () => {
                    toast.error('Error deleting config');
                }
            );
        }
    };

    const {name, type} = remoteWithName;
    return (
        <tr data-test="configRowComponent">
            <th scope="row">{sequenceNumber}</th>
            <td>{name}</td>
            <td>{type}</td>
            <td>
                <Button className={"bg-info me-2"} onClick={onUpdateClicked}>Update</Button>
                <Button className={"bg-danger"} onClick={onDeleteClicked}>Delete</Button>
            </td>
        </tr>
    );
}

const propTypes = {
    remote: PropTypes.object.isRequired,
    refreshHandle: PropTypes.func.isRequired,
    sequenceNumber: PropTypes.number.isRequired,
    remoteName: PropTypes.string.isRequired,
};

ConfigRow.propTypes = propTypes;

export default ConfigRow;