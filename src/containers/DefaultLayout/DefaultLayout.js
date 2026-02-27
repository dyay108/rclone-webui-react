import React, {Component, Suspense} from 'react';
import {Navigate, NavLink, Route, Routes} from 'react-router-dom';
import {withRouter} from '../../utils/withRouter';
import {Container} from 'reactstrap';
import {getVersion} from "../../actions/versionActions";

// sidebar nav config
import navigation from '../../_nav';
// routes config
import routes from '../../routes';
import {connect} from "react-redux";
import {AUTH_KEY, LOGIN_TOKEN} from "../../utils/Constants";
import ErrorBoundary from "../../ErrorHandling/ErrorBoundary";

const DefaultFooter = React.lazy(() => import('./DefaultFooter'));
const DefaultHeader = React.lazy(() => import('./DefaultHeader'));

const SIDEBAR_WIDTH = 200;
const HEADER_HEIGHT = 55;

class DefaultLayout extends Component {

    loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>;

    get navItems() {
        return [
            ...navigation.items,
            {
                name: this.props.version.version,
                url: 'https://rclone.org/changelog',
                icon: 'fa fa-cog',
                target: '_blank',
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
            <div data-test="defaultLayout">
                <ErrorBoundary>
                    {/* Fixed top header */}
                    <header
                        className="navbar bg-dark fixed-top px-3"
                        style={{height: HEADER_HEIGHT, zIndex: 1030}}
                    >
                        <Suspense fallback={this.loading()}>
                            <DefaultHeader/>
                        </Suspense>
                    </header>

                    <div className="d-flex" style={{marginTop: HEADER_HEIGHT}}>
                        {/* Fixed sidebar */}
                        <nav
                            className="bg-dark flex-shrink-0 overflow-auto"
                            style={{
                                width: SIDEBAR_WIDTH,
                                minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
                                position: 'sticky',
                                top: HEADER_HEIGHT,
                                alignSelf: 'flex-start',
                            }}
                        >
                            <ul className="nav flex-column py-2">
                                {this.navItems.map((item, idx) => (
                                    <li className="nav-item" key={idx}>
                                        <NavLink
                                            to={item.url}
                                            target={item.target}
                                            className={({isActive}) =>
                                                'nav-link text-white' + (isActive ? ' active fw-bold' : '')
                                            }
                                        >
                                            {item.icon && <i className={`${item.icon} me-2`}/>}
                                            {item.name}
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        {/* Main content */}
                        <main className="flex-grow-1" style={{minWidth: 0}}>
                            <Container fluid className="pt-3">
                                <Suspense fallback={this.loading()}>
                                    <Routes>
                                        {routes.map((route, idx) =>
                                            route.component ? (
                                                <Route
                                                    key={idx}
                                                    path={route.path}
                                                    element={<route.component/>}
                                                />
                                            ) : null
                                        )}
                                        <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
                                    </Routes>
                                </Suspense>
                            </Container>
                        </main>
                    </div>

                    {/* Footer */}
                    <footer className="py-2 px-3 border-top bg-white">
                        <Suspense fallback={this.loading()}>
                            <DefaultFooter/>
                        </Suspense>
                    </footer>
                </ErrorBoundary>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    isConnected: state.status.isConnected,
    version: state.version,
});

export default withRouter(connect(mapStateToProps, {getVersion})(DefaultLayout));
