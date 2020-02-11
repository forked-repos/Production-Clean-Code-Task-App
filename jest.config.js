module.exports = {
    "roots": [
        "<rootDir>/src"
    ],
    "testMatch": [
        "**/__tests__/**/*.+(ts|tsx|js)",
        "**/?(*.)+(spec|test).+(ts|tsx|js)",
        "**/?(*.)+(spec|test-attempt).+(ts|tsx|js)",
        "**/?(*.)+(spec|test-attempt-two).+(ts|tsx|js)",
    ],
    "transform": {
        "^.+\\.(ts|tsx)$": "ts-jest"
    },
    preset: 'ts-jest'
}