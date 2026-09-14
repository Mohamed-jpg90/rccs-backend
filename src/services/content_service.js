const Content = require("../models/content_model");
const { ROLES, CONTENT_TYPE } = require("../config/constants");
const clubLeaderService = require("./club_leader_service");

const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)/i;
const DRIVE_REGEX = /^(https?:\/\/)?(www\.)?drive\.google\.com\//i;

const validateUrlMatchesType = (type, url) => {
  if (type === CONTENT_TYPE.YOUTUBE && !YOUTUBE_REGEX.test(url)) {
    const error = new Error("externalUrl must be a valid YouTube link");
    error.status = 400;
    throw error;
  }
  if (type === CONTENT_TYPE.DRIVE && !DRIVE_REGEX.test(url)) {
    const error = new Error("externalUrl must be a valid Google Drive link");
    error.status = 400;
    throw error;
  }
};

const createContent = async (data, creator) => {
  if (!data.externalUrl) {
    const error = new Error("externalUrl is required");
    error.status = 400;
    throw error;
  }

  if (!Object.values(CONTENT_TYPE).includes(data.type)) {
    const error = new Error(`type must be one of: ${Object.values(CONTENT_TYPE).join(", ")}`);
    error.status = 400;
    throw error;
  }

  validateUrlMatchesType(data.type, data.externalUrl);

  if (creator.role === ROLES.TEAM_LEADER) {
    if (!data.club) {
      const error = new Error("Team Leaders must specify a club they lead");
      error.status = 400;
      throw error;
    }
    const isLeader = await clubLeaderService.isLeaderOfClub(creator._id, data.club);
    if (!isLeader) {
      const error = new Error("You can only post content to a club you lead");
      error.status = 403;
      throw error;
    }
  }

  return Content.create({
    title: data.title,
    description: data.description,
    type: data.type,
    externalUrl: data.externalUrl,
    club: data.club || null,
    createdBy: creator._id,
  });
};

const getContent = async (requestingUser, { type, club, page = 1, limit = 20 }) => {
  const filter = {};
  if (type) filter.type = type;

  if (requestingUser.role === ROLES.ADMIN) {
    if (club) filter.club = club;
  } else if (requestingUser.role === ROLES.TEAM_LEADER) {
    if (club) {
      filter.club = club;
    } else {
      const ledClubs = await clubLeaderService.getClubsLedBy(requestingUser._id);
      const ledClubIds = ledClubs.map((c) => c._id);
      filter.$or = [{ club: null }, { club: { $in: ledClubIds } }];
    }
  } else {
    filter.$or = [{ club: null }, { club: requestingUser.club }];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [content, total] = await Promise.all([
    Content.find(filter).populate("club", "clubName").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Content.countDocuments(filter),
  ]);

  return { content, total, page: Number(page), limit: Number(limit) };
};

const updateContent = async (id, updates) => {
  const content = await Content.findById(id);
  if (!content) {
    const error = new Error("Content not found");
    error.status = 404;
    throw error;
  }

  const nextType = updates.type !== undefined ? updates.type : content.type;
  const nextUrl = updates.externalUrl !== undefined ? updates.externalUrl : content.externalUrl;

  if (updates.type !== undefined && !Object.values(CONTENT_TYPE).includes(updates.type)) {
    const error = new Error(`type must be one of: ${Object.values(CONTENT_TYPE).join(", ")}`);
    error.status = 400;
    throw error;
  }

  if (updates.type !== undefined || updates.externalUrl !== undefined) {
    validateUrlMatchesType(nextType, nextUrl);
  }

  const fields = ["title", "description", "type", "externalUrl", "club"];
  fields.forEach((field) => {
    if (updates[field] !== undefined) content[field] = updates[field];
  });

  await content.save();
  return content;
};

const deleteContent = async (id) => {
  const content = await Content.findByIdAndDelete(id);
  if (!content) {
    const error = new Error("Content not found");
    error.status = 404;
    throw error;
  }
  return content;
};

module.exports = { createContent, getContent, updateContent, deleteContent };