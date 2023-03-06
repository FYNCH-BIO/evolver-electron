// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ReactEcharts from 'echarts-for-react';  // or var ReactEcharts = require('echarts-for-react');
const remote = require('electron').remote;
const app = remote.app;
const fs = require('fs')
const path = require('path');
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';



const styles = theme => ({
  title: {
    color: 'white',
    fontWeight: 'bold',
    position: 'absolute',
    whiteSpace: 'nowrap',
    textAlign: 'center'
  },
  xaxisTitle: {
    display: 'flex',
    backgroundColor: 'black',
    position: 'absolute',
    top: '570px',
    left: '275px'
  },
  yaxisTitle: {
    backgroundColor: 'black',
    position: 'absolute',
    top: '385px',
    left: '-25px',
    transform: 'rotate(-90deg)',
    textAlign: 'center'
  },
  xaxisTitleCalibration: {
    display: 'flex',
    backgroundColor: 'black',
    position: 'absolute',
    top: '570px',
    left: '390px'
  },
  yaxisTitleCalibration: {
    backgroundColor: 'black',
    position: 'absolute',
    top: '385px',
    left: '-60px',
    transform: 'rotate(-90deg)',
    textAlign: 'center'
  }
});


class VialArrayGraph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      option: this.initializeGraphs(0),
      ymax: this.props.ymax,
      ymin: -0.1,
      timePlotted: this.props.timePlotted,
      downsample: this.props.downsample,
      parameter: this.props.parameter,
      yaxisName: this.props.yaxisName,
      xaxisName: this.props.xaxisName,
      activePlot: this.props.activePlot,
      data: [],
      loaded: false,
      missingData: false,
      selectedSmartQuad: this.props.selectedSmartQuad,
      useDatazoomForAll: false,
      datazoomStart: 0,
      datazoomEnd: 100,
      dataType: this.props.dataType,
      passedData: this.props.passedData,
      displayCalibration: this.props.displayCalibration
    };
  }

  timeTicket = null;

  componentDidUpdate(prevProps) {
    if (this.props.selectedSmartQuad !== prevProps.selectedSmartQuad) {
      this.setState({ selectedSmartQuad: this.props.selectedSmartQuad},
        () => this.getData())
    }
    if (this.props.activePlot !== prevProps.activePlot) {
      this.setState({ activePlot: this.props.activePlot},
        () => this.getData())
    }
    if (this.props.ymax !== prevProps.ymax) {
      this.setState({ ymax: this.props.ymax, loaded: false, missingData: false},
        () => this.getData())
    }
    if (this.props.parameter !== prevProps.parameter) {
      this.setState({
        parameter: this.props.parameter,
        ymax: this.props.ymax,
        loaded: false,
        missingData: false,
        yaxisName: this.props.yaxisName,
        xaxisName: this.props.xaxisName
      },
        () => this.getData())
    }
    if (this.props.timePlotted !== prevProps.timePlotted) {
      this.setState({
        timePlotted: this.props.timePlotted,
        loaded: false,
        missingData: false,
        useDatazoomForAll: false,
        datazoomStart: 0,
        datazoomEnd: 100,
        downsample: this.props.downsample
        },
        () => this.getData())
    }

    if (this.props.passedData !== prevProps.passedData) {
        this.setState({passedData: this.props.passedData}, () => this.getData());
    }
  }

  componentDidMount () {
    setTimeout(this.getData, 100);
    if (this.timeTicket) {
      clearInterval(this.timeTicket);
    }
    this.timeTicket = setInterval(this.getData, 30000);
  }

  componentWillUnmount() {
  if (this.timeTicket) {
    clearInterval(this.timeTicket);
  }
};

  initializeGraphs = (quad) => {
    var option = [];
    for (var i = 0; i < 18; i++) {
      option[i] = this.allVials(i, [], null, null, null, null, quad)
    }
    return option
  }

  getDownsample = (dataArray, start, end) => {
      // Variable downsampling based on data length. This is for the ALL x timescale, which uses -1 as a flag.
      var downsample = this.state.downsample;
      var trimmedData = [];
      for (var i = 0; i < dataArray.length - 1; i++) {
          var t = dataArray[i].split(',')[0];
          if (t >= start && t <= end) {
              trimmedData.push(dataArray[i]);
          }
      }
      if ((downsample === -1 && trimmedData.length > 5000) || this.state.useDatazoomForAll) {
        downsample = Math.ceil(trimmedData.length / 100);
      }
      if (downsample === -1) {
          downsample = 1;
      }
      return downsample;
  }

  handleDatazoom = (dzObject) => {
      this.setState({datazoomStart: dzObject.start, datazoomEnd: dzObject.end, useDatazoomForAll:true, timePlotted: 'None'}, () => {
          this.getData();
          this.props.onDataZoom();
      })

  }

  getStandardDeviation = (array, mean) => {
      var n = array.length;
      var sumSquares = 0
      for (var i = 0; i < array.length; i++) {
          sumSquares = sumSquares + Math.pow(array[i] - mean, 2);
      }
      var stdev = Math.pow(sumSquares / n, 0.5);
      return stdev;
  }

  getData = () => {
    var option = []; var compiled_data = []; var calibrationData = []; var compiledCalibrationData = []; var errorData = []; var compiledErrorData = [];
    if (this.state.activePlot == 'ALL') {
      console.log('Plotting All Vials!');
      if (this.state.dataType.type !== 'calibration' && !fs.existsSync(path.join(this.props.exptDir,'data'))) {
        option = this.initializeGraphs(this.state.selectedSmartQuad)
        this.setState({option: option, missingData: true});
        return;
      }
      for (var i = 0; i < 18; i++) {
        var maxDataPoint = this.state.ymax;
        var minDataPoint = this.state.ymin;
        var odPath =  path.join(this.props.exptDir, 'data','quad_' + this.state.selectedSmartQuad.toString(), 'OD', 'quad' + this.state.selectedSmartQuad.toString() + '_vial' + i.toString() + '_OD.txt');
        var tempPath =  path.join(this.props.exptDir, 'data','quad_' + this.state.selectedSmartQuad.toString(), 'temp', 'quad' + this.state.selectedSmartQuad.toString() + '_vial' + i.toString() + '_temp.txt');
        var data = []; var ymin; var calibrationData = []; var errorData = [];
        var timePlotted = Number.MAX_SAFE_INTEGER;
        if (this.state.timePlotted !== 'ALL' && this.state.dataType.type !== 'calibration') {
            timePlotted = parseFloat(this.state.timePlotted.substring(0, this.state.timePlotted.length - 1));
        }

        if (this.props.dataType.type === 'calibration') {
          var quadData;
            try {
              if (this.state.dataType.param === 'od90') {
                quadData = this.state.passedData.quadsData[this.state.dataType.param][this.state.selectedSmartQuad][i]
                for (var j = 0; j < Object.keys(quadData).length; j++) {
                  var dataAverage = 0;
                  for (var k = 0; k < quadData[j].length; k++) {
                    dataAverage = dataAverage + quadData[j][k]
                  }
                  dataAverage = dataAverage / quadData[j].length;
                  if (dataAverage > maxDataPoint) {
                    maxDataPoint = dataAverage;
                  }
                  if (dataAverage < minDataPoint) {
                    minDataPoint = Math.max(-0.1, dataAverage);
                  }
                  data.push([this.state.passedData.enteredValuesFloat[this.state.selectedSmartQuad][j], dataAverage]);
                  if (this.state.passedData.enteredValuesFloat[this.state.selectedSmartQuad][j].length != 0 && !isNaN(dataAverage)) {
                    var stdDev = this.getStandardDeviation(quadData[j], dataAverage);
                    errorData.push([this.state.passedData.enteredValuesFloat[this.state.selectedSmartQuad][j], dataAverage + stdDev, dataAverage - stdDev]);
                  }
                }
              }
              if (this.state.dataType.param === 'temp') {
                quadData = this.state.passedData.vialData;
                for (var j = 0; j < vialData.length; j++) {
                  var tempData = vialData[j].temp;
                  var averageTemp = 0;
                    for (var k = 0; k < tempData[i].length; k++) {
                      averageTemp = averageTemp + tempData[i][k];
                    }
                  averageTemp = averageTemp / tempData[i].length;
                  if (dataAverage > maxDataPoint) {
                    maxDataPoint = dataAverage;
                  }
                  if (dataAverage < minDataPoint) {
                    minDataPoint = dataAverage;
                  }
                  data.push([averageTemp, parseFloat(vialData[j].enteredValues[i])]);
                }
              }
            }
            catch (error) {
                console.log(error);
                this.setState({missingData: true});
                return;
            }
            if (this.state.passedData.calibration) {
                if (this.state.passedData.calibration.fits.length > 0) {
                  console.log(this.state.passedData.calibration.fits)
                    var fit = this.state.passedData.calibration.fits[0];
                    var coefficients = fit.coefficients[this.state.selectedSmartQuad][i]
                    var measuredData = this.state.passedData.calibration.measuredData[this.state.selectedSmartQuad].filter(element => element!=null);
                    if (fit.type === 'sigmoid') {
                        var a = coefficients[0];
                        var b = coefficients[1];
                        var c = coefficients[2];
                        var d = coefficients[3];
                        for (var j = 0; j < measuredData.length; j++) {
                            var calVal = a + (b - a) / (1 + (10**((c - measuredData[j]) * d)));
                            calibrationData.push([measuredData[j], calVal]);
                        }
                        // Have to sort or else it gets plotted funky.
                        calibrationData.sort(function(a, b) {
                            return a[0] - b[0];
                        });
                    }
                    if (fit.type === 'linear') {
                       for (var j = 0; j < this.state.passedData.vialData.length; j++) {
                           var averageVal = 0;
                           for (var k = 0; k < this.state.passedData.vialData[j].temp[i].length; k++) {
                               averageVal = averageVal + this.state.passedData.vialData[j].temp[i][k]
                           }
                           averageVal = averageVal / this.state.passedData.vialData[j].temp[i].length;
                           calibrationData.push([averageVal, averageVal * coefficients[0] + coefficients[1]]);
                        }
                    }
                }
            }
        }

        if (this.state.parameter == 'OD'){
          ymin = -0.1;
          var odArray;
          try {
            odArray = fs.readFileSync(odPath).toString().split('\n');
          }
          catch (error) {
            this.setState({missingData: true});
            return;
          }

          var lastTime = odArray[odArray.length -2].split(',')[0]
          var lowerTime = this.state.useDatazoomForAll ? this.state.datazoomStart/100 * lastTime : odArray[1].split(',')[0];
          var upperTime = this.state.useDatazoomForAll ? this.state.datazoomEnd/100 * lastTime: lastTime;
          var downsample = this.getDownsample(odArray, lowerTime, upperTime);
          for (var j = odArray.length -1 ; j > 1; j=j-downsample) {
            var parsed_value = odArray[j].split(',')
           parsed_value[0] = parseFloat(parsed_value[0])
            parsed_value[1] = parseFloat(Number(parsed_value[1]).toFixed(4))
            if (this.state.useDatazoomForAll) {
                if (parsed_value[0] >= lowerTime && parsed_value[0] <= upperTime) {
                    data.push(parsed_value);
                }
            }
            else {
                if (( lastTime - parsed_value[0] ) > timePlotted){
                  break;
                } else {
                  data.push(parsed_value)
                }
            }
          }
        }

       if (this.state.parameter == 'Temp'){
          minDataPoint = 15;
          var tempArray;
          try {
            tempArray = fs.readFileSync(tempPath).toString().split('\n');
          }
          catch (error) {
            this.setState({missingData: true});
            return;
          }
          var lastTime = tempArray[tempArray.length -2].split(',')[0]
          var lowerTime = this.state.useDatazoomForAll ? this.state.datazoomStart/100 * lastTime : tempArray[1].split(',')[0];
          var upperTime = this.state.useDatazoomForAll ? this.state.datazoomEnd/100 * lastTime: lastTime;
          var downsample = this.getDownsample(tempArray, lowerTime, upperTime);
          // Last element is blank. TODO: Fix in dpu code.
          for (var j = tempArray.length - 2 ; j > 1; j=j-downsample) {
            var parsed_value = tempArray[j].split(',')
            parsed_value[0] = parseFloat(parsed_value[0])
            parsed_value[1] = parseFloat(Number(parsed_value[1]).toFixed(2));
            if (this.state.useDatazoomForAll) {
                if (parsed_value[0] >= lowerTime && parsed_value[0] <= upperTime) {
                    data.push(parsed_value)
                }
            }
            else {
                if (( lastTime - parsed_value[0] )> timePlotted){
                  break;
                } else {
                  data.push(parsed_value)
                }
            }
          }
        }
        compiled_data[i] = data;
        compiledCalibrationData[i] = calibrationData;
        compiledErrorData[i] = errorData;
        option[i] = this.allVials(i, data, minDataPoint, maxDataPoint, calibrationData, errorData, this.state.selectedSmartQuad)
        }
      } else {
        var odPath =  path.join(this.props.exptDir, 'data','quad_' + this.state.selectedSmartQuad.toString(), 'OD', 'quad' + this.state.selectedSmartQuad.toString() + '_vial' + this.state.activePlot.toString() + '_OD.txt');
        var tempPath =  path.join(this.props.exptDir, 'data','quad_' + this.state.selectedSmartQuad.toString(), 'temp', 'quad' + this.state.selectedSmartQuad.toString() + '_vial' + this.state.activePlot.toString() + '_temp.txt');
        var data = []; var ymin;
        var timePlotted = parseFloat(this.state.timePlotted.substring(0, this.state.timePlotted.length - 1));

        if (this.state.parameter == 'OD'){
          ymin = -0.1;
          var odArray;
          try {
            odArray = fs.readFileSync(odPath).toString().split('\n');
          }
          catch (error) {
            option.push(this.singleVial(this.state.activePlot, [], null, null, this.state.selectedSmartQuad))
            this.setState({option: option, missingData: true});
            return;
          }
          var lastTime = odArray[odArray.length -2].split(',')[0]
          for (var j = 2 ; j < odArray.length; j=j+3) {
            var parsed_value = odArray[j].split(',')
            parsed_value[0] = parseFloat(parsed_value[0])
            parsed_value[1] = parseFloat(Number(parsed_value[1]).toFixed(4))
            data.push(parsed_value)
          }
        }

        if (this.state.parameter == 'Temp'){
          ymin = 20;
          var tempArray;
          try {
            tempArray = fs.readFileSync(tempPath).toString().split('\n');
          }
          catch (error) {
            option.push(this.singleVial(this.state.activePlot, [], null, null, this.state.selectedSmartQuad))
            this.setState({option: option, missingData: true});
            return;
          }
          var lastTime = tempArray[tempArray.length -2].split(',')[0]
          for (var j = 2 ; j < tempArray.length; j=j+3) {
            var parsed_value = tempArray[j].split(',')
            parsed_value[0] = parseFloat(parsed_value[0])
            parsed_value[1] = parseFloat(Number(parsed_value[1]).toFixed(2))
            data.push(parsed_value)
          }
        }
        compiled_data[i] = data;
        option.push(this.singleVial(this.state.activePlot, data, ymin, this.state.ymax, this.state.selectedSmartQuad))
      }
      this.setState({data: compiled_data, option: option, loaded: true, missingData: false});
    }

  allVials = (vial, data, ymin, ymax, calibrationData, errorData, quad) => ({
    title: {
      text: 'SQ:' + quad + ' Vial ' + vial,
      top: 0,
      left: '22%',
      textStyle: {
        color: 'white',
        fontSize: 15,
      }
    },
    dataZoom: {
      show: false,
      start: 0,
      end: 100,
      textStyle: {
        color: 'white'
      },
      handleStyle: {
        color: 'white'
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    grid:{
      left: 30,
      top: 30,
      right: 12,
      bottom: 30
    },
    xAxis: [
      {
        type: 'value',
        name: 'Time(h)',
        scale: true,
        splitLine: {
           show: false
        },
        axisLine: {
          lineStyle: {
              color: 'grey'
            }
        },
        axisLabel: {
          fontSize: 10,
          rotate: 45
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        scale: false,
        boundaryGap: [0.2, 0.2],
        min: ymin,
        max: ymax,
        splitLine: {
           show: false
        },
        axisLine: {
          lineStyle: {
              color: 'grey'
            }
        },
        axisLabel: {
          fontSize: 10,
          rotate: 45
          }
      }
    ],
    series: [
      {
        type:'scatter',
        symbolSize: [3, 3],
        yAxisIndex: 0,
        itemStyle: {
            normal: {
                color: 'orange',
            }
        },
        data: data
      },
      {
          type: 'line',
          data: calibrationData,
          color: 'blue',
          smooth: true,
          itemStyle: {
              opacity: 0
          }
      },
      {
          type: 'custom',
          name: 'error',
          itemStyle: {
              borderWidth: 1.5
          },
          renderItem: function (params, api) {
              var xValue = api.value(0);
              var highPoint = api.coord([xValue, api.value(1)]);
              var lowPoint = api.coord([xValue, api.value(2)]);
              var halfWidth = api.size([1,0])[0] * .01;
              var style = api.style({
                  stroke: api.visual('color'),
                  fill: undefined
              });
              return {
                  type: 'group',
                  children: [
                      {
                          type: 'line',
                          transition: ['shape'],
                          shape: {
                              x1: highPoint[0],
                              y1: highPoint[1],
                              x2: lowPoint[0],
                              y2: lowPoint[1]
                          },
                          style: style
                      }
                  ]
              };
          },
          encode: {
              x: 0,
              y: [1, 2]
          },
          data: errorData,
          z: 100
      }
    ]
  });

  singleVial = (vial, data, ymin, ymax, quad) => ({
    title: {
      text:'SQ:' + quad + ' Vial:' + vial,
      top: 0,
      left: '40%',
      textStyle: {
        color: 'white',
        fontSize: 30,
      }
    },
    dataZoom: {
      show: true,
      start: this.state.datazoomStart,
      end: this.state.datazoomEnd,
      textStyle: {
        color: 'white'
      },
      handleStyle: {
        color: 'white'
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    grid:{
      left: 30,
      top: 30,
      right: 12,
      bottom: 70
    },
    xAxis: [
      {
        type: 'value',
        name: 'Time(h)',
        scale: true,
        interval: 48,
        splitLine: {
           show: false
        },
        axisLine: {
          lineStyle: {
              color: 'white'
            }
        },
        axisLabel: {
          fontSize: 15
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        scale: false,
        boundaryGap: [0.2, 0.2],
        min: ymin,
        max: ymax,
        splitLine: {
           show: false
        },
        axisLine: {
          lineStyle: {
              color: 'white'
            }
        },
        axisLabel: {
          fontSize: 15
          }
      }
    ],
    series: [
      {
        type:'scatter',
        symbolSize: [3, 3],
        yAxisIndex: 0,
        itemStyle: {
            normal: {
                color: 'orange',
            }
        },
        data: data
      }
    ]
  });


  render() {
    const { classes, theme } = this.props;
    var graphMargin = '25px 20px 0px 300px';
    var graphWidth = '130px';
    let xaxisTitleClass = classes.xaxisTitle;
    let yaxisTitleClass = classes.yaxisTitle;
    if (this.state.dataType.type === 'calibration') {
        graphMargin = '30px 0px 0px 90px';
        graphWidth = '165px';
        xaxisTitleClass = classes.xaxisTitleCalibration;
        yaxisTitleClass = classes.yaxisTitleCalibration;
    }
    let loadingText;
    if (!this.state.loaded) {
      if (this.state.missingData) {
        loadingText = <p style={{fontSize: '20px', position: 'absolute', color: 'orange', margin: '-95px 0px 0px 40px'}}> No Data! </p>
      }
      else {
        loadingText =
          <p style={{fontSize: '20px', position: 'absolute', color: 'orange', margin: '-95px 0px 0px 40px'}}> Loading... </p>
      }
    }

    let graph;
    if (this.state.activePlot == 'ALL'){
      graph =
        <div className='row'>
          {this.state.option.map((option, index) => (
            <div key={index}>
              <ReactEcharts ref={index} key={index}
                option={this.state.option[index]}
                style={{height: 190, width: graphWidth}} />
              {loadingText}
            </div>
            ))}
          </div>
    } else {
      loadingText = '';
      if (this.state.missingData) {
        loadingText = <p style={{fontSize: '50px', position: 'absolute', color: 'orange', margin: '-290px 0px 0px 275px'}}> No Data! </p>
      }
      graph =
        <div style={{position: 'absolute', margin: '25px 0px 0px 0px'}}>
          <ReactEcharts
            option={this.state.option[0]}
            onEvents={{
                'datazoom': this.handleDatazoom
            }}
            style={{height: 530, width: 730}} />
            {loadingText}
        </div>
    }

    return (
      <div className='row' style={{position: 'absolute', margin: graphMargin}} >
        <Paper square elevation={10} className={xaxisTitleClass}>
          <Typography variant="h5" className={classes.title}> {this.state.xaxisName} </Typography>
        </Paper>
        <Paper square elevation={10} className={yaxisTitleClass}>
          <Typography variant="h5" className={classes.title}> {this.state.yaxisName} </Typography>
        </Paper>
        {graph}
      </div>

    );
  }
}

export default withStyles(styles)(VialArrayGraph);
