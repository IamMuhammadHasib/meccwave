const { FriendRequest } = require("../../models/FriendRequest");

const getFriendshipStatus = async (loggedInUserId, otherUserId) => {
  if (loggedInUserId === otherUserId) return "self";

  const friendRequest = await FriendRequest.findOne({
    $or: [
      { requesterId: loggedInUserId, recipientId: otherUserId },
      { requesterId: otherUserId, recipientId: loggedInUserId },
    ],
  });

  if (!friendRequest) return "none";

  if (friendRequest.status === "accepted") {
    return "friend";
  } else if (friendRequest.status === "pending") {
    if (friendRequest.requesterId.toString() === loggedInUserId.toString()) {
      return "requested";
    } else {
      return "pending";
    }
  }
};

module.exports = getFriendshipStatus;
