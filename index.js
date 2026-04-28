const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;

// =====================
// DATA
// =====================
let drivers = [
  { id: 1, driverName: "Julius Batumbakal", vehicle: "Motorcycle", status: "available" },
  { id: 2, driverName: "Jan Panget", vehicle: "Car", status: "busy" },
  { id: 3, driverName: "Arnold Ong", vehicle: "Motorcycle", status: "available" }
];

let rides = [];

const getNextId = (arr) =>
  arr.length ? Math.max(...arr.map(i => i.id)) + 1 : 1;

// =====================
// FRONTEND
// =====================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// =====================
// DRIVERS
// =====================
app.get("/drivers", (req, res) => {
  res.json(drivers);
});

app.post("/drivers", (req, res) => {
  const { driverName, vehicle } = req.body;

  if (!driverName || !vehicle) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const newDriver = {
    id: getNextId(drivers),
    driverName,
    vehicle,
    status: "available"
  };

  drivers.push(newDriver);
  res.status(201).json(newDriver);
});

// ✅ DELETE DRIVER (ADDED)
app.delete("/drivers/:id", (req, res) => {
  const index = drivers.findIndex(d => d.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({ message: "Driver not found" });
  }

  drivers.splice(index, 1);
  res.json({ message: "Driver deleted" });
});

// =====================
// RIDES
// =====================
app.get("/rides", (req, res) => {
  res.json(rides);
});

app.post("/rides", (req, res) => {
  const { riderName, pickup, dropoff, driverId } = req.body;

  if (!riderName || !pickup || !dropoff || !driverId) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const driver = drivers.find(
    d => d.id === Number(driverId) && d.status === "available"
  );

  if (!driver) {
    return res.status(400).json({ message: "Driver not available" });
  }

  const newRide = {
    id: getNextId(rides),
    riderName,
    pickup,
    dropoff,
    driverId: Number(driverId),
    status: "ongoing"
  };

  driver.status = "busy";
  rides.push(newRide);

  res.status(201).json(newRide);
});

// =====================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});