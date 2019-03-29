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
      xaxisName: this.props.xaxisName,
      activePlot: this.props.activePlot,
      data: [],
      loaded: false
    };
  }

  timeTicket = null;

  componentDidUpdate(prevProps) {
    if (this.props.activePlot !== prevProps.activePlot) {
      this.setState({ activePlot: this.props.activePlot},
        () => this.getData())
    }
    if (this.props.ymax !== prevProps.ymax) {
      this.setState({ ymax: this.props.ymax, loaded: false},
        () => this.getData())
    }
    if (this.props.parameter !== prevProps.parameter) {
      this.setState({
        parameter: this.props.parameter,
        ymax: this.props.ymax,
        loaded: false,
        xaxisName: this.props.xaxisName,
      },
        () => this.getData())
    }
    if (this.props.timePlotted !== prevProps.timePlotted) {
      this.setState({
        timePlotted: this.props.timePlotted,
        loaded: false,
        downsample: this.props.downsample
        },
        () => this.getData())
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
      option[i] = this.allVials(i, [], null, null)
    }
    return option
  }

  getData = () => {
    var option = []; var compiled_data = [];
    if (this.state.activePlot == 'ALL'){
      console.log('Plotting All Vials!')
      for (var i = 0; i < 16; i++) {
        var odPath =  path.join(this.props.exptDir,'OD', 'vial' + i + '_OD.txt');
        var tempPath =  path.join(this.props.exptDir, 'temp', 'vial' + i + '_temp.txt');
        var data = []; var ymin;
        var timePlotted = parseFloat(this.state.timePlotted.substring(0, this.state.timePlotted.length - 1));

        if (this.state.parameter == 'OD'){
          ymin = 0;
          var odArray = fs.readFileSync(odPath).toString().split('\n');
          var lastTime = odArray[odArray.length -2].split(',')[0]
          for (var j = odArray.length -1 ; j > 1; j=j-this.state.downsample) {
            var parsed_value = odArray[j].split(',')
            parsed_value[0] = parseFloat(parsed_value[0])
            parsed_value[1] = parseFloat(Number(parsed_value[1]).toFixed(4))
            if (( lastTime - parsed_value[0] )> timePlotted){
              break
            } else {
              data.push(parsed_value)
            }
          }
        }

        if (this.state.parameter == 'Temp'){
          ymin = 20;
          var tempArray = fs.readFileSync(tempPath).toString().split('\n');
          var lastTime = tempArray[tempArray.length -2].split(',')[0]
          for (var j = tempArray.length -1 ; j > 1; j=j-this.state.downsample) {
            var parsed_value = tempArray[j].split(',')
            parsed_value[0] = parseFloat(parsed_value[0])
            parsed_value[1] = parseFloat(Number(parsed_value[1]).toFixed(2))
            if (( lastTime - parsed_value[0] )> timePlotted){
              break
            } else {
              data.push(parsed_value)
            }
          }
        }

        compiled_data[i] = data;
        option[i] = this.allVials(i, data, ymin, this.state.ymax)
        }
      } else {

        console.log('Plotting Vial: ' + this.state.activePlot)


        var odPath =  path.join(this.props.exptDir, 'OD', 'vial' + this.state.activePlot + '_OD.txt');
        var tempPath =  path.join(this.props.exptDir, 'temp', 'vial' + this.state.activePlot + '_temp.txt');
        var data = []; var ymin;
        var timePlotted = parseFloat(this.state.timePlotted.substring(0, this.state.timePlotted.length - 1));

        if (this.state.parameter == 'OD'){
          ymin = 0;
          var odArray = fs.readFileSync(odPath).toString().split('\n');
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
          var tempArray = fs.readFileSync(tempPath).toString().split('\n');
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
      console.log(option)
      this.setState({data: compiled_data, option: option, loaded: true})
    }

  allVials = (vial, data, ymin, ymax) => ({
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
              color: 'grey'
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
        symbolSize: [2, 2],
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
        symbolSize: [2, 2],
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

    let loadingText;
    if (!this.state.loaded) {
        loadingText =
          <p style={{fontSize: '20px', position: 'absolute', color: 'orange', margin: '-94px 0px 0px 68px'}}> Loading... </p>
        }

    let graph;
    if (this.state.activePlot == 'ALL'){
      graph =
        <div className='row'>
          {this.state.option.map((option, index) => (
            <div key={index}>
              <ReactEcharts ref={index} key={index}
                option={this.state.option[index]}
                style={{height: 140, width: 190}} />
              {loadingText}
            </div>
            ))}
          </div>
    } else {
      graph =
        <div style={{position: 'absolute', margin: '25px 0px 0px 0px'}}>
          <ReactEcharts
            option={this.state.option[0]}
            style={{height: 530, width: 730}} />
        </div>
    }


    return (
      <div className='row' style={{position: 'absolute', margin: '25px 0px 0px 345px'}} >
        <Paper square elevation={10} className={classes.xaxisTitle}>
          <Typography variant="h5" className={classes.title}> EXPERIMENT TIME (h) </Typography>
        </Paper>
        <Paper square elevation={10} className={classes.yaxisTitle}>
          <Typography variant="h5" className={classes.title}> {this.state.xaxisName} </Typography>
        </Paper>
        {graph}
      </div>

    );
  }
}

export default withStyles(styles)(VialArrayGraph);
