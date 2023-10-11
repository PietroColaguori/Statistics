using System;
using System.Drawing;
using System.Windows.Forms;

namespace hw1
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            base.OnPaint(e);

            // Create a new Pen object with a black color and a width of 1 pixel
            Pen pen = new Pen(Color.Black, 1);

            // Draw a point at (10, 10)
            e.Graphics.DrawRectangle(pen, 10, 10, 1, 1);
        }
    }
}
