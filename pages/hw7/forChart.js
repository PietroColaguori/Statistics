"use strict";

class forChart {

  static randomColor() {
    return '#' + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6);
  }

  static randomColorCSS() {
    return this.CSS_COLORS[Math.round(Math.random() * this.CSS_COLORS.length)];
  }


  static randomRgbaString(Alpha) {
    return 'rgba(' +
      Math.round(Math.random() * 160) + ',' +
      Math.round(Math.random() * 220) + ',' +
      Math.round(Math.random() * 250) + ', ' + Alpha + ')';
  }

  static verticalHistoFromIntervals(ctx, intervals, y_min, y_range, viewRect, strokeStyle, lineWidth, fillStyle) {

    //max freq
    let maxcount = 0;
    for (const interval of intervals) {
      maxcount = Math.max(maxcount, interval.count);
    }

    //isto orizzontale

    for (const interval of intervals) {

      let x_rect = viewRect.x;
      let width_rect = viewRect.width * interval.count / maxcount;

      let y_rect_top = for2d.transformY(interval.upper, y_min, y_range, viewRect.y, viewRect.height);
      let y_rect_bottom = for2d.transformY(interval.lower, y_min, y_range, viewRect.y, viewRect.height);
      let height_rect = y_rect_bottom - y_rect_top;   //y crescono verso il basso

      let rectInterval = new rectangular(x_rect, y_rect_top, width_rect, height_rect);

  
      ctx.rect(rectInterval.x, rectInterval.y, rectInterval.width, rectInterval.height);
      const gradient = ctx.createLinearGradient(rectInterval.x, rectInterval.y, rectInterval.x, rectInterval.y + rectInterval.height);
      gradient.addColorStop(0, 'blue');
      gradient.addColorStop(0.25, fillStyle);
      gradient.addColorStop(0.5, 'pink');
      gradient.addColorStop(0.75, fillStyle);
      gradient.addColorStop(1, 'blue');
      ctx.fillStyle = gradient;
      ctx.fillRect(rectInterval.x, rectInterval.y, rectInterval.width, rectInterval.height);

    }

  }

  static  CSS_COLORS = [
    "black",
    "red",
    "blue",
    "green",
    "yellow",
    "purple",
    "orange",
    "brown",
    "pink",
    "gray"
  ];


}
