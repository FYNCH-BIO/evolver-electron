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

  }]

var fs = require('fs')
var path = require('path')
var util = require('util')

function dirTree(filename) {
    var stats = fs.lstatSync(filename),
        info = {
            key: path.basename(filename),
            extname: path.extname(filename)
        };

    var timestamp = new Date(util.inspect(stats.mtime));
    info.modifiedString = moment(timestamp).fromNow();
    info.modified = moment(timestamp).valueOf()
    info.size = stats.size;

    if (stats.isDirectory()) {
        info.type = "folder";
        info.children = fs.readdirSync(filename).map(function(child) {
            return dirTree(filename + '/' + child);
        });
    } else {

        info.type = "file";
    }

    return info;
}

function loadFileDir (subFolder){
  var dirPath= app.getPath('userData') + subFolder;
  var resultJSON = {'data': dirTree(dirPath).children};
  var searchString = 'data[**]' + '[*type=folder]'
  var filequery = jsonQuery(searchString, {data: resultJSON}).value
  return filequery
}

class ScriptFinder extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      fileJSON:[],
      dirLength: 1,
      selection: 'undefined',
      subFolder: this.props.subFolder,
    };
  }

  componentDidMount(){
    var filequery = loadFileDir (this.state.subFolder);
    var dirLength = filequery.length;
    this.setState({fileJSON: filequery, dirLength: dirLength})
  }

  componentDidUpdate(prevProps) {
    if (this.props.subFolder !== prevProps.subFolder) {
      console.log('updated subfolder')
      this.handleRefresh(this.props.subFolder);
      this.setState({
        subFolder: this.props.subFolder,
      })
    }
  }


  handleRefresh = (newProps) => {
    console.log(newProps)

    var filequery = loadFileDir(newProps);
    var dirLength = filequery.length
    this.setState({fileJSON: filequery, dirLength: dirLength})
  };


  isSelected = rowInfo => {
    if (typeof rowInfo !== 'undefined'){
      if (rowInfo.index == this.state.selection) {
          console.log(rowInfo.original.key)
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
          showPagination={true}
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
