import React, {Component} from 'react';
import {NavLink} from 'react-router-dom';
import {Nav, NavItem} from 'reactstrap';
import PropTypes from 'prop-types';

import {CNavbarBrand, CToggler} from '@coreui/react';
import logo from '../../assets/img/brand/logo.png'
import favicon from '../../assets/img/brand/favicon.png'
import BackendStatusCard from "../../views/Base/BackendStatusCard/BackendStatusCard";

const propTypes = {
    children: PropTypes.node,
};

const defaultProps = {};

class DefaultHeader extends Component {
    render() {

        // eslint-disable-next-line
        const {children, ...attributes} = this.props;

        return (
            <React.Fragment>
                <CToggler className="d-lg-none" inHeader/>
                <CNavbarBrand
                    full={{src: logo, width: 89, height: 25, alt: 'Rclone Logo'}}
                    minimized={{src: favicon, width: 30, height: 30, alt: 'Rclone Logo'}}
                />
                <CToggler className="d-none d-md-block" inHeader/>

                <Nav className="d-none d-md-flex" navbar>
                    <NavItem className="px-3">
                        <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
                    </NavItem>

                </Nav>
                <Nav className="ms-auto" navbar>
                    <BackendStatusCard mode={"button"}/>
                </Nav>

            </React.Fragment>
        );
    }
}

DefaultHeader.propTypes = propTypes;
DefaultHeader.defaultProps = defaultProps;

export default DefaultHeader;
