export const LIMITS = {
  maxVideoDurationSeconds: Number(process.env.MAX_VIDEO_DURATION_SECONDS) || 30 * 60,
  maxVideosPerDay: Number(process.env.MAX_VIDEOS_PER_DAY) || 5,
};
