require("dotenv").config();

const express = require("express");
const app = express();
const uuid = require("uuid");
const QRCode = require("qrcode");
const Joi = require("joi");

const mongoose = require("mongoose");
const User = require("./model");
const fs = require("fs");
const path = require("path");
const { propagateData } = require("./helper");
const req = require("express/lib/request");
const { updateOne, update } = require("./model");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Active");
});

/**
 *
 * @param  firstName - The first name sent from the client
 * @param lastName - The last name sent from the client
 * This function returns a propagated object
 * @returns
 */

mongoose
  .connect("mongodb://127.0.0.1:27017/onlineshop", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((res2) => console.log("Connected successfully"));

app.post("/qrcode/image", async (req, res) => {
  const schema = Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
  });

  await schema
    .validateAsync(req.body)
    .then(() => {
      // Request body validation

      const { firstName, lastName } = req.body;
      console.log(req.body.firstName);
      let dataObject = propagateData(firstName, lastName);

      // Wrapping up the returned data object as a string
      let data = `id: ${dataObject.id}, firstName: ${dataObject.firstName}, 
        lastName: ${dataObject.lastName}, dateCreated: ${dataObject.dateCreated}, 
        registrationUrl: ${dataObject.registrationUrl}`;

      // Create a base64 image and sends it to the client
      QRCode.toDataURL(JSON.stringify(data), function (error, data) {
        let base64Image = data.replace(/^data:image\/png;base64,/, "");
        let image = Buffer.from(base64Image, "base64");
        res.writeHead(200, {
          "Content-Type": "image/png",
          "Content-Length": image.length,
        });
        res.end(image);
      });

      //save to database

      const test = new User({
        firstname: req.body.firstName,
        lastname: req.body.lastName,
        dateCreated: new Date(),
        registrationUrl: "Heloo/jsjs",
        image: {
          data: "",
          contentType: "",
        },
      });
      // let filepath = `uploads/${test.firstname}.png`;

      // QRCode.toFile(filepath, [
      //   {
      //     data: test,
      //   },
      // ]);
      data
        .save()
        .then((s) => console.log("Succes"))
        .catch((err) => console.log(err));
    })
    .catch((err) => {
      res.send(err.details);
    });
});
// to delete

app.delete("/del-user", async (req, res) => {
  const id = req.body.id;
  console.log(id);

  await User.findByIdAndDelete(id)
    .then((result) => {
      res.send(`deleted id ${id} successfully`);
    })
    .then((okay) => console.log("Okayyyy"))
    .catch((err) => {
      console.log(err);
    });
});

//filter user
app.get("/users", (req, res) => {
  const id = req.body.id;
  console.log(id);
  User.findById(id)
    .then((result) => {
      res.send(result);
      //console.log(result)
      // console.log("connected")
    })
    .catch((err) => {
      console.log(err);
    });
});

//update
app.put("/update-user", (req, res) => {
  const { id, firstname, lastname, registrationUrl } = req.body;

  User.findByIdAndUpdate(id, {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    registrationUrl: req.body.registrationUrl,
  })
    .then((oo) => {
      console.log("oakyy");
    })
    .then((su) => res.send("Success"))
    .catch((err) => console.log(err));
});

///get all users
app.get("/all-users", (req, res) => {
  User.find()
    .sort({ updatedAt: -1 })
    .then((result) => res.send(result))
    .catch((err) => console.log(err));
});

// search user

app.post("/search", (req, res) => {
  const { firstname, lastname }= req.query

  User.findOne( { firstname: req.query.firstname, lastname: req.query.lastname})
    .then((suc) => res.send(suc))

    .catch((err) => res.send(err.details));
});

/**
 *
 * @param  firstName - The first name sent from the client
 * @param lastName - The last name sent from the client
 * This function returns a propagated object
 * @returns
 */
app.post("/qrcode/link", async (req, res) => {
  const { firstName, lastName } = req.body;
  let data = await propagateData(firstName, lastName);

  let filePath = `uploads/${data.id}.png`;

  QRCode.toFile(filePath, [
    {
      data: JSON.stringify(data),
    },
  ]);

  let imagePath = `${process.env.HOST}/uploads/${filePath}`;
  res.send(imagePath);
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Our app is litening on port ${PORT}`);
});
