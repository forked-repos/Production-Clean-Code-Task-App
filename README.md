# Clean Task App Example for Production

This is not your ordinary task app. It is a feature-rich Task Management application built from the ground up in TypeScript and PostgreSQL with no frameworks and no "magic". Heavily inspired by many of the well-known .NET Enterprise Patterns, such as three-layer architecture and Unit of Work, this application depicts multiple architectural best practices and utilizes technologies, such as Job Queues, that you'd see in production. 

### Table of Contents

- About
- Description
- Ideology
  - Reason for Creation
- Technologies
- Methodologies
- Infrastructure
  - Authentication
  - Database
  - Redis Queueing & CDN
  - External APIs
  - Layers
  - Error Handling & Custom Exceptions
- Patterns
  - Design Patterns
    - Adapter Pattern
    - Inversion of Control via Dependency Injection
    - Composition Pattern
    - Builder Pattern
    - Observer Pattern
    - Facade Pattern
  - Architectural Patterns
    - Controllers/Services/Repositories
    - Command Query Separation (CQS)
    - Event Bus
- Testing
  - No More Mocks
  - xUnit Testing Patterns
  - Redefining "Unit" Testing
  - E2E Testing
  - Mutation Testing & Code Coverage
  - Continuous Integration
- Local Execution (Usage)
- API
- Contributions
- Resources
- License
- Author

## License

The MIT License

Copyright (C) 2020 Jamie Corkhill ([@eithermonad](https://twitter.com/eithermonad)).

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Author

Jamie Corkhill - [@eithermonad](https://twitter.com/eithermonad)

