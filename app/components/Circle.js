import React from 'react';

export default class Circle extends React.Component {
  render() {  	
    var circleStyle = {
      display:"inline-block",
      backgroundColor: this.props.bgColor,
      borderRadius: "50%",
      width:'15px',
      height:'15px',
      margin:'0px 0px 0px 30px'
    };
    return (
      <div style={circleStyle}></div>
    );
  }
}