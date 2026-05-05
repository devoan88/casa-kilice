export const CREATOR_PLATFORMS = ["Instagram", "TikTok"] as const;
export type CreatorPlatform = (typeof CREATOR_PLATFORMS)[number];

export const CREATOR_COLLAB_STATUSES = ["Active", "Negotiating", "Completed", "Sent Product"] as const;
export type CreatorCollabStatus = (typeof CREATOR_COLLAB_STATUSES)[number];
