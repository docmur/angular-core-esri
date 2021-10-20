import { Action } from '@ngrx/store';
import { MapList } from '../models/map.model';

// NOTE: List of available actions (Add, Remove)
export enum MapActionTypes {
    ADD_MAP = '[MAP] Add Map',
    ADD_MAP_FAILURE = '[MAP] Add Map Failure',          // NOTE: Not sure right now
    ADD_MAP_SUCCESS = '[MAP] Add Map Success',          // NOTE: Not sure right now
    REMOVE_MAP = '[MAP] Remove Map',
    REMOVE_MAP_FAILURE = '[MAP] Remove Map Failure',    // NOTE: Not sure right now
    REMOVE_MAP_SUCCESS = '[MAP] Remove Map Success',    // NOTE: Not sure right now
    UPDATE_MAP = '[MAP] Update Map',
    UPDATE_MAP_FAILURE = '[MAP] Update Map Failure',    // NOTE: Not sure right now
    UPDATE_MAP_SUCCESS = '[MAP] Update Map Successful', // NOTE: Not sure right now
}

export class AddMapAction implements Action {
    readonly type = MapActionTypes.ADD_MAP;

    constructor(public payload: MapList) {
    }
}


export class RemoveMapAction implements Action {
    readonly type = MapActionTypes.REMOVE_MAP;
}

export class UpdateMapAction implements Action {
    readonly type = MapActionTypes.UPDATE_MAP;

    constructor(public payload: MapList) {
    }
}

export type MapActions =
    AddMapAction
    | RemoveMapAction
    | UpdateMapAction;
