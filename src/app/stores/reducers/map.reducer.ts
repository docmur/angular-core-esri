import {MapList} from '../models/map.model';
import {MapActions, MapActionTypes} from '../actions/map.actions';
import * as _ from 'lodash';

const initialState: MapList[] = [];

export function MapReducer( state: MapList[] = initialState, action: MapActions): MapList[] {
    switch (action.type) {
        case MapActionTypes.ADD_MAP:
            // NOTE: If we add a map, append the new map to the end of the current
            // NOTE: list of maps we have in the store
            return [...state, action.payload];
        case MapActionTypes.UPDATE_MAP:
            // NOTE: If we update a map, find the map and update it's information
            // NOTE: this an attempt to update the view
            _.forEach(state, (map: MapList) => {
                // NOTE: Look for the right map (id should match)
                if (map.id === action.payload.id) {
                    // NOTE: The only field we should update is the view
                    map.view = action.payload.view;
                    map.container = action.payload.container;
                }
            });
            return state;
        default:
            return state;
    }
}
