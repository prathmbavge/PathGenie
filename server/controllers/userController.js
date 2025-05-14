import Profile from '../models/Profile.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';


export default {
  updateProfle: asyncHandler(async (req, res) => {
       const { user } = req.session;
    console.log(user.profileId);
   console.log(req.body);
    // Update the profile with the new data
   const profile = await Profile.updateOne({ _id: user.profileId }, { $set: req.body });

    if (!profile) {
      throw new ApiError(404, 'Profile not found');
    }

    res.status(200).json(new ApiResponse(200, { profile }, 'Profile fetched successfully'));
  }),

  getProfile: asyncHandler(async (req, res) => {
    const { user } = req.session;
    console.log(user.profileId);
    const profile = await Profile.findOne({ _id: user.profileId });
    if (!profile) {
      throw new ApiError(404, 'Profile not found');
    }
    res.status(200).json(new ApiResponse(200, { profile }, 'Profile fetched successfully'));
  })

};

