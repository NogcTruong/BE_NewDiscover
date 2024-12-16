const express = require("express");
const router = express.Router();
const Destination = require('../models/Destination');

const destinationController = require("../Controllers/DestinationController");

router.get("/", destinationController.listDestinationByType);
router.get('/:id', async (req, res) => {
    try {
      const destination = await Destination.findById(req.params.id);
      if (!destination) {
        return res.status(404).json({ message: 'Destination not found' });
      }
      res.status(200).json(destination);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching destination details', error });                                                                                                                                                                                                          
    }
  });
// router.get("/categories", destinationController.getCategories);
// router.get("/addresses", destinationController.getAddresses);

module.exports = router;
