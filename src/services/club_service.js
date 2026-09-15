const Club = require("../models/club_model");

const createClub = async (data, uploadedFile) => {
  return Club.create({
    clubName: data.clubName,
    description: data.description,
    maxMembers: data.maxMembers,
    coverImage: uploadedFile ? uploadedFile.path : null,
  });
};

const getClubs = async ({ search, page = 1, limit = 20 }) => {
  const filter = {};
  if (search) filter.clubName = { $regex: search, $options: "i" };

  const skip = (Number(page) - 1) * Number(limit);
  const [clubs, total] = await Promise.all([
    Club.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Club.countDocuments(filter),
  ]);

  return { clubs, total, page: Number(page), limit: Number(limit) };
};

const getClubById = async (id) => Club.findById(id);

const updateClub = async (id, updates, uploadedFile) => {
  const club = await Club.findById(id);
  if (!club) {
    const error = new Error("Club not found");
    error.status = 404;
    throw error;
  }

  if (updates.clubName !== undefined) club.clubName = updates.clubName;
  if (updates.description !== undefined) club.description = updates.description;
  if (updates.maxMembers !== undefined) club.maxMembers = updates.maxMembers;
if (uploadedFile) club.coverImage = uploadedFile.path;
  await club.save();
  return club;
};

const deleteClub = async (id) => {
  const club = await Club.findByIdAndDelete(id);
  if (!club) {
    const error = new Error("Club not found");
    error.status = 404;
    throw error;
  }
  return club;
};

const getClubOverview = async (clubId) => {
  const Event = require("./../models/event_model");
  const User = require("./../models/user_model");
  const Content = require("./../models/content_model");
  const clubLeaderService = require("./club_leader_service");
  const { ROLES } = require("../config/constants");

  const club = await Club.findById(clubId);
  if (!club) {
    const error = new Error("Club not found");
    error.status = 404;
    throw error;
  }

  const [events, members, teamLeaders, content] = await Promise.all([
    Event.find({ club: clubId }).sort({ date: -1 }),
    User.find({ club: clubId, role: ROLES.USER }).select("fullName email phoneNumber profileImage totalPoints"),
    clubLeaderService.getClubLeaders(clubId),
    Content.find({ club: clubId }).sort({ createdAt: -1 }),
  ]);

  return { club, events, members, teamLeaders, content };
};


module.exports = { createClub, getClubs, getClubById, updateClub, deleteClub, getClubOverview };