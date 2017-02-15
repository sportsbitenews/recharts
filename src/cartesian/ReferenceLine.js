/**
 * @fileOverview Reference Line
 */
import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
import pureRender from '../util/PureRender';
import Layer from '../container/Layer';
import Text from '../component/Text';
import { PRESENTATION_ATTRIBUTES, getPresentationAttributes,
  filterEventAttributes } from '../util/ReactUtils';
import Label from '../component/Label';
import { validateCoordinateInRange, isNumOrStr } from '../util/DataUtils';

const renderLine = (option, props) => {
  let line;

  if (React.isValidElement(option)) {
    line = React.cloneElement(option, props);
  } else if (_.isFunction(option)) {
    line = option(props);
  } else {
    line = (
      <line
        {...props}
        className="recharts-reference-line-line"
      />
    );
  }

  return line;
};

@pureRender
class ReferenceLine extends Component {

  static displayName = 'ReferenceLine';

  static propTypes = {
    ...PRESENTATION_ATTRIBUTES,
    viewBox: PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number,
      width: PropTypes.number,
      height: PropTypes.number,
    }),

    xAxis: PropTypes.object,
    yAxis: PropTypes.object,

    isFront: PropTypes.bool,
    alwaysShow: PropTypes.bool,
    x: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    y: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    yAxisId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    xAxisId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    labelPosition: PropTypes.oneOf(['start', 'end']),
    shape: PropTypes.func,
  };

  static defaultProps = {
    isFront: false,
    alwaysShow: false,
    xAxisId: 0,
    yAxisId: 0,
    fill: 'none',
    stroke: '#ccc',
    fillOpacity: 1,
    strokeWidth: 1,
    labelPosition: 'end',
  };

  getEndPoints(isX, isY) {
    const { xAxis, yAxis, viewBox } = this.props;
    const { x, y, width, height } = viewBox;

    if (isY) {
      const value = this.props.y;
      const { scale } = yAxis;
      const offset = scale.bandwidth ? scale.bandwidth() / 2 : 0;
      const coord = scale(value) + offset;

      if (validateCoordinateInRange(coord, scale)) {
        return yAxis.orientation === 'left' ?
            [{ x, y: coord }, { x: x + width, y: coord }] :
            [{ x: x + width, y: coord }, { x, y: coord }];
      }
    } else if (isX) {
      const value = this.props.x;
      const { scale } = xAxis;
      const offset = scale.bandwidth ? scale.bandwidth() / 2 : 0;
      const coord = scale(value) + offset;

      if (validateCoordinateInRange(coord, scale)) {
        return xAxis.orientation === 'top' ?
           [{ x: coord, y }, { x: coord, y: y + height }] :
           [{ x: coord, y: y + height }, { x: coord, y }];
      }
    }

    return null;
  }

  render() {
    const { x, y, labelPosition, shape } = this.props;
    const isX = isNumOrStr(x);
    const isY = isNumOrStr(y);

    if (!isX && !isY) { return null; }

    const endPoints = this.getEndPoints(isX, isY);

    if (!endPoints) { return null; }

    const [start, end] = endPoints;
    const props = {
      ...getPresentationAttributes(this.props),
      ...filterEventAttributes(this.props),
      x1: start.x,
      y1: start.y,
      x2: end.x,
      y2: end.y,
    };

    return (
      <Layer className="recharts-reference-line">
        {renderLine(shape, props)}
        {Label.renderCallByParent(this.props, {
          x: Math.min(props.x1, props.x2),
          y: Math.min(props.y1, props.y2),
          width: Math.abs(props.x2 - props.x1),
          height: Math.abs(props.y2 - props.y1),
        })}
      </Layer>
    );
  }
}

export default ReferenceLine;
