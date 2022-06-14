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
    left: '270px'
  },
  yaxisTitle: {
    backgroundColor: 'black',
    position: 'absolute',
    top: '390px',
    left: '-60px',
    transform: 'rotate(-90deg)',
    textAlign: 'center'
  }
});


class VialArrayGraph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      option: this.initializeGraphs(),
      ymax: this.props.ymax,
      timePlotted: this.props.timePlotted,
      downsample: this.props.downsample,
      parameter: this.props.parameter,
      yaxisName: this.props.yaxisName,
      xaxisName: this.props.xaxisName,
      activePlot: this.props.activePlot,
      data: [],
      loaded: false,
      missingData: false,
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

  initializeGraphs = () => {
    var option = [];
    for (var i = 0; i < 16; i++) {
      option[i] = this.allVials(i, [], null, null, null)
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
      return downsample;
  }

  handleDatazoom = (dzObject) => {
      console.log(dzObject);
      this.setState({datazoomStart: dzObject.start, datazoomEnd: dzObject.end, useDatazoomForAll:true, timePlotted: 'None'}, () => {
          this.getData();
          this.props.onDataZoom();
      })

  }

  getData = () => {
    var option = []; var compiled_data = []; var calibrationData = []; var compiledCalibrationData = [];
    if (this.state.activePlot == 'ALL'){
      console.log('Plotting All Vials!')
      var maxDataPoint = this.state.ymax;
      var minDataPoint = this.state.ymin;      
      if (this.state.dataType.type !== 'calibration' && !fs.existsSync(path.join(this.props.exptDir,'data'))) {
        this.setState({missingData: true});
        return;
      }
      for (var i = 0; i < 16; i++) {
        var odPath =  path.join(this.props.exptDir, 'data','OD', 'vial' + i + '_OD.txt');
        var tempPath =  path.join(this.props.exptDir, 'data', 'temp', 'vial' + i + '_temp.txt');
        var data = []; var ymin; var calibrationData = [];
        var timePlotted = Number.MAX_SAFE_INTEGER;
        if (this.state.timePlotted !== 'ALL' && this.state.dataType.type !== 'calibration') {
            timePlotted = parseFloat(this.state.timePlotted.substring(0, this.state.timePlotted.length - 1));
        }

        if (this.props.dataType.type === 'calibration') {
            console.log(this.state.passedData.vialData);
            var vialData;
            try {
                if (this.state.dataType.param === 'od90') {
                    vialData = this.state.passedData.vialData[this.state.dataType.param][i]
                    for (var j = 0; j < vialData.length; j++) {
                        var dataAverage = 0;
                        for (var k = 0; k < vialData[j].length; k++) {
                            dataAverage = dataAverage + vialData[j][k]
                        }
                        dataAverage = dataAverage / vialData[j].length
                        if (dataAverage > maxDataPoint) {
                            maxDataPoint = dataAverage;
                        }
                        if (dataAverage < minDataPoint) {
                            minDataPoint = dataAverage;
                        }
                    data.push([this.state.passedData.enteredValuesFloat[j], dataAverage]);
                    }
                }
                if (this.state.dataType.param === 'temp') {
                    vialData = this.state.passedData.vialData;
                    for (var j = 0; j < vialData.length; j++) {
                        var tempData = vialData[j].temp;
                        var averageTemp = 0;
                        for (var k = 0; k < tempData[i].length; k++) {
                            averageTemp = averageTemp + tempData[i][k];
                        }
                        averageTemp = averageTemp / tempData[i].length
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
                    var fit = this.state.passedData.calibration.fits[0];
                    var coefficients = fit.coefficients[i]
                    var measuredData = this.state.passedData.calibration.measuredData[i];
                    console.log(this.state.passedData.calibration);
                    if (fit.type === 'sigmoid') {
                        for (var j = 0; j < measuredData.length; j++) {
                            calibrationData.push([measuredData[j], coefficients[0] + (coefficients[1] - coefficients[0]) / (1 + (10^((coefficients[2] - measuredData[j]) * coefficients[3])))])
                        }
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
          minDataPoint = 20;
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
            parsed_value[1] = parseFloat(Number(parsed_value[1]).toFixed(2))
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
        var percentage = maxDataPoint * .05;
        minDataPoint = minDataPoint - percentage;
        maxDataPoint = maxDataPOint + percentage;
        this.setState({ymin: minDataPoint, ymax: maxDataPoint});
        compiled_data[i] = data;
        compiledCalibrationData[i] = calibrationData;
        option[i] = this.allVials(i, data, this.state.ymin, this.state.ymax, calibrationData)
        }
      } else {
        var odPath =  path.join(this.props.exptDir, 'data', 'OD', 'vial' + this.state.activePlot + '_OD.txt');
        var tempPath =  path.join(this.props.exptDir, 'data', 'temp', 'vial' + this.state.activePlot + '_temp.txt');
        var data = []; var ymin;
        var timePlotted = parseFloat(this.state.timePlotted.substring(0, this.state.timePlotted.length - 1));

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
            this.setState({missingData: true});
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
        option.push(this.singleVial(this.state.activePlot, data, ymin, this.state.ymax))
      }
      if (this.state.dataType.type === 'calibration') {
          compiled_data = compiled_data.slice(12,16).concat(compiled_data.slice(8,12)).concat(compiled_data.slice(4,8)).concat(compiled_data.slice(0,4));
          option = option.slice(12,16).concat(option.slice(8,12)).concat(option.slice(4,8)).concat(option.slice(0,4));
      }
      this.setState({data: compiled_data, option: option, loaded: true, missingData: false})
    }

  allVials = (vial, data, ymin, ymax, calibrationData) => ({
    title: {
      text:'Vial ' + vial,
      top: -5,
      left: '41%',
      textStyle: {
        color: 'white',
        fontSize: 20,
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
        interval: 48,
        splitLine: {
           show: false
        },
        axisLine: {
          lineStyle: {
              color: 'grey'
            }
        },
        axisLabel: {
          fontSize: 13,
          rotate: 40
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
          fontSize: 13,
          rotate: 40
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
      }
    ]
  });

  singleVial = (vial, data, ymin, ymax) => ({
    title: {
      text:'Vial ' + vial,
      top: 0,
      left: '50%',
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
    var graphMargin = '25px 20px 0px 345px';
    var graphWidth = '190px';
    if (this.state.dataType.type === 'calibration') {
        graphMargin = '30px 40px 0px 85px';
        graphWidth = '250px';
    }
    let loadingText;
    if (!this.state.loaded) {
      if (this.state.missingData) {
        loadingText = <p style={{fontSize: '20px', position: 'absolute', color: 'orange', margin: '-94px 0px 0px 68px'}}> No Data! </p>
      }
      else {
        loadingText =
          <p style={{fontSize: '20px', position: 'absolute', color: 'orange', margin: '-94px 0px 0px 68px'}}> Loading... </p>
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
                style={{height: 140, width: graphWidth}} />
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
        <Paper square elevation={10} className={classes.xaxisTitle}>
          <Typography variant="h5" className={classes.title}> {this.state.xaxisName} </Typography>
        </Paper>
        <Paper square elevation={10} className={classes.yaxisTitle}>
          <Typography variant="h5" className={classes.title}> {this.state.yaxisName} </Typography>
        </Paper>
        {graph}
      </div>

    );
  }
}

export default withStyles(styles)(VialArrayGraph);
