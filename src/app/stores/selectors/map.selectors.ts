import {AppState} from '../models/app-model.state';
import {createSelector} from '@ngrx/store';

// NOTE: Map Selector is a MapList[]
export const mapSelector = (state: AppState) => state.maps;

export const SelectMapByID = ({id}) => createSelector(
    mapSelector,
    map => map.filter(val => val.id === id)[0]
);
