/**
 * Copy Link to Clipboard
 */
export const copyLink = async (url) => {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch (err) {
    console.error("Failed to copy", err);
    return false;
  }
};

/**
 * Social Share Redirects
 */
export const shareToSocial = (platform, title, url) => {
  let shareUrl = "";
  const text = encodeURIComponent(title);
  const link = encodeURIComponent(url);

  switch (platform) {
    case "whatsapp":
      shareUrl = `https://wa.me/?text=${text}%20${link}`;
      break;
    case "facebook":
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${link}`;
      break;
    case "twitter":
      shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${link}`;
      break;
    case "linkedin":
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${link}`;
      break;
    default:
      return;
  }

  window.open(shareUrl, "_blank", "noopener,noreferrer");
};
