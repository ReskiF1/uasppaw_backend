const express = require(`express`);
const cors = require(`cors`);
const mongoose = require(`mongoose`);

const app = express();
app.use(cors());
app.use(express.json());

require("dotenv").config();

const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI;

const schemaData = mongoose.Schema(
  {
    nim: String,
    name: String,
    gender: {
      type: String,
      enum: ["Laki-laki", "Perempuan"],
    },
    tgl: Date,
    religi: {
      type: String,
      enum: ["Islam", "Protestan", "Katolik", "Hindu", "Buddha", "Konghucu"],
    },
    mobile: String,
    email: String,
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.model("user", schemaData);

app.get("/", async (req, res) => {
  const data = await userModel.find({});
  res.json({ success: true, data: data });
});

app.post("/create", async (req, res) => {
  console.log(req.body);
  const data = new userModel(req.body);
  await data.save();
  res.send({ success: true, message: "data save successfully", data: data });
});

app.put("/update", async (req, res) => {
  console.log(req.body);
  const { _id, ...rest } = req.body;

  console.log(rest);
  const data = await userModel.updateOne({ _id: _id }, rest);
  res.send({ success: true, message: "data update successfully", data: data });
});

app.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;
  console.log(id);
  const data = await userModel.deleteOne({ _id: id });
  res.send({ success: true, message: "data delete successfully", data: data });
});

app.post("/checkNIMUnique", async (req, res) => {
  const { nim } = req.body;

  try {
    const existingUser = await userModel.findOne({ nim });

    if (existingUser) {
      res.json({ unique: false });
    } else {
      res.json({ unique: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("connect to DB");
    app.listen(PORT, () => console.log("Server is running"));
  })
  .catch((err) => console.log(err));
