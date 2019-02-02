import React from 'react';
import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import moment from 'moment'
import parsePath from 'parse-filepath';
import jsonQuery from 'json-query';
import {MdCached} from 'react-icons/md';
import ReactTable from "react-table";


const remote = require('electron').remote;
const app = remote.app;

const styles = {
  card: {
    width: 420,
    height: 220,
    position: 'absolute',
    backgroundColor: 'black',
    verticalAlign: 'bottom',
    top: '80px',
    left: '30px',
    overflowX: 'hidden',
    overflowY: 'scroll',
    border: '1.5px solid grey',
    padding: '5px 0px 15px 15px'
  },

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
  var dirPath= app.getPath('userData') + '/legacy/data/' + subFolder;
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
      test: 'placeholder',
      logPath: '',
      filePath: '',
      selection: 'undefined',
      subFolder: ''
    };
  }

  componentDidMount(){
    var filequery = loadFileDir (this.state.subFolder);
    var dirLength = filequery.length;
    this.setState({fileJSON: filequery, dirLength: dirLength})
  }

  handleRefresh = () => {
    var filequery = loadFileDir(this.state.subFolder);
    var dirLength = filequery.length
    this.setState({fileJSON: filequery, dirLength: dirLength})
  };

  handleFilePath = () => {
    let parsedDirectory = parsePath(document.getElementsByName('fileinput')[0].files[0].path)

    this.setState({
      filePath: document.getElementsByName('fileinput')[0].files[0].path,
      logPath: parsedDirectory.dir})
  }

  isSelected = rowInfo => {
    if (typeof rowInfo !== 'undefined'){
      if (rowInfo.index == this.state.selection) {
          console.log(rowInfo.original.key)
        return true
      }
    }
   };

  render() {
    const { classes } = this.props;
    const { fileJSON, dirLength } = this.state;

    return (
      <div>
        <Card className={classes.card}>
          <ReactTable
            data={fileJSON}
            columns={columns}
            showPagination={false}
            pageSize={dirLength}
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
        </Card>
        <button type="button" className="refreshBtn" onClick={this.handleRefresh}> <MdCached size={40}/> </button>
      </div>
    );
  }
}

export default withStyles(styles)(ScriptFinder);
