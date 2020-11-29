export const MAX_ZOOM = 4;
export const MIN_ZOOM = 0.7;
export const STEP_FACTOR = .99;

export const CANVAS_WIDTH_LIMIT = 4000;
export const CANVAS_HEIGHT_LIMIT = 3000;

export const FONTSIZE = 12;
export const MIN_FONTSIZE = 4;
export const TEXT_PADDING = 10;
export const MIN_TEXT_PADDING = 4;

export const RECT_SIZE = 12;
export const MIN_RECT_SIZE = 4;

export const LINK_WIDTH = 0.3;

export const DATABASE_NAME = "echoes_atlas_map_db";
export const DATABASE_VERSION_STORAGE_KEY = "atlas_db_version";
// lastDatabaseVersion controls the data version. When increased, all clients
// will try to re-fetch the data. Use with caution as this will consume server
// bandwidth
export const lastDatabaseVersion = 2;

export const MapType = {
  UNIVERSE: "universe",
  REGION: "region",
  SYSTEM: "system",
}

export const REPORT_REGION_MIN_RADIUS = 15;
export const REPORT_REGION_MAX_RADIUS = 60;
export const REPORT_SYSTEM_MIN_RADIUS = 10;
export const REPORT_SYSTEM_MAX_RADIUS = 40;

export const OG_GROUP_TOP = -35.35533905932738;
export const OG_GROUP_LEFT = -35.35533905932738;