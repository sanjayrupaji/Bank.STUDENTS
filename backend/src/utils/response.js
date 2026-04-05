function sendSuccess(res, data = null, message = "OK", status = 200) {
  return res.status(status).json({ success: true, message, data });
}

function sendFail(res, status, message, data = null) {
  return res.status(status).json({ success: false, message, data });
}

module.exports = { sendSuccess, sendFail };
