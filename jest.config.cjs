module.exports = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  moduleNameMapper: {
    "\\.(css|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/test/fileMock.js",
  },
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "tsconfig.jest.json",
      },
    ],
  },
  collectCoverageFrom: [
    "src/features/search/searchQueryParams.ts",
    "src/pages/RoomResults/roomResultsUtils.ts",
    "src/features/tenant/mediaUrl.ts",
    "src/features/Deals/dealSlice.ts",
    "src/features/roomCard/roomResultSlice.ts",
  ],
  coveragePathIgnorePatterns: ["/node_modules/"],
};
