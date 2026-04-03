const crypto = require('crypto');

const generateTeamCode = () => {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
};

module.exports = generateTeamCode;
