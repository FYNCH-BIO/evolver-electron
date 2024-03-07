import React from 'react';
import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { withStyles } from '@material-ui/core/styles';
import moment from 'moment'
import parsePath from 'parse-filepath';
import jsonQuery from 'json-query';
import {MdCached} from 'react-icons/md';
import ReactTable from "react-table";
import ReactTooltip from 'react-tooltip';
import {FaPlay, FaStop, FaPen, FaChartBar } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import routes from '../../constants/routes.json';

const remote = require('electron').remote;
const Store = require('electron-store');

const app = remote.app;
const store = new Store();

const styles = {
};

var fs = require('fs');
var path = require('path');
var util = require('util');

moment.updateLocale('en', {
    relativeTime : {
        future: "in %s",
        past:   "%s",
        s  : 'a few s',
        ss : '%d s',
        m:  "a minute",
        mm: "%d m",
        h:  "an h",
        hh: "%d h",
        d:  "a d",
        dd: "%d d",
        w:  "a w",
        ww: "%d w",
        M:  "a month",
        MM: "%d month",
        y:  "a y",
        yy: "%d y"
    }
});

function dirTree(dirname) {
    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname);
    }
        var folderStats = fs.lstatSync(dirname),
            info = {
                key: path.basename(dirname),
                extname: path.extname(dirname)
            };
        var timestamp = new Date(util.inspect(folderStats.mtime));
        info.modifiedString = moment(timestamp).fromNow();
        info.modified = moment(timestamp).valueOf();
        info.size = folderStats.size;

        if (folderStats.isDirectory()) {
            info.type = "folder";
            info.children = fs.readdirSync(dirname).map(function(child) {
                return dirTree(dirname + '/' + child);
            });
        }
        else {

            info.type = "file";
        }
    return info;
}

class ScriptFinder extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      fileJSON:[],
      showPagination: true,
      selection: 'undefined',
      subFolder: this.props.subFolder,
      isScript: this.props.isScript,
      hoveredRow: null,
      evolverIp: this.props.evolverIp,
      exptLocation: this.props.exptLocation
    };
  }

  componentDidMount(){
    var filequery = this.loadFileDir(this.state.subFolder, this.state.isScript);
    var showPagination = (filequery.length > 5);
    this.setState({fileJSON: filequery, showPagination: showPagination});
  }

  componentDidUpdate(prevProps) {
    if (this.props.subFolder !== prevProps.subFolder) {
      this.handleRefresh(this.props.subFolder);
      this.setState({
        subFolder: this.props.subFolder,
      })
    }
    if (this.props.exptLocation !== prevProps.exptLocation) {
        this.setState({exptLocation: this.props.exptLocation}, function() {
            this.handleRefresh(this.props.subFolder);
        });
    }
  }

  componentWillReceiveProps(props) {
      const {refind} = this.props;
      if (props.refind !== refind) {
          this.handleRefresh(props);
      }
  }

loadFileDir = (subFolder, isScript) => {
  if (subFolder == 'undefined'){
    return []
  }
  else{
    var dirPath= path.join(this.state.exptLocation, subFolder);
    var resultJSON = {'data': dirTree(dirPath).children};
    if (isScript) {
      for (var i = 0; i < resultJSON['data'].length; i++) {
        if (resultJSON['data'][i]['type'] == 'folder'){
          var modifiedString;
          var modified;
          var logLocation = path.join(dirPath, resultJSON['data'][i]['key'], 'data', 'evolver.log');
          if (fs.existsSync(logLocation)) {
            var logData = fs.readFileSync(logLocation, 'utf8');
            var dataLines = logData.split('\n');
            var lastTime = dataLines[dataLines.length - 2].split(' ').slice(0,2).join(' ')
            var d = new Date(lastTime);
            modifiedString = moment(d).fromNow();
            modified = moment(d).valueOf();
          }
          resultJSON['data'][i]['modified'] = modified;
          if (modifiedString === undefined) {
            modifiedString = 'Not run yet';
          }
          resultJSON['data'][i]['modifiedString'] = modifiedString;
          resultJSON['data'][i]['fullPath'] = path.join(subFolder, resultJSON['data'][i]['key']);
          resultJSON['data'][i]['status'] = this.props.runningExpts.includes(path.join(this.state.exptLocation, 'experiments', resultJSON['data'][i].key)) ? 'Running' : 'Stopped';
          resultJSON['data'][i]['statusDot'] = this.props.runningExpts.includes(path.join(this.state.exptLocation, 'experiments', resultJSON['data'][i].key)) ? <div className="circleGreen"></div> : <div className="circleRed"></div>;
          resultJSON['data'][i]['evolver'] = this.getEvolver(resultJSON['data'][i]['key']);

        }
      }
    };

    var searchString = 'data[**]' + '[*type=folder]'
    var filequery = jsonQuery(searchString, {data: resultJSON}).value;
    return filequery;
  }
};

  handleRefresh = (newProps) => {
    var filequery = this.loadFileDir(this.state.subFolder, this.state.isScript);
    var showPagination = (filequery.length > 5)
    this.setState({fileJSON: filequery, showPagination: showPagination})
  };

  getEvolver = (expt) => {
    var evolverExptMap = store.get('evolverExptMap', {});
    var evolver = evolverExptMap[path.join(this.state.exptLocation, this.props.subFolder, expt)] === undefined ? 'Not run yet' : evolverExptMap[path.join(this.state.exptLocation, this.props.subFolder, expt)];
    return evolver;
  };

  isSelected = rowInfo => {
    if (typeof rowInfo !== 'undefined'){
      if (rowInfo.index == this.state.selection) {
        this.props.onSelectFolder(rowInfo.original.key);
        return true;
      }
    }
   };

   handlePlay = exptName => {
       this.props.runningExpts.includes(path.join(this.state.exptLocation, this.props.subFolder, exptName)) ? this.props.onContinue(exptName): this.props.onStart(exptName);
   }

   getPathname = exptName => {
      if (this.props.runningExpts.includes(path.join(this.state.exptLocation, this.props.subFolder, exptName))) {
        return routes.GRAPHING;
      }
      return routes.EDITOR;
   }

  render() {
    const { classes } = this.props;
    const { fileJSON, dirLength } = this.state;
    for (var i = 0; i < fileJSON.length; i++) {
      fileJSON[i].status = this.props.runningExpts.includes(path.join(this.state.exptLocation, this.props.subFolder, fileJSON[i].key)) ? "Running" : "Stopped";
      fileJSON[i].statusDot = fileJSON[i].status === "Running" ? <div className="circleGreen"></div> : <div className="circleRed"></div>;
    }
  var columns = [
      {
        Header: 'Name',
        accessor: 'key', // String-based value accessors!
        width: 400,
        Cell: cellInfo => <Link className="scriptFinderEditBtn" id="table" to={{pathname: this.getPathname(cellInfo.row.key), exptDir: path.join(this.state.exptLocation, this.props.subFolder, cellInfo.row.key)}}><div style={{width: '650px'}}>{cellInfo.row.key}</div></Link>
      },
      {
        Header: 'Last Run',
        accessor: 'modified',
        Cell: cellInfo => <Link className="scriptFinderEditBtn" id="table" to={{pathname: this.getPathname(cellInfo.row.key), exptDir: path.join(this.state.exptLocation, this.props.subFolder, cellInfo.row.key)}}><span> {cellInfo.original.modifiedString} </span></Link>,
        width: 120
      },
      {
          Header: 'Status',
          accessor: 'status',
          width: 90,
          Cell: cellInfo => <Link className="scriptFinderEditBtn" id="table" to={{pathname: this.getPathname(cellInfo.row.key), exptDir: path.join(this.state.exptLocation, this.props.subFolder, cellInfo.row.key)}}><div>{cellInfo.original.statusDot}</div></Link>
      },
      {
        Header: 'eVOLVER',
        accessor: 'evolver',
        width: 250,
        Cell: cellInfo => <Link className="scriptFinderEditBtn" id="table" to={{pathname: this.getPathname(cellInfo.row.key), exptDir: path.join(this.state.exptLocation, this.props.subFolder, cellInfo.row.key)}}><span style={{fontSize: 20}}>{this.getEvolver(cellInfo.row.key)}</span></Link>,
      },
      {
          Header: '',
          Cell: (cellInfo) => (<div>
            <ReactTooltip />
            <Link className="scriptFinderEditBtn" id="edits" to={{pathname: routes.EDITOR, exptDir: path.join(this.state.exptLocation, this.props.subFolder, cellInfo.row.key), evolverIp:this.state.evolverIp}}><button data-tip="Edit settings for this experiment" className="tableIconButton" onClick={() => this.props.onEdit(cellInfo.row.key)}> <FaPen size={13}/> </button></Link>
            <Link className="scriptFinderEditBtn" id="graphs" to={{pathname: routes.GRAPHING, evolverIp: this.state.evolverIp, exptDir: path.join(this.state.exptLocation, this.props.subFolder, cellInfo.row.key)}}><button data-tip="View data for this experiment" className="tableIconButton" onClick={() => this.props.onGraph(cellInfo.row.key)}> <FaChartBar size={18}/> </button></Link>
            {this.props.runningExpts.includes(path.join(this.state.exptLocation, this.props.subFolder, cellInfo.row.key)) ? <button data-tip="Stop this experiment" className="tableIconButton" onClick={() => this.props.onStop(cellInfo.row.key)}> <FaStop size={13}/> </button> : (<button data-tip="Resume or start this experiment" className="tableIconButton" onClick={() => this.handlePlay(cellInfo.row.key)} disabled={this.props.disablePlay}> <FaPlay size={13}/> </button>)}
           </div>),
          width: 400
      }];
    return (

      <div>
        <ReactTable
          data={fileJSON}
          columns={columns}
          noDataText="No Experiments Found"
          showPagination={this.state.showPagination}
          pageSize={7}
          height={100}
          resizable={false}
          showPageSizeOptions= {false}
          loading={false}
          defaultSorted={[{id: "modified",desc: true}]}
          className="-striped -highlight -em"
          getTdProps={(state, rowInfo, column, instance) => {
            return {
              onClick: (e, handleOriginal) => {
                this.setState({selection: rowInfo.index})
                if (handleOriginal) {
                  handleOriginal()
                }
              },
              style: {
                  fontWeight: this.isSelected(rowInfo) ? "bold" : null,
                  color: this.isSelected(rowInfo) ? "white" : null,
              }
            }
          }}
        />
      </div>
    );
  }
}

export default withStyles(styles)(ScriptFinder);
