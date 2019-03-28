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
import {FaPlay, FaStop, FaPause, FaPen, FaChartBar } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import routes from '../../constants/routes.json';


const remote = require('electron').remote;
const app = remote.app;

const styles = {
};


var fs = require('fs');
var path = require('path');
var util = require('util');

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
    } else {

        info.type = "file";
    }

    return info;
}

function loadFileDir (subFolder, isScript){
  if (subFolder == 'undefined'){
    return []
  } else{

    var dirPath= app.getPath('userData') + subFolder;
    var resultJSON = {'data': dirTree(dirPath).children};
    if (isScript){
      for (var i = 0; i < resultJSON['data'].length; i++) {
        if (resultJSON['data'][i]['type'] == 'folder'){
          var modifiedString;
          var modified;
          var scriptName = 'tstat_parameters.json';          
          for (var j = 0; j < resultJSON['data'][i]['children'].length; j++) {
            if (resultJSON['data'][i]['children'][j]['key'] == scriptName) {
              modifiedString = resultJSON['data'][i]['children'][j]['modifiedString'];
              modified = resultJSON['data'][i]['children'][j]['modified'];          
            }
          }
          resultJSON['data'][i]['modified'] = modified;
          resultJSON['data'][i]['modifiedString'] = modifiedString;
          resultJSON['data'][i]['fullPath'] = subFolder + '/' + resultJSON['data'][i]['key'];
        }
      }
    };

    var searchString = 'data[**]' + '[*type=folder]'
    var filequery = jsonQuery(searchString, {data: resultJSON}).value;
    return filequery;
  }
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
    var filequery = loadFileDir (this.state.subFolder, this.state.isScript);
    var showPagination = (filequery.length > 5) 
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

  handleRefresh = (newProps) => {
    var filequery = loadFileDir(this.state.subFolder, this.state.isScript);
    var showPagination = (filequery.length > 5)
    this.setState({fileJSON: filequery, showPagination: showPagination})
  };
  
  getStatus = (expt) => {
      if (this.props.pausedExpts.includes(app.getPath('userData') + this.props.subFolder + '/' + expt)) {
          return "Paused";
      }
      else if (this.props.runningExpts.includes(app.getPath('userData') + this.props.subFolder + '/' + expt)) {
          return "Running";
      }
      else {
          return "Stopped";
      }
  }


  isSelected = rowInfo => {
    if (typeof rowInfo !== 'undefined'){
      if (rowInfo.index == this.state.selection) {
        this.props.onSelectFolder(rowInfo.original.key);
        return true;
      }
    }
   };
   
   handlePlay = exptName => {
       this.props.runningExpts.includes(app.getPath('userData') + this.props.subFolder + '/' + exptName) ? this.props.onContinue(exptName): this.props.onStart(exptName);
   }
  
  render() {
    const { classes } = this.props;
    const { fileJSON, dirLength } = this.state; 
  var columns = [
      {
        Header: 'Name',
        accessor: 'key', // String-based value accessors!
        width: 295
      },
      {
        Header: 'Last Modified',
        accessor: 'modified',
        Cell: props => <span> {props.original.modifiedString} </span>,
        width: 215
      },
      {
          Header: 'Status',
          width: 150,
          Cell: cellInfo => <span>{this.getStatus(cellInfo.row.key)}</span>
      },
      {
          Header: '',
          Cell: (cellInfo) => (<div>
            <Link className="scriptFinderEditBtn" id="edits" to={{pathname: routes.EDITOR, exptDir: path.join(app.getPath('userData') + this.props.subFolder, cellInfo.row.key)}}><button className="tableIconButton" onClick={() => this.props.onEdit(cellInfo.row.key)}> <FaPen size={13}/> </button></Link>
            <Link className="scriptFinderEditBtn" id="graphs" to={{pathname: routes.GRAPHING, exptDir: path.join(app.getPath('userData') + this.props.subFolder, cellInfo.row.key)}}><button className="tableIconButton" onClick={() => this.props.onGraph(cellInfo.row.key)}> <FaChartBar size={18}/> </button></Link>
            {this.props.runningExpts.includes(app.getPath('userData') + this.props.subFolder + '/' + cellInfo.row.key) && !this.props.pausedExpts.includes(app.getPath('userData') + this.props.subFolder + '/' + cellInfo.row.key) ? (<button className="tableIconButton" onClick={() => this.props.onPause(cellInfo.row.key)}> <FaPause size={13}/> </button>) : (<button className="tableIconButton" onClick={() => this.handlePlay(cellInfo.row.key)}> <FaPlay size={13}/> </button>)}
            <button className="tableIconButton" onClick={() => this.props.onStop(cellInfo.row.key)}> <FaStop size={13}/> </button>
            <button className="tableTextButton" onClick={() => this.props.onClone(cellInfo.row.key)}> CLONE </button>
           </div>),
          width: 400
      }];    
    return (
                        
      <div>
        <ReactTable
          data={fileJSON}
          columns={columns}
          noDataText="Select an Experiment Type"
          showPagination={this.state.showPagination}
          pageSize={8}
          height={100}
          resizable={false}
          showPageSizeOptions= {false}
          loading={false}
          defaultSorted={[{id: "modified",desc: true}]}
          className="-striped -highlight"
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
