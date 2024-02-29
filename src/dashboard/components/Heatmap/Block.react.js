import React, { Component } from 'react';
import Popover from 'react-popover';

const TooltipWrapper = ({
  className = 'bg-black br2 f7 measure-wide pa2 white bshadow1',
  children
}) =>
  <div className={className}>
    {children}
  </div>;

const Box = ({
  className,
  x,
  y,
  size,
  color,
  index,
  strokeWidth = 0.5,
  ...props
}) =>
  <rect
    className={className}
    x={x}
    y={y}
    width={size}
    height={size}
    style={{
      fill: color,
      strokeWidth,
      '--i': index
    }}
    {...props} />;

export default class Block extends Component {
  constructor (props) {
    super(props);
    this.state = { isOpen: false };
  }

  // defaultProps = {
  //   className: 'stroke-gray2 stroke-o-40 stg-slide-left1'
  // }

  // handleOpenPopover = () => {
  //   this.setState({ isOpen: true });
  // };

  // handleClosePopover = () => {
  //   this.setState({ isOpen: false });
  // }

  render () {
    const {
      tooltip,
      // className,
      ...boxProps
    } = this.props;

    const { isOpen } = this.state;

    if (!tooltip) {
      return <Box {...boxProps} />;
    }

    return (
      <Popover
        isOpen={isOpen}
        onOuterAction={this.handleClosePopover}
        body={<TooltipWrapper>{tooltip}</TooltipWrapper>}>
        <Box
          {...boxProps}
          onMouseEnter={this.handleOpenPopover}
          onMouseLeave={this.handleClosePopover} />
      </Popover>
    );
  }
}
