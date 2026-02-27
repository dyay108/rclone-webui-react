import React, {useCallback, useState} from "react";
import axiosInstance from "../../../utils/API/API";
import {Alert, Col, Container, Row, Spinner, Table} from "reactstrap";
import {useDrop} from "react-dnd";
import FileComponent from "./FileComponent";
import {ItemTypes} from "./Constants";
import {toast} from "react-toastify";
import {
    addColonAtLast,
    changeListVisibility,
    changeSearchFilter,
    getSortCompareFunction,
    isEmpty
} from "../../../utils/Tools";
import {connect} from "react-redux";
import {getFiles} from "../../../actions/explorerActions";
import {changePath, changeSortFilter, navigateUp} from "../../../actions/explorerStateActions";
import LinkShareModal from "../../Base/LinkShareModal/LinkShareModal";
import ScrollableDiv from "../../Base/ScrollableDiv/ScrollableDiv";
import {FILES_VIEW_HEIGHT} from "../../../utils/Constants";
import {PROP_CURRENT_PATH, PROP_FS_INFO} from "../../../utils/RclonePropTypes";
import * as PropTypes from 'prop-types';
import ErrorBoundary from "../../../ErrorHandling/ErrorBoundary";
import {createNewPublicLink, deleteFile, purgeDir} from "rclone-api";
import {createSelector} from "reselect";
import DropOverlay from "../../Base/DropOverlay/DropOverlay";

/**
 * FilesView component renders files in the file explorer.
 * Uses useDrop hook from react-dnd v16.
 */
function FilesView(props) {
    const {
        containerID, currentPath, files, gridMode, fsInfo, loadImages,
        sortFilter, sortFilterAscending, getFiles, changePath, changeSortFilter
    } = props;

    const [isDownloadProgress, setIsDownloadProgress] = useState(false);
    const [downloadingItems, setDownloadingItems] = useState(0);
    const [showLinkShareModal, setShowLinkShareModal] = useState(false);
    const [generatedLink, setGeneratedLink] = useState("");

    const updateHandler = useCallback(() => {
        const {remoteName, remotePath} = currentPath;
        getFiles(remoteName, remotePath);
    }, [currentPath, getFiles]);

    const [{ isOver, canDrop }, drop] = useDrop({
        accept: ItemTypes.FILECOMPONENT,
        drop: (draggedItem, monitor) => {
            if (monitor.didDrop()) return;
            const {Name, Path, IsDir, remoteName} = draggedItem;
            return {
                srcRemoteName: addColonAtLast(remoteName),
                srcRemotePath: Path,
                destRemoteName: addColonAtLast(currentPath.remoteName),
                destRemotePath: currentPath.remotePath,
                Name,
                IsDir,
                updateHandler
            };
        },
        canDrop: (draggedItem) => {
            const {remoteName, remotePath} = draggedItem;
            const destRemoteName = currentPath.remoteName;
            const destRemotePath = currentPath.remotePath;
            if (destRemoteName === remoteName) {
                return destRemotePath !== remotePath;
            }
            return true;
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop()
        })
    });

    const updateRemotePath = (newRemotePath, IsDir, IsBucket) => {
        const {remoteName} = currentPath;
        let updateRemoteName = "";
        let updateRemotePath = "";
        if (IsBucket) {
            updateRemoteName = addColonAtLast(remoteName) + newRemotePath;
            updateRemotePath = "";
        } else if (IsDir) {
            updateRemoteName = remoteName;
            updateRemotePath = newRemotePath;
        }
        changePath(containerID, updateRemoteName, updateRemotePath);
    };

    const handleFileClick = (e, item) => {
        const {Path, IsDir, IsBucket} = item;
        if (IsDir || IsBucket) {
            updateRemotePath(Path, IsDir, IsBucket);
        } else {
            downloadHandle(item);
        }
    };

    const downloadHandle = async (item) => {
        const {remoteName, remotePath} = currentPath;
        let downloadUrl = "";
        if (fsInfo.Features.BucketBased) {
            downloadUrl = `/[${remoteName}]/${remotePath}/${item.Name}`;
        } else {
            downloadUrl = `/[${remoteName}:${remotePath}]/${item.Name}`;
        }

        setDownloadingItems(prev => prev + 1);
        setIsDownloadProgress(true);

        let response = await axiosInstance({
            url: downloadUrl,
            method: 'GET',
            responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', item.Name);
        document.body.appendChild(link);
        link.click();

        setDownloadingItems(prev => {
            const next = prev - 1;
            if (next === 0) setIsDownloadProgress(false);
            return next;
        });
    };

    const deleteHandle = async (item) => {
        const {remoteName} = currentPath;
        try {
            if (item.IsDir) {
                await purgeDir(remoteName, item.Path);
                updateHandler();
                toast.info(`${item.Name} deleted.`);
            } else {
                await deleteFile(remoteName, item.Path);
                updateHandler();
                toast.info(`${item.Name} deleted.`, {autoClose: true});
            }
        } catch (e) {
            toast.error(`Error deleting file. ${e}`, {autoClose: false});
        }
    };

    const dismissAlert = () => {
        setIsDownloadProgress(false);
    };

    const linkShareHandle = (item) => {
        if (fsInfo.Features.PublicLink) {
            const {remoteName} = currentPath;
            createNewPublicLink(remoteName, item.Path)
                .then((res) => {
                    setGeneratedLink(res.url);
                    setShowLinkShareModal(true);
                }, (error) => {
                    toast.error("Error Generating link: " + error);
                });
        } else {
            toast.error("This remote does not support public link");
        }
    };

    const getFileComponents = (isDir) => {
        const {remoteName, remotePath} = currentPath;
        if (fsInfo && !isEmpty(fsInfo)) {
            return files.reduce((result, item) => {
                let {ID, Name} = item;
                if (ID === undefined) {
                    ID = Name;
                }
                if (item.IsDir === isDir) {
                    result.push(
                        <FileComponent key={ID} item={item} clickHandler={handleFileClick}
                                       downloadHandle={downloadHandle} deleteHandle={deleteHandle}
                                       remoteName={remoteName} remotePath={remotePath} gridMode={gridMode}
                                       containerID={containerID}
                                       linkShareHandle={linkShareHandle}
                                       loadImages={loadImages}
                                       isBucketBased={fsInfo.Features.BucketBased}
                                       canCopy={fsInfo.Features.Copy} canMove={fsInfo.Features.Move} itemIdx={1}>
                        </FileComponent>
                    );
                }
                return result;
            }, []);
        }
    };

    const applySortFilter = (filter) => {
        if (sortFilter === filter) {
            return changeSortFilter(containerID, filter, (sortFilterAscending !== true));
        } else {
            return changeSortFilter(containerID, filter, true);
        }
    };

    if (!files) {
        return (<div><Spinner color="primary"/> Loading</div>);
    }

    const {remoteName} = currentPath;

    if (remoteName === "") {
        return (<div>No remote is selected. Select a remote from above to show files.</div>);
    }

    const dirComponentMap = getFileComponents(true);
    const fileComponentMap = getFileComponents(false);

    let renderElement;

    if (gridMode === "card") {
        renderElement = (
            <Container fluid={true}>
                <Row>
                    <Col lg={3}>
                        <h3>Directories</h3>
                        <ScrollableDiv height={FILES_VIEW_HEIGHT}>
                            {dirComponentMap}
                        </ScrollableDiv>
                    </Col>
                    <Col lg={9}>
                        <h3>Files</h3>
                        <ScrollableDiv height={FILES_VIEW_HEIGHT}>
                            <Row>
                                {fileComponentMap}
                            </Row>
                        </ScrollableDiv>
                    </Col>
                </Row>
            </Container>
        );
    } else {
        let filterIconClass = "fa fa-lg fa-arrow-down";
        if (sortFilterAscending) {
            filterIconClass = "fa fa-lg fa-arrow-up";
        }
        renderElement = (
            <Container fluid={true} className={"p-0"}>
                <ScrollableDiv height={FILES_VIEW_HEIGHT}>
                    <Table className="table table-responsive-sm table-striped table-fix-head">
                        <thead>
                        <tr>
                            <th className="pointer-cursor"
                                onClick={() => applySortFilter("name")}>Name {sortFilter === "name" &&
                            <i className={filterIconClass}/>}</th>
                            <th className="pointer-cursor"
                                onClick={() => applySortFilter("size")}>Size {sortFilter === "size" &&
                            <i className={filterIconClass}/>}</th>
                            <th className="d-none d-md-table-cell pointer-cursor"
                                onClick={() => applySortFilter("modified")}>Modified {sortFilter === "modified" &&
                            <i className={filterIconClass}/>}</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {files.length > 0 ? (
                            <React.Fragment>
                                <tr>
                                    <th colSpan={4}>Directories</th>
                                </tr>
                                {dirComponentMap}
                                <tr>
                                    <th colSpan={4}>Files</th>
                                </tr>
                                {fileComponentMap}
                            </React.Fragment>
                        ) : (
                            <tr>
                                <th colSpan={4}>Files</th>
                            </tr>
                        )}
                        </tbody>
                    </Table>
                </ScrollableDiv>
            </Container>
        );
    }

    return (
        <div ref={drop} className={"row"}>
            {isOver && canDrop && <DropOverlay/>}
            <ErrorBoundary>
                <Alert color="info" isOpen={isDownloadProgress} toggle={dismissAlert} sm={12} lg={12}>
                    Downloading {downloadingItems} file(s). Please wait.
                </Alert>
                {renderElement}
                <LinkShareModal closeModal={() => setShowLinkShareModal(false)} isVisible={showLinkShareModal}
                                linkUrl={generatedLink}/>
            </ErrorBoundary>
        </div>
    );
}

FilesView.propTypes = {
    containerID: PropTypes.string.isRequired,
    currentPath: PROP_CURRENT_PATH.isRequired,
    fsInfo: PROP_FS_INFO,
    gridMode: PropTypes.string,
    searchQuery: PropTypes.string,
    loadImages: PropTypes.bool.isRequired
};

const getVisibleFiles = createSelector(
    (state, props) => props.containerID,
    (state, props) => state.explorer.currentPaths[props.containerID],
    (state, props) => state.explorer.visibilityFilters[props.containerID],
    (state, props) => state.explorer.sortFilters[props.containerID],
    (state, props) => state.explorer.searchQueries[props.containerID],
    (state, props) => state.explorer.sortFiltersAscending[props.containerID],
    (state, props) => state.remote.files[`${state.explorer.currentPaths[props.containerID].remoteName}-${state.explorer.currentPaths[props.containerID].remotePath}`],
    (containerID, currentPath, visibilityFilter, sortFilter, searchQuery, sortFilterAscending, files) => {
        files = files.files;
        if (visibilityFilter && visibilityFilter !== "") {
            files = changeListVisibility(files, visibilityFilter);
        }
        if (searchQuery) {
            files = changeSearchFilter(files, searchQuery);
        }
        files.sort(getSortCompareFunction(sortFilter, sortFilterAscending));
        return files;
    }
)

const mapStateToProps = (state, ownProps) => {
    const {currentPaths, gridMode, searchQueries, loadImages, sortFilters, sortFiltersAscending} = state.explorer;
    const {containerID} = ownProps;
    const currentPath = currentPaths[containerID];
    const mgridMode = gridMode[containerID];
    const searchQuery = searchQueries[containerID];
    const mloadImages = loadImages[containerID];
    const sortFilter = sortFilters[containerID];
    const sortFilterAscending = sortFiltersAscending[containerID];

    let fsInfo = {};
    const {remoteName, remotePath} = currentPath;

    if (currentPath && state.remote.configs) {
        const tempRemoteName = remoteName.split(':')[0];
        if (state.remote.configs[tempRemoteName])
            fsInfo = state.remote.configs[tempRemoteName];
    }

    const pathKey = `${remoteName}-${remotePath}`;
    let files = state.remote.files[pathKey];
    if (files) {
        files = getVisibleFiles(state, ownProps);
    }

    return {
        files,
        currentPath,
        fsInfo,
        gridMode: mgridMode,
        searchQuery,
        loadImages: mloadImages,
        sortFilter,
        sortFilterAscending
    }
};

export default connect(mapStateToProps, {getFiles, navigateUp, changePath, changeSortFilter})(FilesView);
