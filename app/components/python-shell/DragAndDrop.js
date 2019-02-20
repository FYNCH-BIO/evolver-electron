import React from 'react'
import Dropzone from 'react-dropzone'
import {MdFileUpload} from 'react-icons/md';


const overlayStyle = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  padding: '2.5em 0',
  background: 'rgba(0,0,0,0.8)',
  textAlign: 'center',
  color: 'grey',
  zIndex: 1000,
  fontSize: 70,
  paddingTop: '40vh',
  fontStyle: 'italic',

};

class DragAndDrop extends React.Component {
  constructor() {
    super()
    this.state = {
      accept: '.py',
      files: []
    }
  }

  onDrop(files) {
    console.log(files)
    this.setState({files});
  }

  applyMimeTypes(event) {
    this.setState({
      accept: event.target.value
    });
  }

  render() {
    const { accept } = this.state;

    const files = this.state.files.map((file, index) => (
      <li key={file.name}>
        {file.name} - {file.size} bytes
      </li>
    ))

    return (
      <Dropzone
        accept={accept}
        onDrop={this.onDrop.bind(this)}
        disableClick
      >
        {({getRootProps, getInputProps, isDragActive}) => (
            <div {...getRootProps()} className="draganddrop">
              <input {...getInputProps()} />
              {isDragActive && <div style={overlayStyle}>Upload Python Scripts <MdFileUpload/> </div> }
            </div>
        )}
      </Dropzone>
    );
  }
}

export default DragAndDrop;
