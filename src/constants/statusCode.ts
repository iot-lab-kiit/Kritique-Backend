// Success codes
export const SUCCESSFUL = { CODE: 200, MESSAGE: "Successful" };
export const CREATED = { CODE: 201, MESSAGE: "Created" };
export const DELETED = { CODE: 202, MESSAGE: "Deleted" };
export const UPDATED = { CODE: 203, MESSAGE: "Updated" };

// Data not found codes
export const USER_NOT_FOUND = { CODE: 204, MESSAGE: "User not found" };

export const REVIEW_NOT_FOUND = {
  CODE: 205,
  MESSAGE: "Reviews were not found for current faculty.",
};

export const FACULTY_NOT_FOUND = {
  CODE: 206,
  MESSAGE: "The faculty was not found.",
};

export const ALREADY_REVIEWED = {
  CODE: 207,
  MESSAGE:
    "You have already reviewed this faculty.\nYou can update your review by going to the review section.",
};

export const EMAIL_NOT_ALLOWED = {
  CODE: 208,
  MESSAGE:
    "Invalid email id, Login with personal email id is not permitted.\nLogin with your @kiit email id to gain access.",
};

export const PROFANITY_DETECTED = {
  CODE: 209,
  MESSAGE: "We don't encourage users in using abusive language.",
};

// Crucial Error Codes.
export const INVALID_REQUEST = {
  CODE: 400,
  MESSAGE: "The api request is invalid and cannot be processed.",
};

export const TOKEN_REQUIRED = {
  CODE: 401,
  MESSAGE:
    "Token missing! Try restarting the app.\nIf the problem persists, contact the developers at iot.lab@kiit.ac.in",
};

export const INVALID_TOKEN = {
  CODE: 402,
  MESSAGE:
    "Token invalid ! Restart the app, clear data and try again.\nIf the problem persists, contact the developers at iot.lab@kiit.ac.in",
};

export const UNAUTHORIZED = {
  CODE: 403,
  MESSAGE:
    "User not authorized. Try restarting the app.\nIf the problem persists, contact the developers at iot.lab@kiit.ac.in",
};

export const INTERNAL_SERVER_ERROR = {
  CODE: 404,
  MESSAGE:
    "Internal server error.\nContact the developer at iot.lab@kiit.ac.in",
};

export const VERSION_MISMATCH = {
  CODE: 405,
  MESSAGE: "New Update Found! Please update the app.",
};
