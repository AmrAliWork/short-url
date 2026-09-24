exports.authorized = (currentUserId, URLOwnerId) => {
  if (!currentUserId || !URLOwnerId) return false;
  return currentUserId.toString() === URLOwnerId.toString();
};
