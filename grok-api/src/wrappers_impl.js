import {Column, DataFrame} from "./dataframe";
import {Project, Property, SemanticValue, User} from "./entities";
import {EventData} from "./events";
import {Menu} from "./ui_classes";
import {TableView, View} from "./view";
import {TYPE, TYPES_SCALAR} from "./const";
import {GridCellRenderArgs} from "./grid";

export function paramsToJs(params) {
        let result = [];
        for (let i = 0; i < params.length; i++) {
            let type = grok_GetType(params[i]);
            if (type !== null && !TYPES_SCALAR.has(type))
                result.push(this.toJs(params[i]));
            else
                result.push(params[i]);
        }

        return result;
    }

    /** Instantiates the corresponding JS handler for the Dart object [d]. */
    export function toJs(d, check = true) {
        let type = grok_GetType(d);
        switch (type) {
            case TYPE.DATA_FRAME:
                return new DataFrame(d);
            case TYPE.COLUMN:
                return new Column(d);
            case TYPE.PROPERTY:
                return new Property(d);
            case TYPE.PROJECT:
                return new Project(d);
            case TYPE.USER:
                return new User(d);
            case TYPE.SEMANTIC_VALUE:
                return new SemanticValue(d);
            case TYPE.MENU:
                return new Menu(d);
            case TYPE.GRID_CELL_RENDER_ARGS:
                return new GridCellRenderArgs(d);
            case TYPE.EVENT_DATA:
                return new EventData(d);
            case TYPE.VIEW:
                return new View(d);
            case TYPE.TABLE_VIEW:
                return new TableView(d);
        }

        if (check)
            throw `Not supported type: ${type}`;

        return d;
    }

   export function toDart(x) {
        return (typeof x.d !== 'undefined') ? x.d : x;
    }


