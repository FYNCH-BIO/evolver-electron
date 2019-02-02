import React from 'react';
import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import FileBrowser, {Icons, Sorters} from 'react-keyed-file-browser'
import moment from 'moment'
import parsePath from 'parse-filepath';
import jsonQuery from 'json-query';
import {MdCached} from 'react-icons/md';

const remote = require('electron').remote;
const app = remote.app;

const styles = {
  root: {
    height: 17,
    width: 100,
  },
  icon: {
    width: 30,
    height: 30,
  },
  switchBase: {
    width: 55,
  },
  bar: {
    width: 45,
    height: 17,
    backgroundColor: 'white',
    margin: '8px 0px 0px -23px'
  },
  checked: {
    transform: 'translateX(35px)',
    '& + $bar': {
      opacity: 1,
    },
  },
  label: {
    color: 'white',
    fontSize: '18px',
    margin: '30px 0px 0px 0px',
  },
  labelPlacementStart: {
    margin: '0px 0px 0px 0px',
    padding: '0px 0px 0px 0px',
    height: 20,
  },
  colorPrimary: {
    '&$checked': {
      color: '#f58245',
      '& + $bar': {
        backgroundColor: '#f58245',
      },
    },
  },
  colorSecondary: {
    '&$checked': {
      color: 'grey',
      '& + $bar': {
        backgroundColor: 'grey',
      },
    },
  },
  card: {
    width: 600,
    height: 300,
    backgroundColor: 'black',
    margin: '-604px 0px 0px 20px',
    verticalAlign: 'bottom',
    }
};


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
    info.modified = moment(timestamp).valueOf();
    info.size = stats.size;

    if (stats.isDirectory()) {
        info.type = "folder";
        info.children = fs.readdirSync(filename).map(function(child) {
            return dirTree(filename + '/' + child);
        });
    } else {
        // Assuming it's a file. In real life it could be a symlink or
        // something else!
        info.type = "file";
    }

    return info;
}

function loadFileDir (){
  var dirPath= app.getPath('userData') + '/legacy/data';
  var resultJSON = {'data': dirTree(dirPath).children};
  var filequery = jsonQuery('data[**][*extname=.py]', {data: resultJSON}).value
  return filequery
}

class ScriptForm extends React.Component {
  state = {
    fileJSON: [],
    test: 'placeholder',
    logPath: '',
    filePath: ''
  };

  componentDidMount(){
    var filequery = loadFileDir ();
    this.setState({fileJSON: filequery})
  }

  handleTestBtn = () => {
    var filequery = loadFileDir ();
    this.setState({fileJSON: filequery})
  };

  handleChange = name => event => {
    this.setState({ [name]: event.target.checked });
  };


  handleFilePath = () => {
    let parsedDirectory = parsePath(document.getElementsByName('fileinput')[0].files[0].path)

    this.setState({
      filePath: document.getElementsByName('fileinput')[0].files[0].path,
      logPath: parsedDirectory.dir})
  }

  handleSelectFile = (fileKey) => {
    console.log(fileKey)
  }

  render() {
    const { classes } = this.props;
    const { fileJSON } = this.state;

    return (
      <div>
        <Card className={classes.card}>
          <button type="button" className="refreshBtn" onClick={this.handleTestBtn}> <MdCached size={30}/> </button>
          <FileBrowser
            files={this.state.fileJSON}
            sort = {Sorters.SortByModified}
            onSelectFile= {this.handleSelectFile}
          />
        </Card>

      </div>
    );
  }
}

export default withStyles(styles)(ScriptForm);
