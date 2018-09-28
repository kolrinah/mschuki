// Health Module

exports.checkHealth = function () {
  console.log('Checking Health');
  return true;
};

exports.routeHandler = function (req, res) {
  res.status(200).json(exports.checkHealth());
};
