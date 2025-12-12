export const BOARD_TEMPLATE_TYPES = {
  COLOR: "color",
  IMAGE: "image",
  CUSTOM: "custom",
};

export const DEFAULT_BOARD_TEMPLATE = {
  type: BOARD_TEMPLATE_TYPES.COLOR,
  value: "#1976d2",
};

export const DEFAULT_BOARD_COLORS = [
  "#1976d2",
  "#0c66e4",
  "#d35400",
  "#0f766e",
  "#6d28d9",
  "#f97316",
  "#1f2a44",
  "#16a34a",
  "#dc2626",
];

const BACKGROUND_IMAGE_MODULES = import.meta.glob(
  "../assets/backgrounds/bg-*.{jpg,jpeg,png}",
  {
    eager: true,
    import: "default",
  }
);

const extractBgIndex = (path) => {
  const match = path.match(/bg-(\d+)/i);
  return match ? Number(match[1]) : 0;
};

export const DEFAULT_BOARD_IMAGES = Object.entries(BACKGROUND_IMAGE_MODULES)
  .map(([path, url]) => ({ path, url }))
  .sort((a, b) => extractBgIndex(a.path) - extractBgIndex(b.path))
  .map((item) => item.url);

export const buildBoardBackgroundSx =
  (template, options = {}) =>
  (theme) => {
    const { withOverlay = false, overlayOpacity = 0.4 } = options;
    const fallbackColor =
      theme?.palette?.mode === "dark" ? "#1f2a44" : "#1976d2";
    const normalizedTemplate = template?.type
      ? template
      : DEFAULT_BOARD_TEMPLATE;

    if (normalizedTemplate.type === BOARD_TEMPLATE_TYPES.COLOR) {
      return { background: normalizedTemplate.value || fallbackColor };
    }

    if (
      [BOARD_TEMPLATE_TYPES.IMAGE, BOARD_TEMPLATE_TYPES.CUSTOM].includes(
        normalizedTemplate.type
      )
    ) {
      const opacity = Math.min(Math.max(overlayOpacity, 0), 1);
      const overlayLayer = withOverlay
        ? `linear-gradient(135deg, rgba(0,0,0,${opacity}), rgba(0,0,0,${
            opacity * 0.75
          })), `
        : "";

      return {
        backgroundImage: `${overlayLayer}url(${
          normalizedTemplate.value || ""
        })`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        // backgroundColor: fallbackColor
      };
    }

    return { background: fallbackColor };
  };
