// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ReactEcharts from 'echarts-for-react';  // or var ReactEcharts = require('echarts-for-react');
const remote = require('electron').remote;
const app = remote.app;
const fs = require('fs')



const styles = {

};


class VialArrayGraph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      option: this.initializeGraphs(),
      ymax: this.props.ymax,
      timePlotted: this.props.timePlotted,
      downsample: this.props.downsample,
      testoption: [],
      od: [],
      temp: [],
      loaded: false
    };
  }

  timeTicket = null;

  componentDidUpdate(prevProps) {
    if (this.props.ymax !== prevProps.ymax) {
      this.setState({ ymax: this.props.ymax},
        () => this.getData())
    }
    if (this.props.timePlotted !== prevProps.timePlotted) {
      this.setState({
        timePlotted: this.props.timePlotted,
        downsample: this.props.downsample
        },
        () => this.getData())
    }
  }

  componentDidMount () {
    setTimeout(this.getData, 1000);
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
      option[i] = this.getOption(i, [],[], null)
    }
    return option
  }

  getData = () => {
    var option = []; var compiled_od = []; var compiled_temp = [];
    for (var i = 0; i < 16; i++) {
      var odPath =  app.getPath('userData') + '/legacy/data/pombe_dc_20190314_expt/OD/vial' + i + '_OD.txt'
      var tempPath =  app.getPath('userData') + '/legacy/data/pombe_dc_20190314_expt/temp/vial' + i + '_temp.txt'
      var od = []; var temp = []; const points_read = 1000;
      var timePlotted = parseFloat(this.state.timePlotted.substring(0, this.state.timePlotted.length - 1));

      var odArray = fs.readFileSync(odPath).toString().split('\n');
      var lastTime = odArray[odArray.length -2].split(',')[0]
      console.log(lastTime)
      for (var j = odArray.length -1 ; j > 1; j=j-this.state.downsample) {
        var parsed_value = odArray[j].split(',')
        parsed_value[0] = parseFloat(parsed_value[0])
        parsed_value[1] = parseFloat(Number(parsed_value[1]).toFixed(4))
        if (( lastTime - parsed_value[0] )> timePlotted){
          break
        } else {
          od.push(parsed_value)
        }
      }

      var tempArray = fs.readFileSync(tempPath).toString().split('\n');
      for (var j = tempArray.length - points_read; j < tempArray.length; j=j+10) {
        var parsed_value = tempArray[j].split(',')
        parsed_value[0] = parseFloat(parsed_value[0])
        parsed_value[1] = parseFloat(Number(parsed_value[1]).toFixed(2))
        temp.push(parsed_value)
      }
      compiled_od[i] = od;
      compiled_temp[i] = temp;
      option[i] = this.getOption(i, od, temp, this.state.ymax)
      }
      console.log(option)
      this.setState({od: compiled_od, temp: compiled_od, option: option, loaded: true})
    }

  getOption = (vial, od, temp, ymax) => ({
    title: {
      text:'Vial ' + vial,
      top: -5,
      left: '41%',
      textStyle: {
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
        name: 'OD',
        boundaryGap: [0.2, 0.2],
        interval: .5,
        min: 0,
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
      },
      // {
      //   type: 'value',
      //   scale: true,
      //   name: 'TEMP'+ '\u00b0' + 'C',
      //   interval: 50,
      //   splitLine: {
      //      show: false
      //   },
      //   axisLine: {
      //     lineStyle: {
      //         color: 'white'
      //       }
      //   },
      //   min: 16,
      //   max: 48,
      //   axisLabel: {
      //     fontSize: 15,
      //     color: 'white',
      //   },
      //   nameTextStyle: {
      //     fontStyle: 'italic',
      //     padding: [33, 0, 0, -80],
      //     fontSize: 13
      //   },
      //   nameRotate: 90
      // }
    ],
    series: [
      {
        name:'OD',
        type:'scatter',
        symbolSize: [2, 2],
        yAxisIndex: 0,
        itemStyle: {
            normal: {
                color: 'orange',
            }
        },
        data: od
      },
      // {
      //   name:'Temp',
      //   type:'scatter',
      //   symbolSize: [2, 2],
      //   yAxisIndex: 1,
      //   itemStyle: {
      //       normal: {
      //           color: 'red',
      //       }
      //   },
      //   data: temp
      // }
    ]
  });

  render() {
    let loadingText;
    if (!this.state.loaded) {
        loadingText =
          <p style={{fontSize: '20px', position: 'absolute', color: 'orange', margin: '-94px 0px 0px 68px'}}> Loading... </p>
        }


    return (
      <div className='row' style={{position: 'absolute', margin: '75px 0px 0px 290px'}} >
        {this.state.option.map((option, index) => (
          <div key={index}>
            <ReactEcharts ref={index} key={index}
              option={this.state.option[index]}
              style={{height: 140, width: 200}} />
            {loadingText}
          </div>
          ))}
      </div>

    );
  }
}

export default withStyles(styles)(VialArrayGraph);
