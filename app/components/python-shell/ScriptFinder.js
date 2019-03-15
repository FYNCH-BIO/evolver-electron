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


const remote = require('electron').remote;
const app = remote.app;

const styles = {

};

const columns = [{
    Header: 'Name',
    accessor: 'key' // String-based value accessors!
  },{
    Header: 'Modified',
    accessor: 'modified',
    Cell: props => <span> {props.original.modifiedString} </span>

  }];

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
          var scriptName = 'custom_script.py';          
          for (var j = 0; j < resultJSON['data'][i]['children'].length; j++) {
            if (resultJSON['data'][i]['children'][j]['key'] == scriptName) {
              modifiedString = resultJSON['data'][i]['children'][j]['modifiedString'];
              modified = resultJSON['data'][i]['children'][j]['modified'];          
            }
          }
          resultJSON['data'][i]['modified'] = modified;
          resultJSON['data'][i]['modifiedString'] = modifiedString;
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
    this.setState({fileJSON: filequery, showPagination: showPagination})
  }

  componentDidUpdate(prevProps) {
    if (this.props.subFolder !== prevProps.subFolder) {
      this.handleRefresh(this.props.subFolder);
      this.setState({
        subFolder: this.props.subFolder,
      })
    }
  }


  handleRefresh = (newProps) => {
    var filequery = loadFileDir(newProps, this.state.isScript);
    var showPagination = (filequery.length > 5)
    this.setState({fileJSON: filequery, showPagination: showPagination})
  };


  isSelected = rowInfo => {
    if (typeof rowInfo !== 'undefined'){
      if (rowInfo.index == this.state.selection) {
        console.log(this.state.selection);
        console.log(rowInfo);
        this.props.onSelectFolder(rowInfo.original.key);
        return true
      }
    }
   };

  render() {
    const { classes } = this.props;
    const { fileJSON, dirLength } = this.state;

    return (
      <div>
        <ReactTable
          data={fileJSON}
          columns={columns}
          noDataText="Select an Experiment Type"
          showPagination={this.state.showPagination}
          pageSize={5}
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
