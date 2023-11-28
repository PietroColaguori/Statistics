"use strict";

class for2d {

  static transformXYIntoViewport([x, y], rectWorld, rectView) {
    return (
      [
        for2d.transformX(x, rectWorld.x, rectWorld.width, rectView.x, rectView.width),
        for2d.transformY(y, rectWorld.y - rectWorld.height, rectWorld.height, rectView.y, rectView.height)
      ]
    )
  }

  static transformXYToViewport([x, y], min_x, range_x, min_y, range_y, rectView) {
    return (
      [
        for2d.transformX(x, min_x, range_x, rectView.x, rectView.width),
        for2d.transformY(y, min_y, range_y, rectView.y, rectView.height)
      ]
    )
  }


  static transformX(x, min_x, range_x, left, width) {
    return left + width * (x - min_x) / range_x;
  }

  static transformY(y, min_y, range_y, top, height) {
    return top + height - (height * (y - min_y) / range_y);
  }


  static backToWorldXY([x, y], rectWorld, rectView) {
    return (
      [
        for2d.backToWorldX(x, rectWorld.x, rectWorld.width, rectView.x, rectView.width),
        for2d.backToWorldY(y, rectWorld.y - rectWorld.height, rectWorld.height, rectView.y, rectView.height)
      ]
    )
  }


  //returning from viewport to world
  static backToWorldX(x, min_x, range_x, left, width) {
    return min_x + range_x * (x - left) / width;
  }

  static backToWorldY(y, min_y, range_y, top, height) {
    return min_y + range_y - range_y * (y - top) / height;
  }


}
