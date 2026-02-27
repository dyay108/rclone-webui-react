import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Card, CardBody, Progress} from 'reactstrap';
import classNames from 'classnames';

const propTypes = {
    header: PropTypes.string,
    icon: PropTypes.string,
    color: PropTypes.string,
    value: PropTypes.string,
    children: PropTypes.node,
    className: PropTypes.string,
    cssModule: PropTypes.object,
    invert: PropTypes.bool,
};

const defaultProps = {
    header: '87.500',
    icon: 'icon-people',
    color: 'info',
    value: '25',
    children: 'Visitors',
    invert: false,
};

class BandwidthWidget extends Component {
    render() {
        const {className, cssModule, header, icon, color, value, children, invert, ...attributes} = this.props;

        // demo purposes only
        const progress = {style: '', color: color, value: value};
        const card = {style: '', bgColor: '', icon: icon};

        if (invert) {
            progress.style = 'progress-white';
            progress.color = '';
            card.style = 'text-white';
            card.bgColor = 'bg-' + color;
        }

        const classes = classNames(className, card.style, card.bgColor);
        progress.style = classNames('progress-xs mt-3 mb-0', progress.style);

        return (
            <Card className={classes} {...attributes}>
                <CardBody>
                    <div className="h1 text-muted text-end mb-2">
                        <i className={card.icon}></i>
                    </div>
                    <div className="h4 mb-0">{header}</div>
                    <small className="text-muted text-uppercase fw-bold">{children}</small>
                    <Progress className={progress.style} color={progress.color} value={progress.value}/>
                </CardBody>
            </Card>
        );
    }
}

BandwidthWidget.propTypes = propTypes;
BandwidthWidget.defaultProps = defaultProps;

export default BandwidthWidget;
