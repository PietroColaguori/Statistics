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
            Pen pen = new Pen(Color.Purple, 3);
            Rectangle rect = new Rectangle(50, 50, 200, 100);
            e.Graphics.DrawRectangle(pen, rect);
        }
    }
}
