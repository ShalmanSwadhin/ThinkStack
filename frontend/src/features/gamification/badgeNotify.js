let badgeListener = null;

export const setBadgeListener = (listener) => {
  badgeListener = listener;
};

export const notifyBadges = (badges) => {
  if (badgeListener && badges?.length > 0) {
    badgeListener(badges);
  }
};

export default notifyBadges;
