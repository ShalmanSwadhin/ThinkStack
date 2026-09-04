/**
 * Standard API success response
 * @param {import('express').Response} res
 * @param {*} data
 * @param {string} [message]
 * @param {number} [statusCode]
 * @param {object} [meta]
 */
export const sendSuccess = (res, data, message = 'Success', statusCode = 200, meta = null) => {
  const response = {
    success: true,
    message,
    data,
  };
  if (meta) {
    response.meta = meta;
  }
  return res.status(statusCode).json(response);
};

/**
 * Standard API error response
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} [statusCode]
 * @param {object} [details]
 */
export const sendError = (res, message, statusCode = 500, details = null) => {
  const response = {
    success: false,
    error: {
      message,
      ...(details && { details }),
    },
  };
  return res.status(statusCode).json(response);
};

export const sendComingSoon = (res, service, message) =>
  res.status(200).json({
    success: false,
    comingSoon: true,
    service,
    message,
  });

export default { sendSuccess, sendError, sendComingSoon };
