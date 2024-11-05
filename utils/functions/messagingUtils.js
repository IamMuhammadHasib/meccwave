const getRoomId = (u1, u2) => {
  return [u1, u2].sort().join("-");
};

module.exports = getRoomId;
