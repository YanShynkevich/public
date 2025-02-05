import * as grok from 'datagrok-api/grok';
import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';
import $ from 'cash-dom';
import '../../css/usage_analysis.css';
import {UaToolbox} from "../ua-toolbox";
import {UaView} from "./ua-view";
import {UaFilter} from "../filter2";
import {UaFilterableQueryViewer} from "../viewers/ua-filterable-query-viewer";
import {UaQueryViewer} from "../viewers/abstract/ua-query-viewer";
import {TopPackagesViewer} from "../drilldown_viewers/events/top-packages-viewer";
import {TopPackageFunctionsViewer} from "../drilldown_viewers/events/top-package-functions-viewer";
import {TopFunctionsViewer} from "../drilldown_viewers/events/top-functions-viewer";
import {TopSourcesViewer} from "../drilldown_viewers/events/top-sources-viewer";

export class EventsView extends UaView {
  topPackagesViewer: TopPackagesViewer | null = null;
  constructor(uaToolbox: UaToolbox) {
    super('Events', uaToolbox);
  }

  async initViewers() : Promise<void> {
    let topFunctionsViewer = new TopFunctionsViewer(this.uaToolbox.filterStream);
    this.viewers.push(topFunctionsViewer);

    let topPackageFunctionsViewer = new TopPackageFunctionsViewer('Package Functions','TopPackageFunctions', this.uaToolbox.filterStream, null,true);
    this.viewers.push(topPackageFunctionsViewer);

    this.topPackagesViewer = new TopPackagesViewer('Packages', 'TopPackages', this.uaToolbox.filterStream);
    this.viewers.push(this.topPackagesViewer);

    let eventsViewer = new UaFilterableQueryViewer(
        this.uaToolbox.filterStream,
        'Events',
        'Events1',
        (t: DG.DataFrame) => {
          let viewer = DG.Viewer.lineChart(t, UaQueryViewer.defaultChartOptions).root;
          viewer.style.maxHeight = '150px';
          return viewer;
        }
    );
    this.viewers.push(eventsViewer);

    let topSourcesViewer = new TopSourcesViewer(this.uaToolbox.filterStream);
    this.viewers.push(topSourcesViewer);

    this.root.append(ui.divV([
          ui.divH([ui.block([eventsViewer.root])]),
          ui.divH([ui.block50([this.topPackagesViewer.root]), ui.block50([topPackageFunctionsViewer.root])]),
          ui.divH([ui.block50([topFunctionsViewer.root]), ui.block50([topSourcesViewer.root])])
        ])
    );
  }

  handleUrlParams(params: Map<string,string>) : void {
    if (params.has('package')) {
      // @ts-ignore
      this.topPackagesViewer?.categorySelected(params.get('package'));
    }
  }

}