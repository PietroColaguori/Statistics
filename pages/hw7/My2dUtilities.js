/* Javascript progressive tutorial by example for students, by Tom Gastaldi, University of Rome "Sapienza",
tommaso.gastaldi@gmail.com, WhatsApp: 3272347610. Please report corrections, improvements, reference links, etc. */

"use strict";

class My2dUtilities {

  static transformXYIntoViewport([x, y], rectWorld, rectView) {
    //min_x in rectWorld è rectWorld.x
    //range_x in rectWorld è rectWorld.width
    //min_y in rectWorld è rectWorld.y - rectWorld.height
    //range_y in rectWorld è rectWorld.width
    //come un rettangolo definito su un ordinario sistema cartesiano
    return (
      [
        My2dUtilities.transformX(x, rectWorld.x, rectWorld.width, rectView.x, rectView.width),
        My2dUtilities.transformY(y, rectWorld.y - rectWorld.height, rectWorld.height, rectView.y, rectView.height)
      ]
    )
  }

  static transformXYToViewport([x, y], min_x, range_x, min_y, range_y, rectView) {
    return (
      [
        My2dUtilities.transformX(x, min_x, range_x, rectView.x, rectView.width),
        My2dUtilities.transformY(y, min_y, range_y, rectView.y, rectView.height)
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
        My2dUtilities.backToWorldX(x, rectWorld.x, rectWorld.width, rectView.x, rectView.width),
        My2dUtilities.backToWorldY(y, rectWorld.y - rectWorld.height, rectWorld.height, rectView.y, rectView.height)
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
