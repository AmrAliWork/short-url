const URLModel = require("../Models/urlModel");
const AppError = require("../utils/AppError");
const { authorized } = require("../middlewares/authorizationMiddleware");
const catchAsync = require("../utils/catchAsync");
const createShortCode = require("../utils/createShortCode");
exports.getMainUrl = catchAsync(async (req, res, next) => {
  const url = await URLModel.findOne({ shortCode: req.params.shortcode });

  if (!url) {
    return next(new AppError("This short URL not exist ", 404));
  }

  if (!authorized(url.user, req.user._id)) {
    return next(new AppError("You don't have a permission", 403));
  }

  res.status(200).json({
    status: "success",
    data: url,
  });
});

exports.createUrl = catchAsync(async (req, res, next) => {
  let url = "";
  try {
    url = new URL(req.body.mainURL);
  } catch (err) {
    return next(new AppError("Please enter a valid main URL", 400));
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return next(new AppError("Please enter a valid main URL", 400));
  }

  const shortUrlData = {
    user: req.user._id,
    mainURL: req.body.mainURL,
    shortCode: createShortCode(),
  };
  while (true) {
    try {
      await URLModel.create(shortUrlData);
      break;
    } catch (err) {
      if (err.code === 11000 || err.cause?.code === 11000)
        shortUrlData.shortCode = createShortCode();
      else {
        throw err;
      }
    }
  }

  const shortURL = `http://localhost:3000/open/${shortUrlData.shortCode}`;
  res.status(201).json({
    status: "success",
    data: {
      shortURL,
      mainURL: req.body.mainURL,
    },
  });
});

exports.openUrl = catchAsync(async (req, res, next) => {
  const url = await URLModel.findOneAndUpdate(
    { shortCode: req.params.shortcode },
    { $inc: { clickCount: 1 } },
  );
  if (!url) {
    return next(new AppError("URL is not exist", 404));
  }
  res.redirect(url.mainURL);
});
exports.getAllUrl = catchAsync(async (req, res, next) => {
  let { page, limit } = req.query;

  if (!page) page = 1;
  if (!limit) limit = 20;

  page *= 1;
  limit *= 1;
  if (!Number.isInteger(page) || !Number.isInteger(limit)) {
    return next(new AppError("Page and limit must be positive number", 400));
  }

  if (limit > 100 || limit < 1) {
    return next(
      new AppError("Limit must be less than 100 and more than 0", 400),
    );
  } else if (page < 1) {
    return next(new AppError("Page must be more than 0", 400));
  }
  const skip = (page - 1) * limit;

  const urls = await URLModel.find({ user: req.user._id })
    .skip(skip)
    .limit(limit);
  res.status(200).json({
    status: "success",
    length: urls.length,
    data: urls,
  });
});
exports.updateMainUrl = catchAsync(async (req, res, next) => {
  let mainUrl;
  try {
    mainUrl = new URL(req.body.mainURL);
  } catch (err) {
    return next(new AppError("Please enter a valid main URL", 400));
  }
  if (mainUrl.protocol !== "https:" && mainUrl.protocol !== "http:") {
    return next(new AppError("Please enter a valid main URL", 400));
  }

  const shortUrl = await URLModel.findOne({
    shortCode: req.params.shortcode,
  });

  if (!shortUrl) {
    return next(new AppError("This short URL does not exist", 404));
  }
  if (!authorized(req.user._id, shortUrl.user)) {
    return next(new AppError("You don't have permission", 403));
  }

  shortUrl.mainURL = req.body.mainURL;
  await shortUrl.save();
  res.status(200).json({
    status: "success",
    data: shortUrl,
  });
});
exports.deleteUrl = catchAsync(async (req, res, next) => {
  const shortUrl = await URLModel.findOne({
    shortCode: req.params.shortcode,
  });
  if (!shortUrl) {
    return next(new AppError("This short URL does not exist", 404));
  }
  if (!authorized(req.user._id, shortUrl.user)) {
    return next(new AppError("You don't have permission", 403));
  }

  await shortUrl.deleteOne();

  res.status(200).json({
    status: "success",
  });
});
exports.getUrlStat = catchAsync(async (req, res, next) => {
  const shortUrl = await URLModel.findOne({
    shortCode: req.params.shortcode,
  });
  if (!shortUrl) {
    return next(new AppError("This short URL does not exist", 404));
  }
  if (!authorized(req.user._id, shortUrl.user)) {
    return next(new AppError("You don't have permission", 403));
  }

  res.status(200).json({
    status: "success",
    data: {
      clickCount: shortUrl.clickCount,
    },
  });
});
