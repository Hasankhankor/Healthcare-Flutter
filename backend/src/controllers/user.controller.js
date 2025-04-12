const User = require('../models/user.model');

exports.updateProfile = async (req, res) => {
  try {
    // Fields that users can update
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      profileImage: req.body.profileImage
    };

    // Add doctor-specific fields if user is a doctor
    if (req.user.role === 'doctor') {
      fieldsToUpdate.specialization = req.body.specialization;
      fieldsToUpdate.experience = req.body.experience;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: fieldsToUpdate },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getDoctors = async (req, res) => {
  try {
    const filters = { role: 'doctor' };

    // Add specialization filter if provided
    if (req.query.specialization) {
      filters.specialization = req.query.specialization;
    }

    const doctors = await User.find(filters)
      .select('-password')
      .sort({ experience: -1 });

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDoctor = async (req, res) => {
  try {
    const doctor = await User.findOne({
      _id: req.params.id,
      role: 'doctor'
    }).select('-password');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.searchDoctors = async (req, res) => {
  try {
    const searchQuery = req.query.q;
    if (!searchQuery) {
      return res.status(400).json({ message: 'Please provide a search query' });
    }

    const doctors = await User.find({
      role: 'doctor',
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { specialization: { $regex: searchQuery, $options: 'i' } }
      ]
    }).select('-password');

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};