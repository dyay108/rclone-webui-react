import React from 'react';
import {useNavigate, useParams, useLocation} from 'react-router-dom';

/**
 * Compatibility shim replacing react-router-dom v5's withRouter HOC.
 * Provides a history-compatible object to class components that call this.props.history.push.
 */
export function withRouter(Component) {
    function Wrapped(props) {
        const navigate = useNavigate();
        const history = {
            push: (path) => navigate(path),
            replace: (path) => navigate(path, {replace: true}),
        };
        return <Component {...props} history={history} params={useParams()} location={useLocation()}/>;
    }
    Wrapped.displayName = `withRouter(${Component.displayName || Component.name})`;
    return Wrapped;
}
