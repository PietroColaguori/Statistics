using System;
using System.Windows.Forms;
using System.IO;
using System.Data;
using System.Linq;

class Program
{
    static Label resultsLabel; // Declare the resultsLabel outside of Main method

    class Program
    {
        static Label resultsLabel; // Declare the resultsLabel outside of Main method

        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            // Create a new form
            Form form = new Form
            {
                Text = "Frequency Calculator",
                Size = new System.Drawing.Size(400, 400)
            };

            // Create a label on the form
            Label label = new Label
            {
                Text = "Frequency Calculator",
                TextAlign = ContentAlignment.MiddleCenter
            };

            // Add the label to the form
            form.Controls.Add(label);

            // Show the form (this shows the form, but it won't block the program)
            form.Show();

            // Read the Excel file
            string filePath = "C:/Users/pietr/OneDrive/Documenti/GitHub/Statistics/hw2_CS/professional_life.xlsx";
            DataSet ds = new DataSet();
            if (File.Exists(filePath))
            {
                ds.ReadXml(filePath);
            }
            else
            {
                MessageBox.Show("File not found!");
                return;
            }

            // Get the data from the Excel file
            DataTable dt = ds.Tables[0];
            var sex = dt.AsEnumerable().Select(x => x.Field<string>("Sex")).ToList();
            var teamLeaderOrPlayer = dt.AsEnumerable().Select(x => x.Field<string>("Team leader or Team player ?")).ToList();

            // Compute the joint probability
            var jointProbability = sex.Zip(teamLeaderOrPlayer, (s, t) => new { Sex = s, TeamLeaderOrPlayer = t })
                                       .GroupBy(x => new { x.Sex, x.TeamLeaderOrPlayer })
                                       .ToDictionary(x => $"{x.Key.Sex} - {x.Key.TeamLeaderOrPlayer}", x => (double)x.Count() / dt.Rows.Count);

            // Display the results in a label on the form
            resultsLabel = new Label
            {
                Text = "Calculating frequencies...",
                TextAlign = ContentAlignment.TopLeft,
                Location = new System.Drawing.Point(10, 50),
                AutoSize = true
            };
            form.Controls.Add(resultsLabel);

            string message = "Joint probability between Sex and Team leader or Team player ?:\n";
            foreach (var item in jointProbability)
            {
                message += $"{item.Key}: {item.Value:P2}\n";
            }

            resultsLabel.Text = message; // Update the label text with the results

            // Wait for the form to be closed
            Application.Run(form);
        }
    }
}
