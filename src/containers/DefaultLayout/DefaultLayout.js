import React, {Component, Suspense} from 'react';
import {Navigate, Route, Routes} from 'react-router-dom';
import {withRouter} from '../../utils/withRouter';
import {Container} from 'reactstrap';
import {getVersion} from "../../actions/versionActions";

import {
    CBreadcrumb,
    CFooter,
    CHeader,
    CSidebar,
    CSidebarFooter,
    CSidebarNav,
    CSidebarNavItem,
    CSidebarMinimizer,
} from '@coreui/react';
// sidebar nav config
import navigation from '../../_nav';
// routes config
import routes from '../../routes';
import {connect} from "react-redux";
import {AUTH_KEY, LOGIN_TOKEN} from "../../utils/Constants";
import ErrorBoundary from "../../ErrorHandling/ErrorBoundary";

// const DefaultAside = React.lazy(() => import('./DefaultAside'));
const DefaultFooter = React.lazy(() => import('./DefaultFooter'));
const DefaultHeader = React.lazy(() => import('./DefaultHeader'));

const VERSION_NAV_ITEM_ATTRS = {
    className: 'mt-auto',
    fontIcon: 'fa fa-cog',
    to: 'https://rclone.org/changelog',
    target: '_blank',
    color: 'success'
}

class DefaultLayout extends Component {

    loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>;

    get navItems() {
        return [
            ...navigation.items,
            {
                name: this.props.version.version,
                ...VERSION_NAV_ITEM_ATTRS
            }
        ];
    }

    componentDidMount() {
        if (!localStorage.getItem(AUTH_KEY) || window.location.href.indexOf(LOGIN_TOKEN) > 0) {
            this.props.history.push('/login');
        } else {
            this.props.getVersion();
        }
    }

    render() {
        return (
            <div className="app" data-test="defaultLayout">
                <ErrorBoundary>
                    <CHeader fixed>
                        <Suspense fallback={this.loading()}>
                            <DefaultHeader onLogout={e => this.signOut(e)}/>
                        </Suspense>
                    </CHeader>
                    <div className="app-body">
                        <CSidebar fixed breakpoint="lg">
                            <CSidebarNav>
                                <Suspense fallback={this.loading()}>
                                    {this.navItems.map((item, idx) => (
                                        <CSidebarNavItem
                                            key={idx}
                                            name={item.name}
                                            to={item.to || item.url}
                                            fontIcon={item.fontIcon || item.icon}
                                            target={item.target}
                                            className={item.className || item.class}
                                            color={item.color}
                                        />
                                    ))}
                                </Suspense>
                            </CSidebarNav>
                            <CSidebarFooter/>
                            <CSidebarMinimizer/>
                        </CSidebar>
                        <main className="main">
                            <CBreadcrumb appRoutes={routes}/>
                            <Container fluid>
                                <Suspense fallback={this.loading()}>
                                    <Routes>
                                        {
                                            routes.map((route, idx) => {
                                                return route.component ? (
                                                    <Route
                                                        key={idx}
                                                        path={route.path}
                                                        element={<route.component />}/>
                                                ) : (null);
                                            })
                                        }
                                        <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
                                    </Routes>
                                </Suspense>
                            </Container>
                        </main>
                    </div>
                    <CFooter>
                        <Suspense fallback={this.loading()}>
                            <DefaultFooter/>
                        </Suspense>
                    </CFooter>
                </ErrorBoundary>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    isConnected: state.status.isConnected,
    version: state.version,
});

export default withRouter(connect(mapStateToProps, { getVersion })(DefaultLayout));
