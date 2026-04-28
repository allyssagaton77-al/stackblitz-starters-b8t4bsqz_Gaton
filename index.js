const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// =====================
// MIDDLEWARE
// =====================
app.use(express.json());
app.use(cors());

// serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;

// =====================
// DATA
// =====================
let drivers = [
  { 
    id: 1, 
    driverName: "Juan Dela Cruz",
    vehicle: "Motorcycle",
    plateNumber: "ABC-123", 
    status: "available", 
    rating: 4.8 
  },
  { 
    id: 2,
    driverName: "Maria Santos",
    vehicle: "Car", 
    plateNumber: "XYZ-456", 
    status: "busy",
    rating: 4.9 
  },
  { 
    id: 3, 
    driverName: "Carlos Reyes", 
    vehicle: "Motorcycle",
    plateNumber: "LMN-789", 
    status: "available",
    rating: 4.6 
  }
];

let rides = [];

const getNextId = (arr) => arr.length ? Math.max(...arr.map(i => i.id)) + 1 : 1;

// =====================
// FRONTEND ROUTE
// =====================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// =====================
// DRIVERS
// =====================
app.get("/drivers", (req, res) => res.json(drivers));

app.get("/drivers/:id", (req, res) => {
  const driver = drivers.find(d => d.id === Number(req.params.id));
  if (!driver) return res.status(404).json({ message: "Driver not found" });
  res.json(driver);
});

app.post("/drivers", (req, res) => {
  const { driverName, vehicle, plateNumber } = req.body;

  if (!driverName || !vehicle) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const newDriver = {
    id: getNextId(drivers),
    driverName,
    vehicle,
    plateNumber,
    status: "available",
    rating: 5
  };

  drivers.push(newDriver);
  res.status(201).json(newDriver);
});

app.put("/drivers/:id", (req, res) => {
  const driver = drivers.find(d => d.id === Number(req.params.id));
  if (!driver) return res.status(404).json({ message: "Driver not found" });

  Object.assign(driver, req.body);
  res.json(driver);
});

app.delete("/drivers/:id", (req, res) => {
  const index = drivers.findIndex(d => d.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ message: "Driver not found" });

  drivers.splice(index, 1);
  res.json({ message: "Driver deleted" });
});

// =====================
// RIDES
// =====================
app.get("/rides", (req, res) => res.json(rides));

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

app.put("/rides/:id", (req, res) => {
  const ride = rides.find(r => r.id === Number(req.params.id));
  if (!ride) return res.status(404).json({ message: "Ride not found" });

  const { status } = req.body;

  if (!["ongoing", "completed", "cancelled"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  ride.status = status;

  if (status === "completed" || status === "cancelled") {
    const driver = drivers.find(d => d.id === ride.driverId);
    if (driver) driver.status = "available";
  }

  res.json(ride);
});

app.delete("/rides/:id", (req, res) => {
  const index = rides.findIndex(r => r.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ message: "Ride not found" });

  const ride = rides[index];
  const driver = drivers.find(d => d.id === ride.driverId);
  if (driver) driver.status = "available";

  rides.splice(index, 1);
  res.json({ message: "Ride cancelled" });
});

// =====================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});