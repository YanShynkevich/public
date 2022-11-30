/* Do not change these import lines to match external modules in webpack configuration */
import * as grok from 'datagrok-api/grok';
import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';

export const _package = new DG.Package();

import { callWasm } from '../wasm/callWasm';

//name: info
export function info() {
  grok.shell.info(_package.webRoot);
}

//tags: init
export async function init() {
  await initEigenPLS();  
}

//top-menu: Tools | Data Science | MVA (PLS) by Eigen
//name: pls
//input: dataframe df
//input: column predict
//input: column_list features
//input: int components = 3
export function pls(df, predict, features, components) {
     
  // CALL EXPORTED C++--FUNCTION
  let callOutput = callWasm(EigenPLS, 'partialLeastSquareRegressionExtended', 
    [features, predict, components]);    

  // CREATING VISUALIZATION
  
  let dfView = grok.shell.getTableView(df.name);

  // Predicted vs Reference scatter plot

  let prediction = callOutput[0];
  prediction.name = predict.name + '(predicted)';

  let dfReferencePrediction = DG.DataFrame.fromColumns([predict, prediction]);
  dfReferencePrediction.name = 'Reference vs. Predicted';
  
  dfView.addViewer(DG.Viewer.scatterPlot(dfReferencePrediction, 
    { title: dfReferencePrediction.name,
      x: predict.name,
      y: prediction.name,
      showRegressionLine: true,
      markerType: 'circle'
     }));

  // Regression Coefficients Bar Chart
  let regressionCoefficients = callOutput[1];
  regressionCoefficients.name = 'regression coefficient';

  let namesOfPredictors = [];
  for(let col of features)
    namesOfPredictors.push(col.name); 
  
  let  predictorNamesColumn = DG.Column.fromStrings('feature', namesOfPredictors);  

  let dfRegrCoefs = DG.DataFrame.fromColumns([predictorNamesColumn, regressionCoefficients]);
  dfRegrCoefs.name = 'Regression Coefficients';
    
  dfView.addViewer(DG.Viewer.barChart(dfRegrCoefs, 
    {title: dfRegrCoefs.name, split: 'feature', 
     value: 'regression coefficient', valueAggrType: 'avg'}));
  

  let scoresColumns = [];
  
  let xScores = callOutput[2];
  for(let i = 0; i < xScores.length; i++) {
    xScores[i].name = `x${i + 1}.score.t${i+1}`;
    scoresColumns.push(xScores[i]);
  }

  let yScores = callOutput[3];
  for(let i = 0; i < yScores.length; i++) {
    yScores[i].name = `y${i + 1}.score.u${i+1}`;
    scoresColumns.push(yScores[i]);
  }  

  let scores = DG.DataFrame.fromColumns(scoresColumns);
  scores.name = 'Scores';
  //grok.shell.addTableView(scores);

  dfView.addViewer(DG.Viewer.scatterPlot(scores, 
    { title: scores.name,
      x: 'x1.score.t1',
      y: 'y1.score.u1',      
      markerType: 'circle'
     }));

  //df.columns.add(prediction);    
}

