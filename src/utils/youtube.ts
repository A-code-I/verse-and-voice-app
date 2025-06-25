
export const getYouTubeVideoId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export const createEmbedUrl = (videoId: string) => {
  return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}`;
};
