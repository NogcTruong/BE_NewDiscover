const UserRequire = require("../models/userRequireModel");
const Destination = require("../models/Destination");
const mongoose = require("mongoose");
const CreateSchedule = require("../models/CreateSchedule");

const PlanController = {
  async createPlan(req, res) {
    try {
      const userRequireId = req.params.id;
      let selectedDestinationIds = new Set();

      if (!userRequireId) {
        return res.status(400).json({
          type: "error",
          message: "UserRequire ID is required",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(userRequireId)) {
        return res.status(400).json({
          type: "error",
          message: "Invalid UserRequire ID format",
        });
      }

      const userRequire = await UserRequire.findById(userRequireId).populate(
        "userId"
      );

      if (!userRequire) {
        return res.status(404).json({
          type: "error",
          message: "UserRequire not found",
        });
      }

      const { totalDay, budget, category, location, quantity } = userRequire;
      const categories = category;

      const totalNeededDestinations = totalDay * categories.length;

      for (const category of categories) {
        const destinationCount = await Destination.find({
          category,
          location: { $regex: location, $options: "i" },
        }).countDocuments();

        if (destinationCount < totalDay) {
          return res.status(400).json({
            type: "error",
            message: "Not enough unique destinations",
            details: {
              category,
              availableDestinations: destinationCount,
              requiredDestinations: totalDay,
              totalNeededDestinations,
              message: `Need ${totalDay} destinations for category "${category}" but only found ${destinationCount}`,
            },
          });
        }
      }

      let selectedTrips = [];
      let totalCost = 0;

      for (let day = 0; day < totalDay; day++) {
        for (let timeSlot = 0; timeSlot < categories.length; timeSlot++) {
          const category = categories[timeSlot];
          const destinations = await Destination.find({
            category,
            location: { $regex: location, $options: "i" },
          });

          if (destinations.length === 0) {
            return res.status(404).json({
              message: `No destinations found for the category: ${category}`,
            });
          }

          const ratingRanges = getRatingRanges(destinations);
          const result = getDestinationByRating(
            ratingRanges,
            budget,
            quantity,
            totalCost,
            selectedDestinationIds
          );

          if (result.error) {
            return res.status(400).json({
              type: "error",
              message:
                result.message ||
                (result.error === "budget_exceeded"
                  ? `Not enough budget for any of the ${result.triedDestinations} available destinations`
                  : "No available destinations found"),
              currentTotalCost: totalCost,
              budget: budget,
              maxAffordablePrice: (budget + 1000 - totalCost) / quantity,
              quantity: quantity,
              availableDestinations: result.triedDestinations || 0,
            });
          }

          selectedDestinationIds.add(result.destination._id.toString());

          selectedTrips.push({
            ...result.destination.toObject(),
            totalTripCost: result.tripCost,
            quantity: quantity,
            ratingRange: result.selectedRange,
          });
          totalCost += result.tripCost;
        }
      }

      res.status(200).json({
        type: "success",
        totalCost,
        quantity,
        selectedTrips,
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "An error occurred while creating the plan.",
        error: error.message,
      });
    }
  },

  async saveSchedule(req, res) {
    try {
      const { userId, userRequireId, totalCost, quantity, selectedTrips } =
        req.body;

      // Validate input
      if (!userId || !userRequireId || !Array.isArray(selectedTrips)) {
        return res.status(400).json({
          type: "error",
          message: "Missing required fields",
        });
      }

      // Format selectedTrips
      const formattedTrips = selectedTrips.map((trip, index) => ({
        name: trip.name || "",
        category: trip.category || "",
        price: trip.price || 0,
        description: trip.description || "",
        place: trip.place || "",
        rating: trip.rating || 0,
        location: trip.location || "",
        open_hours: trip.open_hours || "",
        close_hours: trip.close_hours || "",
        transportation: trip.transportation || "",
        image_url: Array.isArray(trip.image_url) ? trip.image_url : [],
        distance: trip.distance || "",
        service: trip.service || "",
        type: trip.type || "",
        totalTripCost: trip.totalTripCost || 0,
        quantity: trip.quantity || 0,
        ratingRange: trip.ratingRange || "",
        dayNumber: Math.floor(index / 3) + 1, // Giả sử mỗi ngày có 3 hoạt động
        timeSlot: (index % 3) + 1,
      }));

      // Create new schedule
      const schedule = await CreateSchedule.create({
        userId,
        userRequireId,
        totalCost,
        quantity,
        selectedTrips: formattedTrips,
      });

      return res.status(200).json({
        type: "success",
        data: {
          scheduleId: schedule._id,
          message: "Schedule saved successfully",
        },
      });
    } catch (error) {
      console.error("Save schedule error:", error);
      return res.status(500).json({
        type: "error",
        message: "Failed to save schedule",
        error: error.message,
      });
    }
  },
};

const getRatingRanges = (destinations) => {
  const ratingRanges = {
    "5.0-4.5": [],
    "4.5-4.0": [],
    "4.0-3.5": [],
    "3.5-3.0": [],
    "3.0-2.5": [],
    "2.5-2.0": [],
    "2.0-1.5": [],
    "1.5-1.0": [],
    "1.0-0.5": [],
    "0.5-0.0": [],
  };

  destinations.forEach((destination) => {
    const rating = destination.rating;
    if (rating >= 4.5) ratingRanges["5.0-4.5"].push(destination);
    else if (rating >= 4.0) ratingRanges["4.5-4.0"].push(destination);
    else if (rating >= 3.5) ratingRanges["4.0-3.5"].push(destination);
    else if (rating >= 3.0) ratingRanges["3.5-3.0"].push(destination);
    else if (rating >= 2.5) ratingRanges["3.0-2.5"].push(destination);
    else if (rating >= 2.0) ratingRanges["2.5-2.0"].push(destination);
    else if (rating >= 1.5) ratingRanges["2.0-1.5"].push(destination);
    else if (rating >= 1.0) ratingRanges["1.5-1.0"].push(destination);
    else if (rating >= 0.5) ratingRanges["1.0-0.5"].push(destination);
    else ratingRanges["0.5-0.0"].push(destination);
  });

  return ratingRanges;
};

const getDestinationByRating = (
  ratingRanges,
  budget,
  quantity,
  totalCost,
  selectedDestinationIds
) => {
  const ranges = [
    "5.0-4.5",
    "4.5-4.0",
    "4.0-3.5",
    "3.5-3.0",
    "3.0-2.5",
    "2.5-2.0",
    "2.0-1.5",
    "1.5-1.0",
    "1.0-0.5",
    "0.5-0.0",
  ];

  let availableDestinations = [];
  let budgetExceededCount = 0;

  for (const range of ranges) {
    const destinations = ratingRanges[range];

    destinations.forEach((dest) => {
      const tripCost = dest.price * quantity;

      if (!selectedDestinationIds.has(dest._id.toString())) {
        if (totalCost + tripCost <= budget + 1000) {
          availableDestinations.push({
            destination: dest,
            range: range,
            tripCost: tripCost,
          });
        } else {
          budgetExceededCount++;
        }
      } else {
      }
    });
  }

  if (availableDestinations.length > 0) {
    availableDestinations.sort((a, b) => {
      const rangeIndexA = ranges.indexOf(a.range);
      const rangeIndexB = ranges.indexOf(b.range);
      return rangeIndexA - rangeIndexB;
    });

    const highestRange = availableDestinations[0].range;

    const bestDestinations = availableDestinations.filter(
      (item) => item.range === highestRange
    );

    const randomIndex = Math.floor(Math.random() * bestDestinations.length);
    const selected = bestDestinations[randomIndex];

    return {
      destination: selected.destination,
      tripCost: selected.tripCost,
      selectedRange: selected.range,
    };
  }
  if (budgetExceededCount === 0) {
    return {
      error: "no_destinations",
      message: "No destinations available for selection",
    };
  }

  return {
    error: "budget_exceeded",
    triedDestinations: budgetExceededCount,
    message: `Found ${budgetExceededCount} destinations but all exceed budget`,
  };
};

module.exports = PlanController;
