import express from "express";
import https from "https"; //
import { fileURLToPath } from "url"; //
import path from "path"; //
import dotenv from "dotenv";
import mailchimp from "@mailchimp/mailchimp_marketing";
import e from "express";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(__dirname);
  console.log(`http://localhost:${PORT}`);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "sign-up.html"));
});

app.post("/", (req, res) => {
  const firstName = req.body.fname;
  const lastName = req.body.lname;
  const email = req.body.email;
  console.log(firstName, lastName, email);

  const data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
        },
      },
    ],
  };
  const options = {
    method: "POST",
    auth: `anystring:${process.env.API_KEY}`,
  };

  const url = `https://${process.env.SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${process.env.LIST_ID}`;
  const jsonData = JSON.stringify(data);

  const request = https.request(url, options, (response) => {
    if (response.statusCode === 200) {
      response.on("data", (data) => {
        const result = JSON.parse(data);
        console.log(result);
        res.sendFile(path.join(__dirname, "success.html")); // Send success response
      });
    } else {
      response.on("data", (data) => {
        const result = JSON.parse(data);
        console.log(result);
        res.sendFile(path.join(__dirname, "failure.html")); // Send failure response
      });
    }
  });
  request.write(jsonData); // to Mailchimp API
  request.end(); // close the request
});

app.post("/failure", (req, res) => {
  res.redirect("/"); // Redirect to the sign-up page on failure
});

app.post("/success", (req, res) => {
  res.redirect("/"); // Redirect to the sign-up page on success
});
