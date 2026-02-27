jest.mock('react-router-dom', () => ({
    useNavigate: () => jest.fn(),
}));

import React from "react";
import {shallow} from "enzyme";
import {findByTestAttr} from "../../../../Utils";
import toJson from "enzyme-to-json";
import ConfigRow from "./ConfigRow";

const setUp = (props = {}) => {
    return shallow(<ConfigRow {...props}/>);
};


describe('Config Row', function () {

    let refreshHandle = jest.fn();

    describe('renders', function () {
        let wrapper;
        beforeEach(() => {
            const props = {
                sequenceNumber: 1,
                key: 1,
                remoteName: 'local',
                remote: {
                    token: '',
                    type: 'drive'
                },
                refreshHandle: refreshHandle
            };
            wrapper = setUp(props)
        });

        it('should render without crashing', function () {
            const component = findByTestAttr(wrapper, "configRowComponent");
            expect(component).toHaveLength(1);
        });

        it('should match snapshot', function () {
            expect(toJson(wrapper)).toMatchSnapshot()
        });

    });

});