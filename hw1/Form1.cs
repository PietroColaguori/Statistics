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
            Graphics g = e.Graphics;
            Pen pen = new Pen(Color.Purple);

            g.DrawLine(pen, 50, 50, 300, 300);
        }
    }
}
