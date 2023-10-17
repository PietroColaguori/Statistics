using System;
using System.Windows.Forms;

class Program
{
    static void Main()
    {
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);

        // Create a new form
        Form form = new Form
        {
            Text = "Hello, Window!",
            Size = new System.Drawing.Size(400, 200)
        };

        // Create a label on the form
        Label label = new Label
        {
            Text = "This is a simple window.",
            TextAlign = ContentAlignment.MiddleCenter
        };

        // Add the label to the form
        form.Controls.Add(label);

        // Show the form
        Application.Run(form);
    }
}
