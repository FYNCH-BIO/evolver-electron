import React from 'react';
import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import FileBrowser, {Icons, Sorters} from 'react-keyed-file-browser'
import moment from 'moment'
import parsePath from 'parse-filepath';



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
    position: 'absolute',
    margin: '-310px 0px 0px 20px',
    verticalAlign: 'top',
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

class ScriptForm extends React.Component {
  state = {
    fileJSON: [],
    test: 'placeholder',
    logPath: '',
    filePath: ''
  };

  handleTestBtn = () => {
    const remote = require('electron').remote;
    var dirPath= './app/components/python-shell';
    var resultJSON = {'data': dirTree(dirPath).children};
    console.log(resultJSON);

    var jp = require('jsonpath');
    var filequery = jp.query(resultJSON, '$..data[?(@.extname==".py" && @.type=="file")]');

    console.log(filequery)

    // $..book[?(@.price==8.99),?(@.category=='fiction')]

    const app = remote.app;

    this.setState({fileJSON: filequery})
  };

  handleChange = name => event => {
    this.setState({ [name]: event.target.checked });
  };

  handleSubmit = value => {
      var values = {percent: value, lightA: this.state.lightAToggle, lightB: this.state.lightBToggle};
      this.props.onSubmitButton("light", values);
  };

  handleFilePath = () => {
    let parsedDirectory = parsePath(document.getElementsByName('fileinput')[0].files[0].path)

    this.setState({
      filePath: document.getElementsByName('fileinput')[0].files[0].path,
      logPath: parsedDirectory.dir})
  }

  render() {
    const { classes } = this.props;
    const { fileJSON } = this.state;

    return (
      <div>
        <Card className={classes.card}>
          <FileBrowser
            files={this.state.fileJSON}
            sort = {Sorters.SortByModified}
          />
        </Card>
        <button type="button" className="scriptSubmitBtn" onClick={this.handleTestBtn}> Test Code </button>
        <p>{this.state.test}</p>

        <input name="fileinput" className= "managerFileInput" type="file" onChange={this.handleFilePath}/>


      </div>
    );
  }
}

export default withStyles(styles)(ScriptForm);
