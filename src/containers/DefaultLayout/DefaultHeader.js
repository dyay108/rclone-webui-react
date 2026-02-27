import React, {Component} from 'react';
import {NavLink} from 'react-router-dom';
import {Nav, NavItem} from 'reactstrap';
import PropTypes from 'prop-types';
import logo from '../../assets/img/brand/logo.png';
import BackendStatusCard from "../../views/Base/BackendStatusCard/BackendStatusCard";

const propTypes = {
    children: PropTypes.node,
};

const defaultProps = {};

class DefaultHeader extends Component {
    render() {
        return (
            <React.Fragment>
                <NavLink to="/dashboard" className="navbar-brand me-3">
                    <img src={logo} height="25" alt="Rclone Logo"/>
                </NavLink>

                <Nav className="d-none d-md-flex me-auto" navbar>
                    <NavItem className="px-3">
                        <NavLink to="/dashboard" className="nav-link text-white">Dashboard</NavLink>
                    </NavItem>
                </Nav>

                <div className="ms-auto">
                    <BackendStatusCard mode={"button"}/>
                </div>
            </React.Fragment>
        );
    }
}

DefaultHeader.propTypes = propTypes;
DefaultHeader.defaultProps = defaultProps;

export default DefaultHeader;
