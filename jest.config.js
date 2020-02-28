module.exports = {
    "roots": [
        "<rootDir>/src"
    ],
    "testMatch": [
        "**/?(*.)+(spec|test).+(ts|tsx|js)",
        "**/?(*.)+(spec|test-attempt).+(ts|tsx|js)",
        "**/?(*.)+(spec|test-attempt-two).+(ts|tsx|js)",
    ],
    "transform": {
        "^.+\\.(ts|tsx)$": "ts-jest"
    },
    "coveragePathIgnorePatterns": [
        "__tests__",
        "node_modules"
    ],
    preset: 'ts-jest'
}