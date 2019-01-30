import React from 'react';
import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import FileBrowser, {Icons} from 'react-keyed-file-browser'
import moment from 'moment'


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
    height: 600,
    backgroundColor: 'black',
    margin: '100px 0px -165px 100px'
    }
};

var fs = require('fs');
var path = require('path');
var util = require('util');

var diretoryTreeToObj = function(dir, done) {
    var results = [];

    fs.readdir(dir, function(err, list) {
        if (err)
            return done(err);

        var pending = list.length;

        if (!pending)
            return done(null, {name: path.basename(dir), type: 'folder', children: results});

        list.forEach(function(file) {
            file = path.resolve(dir, file);
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    diretoryTreeToObj(file, function(err, res) {
                        results.push({
                            name: path.basename(file),
                            type: 'folder',
                            children: res
                        });
                        if (!--pending)
                            done(null, results);
                    });
                }
                else {
                    results.push({
                        type: 'file',
                        name: path.basename(file),
                        extension: path.extname(file),
                        modified: new Date(util.inspect(stat.mtime))
                    });
                    if (!--pending)
                        done(null, results);
                }
            });
        });
    });
};


class ScriptForm extends React.Component {
  state = {
    expt_continue: false,
    lightBToggle: false,
  };

  handleTestBtn = () => {
    const remote = require('electron').remote;
    const app = remote.app;

    var dirTree = ('/Users/brandonwong/Documents/GitHub.noindex/evolver-electron/app/components/python-shell');

    diretoryTreeToObj(dirTree, function(err, res){
        if(err)
            console.error(err);

        console.log(JSON.stringify(res));
    });

    console.log(+moment().subtract(3, 'days'))
  };

  handleChange = name => event => {
    this.setState({ [name]: event.target.checked });
  };

  handleSubmit = value => {
      var values = {percent: value, lightA: this.state.lightAToggle, lightB: this.state.lightBToggle};
      this.props.onSubmitButton("light", values);
  };

  render() {
    const { classes } = this.props;

    return (
      <div>
        <Card className={classes.card}>
          <FileBrowser
            files={[
              {
                key: 'cat.png',
                modified: +moment().subtract(3, 'days'),
                size: 1.5 * 1024 * 1024,
              },
              {
                key: 'kitten.png',
                modified: moment('2019-01-26T05:45:10.343Z').fromNow() ,
                size: 545 * 1024,
              },
              {
                key: 'elephant1.png',
                modified: moment('November 2000').fromNow(),
                size: 52 * 1024,
              },
              {
                key: 'elephant2.png',
                modified: +moment().subtract(3, 'days'),
                size: 52 * 1024,
              },
              {
                key: 'elephant3.png',
                modified: +moment().subtract(3, 'days'),
                size: 52 * 1024,
              },
              {
                key: 'elephant4.png',
                modified: +moment().subtract(3, 'days'),
                size: 52 * 1024,
              },
              {
                key: 'elephant5.png',
                modified: +moment().subtract(3, 'days'),
                size: 52 * 1024,
              },
              {
                key: 'elephant6.png',
                modified: +moment().subtract(3, 'days'),
                size: 52 * 1024,
              },
              {
                key: 'elephant7.png',
                modified: +moment().subtract(3, 'days'),
                size: 52 * 1024,
              },
              {
                key: 'elephant8.png',
                modified: +moment().subtract(3, 'days'),
                size: 52 * 1024,
              },

            ]}
          />
        </Card>

        <FormGroup row>
          <FormControlLabel
            control={
              <Switch
                checked={this.state.expt_continue}
                onChange={this.handleChange('expt_continue')}
                value="expt_continue"
                color="primary"
                classes={{root: classes.root, disabled: classes.disabledSwitch, icon: classes.icon, switchBase: classes.switchBase, bar: classes.bar, checked: classes.checked, colorPrimary: classes.colorPrimary}}
              />
            }
            labelPlacement="start"
            label ="Continue Experiment?"
            classes = {{
              label: classes.label,
              labelPlacementStart: classes.labelPlacementStart,
            }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={this.state.expt_overwrite}
                onChange={this.handleChange('expt_overwrite')}
                value="expt_overwrite"
                color="primary"
                classes={{root: classes.root, icon: classes.icon, switchBase: classes.switchBase, bar: classes.bar, checked: classes.checked, colorPrimary: classes.colorPrimary}}
              />
            }
            labelPlacement="start"
            label ="Overwrite Experiment?"
            classes = {{
              label: classes.label,
              labelPlacementStart: classes.labelPlacementStart,
            }}
          />
        </FormGroup>
        <button type="button" className="scriptSubmitBtn" onClick={this.handleTestBtn}> Test Code </button>

      </div>
    );
  }
}

export default withStyles(styles)(ScriptForm);
