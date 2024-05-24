# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog],
and this project adheres to [Semantic Versioning].

## [Unreleased]

## [1.3.3] - 2024-05-22

### Added

- Check for `https://dashboard.dojonode.xyz` and add warning to use http or selfhost to fix common issue

### Changed

- remove cursor pointer on cards

## [1.3.2] - 2024-05-06

### Fixed

- fix broken startNodeHeight which broke the ETA timer

## [1.3.1] - 2024-05-02

### Changed

- include arm in docker build

## [1.3.0] - 2024-04-25

### Changed

- upgrade to alpha7 hekla testnet

## [1.2.2] - 2024-01-23

### Fixed

- fix dojo flag title
- update headerimage href url

## [1.2.1] - 2024-01-16

### Fixed

- issue with animateConnections on error

## [1.2.0] - 2024-01-16

### Added

- add changelog

### Changed

- upgrade postcss to es6
- update dependencies: vite v5
- update footer
- upgrade to alpha6 katla testnet
- optimize images
- combine connections and settings into connections popup
- refactored the themeswitcher
- updated theme colors

## [1.1.5] - 2023-11-12

### Added

- add RPC checks before fetching

### Changed

- refactored initializeRPCConnection with max time so users sees quicker connection feedback

## [1.1.4] - 2023-11-05

### Added

- add PWA splashscreen
- add node check before fetching data

### Changed

- update Docker base images
- update npm dependencies

### Removed

- remove L2 address input

## [1.1.3] - 2023-10-28

## Added

- add URL params support
- add Footer
- add 'expert mode'

### Changed

- cleanup systeminfo
- abstract away RPC inits
- refactor Prometheus calls
- linting + cleanup project

## [1.1.2] - 2023-10-22

### Added

- add PWA support
- add deployment scripts
- add umami website analytics

### Changed

- refactored project

### Fixed

- fixed accessibility issue of input fields

## [1.1.1] - 2023-09-22

### Fixed

- update blockexplorer url to jolnir

## [1.1.0] - 2023-09-22

### Added

- support custom event indexer API in connections

### Changed

- support a5 testnet (jolnir)
- update default ports to a5 ports
- hide ETA time when (almost) synced
- update npm dependencies

## [1.0.3] - 2023-07-17

- initial release

<!-- Links -->
[keep a changelog]: https://keepachangelog.com/en/1.0.0/
[semantic versioning]: https://semver.org/spec/v2.0.0.html

<!-- Versions -->
[unreleased]: https://github.com/dojonode/taiko-node-dashboard/compare/1.1.5...HEAD
[1.1.5]: https://github.com/dojonode/taiko-node-dashboard/compare/1.1.4...1.1.5
[1.1.4]: https://github.com/dojonode/taiko-node-dashboard/compare/1.1.3...1.1.4
[1.1.3]: https://github.com/dojonode/taiko-node-dashboard/compare/1.1.2...1.1.3
[1.1.2]: https://github.com/dojonode/taiko-node-dashboard/compare/1.1.1...1.1.2
[1.1.1]: https://github.com/dojonode/taiko-node-dashboard/compare/1.1.0...1.1.1
[1.1.0]: https://github.com/dojonode/taiko-node-dashboard/compare/1.0.3...1.1.0
[1.0.3]: https://github.com/dojonode/taiko-node-dashboard/releases/tag/0.0.1
