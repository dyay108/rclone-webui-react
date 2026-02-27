import React from "react";
import {Card, CardBody, CardFooter} from "reactstrap";

import {ItemTypes} from './Constants'
import {useDrag} from 'react-dnd'
import {formatBytes} from "../../../utils/Tools";
import {performCopyFile, performMoveFile} from "../../../utils/API/API";
import {toast} from "react-toastify";
import * as PropTypes from "prop-types";
import MediaWidget, {isMedia} from "../../Base/MediaWidget/MediaWidget";
import {PROP_ITEM} from "../../../utils/RclonePropTypes";
import ErrorBoundary from "../../../ErrorHandling/ErrorBoundary";
import FileActions from "./FileActions";
import FileIcon from "./FileIcon";

async function performCopyMoveOperation(params) {
    const {srcRemoteName, srcRemotePath, destRemoteName, destRemotePath, Name, IsDir, dropEffect, updateHandler} = params;
    if (dropEffect === "move") { /*Default operation without holding alt is copy, named as move in react-dnd*/
        await performCopyFile(srcRemoteName, srcRemotePath, destRemoteName, destRemotePath, Name, IsDir);
        updateHandler();
        if (IsDir) {
            toast.info(`Directory copying started in background: ${Name}`);
        } else {
            toast.info(`File copying started in background: ${Name}`);
        }
    } else {
        await performMoveFile(srcRemoteName, srcRemotePath, destRemoteName, destRemotePath, Name, IsDir);
        updateHandler();
        if (IsDir) {
            toast.info(`Directory moving started in background: ${Name}`);
        } else {
            toast.info(`Directory moving started in background: ${Name}`);
        }
    }
}

/**
 * FileComponent renders an individual file/directory in the files view.
 * Uses useDrag hook from react-dnd v16.
 */
function FileComponent({
    containerID, inViewport, item, loadImages, clickHandler, downloadHandle,
    linkShareHandle, deleteHandle, gridMode, remoteName, remotePath
}) {
    const {IsDir, MimeType, ModTime, Name, Size} = item;

    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.FILECOMPONENT,
        item: () => ({
            Name,
            Path: item.Path,
            IsDir,
            remoteName,
            remotePath
        }),
        end: (draggedItem, monitor) => {
            try {
                if (monitor.getDropResult()) {
                    performCopyMoveOperation(monitor.getDropResult());
                }
            } catch (e) {
                const error = e.response ? e.response : e;
                toast.error(`Error copying file(s). ${error}`, {autoClose: false});
            }
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    });

    const handleClick = (e) => {
        if (IsDir) {
            clickHandler(e, item);
        }
    };

    let modTime = new Date(ModTime);
    let element;
    if (gridMode === "card") {
        element = (
            <div ref={drag} className={IsDir ? "" : "col-md-4"}>
                <Card>
                    <CardBody onClick={handleClick}>
                        {loadImages && isMedia(MimeType) ?
                            <MediaWidget containerID={containerID} item={item} inViewport={inViewport}/> :
                            <FileIcon IsDir={IsDir} MimeType={MimeType}/>
                        }
                        {Name}
                    </CardBody>
                    <CardFooter>
                        <FileActions downloadHandle={downloadHandle} linkShareHandle={linkShareHandle}
                                     deleteHandle={deleteHandle} item={item}/>
                    </CardFooter>
                </Card>
            </div>
        );
    } else {
        element = (
            <tr ref={drag} className="pointer-cursor fadeIn">
                <td onClick={(e) => clickHandler(e, item)}>
                    <FileIcon IsDir={IsDir} MimeType={MimeType}/>{" "}{Name}
                </td>
                <td>{Size === -1 ? "-" : formatBytes(Size, 2)}</td>
                <td className="d-none d-md-table-cell">{modTime.toLocaleDateString()}</td>
                <td><FileActions downloadHandle={downloadHandle} linkShareHandle={linkShareHandle}
                                 deleteHandle={deleteHandle} item={item}/></td>
            </tr>
        );
    }
    return <ErrorBoundary>{element}</ErrorBoundary>;
}

FileComponent.propTypes = {
    item: PROP_ITEM.isRequired,
    clickHandler: PropTypes.func.isRequired,
    downloadHandle: PropTypes.func.isRequired,
    deleteHandle: PropTypes.func.isRequired,
    linkShareHandle: PropTypes.func.isRequired,
    remoteName: PropTypes.string.isRequired,
    remotePath: PropTypes.string.isRequired,
    gridMode: PropTypes.string,
    containerID: PropTypes.string.isRequired,
    canMove: PropTypes.bool.isRequired,
    canCopy: PropTypes.bool.isRequired,
    loadImages: PropTypes.bool.isRequired,
    isBucketBased: PropTypes.bool.isRequired
};

export default FileComponent;
