jest.mock('react-dnd', () => ({
    useDrop: () => [{isOver: false, canDrop: false}, jest.fn()],
    useDrag: () => [{isDragging: false}, jest.fn()],
}));

import React from "react";
import {shallow} from "enzyme";
import {testStore} from "../../../../Utils";
import FilesView from "./FilesView";
import toJson from "enzyme-to-json";
import {TEST_REDUX_PROPS} from "../../../utils/testData";

const setUp = (intialState = {}, props = {}) => {
    const store = testStore(intialState);
    const component = shallow(<FilesView {...props} store={store}/>);
    return component.childAt(0).dive();
};


describe("Files View", function () {
    describe('renders', function () {
        let wrapper;
        beforeEach(() => {
            const initialState = {

                ...TEST_REDUX_PROPS
            };

            const props = {
                containerID: '0',
            };
            wrapper = setUp(initialState, props)
        });

        it('should render without crashing', function () {
            expect(wrapper).toHaveLength(1)
        });

        it('should match snapshot', function () {
            expect(toJson(wrapper)).toMatchSnapshot()
        });
    });
});
