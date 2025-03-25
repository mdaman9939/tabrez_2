require("dotenv").config(); // Add this line at the top
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

// Middleware
// CORS setup to allow frontend requests
app.use(
  cors({
    origin: [
       "https://tabrez-2-admin.vercel.app",
      "https://tabrez-2-employee-from.vercel.app",
         "https://tabrez-admin.vercel.app",
      "https://tabrez-form.vercel.app",
     
    ], // Open to all origins (for dev). Change this to frontend URL in production.
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

const Observation = require("./models/Observation");
const authRoutes = require("./routes/authRoutes");
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
app.use(express.json()); // Middleware to parse JSON


app.use(bodyParser.json());

// Routes
app.use("/api/admin", authRoutes);

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Failed:", err));

// Routes
app.get("/", (req, res) => {
  res.json("Hello, Server is Ready!");
});

// POST API for Observations
app.post("/api/observations", async (req, res) => {
  try {
    const newObservation = new Observation(req.body);
    await newObservation.save();
    res
      .status(201)
      .json({ message: "Observation Created", observation: newObservation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get observation
app.get("/api/observations", async (req, res) => {
  try {
    const observations = await Observation.find();
    res.status(200).json({ observations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Get individual observation by ID
app.get("/api/observations/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const observation = await Observation.findById(id);
    if (!observation) {
      return res.status(404).json({ message: "Observation not found" });
    }
    res.status(200).json({ observation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Observation
app.put("/api/observations/:observationId", async (req, res) => {
  try {
    const { observationId } = req.params; // Get observation ID from URL
    const updateData = req.body; // Get updated data from request body

    // Find and update the observation
    const updatedObservation = await Observation.findByIdAndUpdate(
      observationId, // ID of the observation to update
      updateData, // New data to update
      { new: true } // Return the updated document
    );

    if (!updatedObservation) {
      return res.status(404).json({ message: "Observation not found" });
    }

    res.status(200).json({
      message: "Observation updated",
      observation: updatedObservation,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Observation
app.delete("/api/observations/:observationId", async (req, res) => {
  try {
    const { observationId } = req.params; // Get observation ID from URL

    // Validate the observationId
    if (!mongoose.Types.ObjectId.isValid(observationId)) {
      return res.status(400).json({ message: "Invalid observation ID" });
    }

    // Find and delete the observation
    const deletedObservation = await Observation.findByIdAndDelete(
      observationId
    );

    if (!deletedObservation) {
      return res.status(404).json({ message: "Observation not found" });
    }

    res.status(200).json({
      message: "Observation deleted",
      observation: deletedObservation,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
