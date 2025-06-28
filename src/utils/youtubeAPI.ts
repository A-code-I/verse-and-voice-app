
export const getYouTubeVideoId = (url: string): string | null => {
  if (!url || typeof url !== 'string') return null;
  
  // Handle various YouTube URL formats including live streams
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
    /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
    /(?:youtube\.com\/v\/)([^&\n?#]+)/,
    /(?:youtu\.be\/)([^&\n?#]+)/,
    /(?:youtube\.com\/.*[?&]v=)([^&\n?#]+)/,
    /(?:youtube\.com\/live\/)([^&\n?#]+)/  // Added support for live streams
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1] && match[1].length === 11) {
      return match[1];
    }
  }
  
  // If it looks like a video ID itself (11 characters)
  if (url.length === 11 && /^[a-zA-Z0-9_-]+$/.test(url)) {
    return url;
  }
  
  return null;
};

export const formatTime = (time: number): string => {
  if (!time || isNaN(time)) return '0:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
