module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: [
        "**/test/**/*.test.ts",
    ],
    transform: {
        "^.+\\.js$": "babel-jest",
        "^.+\\.(ts|tsx)$": "ts-jest"
    },
    moduleFileExtensions: [
        "js",
        "jsx",
        "json",
        "node",
        "ts"
    ],
    moduleDirectories: [
        "node_modules",
        "src/node_modules"
    ],
    moduleNameMapper: {
        "^submodules/(.*)$": "<rootDir>/submodules/$1"
    },
};
