// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import { withStyles } from '@material-ui/core/styles';
import {FaArrowLeft} from 'react-icons/fa';
import ReactEcharts from 'echarts-for-react';  // or var ReactEcharts = require('echarts-for-react');
const remote = require('electron').remote;
const app = remote.app;
const fs = require('fs')



const styles = {

};


class Graph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      option: this.initializeGraphs(),
      testoption: [],
      od: [],
      temp: []
    };
  }

  componentDidMount () {
    this.getData();
  }

  initializeGraphs = () => {
    var option = [];
    for (var i = 0; i < 16; i++) {
      option[i] = this.getOption(i, [],[])
    }
    return option
  }

  getData = () => {
    var option = [];
    for (var i = 0; i < 16; i++) {
      var odPath =  app.getPath('userData') + '/legacy/data/pombe_dc_20190314_expt/OD/vial' + i + '_OD.txt'
      var tempPath =  app.getPath('userData') + '/legacy/data/pombe_dc_20190314_expt/temp/vial' + i + '_temp.txt'
      var od = []; var temp = []; const points_read = 500

      var odArray = fs.readFileSync(odPath).toString().split('\n');
      for (var j = odArray.length - points_read; j < odArray.length; j=j+5) {
        var parsed_value = odArray[j].split(',')
        parsed_value[0] = parseFloat(parsed_value[0])
        parsed_value[1] = parseFloat(Number(parsed_value[1]).toFixed(4))
        od.push(parsed_value)
      }

      var tempArray = fs.readFileSync(tempPath).toString().split('\n');
      for (var j = tempArray.length - points_read; j < tempArray.length; j=j+5) {
        var parsed_value = tempArray[j].split(',')
        parsed_value[0] = parseFloat(parsed_value[0])
        parsed_value[1] = parseFloat(Number(parsed_value[1]).toFixed(2))
        temp.push(parsed_value)
      }
      option[i] = this.getOption(i, od,temp)
      }
      console.log(option)
      this.setState({od: od, temp: temp, option: option})

    }


  getOption = (vial, od, temp) => ({
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
      left: 50,
      top: 30,
      right: 40,
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
        name: 'OD',
        boundaryGap: [0.2, 0.2],
        interval: 1,
        min: -.05,
        max: 1,
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
      },
      {
        type: 'value',
        scale: true,
        name: 'TEMP'+ '\u00b0' + 'C',
        interval: 50,
        splitLine: {
           show: false
        },
        axisLine: {
          lineStyle: {
              color: 'white'
            }
        },
        min: 16,
        max: 48,
        axisLabel: {
          fontSize: 15,
          color: 'white',
        },
        nameTextStyle: {
          fontStyle: 'italic',
          padding: [33, 0, 0, -80],
          fontSize: 13
        },
        nameRotate: 90
      }
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
      {
        name:'Temp',
        type:'scatter',
        symbolSize: [2, 2],
        yAxisIndex: 1,
        itemStyle: {
            normal: {
                color: 'red',
            }
        },
        data: temp
      }
    ]
  });

  render() {
    return (
      <div>
        <Link className="backHomeBtn" style={{zIndex: '10', position: 'absolute', margin: '-60px 0px 0px 20px'}} id="experiments" to={{pathname:routes.HOME, socket: this.props.socket, logger:this.props.logger}}><FaArrowLeft/></Link>
        <div className='row' style={{margin: '70px 0px 0px 65px'}} >
          {this.state.option.map((option, index) => (
            <ReactEcharts ref={index} key={index}
              option={this.state.option[index]}
              style={{height: 140, width: 260}} />
            ))}
          </div>
      </div>

    );
  }
}

export default withStyles(styles)(Graph);
