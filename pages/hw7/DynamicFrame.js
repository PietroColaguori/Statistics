/* Javascript progressive tutorial by example for students, by Tom Gastaldi, University of Rome "Sapienza",
tommaso.gastaldi@gmail.com, WhatsApp: 3272347610. Please report corrections, improvements, reference links, etc. */

"use strict";

class DynamicFrame {

  rettangolo;
  ctx;
  outlineColor;
  lineWidth;
  lineDash;
  myCanvas;

  x_RectDown = 0;
  y_RectDown = 0;
  Width_RectDown = 0;
  Height_RectDown = 0;

  x_MouseDown = 0;
  y_MouseDown = 0;
  x_MouseMove = 0;
  y_MouseMove = 0;
  x_MouseUp = 0;
  y_MouseUp = 0;
  x_Mouse_Old = 0;
  y_Mouse_Old = 0;

  draggingStarted = false;
  resizingStarted = false;

  speed_dt = 30;
  speed_dx = 0;
  speed_dy = 0;
  dx_ContinueDrag = 0;
  dy_ContinueDrag = 0;

  containsMouse = false;


  static initialState = {

    rettangolo: undefined,
    ctx: undefined,
    outlineColor: undefined,
    lineWidth: undefined,
    lineDash: undefined,
    enableInertialDrag: false,

  };


  constructor(initialState) {

    this.rettangolo = initialState.rettangolo;
    this.ctx = initialState.ctx;
    this.outlineColor = initialState.outlineColor;
    this.lineWidth = initialState.lineWidth;
    this.lineDash = initialState.lineDash;
    this.enableInertialDrag = initialState.enableInertialDrag;

    this.myCanvas = this.ctx.canvas;


    this.myCanvas.addEventListener("mousedown", (e) => {
      this.mousedown_Handler(e)
    });
    this.myCanvas.addEventListener("mousemove", (e) => {
      this.mousemove_Handler(e)
    });
    this.myCanvas.addEventListener("mouseup", (e) => {
      this.mouseup_Handler(e)
    });
    this.myCanvas.addEventListener("wheel", (e) => {
      this.wheel_Handler(e)
    });

    if (this.enableInertialDrag) {
      setInterval(() => this.mouseVelocityMonitor(), this.speed_dt);
    }


  }

  mouseVelocityMonitor() {

    if (!this.x_MouseMove || !this.y_MouseMove) {
      return
    }

    this.speed_dx = this.x_MouseMove - this.x_Mouse_Old;
    this.speed_dy = this.y_MouseMove - this.y_Mouse_Old;
    this.x_Mouse_Old = this.x_MouseMove;
    this.y_Mouse_Old = this.y_MouseMove;

  }

  mousedown_Handler(e) {

//    const rect = this.myCanvas.getBoundingClientRect();

    this.x_MouseDown = e.x;
    this.y_MouseDown = e.y;

    if (!this.containsMouse) {
      return
    }

    this.x_RectDown = this.rettangolo.x;
    this.y_RectDown = this.rettangolo.y;
    this.Width_RectDown = this.rettangolo.width;
    this.Height_RectDown = this.rettangolo.height;

    if (e.which === 1)          //left
    {
      this.draggingStarted = true
    } else if (e.which === 3)     //right
    {
      this.resizingStarted = true
    }

  }

  mousemove_Handler(e) {

    this.x_MouseMove = e.x;
    this.y_MouseMove = e.y;

    //flag mouse contained
    const rect = this.myCanvas.getBoundingClientRect();
    this.containsMouse = this.rettangolo.contains(e.x - rect.x, e.y - rect.y);

    const shiftX = this.x_MouseMove - this.x_MouseDown;
    const shiftY = this.y_MouseMove - this.y_MouseDown;

    if (this.draggingStarted) {

      this.rettangolo.x = this.x_RectDown + shiftX;
      this.rettangolo.y = this.y_RectDown + shiftY;

    } else if (this.resizingStarted) {

      this.rettangolo.width = this.Width_RectDown + shiftX;
      this.rettangolo.height = this.Height_RectDown + shiftY;

      // this.checkSize()

    }
  }

  mouseup_Handler(e) {

    this.x_MouseUp = e.x;
    this.y_MouseUp = e.y;

    this.resizingStarted = false;

    if (this.draggingStarted) {

      this.draggingStarted = false;

      //continue drag effect

      if (this.enableInertialDrag) {

        this.dx_ContinueDrag = this.speed_dx;
        this.dy_ContinueDrag = this.speed_dy;

        this.continuaDrag();
      }

    }

  }

  //effetto di inerzia drag
  continuaDrag() {

    if (Math.max(Math.abs(this.dx_ContinueDrag), Math.abs(this.dy_ContinueDrag)) < 1 ||
      this.draggingStarted || this.resizingStarted) {
      return
    }
    this.rettangolo.x += Math.round(this.dx_ContinueDrag);
    this.rettangolo.y += Math.round(this.dy_ContinueDrag);
    this.dx_ContinueDrag *= 0.6;
    this.dy_ContinueDrag *= 0.6;
    setTimeout(() => this.continuaDrag(), this.speed_dt);   //rientro fino a che finisce lo slancio

  }

  wheel_Handler(e) {

    // const rect = this.myCanvas.getBoundingClientRect();
    //
    // if (!this.rettangolo.contains(e.x - rect.x, e.y - rect.y)) {
    //   return
    // }

    const shiftY = 15 * Math.sign(e.deltaY);
    const shiftX = Math.round(shiftY * this.rettangolo.aspectRatio());     //keep aspect ratio

    this.rettangolo.x -= shiftX;
    this.rettangolo.y -= shiftY;
    this.rettangolo.width += shiftX + shiftX;
    this.rettangolo.height += shiftY + shiftY;


    // this.checkSize()

  }

  // checkSize() {
  //
  //   const min_Width = this.min_Height * this.rettangolo.aspectRatio();
  //
  //   if (this.rettangolo.width < min_Width) {
  //     this.rettangolo.width = min_Width
  //   }
  //   if (this.rettangolo.height < this.min_Height) {
  //     this.rettangolo.height = this.min_Height
  //   }
  //
  // }


  drawFrame() {
    //contenitore chart
    this.rettangolo.disegnaRettangolo(this.ctx, this.outlineColor, this.lineWidth, this.lineDash);
  }

  drawFrameIfContainsMouse() {
    if (this.containsMouse) {
      this.drawFrame();
    }
  }

}


