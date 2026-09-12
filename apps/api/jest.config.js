/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "src",
  testRegex: ".*\\.spec\\.ts$",
  transform: { "^.+\\.ts$": ["ts-jest", { tsconfig: "<rootDir>/../tsconfig.json" }] },
  // Source files import each other with explicit .js extensions, which is how
  // the ESM build worked. Under CommonJS those must map back to the .ts source.
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^ai$": "<rootDir>/../test/stubs/ai-sdk.cjs",
    "^@ai-sdk/openai$": "<rootDir>/../test/stubs/ai-sdk.cjs",
    "^@ai-sdk/azure$": "<rootDir>/../test/stubs/ai-sdk.cjs",
  },
  collectCoverageFrom: ["**/*.ts"],
  testEnvironment: "node",
};
