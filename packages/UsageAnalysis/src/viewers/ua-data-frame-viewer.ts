import {UaQueryViewer} from "./ua-query-viewer";
import {UaFilter} from "../filter2";

export class UaDataFrameViewer extends UaQueryViewer {

    public constructor(name: string, queryName: string, viewerFunction: Function, setStyle?: Function, staticFilter?: Object) {
        super(name, queryName, viewerFunction, setStyle, staticFilter);
    }

    init(): void {
        this.root.innerHTML = '';
        this.root.append(
            this.addCardWithFilters(
                this.name,
                this.queryName,
                new UaFilter(),
                this.viewerFunction
            )
        );
    }

}