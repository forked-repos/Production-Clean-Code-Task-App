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
    preset: 'ts-jest'
}