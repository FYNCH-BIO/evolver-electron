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
import {FaPlay, FaStop, FaPen, FaChartBar } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import routes from '../../constants/routes.json';
import Circle from '../Circle'

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
    var dirPath= path.join(app.getPath('userData'), subFolder);
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
            var lastTime = dataLines[dataLines.length - 2].split(' ')[0]
            lastTime = lastTime.substring(1, lastTime.length-1);
            var d = new Date(lastTime);
            modifiedString = moment(d).fromNow();
            modified = moment(d).valueOf();
          }
          resultJSON['data'][i]['modified'] = modified;
          resultJSON['data'][i]['modifiedString'] = modifiedString;
          resultJSON['data'][i]['fullPath'] = path.join(subFolder, resultJSON['data'][i]['key']);
          resultJSON['data'][i]['status'] = this.props.runningExpts.includes(path.join(app.getPath('userData'), 'experiments', resultJSON['data'][i].key)) ? 'Running' : 'Stopped';
          resultJSON['data'][i]['statusDot'] = this.props.runningExpts.includes(path.join(app.getPath('userData'), 'experiments', resultJSON['data'][i].key)) ? <Circle bgColor='#32CD32'/> : <Circle bgColor='#DC143C'/>;

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
    var evolver = evolverExptMap[path.join(app.getPath('userData'), this.props.subFolder, expt)] === undefined ? 'Not run yet' : evolverExptMap[path.join(app.getPath('userData'), this.props.subFolder, expt)];
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
       this.props.runningExpts.includes(path.join(app.getPath('userData'), this.props.subFolder, exptName)) ? this.props.onContinue(exptName): this.props.onStart(exptName);
   }

  render() {
    const { classes } = this.props;
    const { fileJSON, dirLength } = this.state;
    for (var i = 0; i < fileJSON.length; i++) {
      fileJSON[i].status = this.props.runningExpts.includes(path.join(app.getPath('userData'), this.props.subFolder, fileJSON[i].key)) ? "Running" : "Stopped";
      fileJSON[i].statusDot = fileJSON[i].status === "Running" ? <Circle bgColor='#32CD32'/> : <Circle bgColor='#DC143C'/>;
    }
  var columns = [
      {
        Header: 'Name',
        accessor: 'key', // String-based value accessors!
        width: 400
      },
      {
        Header: 'Last Run',
        accessor: 'modified',
        Cell: props => <span> {props.original.modifiedString} </span>,
        width: 120
      },
      {
          Header: 'Status',
          accessor: 'status',
          width: 90,
          Cell: props => <div>{props.original.statusDot}</div>
      },
      {
        Header: 'eVOLVER',
        accessor: 'evolver',
        width: 250,
        Cell: cellInfo => <span style={{fontSize: 20}}>{this.getEvolver(cellInfo.row.key)}</span>,
      },
      {
          Header: '',
          Cell: (cellInfo) => (<div>
            <Link className="scriptFinderEditBtn" id="edits" to={{pathname: routes.EDITOR, exptDir: path.join(app.getPath('userData'), this.props.subFolder, cellInfo.row.key), evolverIp:this.props.evolverIp}}><button className="tableIconButton" onClick={() => this.props.onEdit(cellInfo.row.key)}> <FaPen size={13}/> </button></Link>
            <Link className="scriptFinderEditBtn" id="graphs" to={{pathname: routes.GRAPHING, exptDir: path.join(app.getPath('userData'), this.props.subFolder, cellInfo.row.key)}}><button className="tableIconButton" onClick={() => this.props.onGraph(cellInfo.row.key)}> <FaChartBar size={18}/> </button></Link>
            {this.props.runningExpts.includes(path.join(app.getPath('userData'), this.props.subFolder, cellInfo.row.key)) ? <button className="tableIconButton" onClick={() => this.props.onStop(cellInfo.row.key)}> <FaStop size={13}/> </button> : (<button className="tableIconButton" onClick={() => this.handlePlay(cellInfo.row.key)} disabled={this.props.disablePlay}> <FaPlay size={13}/> </button>)}
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
          pageSize={8}
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
