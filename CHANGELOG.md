---
kind: '🏡 Getting Started'
title: 'Changelog'
---

# Changelog

## [17.0.1](https://github.com/CleverCloud/clever-components/compare/17.0.0...17.0.1) (2025-01-10)


### 🐛 Bug Fixes

* **cc-kv-terminal:** handle huge command history using `lit-virtualizer` ([2b89f01](https://github.com/CleverCloud/clever-components/commit/2b89f019b88a6b6a005c850b63762d1c6a7a66e6))
* **cc-tile-status-codes.smart:** remove status codes that are below `100` ([6b0b1df](https://github.com/CleverCloud/clever-components/commit/6b0b1df44ec3707a8abf40c148479a5e637a1cef))
* **cc-tile-status-codes:** fix 6XX..9XX translations ([6e20c39](https://github.com/CleverCloud/clever-components/commit/6e20c39e8d1c826db5bee557241c0e856fb1a817))

## [17.0.0](https://github.com/CleverCloud/clever-components/compare/16.4.0...17.0.0) (2024-12-05)


### ⚠ BREAKING CHANGES

* **cc-tile-metrics:** the following attributes are impacted
    - `metricsLink` has been renamed to `metrics-link`,
    - `metricsState` has been renamed to `metrics-state`,
    - `grafanaLinkState` has been renamed to `grafana-link-state`.
* **cc-addon-option-form:** rename `title` to `heading`
* **cc-addon-option:** rename `title` to `heading`
* **cc-pricing-page:** the component no longer supports hard coded change rate Prices displayed in pricing components are no longer computed based on hard coded change rate. Prices related to the selected currency come from the API priceSytem endpoint.
* **cc-pricing-estimation:** the component no longer supports hard coded change rate Prices displayed in pricing components are no longer computed based on hard coded change rate. Prices related to the selected currency come from the API priceSytem endpoint. This means the component now has a dedicated smart component ( `cc-pricing-estimation.smart`) to fetch the `priceSystem` corresponding to the selected currency everytime it changes.
* **cc-pricing-product-consumption:** the component no longer supports hard coded change rate Prices displayed in pricing components are no longer computed based on hard coded change rate. Prices related to the selected currency come from the API priceSytem endpoint. The component also relies on the new `state` prop for data coming from the API.
* **cc-pricing-product:** the component no longer supports hard coded change rate Prices displayed in pricing components are no longer computed based on hard coded change rate. Prices related to the selected currency come from the API priceSytem endpoint. The component also relies on the new `state` prop for data coming from the API.
* **cc-pricing-header:** the component no longer supports hard coded change rate Prices displayed in pricing components are no longer computed based on hard coded change rate. Prices related to the selected currency come from the API priceSytem endpoint.

### 🚀 Features

* **cc-pricing-estimation:** init smart & adapt to support priceSystem currency ([a67c3bc](https://github.com/CleverCloud/clever-components/commit/a67c3bc8c8fca6b4a35881d6a1395416473381da)), closes [#1167](https://github.com/CleverCloud/clever-components/issues/1167)
* **cc-pricing-header:** adapt to support priceSystem currency ([dd173cb](https://github.com/CleverCloud/clever-components/commit/dd173cb4f9bbd3f2fa8966b8dac967dcdbd75d06)), closes [#1167](https://github.com/CleverCloud/clever-components/issues/1167)
* **cc-pricing-page:** adapt to support priceSystem currency ([0d24ff5](https://github.com/CleverCloud/clever-components/commit/0d24ff5c0cac5823c21eccb82dc4534c1a0acfc8)), closes [#1167](https://github.com/CleverCloud/clever-components/issues/1167)
* **cc-pricing-product-consumption:** adapt to support priceSystem currency ([181feb6](https://github.com/CleverCloud/clever-components/commit/181feb6f4b75b2adda3ccad016a8be7a6b70cedb)), closes [#1167](https://github.com/CleverCloud/clever-components/issues/1167) [#1176](https://github.com/CleverCloud/clever-components/issues/1176) [#1109](https://github.com/CleverCloud/clever-components/issues/1109)
* **cc-pricing-product:** adapt to support priceSystem currency ([3316eb8](https://github.com/CleverCloud/clever-components/commit/3316eb84093f919eb542c55de8624df78c95dd71)), closes [#1167](https://github.com/CleverCloud/clever-components/issues/1167) [#1109](https://github.com/CleverCloud/clever-components/issues/1109) [#1174](https://github.com/CleverCloud/clever-components/issues/1174) [#1176](https://github.com/CleverCloud/clever-components/issues/1176)


### 🐛 Bug Fixes

* **cc-addon-backups:** make `delete` & `restore` overlays reponsive ([a98945a](https://github.com/CleverCloud/clever-components/commit/a98945a29058d2c86385a82ef7cc04d25021fc64)), closes [#1268](https://github.com/CleverCloud/clever-components/issues/1268)
* **cc-addon-option-form:** rename `title` to `heading` ([9bbc556](https://github.com/CleverCloud/clever-components/commit/9bbc55657c3357d093a94445ae3d77ec9db369f0)), closes [#1125](https://github.com/CleverCloud/clever-components/issues/1125)
* **cc-addon-option:** rename `title` to `heading` ([f0a85d3](https://github.com/CleverCloud/clever-components/commit/f0a85d347df7f5219c7725e016a28ea99375860c)), closes [#1125](https://github.com/CleverCloud/clever-components/issues/1125)
* **cc-block:** add css rules to the `slot name="content-body"` ([c7ac3e9](https://github.com/CleverCloud/clever-components/commit/c7ac3e918aac17ee55727bb59a0b4686e432b41c)), closes [#1259](https://github.com/CleverCloud/clever-components/issues/1259)
* **cc-domain-management:** restore loader & error message in the DNS config section ([beb7f8a](https://github.com/CleverCloud/clever-components/commit/beb7f8a0b374324b0da74bc4191fc5005c7cc582)), closes [#1261](https://github.com/CleverCloud/clever-components/issues/1261)
* **cc-pricing-*:** restore currency symbol display inside dropdowns ([89dede5](https://github.com/CleverCloud/clever-components/commit/89dede506e10f8597e66e58553ee1555526b69d6)), closes [#1223](https://github.com/CleverCloud/clever-components/issues/1223)
* **cc-tile-metrics:** use kebab case for all attributes ([8bff968](https://github.com/CleverCloud/clever-components/commit/8bff968e206a35292a7dcdda845d0106b073558c))
* **smart components:** allow optional `apiConfig` context params ([23fb6fd](https://github.com/CleverCloud/clever-components/commit/23fb6fd285ffde9c989c2861e0cc9e92b3daf39a)), closes [#1222](https://github.com/CleverCloud/clever-components/issues/1222)

## [16.4.0](https://github.com/CleverCloud/clever-components/compare/16.3.1...16.4.0) (2024-11-28)


### 🚀 Features

* **cc-domain-management:** make APEX domain DNS config more explicit ([e882e57](https://github.com/CleverCloud/clever-components/commit/e882e5704ab7762e3dc053b8d1148fc2b03fd9bf)), closes [#1231](https://github.com/CleverCloud/clever-components/issues/1231)
* **cc-kv-explorer:** add `refreshing` and `filtering` states ([db01d63](https://github.com/CleverCloud/clever-components/commit/db01d632642cd3c0b3c117804da6cff1b5a29faf))


### 🐛 Bug Fixes

* **cc-kv-explorer:** fix key type label on unsupported types ([bc59008](https://github.com/CleverCloud/clever-components/commit/bc59008fb479139d7260d146b0ce9191b0180b0c))
* **cc-kv-hash-explorer:** adjust gap between elements of the add form ([55735d4](https://github.com/CleverCloud/clever-components/commit/55735d4f5cdc986c0bb75440d19e8fd848f0a6bc))
* **cc-kv-hash-input:** adjust gap between elements ([950a2cc](https://github.com/CleverCloud/clever-components/commit/950a2cc86a419fe1e9e3ef7a80136f4cf34016b9))
* **cc-kv-list-explorer:** adjust gap between elements of the add form ([e60ded5](https://github.com/CleverCloud/clever-components/commit/e60ded5eba9538ac88ac8e8e40f9e899b18bfd42))
* **cc-kv-list-explorer:** fix copy to clipboard button a11y name ([ee692a6](https://github.com/CleverCloud/clever-components/commit/ee692a667535c0c8aa3574ef555246113d1ad309))
* **cc-kv-list-input:** adjust gap between elements ([07de28e](https://github.com/CleverCloud/clever-components/commit/07de28e5aca97cc6f8c730e4ff65f080da1a4037))
* **cc-kv-set-explorer:** adjust gap between elements of the add form ([4956312](https://github.com/CleverCloud/clever-components/commit/49563124c7cf4efde3626b0744f4a42a4769f460))
* **cc-kv-string-editor:** remove padding around component ([8434e2f](https://github.com/CleverCloud/clever-components/commit/8434e2fa6b7e211314db68dcfb15486c76e4345d))

## [16.3.1](https://github.com/CleverCloud/clever-components/compare/16.3.0...16.3.1) (2024-11-15)


### 🐛 Bug Fixes

* **cc-kv-explorer:** wrong gap between buttons in hash, list and set explorers ([038a5da](https://github.com/CleverCloud/clever-components/commit/038a5dadce7d206b9875ec36714bb67724a9eff5)), closes [#1236](https://github.com/CleverCloud/clever-components/issues/1236)

## [16.3.0](https://github.com/CleverCloud/clever-components/compare/16.2.0...16.3.0) (2024-11-15)


### 🚀 Features

* **cc-kv-explorer:** init component ([d6e3ee7](https://github.com/CleverCloud/clever-components/commit/d6e3ee744f816cff9685eca91a856805ede13888)), closes [#1177](https://github.com/CleverCloud/clever-components/issues/1177)
* **LostFocusController:** add an additional waiter ([327b180](https://github.com/CleverCloud/clever-components/commit/327b180edccf7cab22a18e02a6ad1ac8fb559c03)), closes [#1155](https://github.com/CleverCloud/clever-components/issues/1155)


### 🐛 Bug Fixes

* **cc-input-text:** fix `Ctrl`+`Enter` keystroke when in `multi` mode on Chrome ([5be2bcd](https://github.com/CleverCloud/clever-components/commit/5be2bcdc4942e0d13fc66b9c4dd3f977515a12e1)), closes [#861](https://github.com/CleverCloud/clever-components/issues/861)
* **cc-toast:** replace hard coded border radius with `--cc-border-radius-default` ([c3ae6bb](https://github.com/CleverCloud/clever-components/commit/c3ae6bb5c3c8e646a6fd28ff0638e5b2c336015e)), closes [#1232](https://github.com/CleverCloud/clever-components/issues/1232)
* fix `visually-hidden` style to prevent a strange bug in Chrome ([e05e85c](https://github.com/CleverCloud/clever-components/commit/e05e85cc2c4d084d0689749c3672704caea7d59f)), closes [#1200](https://github.com/CleverCloud/clever-components/issues/1200)

## [16.2.0](https://github.com/CleverCloud/clever-components/compare/16.1.0...16.2.0) (2024-10-30)


### 🚀 Features

* **cc-zone-picker:** add disabled and readonly modes ([a17dfd1](https://github.com/CleverCloud/clever-components/commit/a17dfd15cc6c88626192466741c8fadeb424cd31))


### 🐛 Bug Fixes

* **cc-block:** improve alignment in footer ([0a7e3ae](https://github.com/CleverCloud/clever-components/commit/0a7e3aedb360f502731cd7cefb2aca80c736ab8d))
* **cc-header-addon:** improve zone alignment in footer ([d875d57](https://github.com/CleverCloud/clever-components/commit/d875d5757fba33b8e710e762eb4f925d702de3ab))
* **cc-header-app:** improve zone alignment in footer ([8c72d23](https://github.com/CleverCloud/clever-components/commit/8c72d23761d8eec410653712bd9d2a0ca83ed847))
* **cc-zone:** improve alignment ([5b42c3d](https://github.com/CleverCloud/clever-components/commit/5b42c3d88f2b9233c2cdc8cdace76c3cc79629f2)), closes [#1226](https://github.com/CleverCloud/clever-components/issues/1226)

## [16.1.0](https://github.com/CleverCloud/clever-components/compare/16.0.0...16.1.0) (2024-10-22)


### 🚀 Features

* **cc-domain-management:** remove spacing between domain and path ([b5498f3](https://github.com/CleverCloud/clever-components/commit/b5498f31f89e24ca6ba9dda9d2685de34d7a0b7e)), closes [#1204](https://github.com/CleverCloud/clever-components/issues/1204)


### 🐛 Bug Fixes

* **cc-block:** remove margin bottom ([1ca09d5](https://github.com/CleverCloud/clever-components/commit/1ca09d553d9f07b8326fc47946b6d35e118b55ae))
* **cc-domain-management:** allow newly added domain to be marked as primary ([68c3961](https://github.com/CleverCloud/clever-components/commit/68c3961645aedb7dafeff7dd0822a6fde7592dd1)), closes [#1213](https://github.com/CleverCloud/clever-components/issues/1213)
* **cc-domain-management:** revert to initial gap ([993ff9f](https://github.com/CleverCloud/clever-components/commit/993ff9f106e4e77585f2c0b9551d3f6a0b32541a))
* **cc-env-var-form:** remove unnecessary link and fix typo in description text ([4b2e3f7](https://github.com/CleverCloud/clever-components/commit/4b2e3f701a125daf189937eef18b5395ac534023))
* **cc-invoice:** remove unnecessary padding ([458a488](https://github.com/CleverCloud/clever-components/commit/458a4889ac2f06d3c76421cafe5ddd73df7aeca5))

## [16.0.0](https://github.com/CleverCloud/clever-components/compare/15.3.0...16.0.0) (2024-10-21)


### ⚠ BREAKING CHANGES

* **cc-header-orga:** the footer slot has changed
    - `slot='footer'`: has been removed
    - `slot='footer-left'`: has been created
    - `slot='footer-right`: has been created
* **cc-addon-credentials:** the properties have changed
    - `toggleState`: property has been renamed to `toggle`
* **cc-block:** the properties have changed
    - `noHead`: property has been deleted
    - `state`: property has been renamed to `toggle`
    - `overlay`: property has been deleted

### 🚀 Features

* **cc-domain-management:** move doc link into `cc-block` footer slot ([6430b67](https://github.com/CleverCloud/clever-components/commit/6430b6772b69b2eab4c60a6024d02951f9581450))
* **cc-elasticsearch-info:** move doc link into `cc-block` footer slot ([ecfa136](https://github.com/CleverCloud/clever-components/commit/ecfa136ab24bccb1c218d9bf3908fb68fc56e60c))
* **cc-env-var-form:** move doc link into `cc-block` footer slot ([2be6567](https://github.com/CleverCloud/clever-components/commit/2be656740c9d98f8d80e55189829f47db26e0154))
* **cc-grafana-info:** move doc link into `cc-block` footer slot ([1f4940e](https://github.com/CleverCloud/clever-components/commit/1f4940e84f484606c30bb131754e5239418d60b4))
* **cc-heptapod-info:** move doc link into `cc-block` footer slot ([cab5c7e](https://github.com/CleverCloud/clever-components/commit/cab5c7e0d6d3d69a29c0d65b2406a3d278c53b6d))
* **cc-invoice-list:** move doc link into `cc-block` footer slot ([ff67820](https://github.com/CleverCloud/clever-components/commit/ff67820743d34c2b72c3152de8362cad6273fe7e))
* **cc-invoice-table:** support multi-currency ([a7a9ec2](https://github.com/CleverCloud/clever-components/commit/a7a9ec2eb89c611e6282c2399364c7b8447db592)), closes [#1171](https://github.com/CleverCloud/clever-components/issues/1171)
* **cc-invoice:** add `currency` as part of the `state` ([5590257](https://github.com/CleverCloud/clever-components/commit/5590257e047741e9d91c970b46ca426d7de121a0)), closes [#1169](https://github.com/CleverCloud/clever-components/issues/1169)
* **cc-jenkins-info:** move doc link into `cc-block` footer slot ([a23e8f7](https://github.com/CleverCloud/clever-components/commit/a23e8f755308d59e58102b8744f4579ceb8aa7e3))
* **cc-matomo-info:** move doc link into `cc-block` footer slot ([20ef5fa](https://github.com/CleverCloud/clever-components/commit/20ef5fa9c866e9e975cd3abc2fb4b5678d15a361))
* **cc-orga-member-list:** move doc link into `cc-block` footer slot ([7f4e006](https://github.com/CleverCloud/clever-components/commit/7f4e006d6c2ae9daf71436c5168e8be90cc29b7b))
* **cc-ssh-key-list:** move doc link into `cc-block` footer slot ([841a584](https://github.com/CleverCloud/clever-components/commit/841a5845dc3d77bf5475d95892acd62a0251d722))
* **cc-tcp-redirection-form:** move doc link into `cc-block` footer slot ([b619304](https://github.com/CleverCloud/clever-components/commit/b619304375b52e39dd9be430b4db07cabe82da1f))


### 🛠 Code Refactoring

* **cc-addon-credentials:** adapt component with the new `cc-block` ([2e39c47](https://github.com/CleverCloud/clever-components/commit/2e39c4763f1db9e9c12bd88b7b59ee5a41f1fd99))
* **cc-block:** rework component and introduce slot stack ([7bb3425](https://github.com/CleverCloud/clever-components/commit/7bb34257a205d5d3de4cecdfb4acfda2b9f2fdf9)), closes [#225](https://github.com/CleverCloud/clever-components/issues/225)
* **cc-header-orga:** adapt component with the new `cc-block` ([9107721](https://github.com/CleverCloud/clever-components/commit/9107721be75964991fe13ede59a41175cc479f1a))

## [15.3.0](https://github.com/CleverCloud/clever-components/compare/15.2.2...15.3.0) (2024-10-09)


### 🚀 Features

* **cc-zone-card:** init component ([ca935db](https://github.com/CleverCloud/clever-components/commit/ca935db16a7b9758649268a1113d6184da171946))
* **cc-zone-picker:** init component ([07517d6](https://github.com/CleverCloud/clever-components/commit/07517d642ad8d289f4446c91c794d4ea17059f6f))

## [15.2.2](https://github.com/CleverCloud/clever-components/compare/15.2.1...15.2.2) (2024-10-07)


### 🐛 Bug Fixes

* **cc-domain-management:** update `cleverapps` docs link ([f2b44ac](https://github.com/CleverCloud/clever-components/commit/f2b44ac41d9d04f7975bbc88d84380956ddb4ad5)), closes [#1173](https://github.com/CleverCloud/clever-components/issues/1173)
* **cem-types-plugin:** ignore non relative path imports ([bbe2c02](https://github.com/CleverCloud/clever-components/commit/bbe2c029d18348e70d90bd90366ff6a9410daa2c))
* **storybook:** update storybook config ([b4eea78](https://github.com/CleverCloud/clever-components/commit/b4eea787854cf201a4d5d76783c2ffeb414b3fe6))

## [15.2.1](https://github.com/CleverCloud/clever-components/compare/15.2.0...15.2.1) (2024-08-07)


### 🐛 Bug Fixes

* **cc-domain-management:** fix typo & improve texts ([5132105](https://github.com/CleverCloud/clever-components/commit/5132105692a639dc62e76daa1eb2c18abb8b1548))

## [15.2.0](https://github.com/CleverCloud/clever-components/compare/15.1.1...15.2.0) (2024-08-05)


### 🚀 Features

* **cc-domain-management:** display all A Records within a single input ([cf58a0c](https://github.com/CleverCloud/clever-components/commit/cf58a0c48a1cd990305468dd8d7770a0079fddb8)), closes [#1134](https://github.com/CleverCloud/clever-components/issues/1134)


### 🐛 Bug Fixes

* **cc-domain-management:** improve responsive aspect ([dca9c74](https://github.com/CleverCloud/clever-components/commit/dca9c742a5f78bd6d5196ea55ee7cf8c0461f9ed)), closes [#1126](https://github.com/CleverCloud/clever-components/issues/1126)

## [15.1.1](https://github.com/CleverCloud/clever-components/compare/15.1.0...15.1.1) (2024-07-30)


### 🐛 Bug Fixes

* **cc-input-text:** match text and input ([7e156b4](https://github.com/CleverCloud/clever-components/commit/7e156b402873caa74b963e154ee6ab59f702edec)), closes [#1130](https://github.com/CleverCloud/clever-components/issues/1130)
* **cc-toast:** decrease paragraph margins ([388b7db](https://github.com/CleverCloud/clever-components/commit/388b7db11b067dcb2d88db36c7295f6089d2543e)), closes [#1127](https://github.com/CleverCloud/clever-components/issues/1127)

## [15.1.0](https://github.com/CleverCloud/clever-components/compare/15.0.1...15.1.0) (2024-07-25)


### 🚀 Features

* **cc-domain-management:** init ([f4d0146](https://github.com/CleverCloud/clever-components/commit/f4d0146cd21dbc7b332a26d8c7069f2277e22263)), closes [#1095](https://github.com/CleverCloud/clever-components/issues/1095)
* **i18n-sanitize:** authorize `&lt;span&gt;` elements ([21bfad0](https://github.com/CleverCloud/clever-components/commit/21bfad07899eb81c905c071f22be9e184ecf076c))


### 🐛 Bug Fixes

* prettier adr wasn't in the correct directory ([07e944b](https://github.com/CleverCloud/clever-components/commit/07e944b6c0eab1788afd545ab2976c802f869695))

## [15.0.1](https://github.com/CleverCloud/clever-components/compare/15.0.0...15.0.1) (2024-06-28)


### 🐛 Bug Fixes

* **cc-input-date:** fix Enter keystroke when not into a form element ([31bcb3c](https://github.com/CleverCloud/clever-components/commit/31bcb3cb22f7c0061bc5d589c1a5f7001491f1a6))
* **cc-input-number:** fix Enter keystroke when not into a form element ([aa9fa07](https://github.com/CleverCloud/clever-components/commit/aa9fa0730bb10715a505130f3739163a7d7c3240))
* **cc-input-text:** fix Enter keystroke when not into a form element ([c23f31a](https://github.com/CleverCloud/clever-components/commit/c23f31a7949563cc1b4f6554672b17cfe5d30fa7))

## [15.0.0](https://github.com/CleverCloud/clever-components/compare/14.1.1...15.0.0) (2024-06-28)


### ⚠ BREAKING CHANGES

* **cc-orga-member-list:** an `ElementInternals` polyfill is required to support Safari before version 16.4
* **cc-ssh-key-list:** an `ElementInternals` polyfill is required to support Safari before version 16.4
* **cc-email-list:** an `ElementInternals` polyfill is required to support Safari before version 16.4
* **cc-button:** an `ElementInternals` polyfill is required to support Safari before version 16.4
* **cc-select:** an `ElementInternals` polyfill is required to support Safari before version 16.4
* **cc-input-text:** an `ElementInternals` polyfill is required to support Safari before version 16.4
* **cc-input-number:** an `ElementInternals` polyfill is required to support Safari before version 16.4
* **cc-input-date:** an `ElementInternals` polyfill is required to support Safari before version 16.4

### 🚀 Features

* **cc-button:** implement element internals ([9040c22](https://github.com/CleverCloud/clever-components/commit/9040c22b46f03b87c1626195d6e0376ca063edba))
* **cc-input-date:** implement element internals ([3928fcc](https://github.com/CleverCloud/clever-components/commit/3928fcca34380e69990a3cf8066dca4f3bd52f06))
* **cc-input-number:** implement element internals ([695c934](https://github.com/CleverCloud/clever-components/commit/695c934963f83cdd819cb455a90292e585b39fea))
* **cc-input-text:** implement element internals ([5bbf548](https://github.com/CleverCloud/clever-components/commit/5bbf54821bccc956616810baece3f9c23cf58f5d))
* **cc-logs:** add `Home` and `End` keystrokes ([8dc21b7](https://github.com/CleverCloud/clever-components/commit/8dc21b78c938899b3f87b2e2f822e9897ee72306)), closes [#1009](https://github.com/CleverCloud/clever-components/issues/1009)
* **cc-logs:** add ctrl+A keystroke for selecting all log lines ([1610cb2](https://github.com/CleverCloud/clever-components/commit/1610cb28ba59e736d444d0f8a870f60105aba1ec)), closes [#1008](https://github.com/CleverCloud/clever-components/issues/1008)
* **cc-logs:** make copy button more visible ([08ffc0d](https://github.com/CleverCloud/clever-components/commit/08ffc0db14f1fbd8cc864155ef8f4644a2473af5)), closes [#1012](https://github.com/CleverCloud/clever-components/issues/1012)
* **cc-logs:** select whole log line with triple click ([7c46e49](https://github.com/CleverCloud/clever-components/commit/7c46e498d5f7589db9f99eb2ee0a8c4d62596fcd)), closes [#1006](https://github.com/CleverCloud/clever-components/issues/1006)
* **cc-select:** implement element internals ([4a5a13d](https://github.com/CleverCloud/clever-components/commit/4a5a13d8d651521a9cca1681df362de68b088e28))
* **forms:** add framework for element internals support ([1d52fbb](https://github.com/CleverCloud/clever-components/commit/1d52fbb66b59bca6bffd319fa5a18996240b4718))


### 🛠 Code Refactoring

* **cc-email-list:** implement the add-secondary-email form with the new form mechanism ([be5b6c2](https://github.com/CleverCloud/clever-components/commit/be5b6c257e3e131c897a19335139442fa4f4e832))
* **cc-orga-member-list:** implement the create-key form with the new form mechanism ([9929b0a](https://github.com/CleverCloud/clever-components/commit/9929b0aeaaf07c0ef01efffa5c94fec92a29b19c))
* **cc-ssh-key-list:** implement the create-key form with the new form mechanism ([c4e49f4](https://github.com/CleverCloud/clever-components/commit/c4e49f40f5e59b41103ce97cb8cae60592012375))

## [14.1.1](https://github.com/CleverCloud/clever-components/compare/14.1.0...14.1.1) (2024-06-21)


### 🐛 Bug Fixes

* **cc-tile-metrics:** use memtrics to populate `lastMemValue` ([f18cd50](https://github.com/CleverCloud/clever-components/commit/f18cd508bad67cabef864816203c9e36c75612d4)), closes [#1092](https://github.com/CleverCloud/clever-components/issues/1092)

## [14.1.0](https://github.com/CleverCloud/clever-components/compare/14.0.1...14.1.0) (2024-06-19)


### 🚀 Features

* **cc-logs-application-view:** dispatch event when date range selection changes ([04c376c](https://github.com/CleverCloud/clever-components/commit/04c376cf30b5df8f1cc2585a72b69c8bb7244110))
* **cc-logs-application-view:** enhance filtering ([eaa96cf](https://github.com/CleverCloud/clever-components/commit/eaa96cf8bb2c5e4012778f5d865a2d8c4cf0692d)), closes [#1073](https://github.com/CleverCloud/clever-components/issues/1073) [#1014](https://github.com/CleverCloud/clever-components/issues/1014)
* **cc-logs-application-view:** init from a date range selection passed into the smart context ([9cdeb1f](https://github.com/CleverCloud/clever-components/commit/9cdeb1f428e028bccf14eb35a627bacb7e47dd36)), closes [#1075](https://github.com/CleverCloud/clever-components/issues/1075)


### 🐛 Bug Fixes

* **cc-logs-instances:** make sure deploying instances grid layout is never broken ([eddeac7](https://github.com/CleverCloud/clever-components/commit/eddeac7c55ed603133ce5b6d703f4f3e382ac319)), closes [#1070](https://github.com/CleverCloud/clever-components/issues/1070)

## [14.0.1](https://github.com/CleverCloud/clever-components/compare/14.0.0...14.0.1) (2024-06-17)


### 🐛 Bug Fixes

* **cc-header-orga:** center enterprise icons vertically ([0fc4a8a](https://github.com/CleverCloud/clever-components/commit/0fc4a8a3284a19ee173f645853fa9ff727239fbb)), closes [#1084](https://github.com/CleverCloud/clever-components/issues/1084)
* **cc-tile-status-codes.smart:** pass `warpConfig` instead of `apiConfig` ([bdd02cd](https://github.com/CleverCloud/clever-components/commit/bdd02cda92e186b569955f9904f3e13f95f10fb9)), closes [#1085](https://github.com/CleverCloud/clever-components/issues/1085)

## [14.0.0](https://github.com/CleverCloud/clever-components/compare/13.3.1...14.0.0) (2024-06-12)


### ⚠ BREAKING CHANGES

* **cc-addon-credentials:** The `addonType` value for Materia KV is now `materia-kv` instead of `materiadb-kv`
* **cc-pricing-header:** the properties have changed
    - `zones`: property has been renamed to `state`
    - `zones.state`: property has been renamed to `type`
* **cc-header-addon:** the properties have changed
    - `state`: new property containing the whole state
    - `addon`: property has been deleted as it is now part of the state
    - `version`: property has been deleted as it is now part of the state
    - `zone`: property has been deleted as it is now part of the state
    - `error`: property has been deleted as it is now part of the state
* **cc-header-app:** the properties have changed
    - `state`: new property containing the whole state of the component
      - `app`: property has been deleted as it is now part of the `state` property
      - `status`: property has been deleted as it is now part of the `state` property
      - `running-commit`: property has been deleted as it is now part of the
        `state` property
      - `starting-commit`: property has been deleted as it is now part of the
        `state` property
      - `zone`: property has been deleted as it is now part of the
        `state` property
      - `error`: property has been deleted as it is now part of the `state` property
* **cc-zone-input:** the properties have changed   - `state`: new property containing the whole state   - `zones`: property has been deleted as it is now part of the state   - `error`: property has been deleted as it is now part of the state
* **cc-zone:** the properties have changed
    - `state`: new property containing the whole state
    - `zone`: property has been deleted as it is now part of the state
* **cc-invoice-table:** the properties have changed
    - `state`: new property containing the whole state
    - `invoices`: property has been deleted as it is now part of the state
* **cc-addon-admin:** the properties have changed
    - `state`: new property containing the whole state
    - `addon`: property has been deleted as it is now part of the state
    - `error`: property has been deleted as it is now part of the state
    - `saving`: property has been deleted as it is now part of the state
* **cc-doc-list:** the properties have changed
    - `state`: new property containing the whole state
    - `docs`: property has been deleted as it is now part of the state
    - `error`: property has been deleted as it is now part of the state
* **cc-doc-card:** the properties have changed
    - `state`: new property containing the whole state
    - `description`: property has been deleted as it is now part of the state
    - `heading`: property has been deleted as it is now part of the state
    - `icons`: property has been deleted as it is now part of the state
    - `link`: property has been deleted as it is now part of the state
* **cc-tile-scalability:** the properties have changed
    - `state`: new property containing the whole state
    - `scalability`: property has been deleted as it is now part of the state
    - `error`: property has been deleted as it is now part of the state
* **cc-header-orga:** the properties have changed
    - The `orga` component property has been renamed to `state`
      - The `orga.state` state property has been renamed to `state.type`
* **cc-addon-features:** the properties have changed
    - `state`: new property containing the whole state
    - `features`: property has been deleted as it is now part of the state
    - `error`: property has been deleted as it is now part of the state
* **cc-addon-backups:** the properties have changed
    - `state`: new property containing the whole state
    - `backups`: property has been deleted as it is now part of the state
    - `error`: property has been deleted as it is now part of the state
* **cc-heptapod-info:** the properties have changed
    - `state`: new property containing the whole state
    - `statistics`: property has been deleted as it is now part of the state
    - `error`: property has been deleted as it is now part of the state
* **cc-elasticsearch-info:** the properties have changed
    - `state`: new property containing the whole state
    - `error`: property has been deleted as it is now part of the state
    - `links`: property has been deleted as it is now part of the state
* **cc-matomo-info:** the properties have changed
    - `state`: new property containing the whole state
    - `matomoLink`: property has been deleted as it is now part of the state as `matomoUrl`
    - `mysqlLink`: property has been deleted as it is now part of the state as `mysqlUrl`
    - `phpLink`: property has been deleted as it is now part of the state as `phpUrl`
    - `redisLink`: property has been deleted as it is now part of the state as `redisUrl`
    - `error`: property has been deleted as it is now part of the state
* **cc-tcp-redirection-form:** the properties have changed
    - The `redirections` component property has been renamed to `state`
      - The `redirections.state` state property has been renamed to `state.type`
      - The `redirections.value` state property has been renamed to `state.redirections`
* **cc-tcp-redirection:** the properties have changed
    - The `redirection` component property has been renamed to `state`
      - The `redirection.state` state property has been renamed to `state.type`
* **cc-article-card:** the properties have changed
    - `state`: new property containing the whole state
    - `title`: property has been deleted as it is now part of the state
    - `description`: property has been deleted as it is now part of the state
    - `banner`: property has been deleted as it is now part of the state
    - `date`: property has been deleted as it is now part of the state
    - `link`: property has been deleted as it is now part of the state
* **cc-tile-requests:** the properties have changed
    - `state`: new property containing the whole state
    - `error`: property has been deleted as it is now part of the state
    - `data`: property has been deleted as it is now part of the state
* **cc-tile-metrics:** the properties have changed
    - `metrics`: property has been renamed to `state`
    - `metrics.state`: property has been renamed to `type`
    - `grafanaLink`: property has been replaced by an object property named `grafanaLinkState`

### 🐛 Bug Fixes

* **cc-addon-credentials:** change `addonType` value for Materia KV ([3ab0d56](https://github.com/CleverCloud/clever-components/commit/3ab0d565ca4963cfd79b7cdc334507483949c22c)), closes [#1068](https://github.com/CleverCloud/clever-components/issues/1068)


### 🛠 Code Refactoring

* **cc-addon-admin:** rework properties to avoid impossible states ([954ebd2](https://github.com/CleverCloud/clever-components/commit/954ebd26fff6fe4146ce9448e36859c40f71a549))
* **cc-addon-backups:** rework properties to avoid impossible st… ([ea9c40f](https://github.com/CleverCloud/clever-components/commit/ea9c40fe5ffd4a0327d321e2e17d672dc6639e42))
* **cc-addon-features:** rework properties to avoid impossible states ([89f1a4f](https://github.com/CleverCloud/clever-components/commit/89f1a4fd4867d248434a4743282b9dd5f43ac2a1))
* **cc-article-card:** rework properties to avoid impossible states ([675d1ca](https://github.com/CleverCloud/clever-components/commit/675d1cadc0d1ae1628ae5431b77b3db4263312a3))
* **cc-doc-card:** rework properties to avoid impossible states ([b4d4f87](https://github.com/CleverCloud/clever-components/commit/b4d4f878fe841e4781f56a7108f4b47646041816))
* **cc-doc-list:** rework properties to avoid impossible states ([1ef23ee](https://github.com/CleverCloud/clever-components/commit/1ef23ee704103e72f31f782fd14fe0d518312515))
* **cc-elasticsearch-info:** rework properties to avoid impossible states ([26fde7d](https://github.com/CleverCloud/clever-components/commit/26fde7d0da8758b67fb424c6a9bd549b73333d2c))
* **cc-header-addon:** rework properties to avoid impossible states ([ceea4ab](https://github.com/CleverCloud/clever-components/commit/ceea4ab2069889db06d16dc5b4d9418b9313966f))
* **cc-header-app:** rework properties to avoid impossible states ([721bf45](https://github.com/CleverCloud/clever-components/commit/721bf4517fb10dd4c73aca3b2cb40bc586d8ba01))
* **cc-header-orga:** rework properties to avoid impossible states ([fd2b737](https://github.com/CleverCloud/clever-components/commit/fd2b737949bc66bbece8a3efc44814757a3f0016))
* **cc-heptapod-info:** rework properties to avoid impossible states ([654dbba](https://github.com/CleverCloud/clever-components/commit/654dbba667e9132b77c67adb448204037c49cd8c))
* **cc-invoice-table:** rework properties to avoid impossible states ([1f7ee73](https://github.com/CleverCloud/clever-components/commit/1f7ee73af79583166e8864b1137008242242e775))
* **cc-matomo-info:** rework properties to avoid impossible states ([cbfc1f7](https://github.com/CleverCloud/clever-components/commit/cbfc1f7da313d5079911f533c5ef17730d08ac51))
* **cc-pricing-header:** rework properties to avoid impossible states ([7a8bad2](https://github.com/CleverCloud/clever-components/commit/7a8bad20bceb4177ae4531366382b38ff1e27be0))
* **cc-tcp-redirection-form:** rework properties to avoid impossible states ([267ea82](https://github.com/CleverCloud/clever-components/commit/267ea827e1898b5c8409a72602d1aee57cad24e7))
* **cc-tcp-redirection:** rework properties to avoid impossible states ([08b2fcd](https://github.com/CleverCloud/clever-components/commit/08b2fcd8aa4cf855bf25d674e88b1f7f4fa0a7d8))
* **cc-tile-metrics:** rework properties to avoid impossible states ([26da5af](https://github.com/CleverCloud/clever-components/commit/26da5afd1eb407d913860201013bd78f1106cc47))
* **cc-tile-requests:** rework properties to avoid impossible states ([b6d3477](https://github.com/CleverCloud/clever-components/commit/b6d34778e82bf9ffcac8e0e6139214486d6bd550))
* **cc-tile-scalability:** rework properties to avoid impossible states ([aeabe7b](https://github.com/CleverCloud/clever-components/commit/aeabe7bea2c336ba8d524abf6b625b11e1ab2461))
* **cc-zone-input:** rework properties to avoid impossible states ([3475635](https://github.com/CleverCloud/clever-components/commit/3475635aeac2b75d79c60e87e44be638adeeab56))
* **cc-zone:** rework properties to avoid impossible states ([9e9dceb](https://github.com/CleverCloud/clever-components/commit/9e9dcebb9a583c886253ca25b45d5aaf59373d26))

## [13.3.1](https://github.com/CleverCloud/clever-components/compare/13.3.0...13.3.1) (2024-05-31)


### 🐛 Bug Fixes

* **cc-addon-credentials:** update Materia branding ([bf9c68f](https://github.com/CleverCloud/clever-components/commit/bf9c68ff370e62fe9d2658f36509015ed1dc475e))

## [13.3.0](https://github.com/CleverCloud/clever-components/compare/13.2.0...13.3.0) (2024-05-06)


### 🚀 Features

* **cc-addon-admin:** adapt the danger zone text to match different situations ([8dfea44](https://github.com/CleverCloud/clever-components/commit/8dfea4443705e07cea3353543ffcc9a229bfb0d6)), closes [#1018](https://github.com/CleverCloud/clever-components/issues/1018)
* **cc-logsmap:** allow the configuration of modes (availability and order) ([71cc825](https://github.com/CleverCloud/clever-components/commit/71cc825946b2f105b42714a66b53e39ed8b6aae7)), closes [#1040](https://github.com/CleverCloud/clever-components/issues/1040)


### 🐛 Bug Fixes

* **cc-addon-admin:** remove improper spacing within the danger zone ([219a612](https://github.com/CleverCloud/clever-components/commit/219a6127b73a38aa6b7dc7fd3b324f044e604352)), closes [#1042](https://github.com/CleverCloud/clever-components/issues/1042)

## [13.2.0](https://github.com/CleverCloud/clever-components/compare/13.1.0...13.2.0) (2024-04-12)


### 🚀 Features

* **cc-logs-application-view:** add a fullscreen button mode ([d6c7e36](https://github.com/CleverCloud/clever-components/commit/d6c7e3687200db12caa615baa1a0b25cb84bcaa5)), closes [#983](https://github.com/CleverCloud/clever-components/issues/983)
* **cc-logs-application-view:** init component ([732b48e](https://github.com/CleverCloud/clever-components/commit/732b48ec9ed51bd2b96f283a842a894663f0aef9)), closes [#967](https://github.com/CleverCloud/clever-components/issues/967)
* **cc-logs-control:** add header slot ([9fcbff6](https://github.com/CleverCloud/clever-components/commit/9fcbff681475fdbf576472cbd4635e6cc2e233aa)), closes [#964](https://github.com/CleverCloud/clever-components/issues/964)
* **cc-logs-instances:** add tooltips to commit label and instance index ([438751c](https://github.com/CleverCloud/clever-components/commit/438751cd3cfc671c78d361335aecfd2a759f5b65))
* **cc-logs,cc-logs-control:** add the ability to filter on logs' message ([362c9ba](https://github.com/CleverCloud/clever-components/commit/362c9ba432671a3f1193350ce96216f796571b86))
* **cc-popover:** add `--cc-popover-trigger-button-width` css property ([3e1dc1c](https://github.com/CleverCloud/clever-components/commit/3e1dc1ccaea83c4ad8f15b3b58b1ea72d79c4739))
* **cc-smart-container:** allow optional property in smart context ([c62f172](https://github.com/CleverCloud/clever-components/commit/c62f1725200b3bf8689139f797e7c34b224f3f9c))


### 🐛 Bug Fixes

* **cc-input-date:** fix date formatting at midnight ([bc67946](https://github.com/CleverCloud/clever-components/commit/bc679461abee8dbff17b6aafe6d92308aa2f8adb))
* **cc-logs-application-view:** fix loading message visibility hover black theme ([ba1e0b4](https://github.com/CleverCloud/clever-components/commit/ba1e0b44a37bfdb29b6990066e76f77a8ae45e09)), closes [#1019](https://github.com/CleverCloud/clever-components/issues/1019)
* **cc-logs-control:** fix the event detail when metadata-display option changes ([222e110](https://github.com/CleverCloud/clever-components/commit/222e1103adac02726883fd4640074c21cd5d8f9e))
* **cc-logs-instances:** fix instance selection ([3ff0206](https://github.com/CleverCloud/clever-components/commit/3ff0206e1505d72027e55a146b184bc1b8854361))
* **cc-logs-instances:** fix sort order of the instances when grouped by deployments ([0bb4d18](https://github.com/CleverCloud/clever-components/commit/0bb4d1837060f85686a8f5438306be017c663455))
* **cc-logs-instances:** fix spacing around deployment relative date ([7a95572](https://github.com/CleverCloud/clever-components/commit/7a95572f5240827fb5465903cd97c722dc4f8f39)), closes [#965](https://github.com/CleverCloud/clever-components/issues/965)
* **cc-logs:** do not collapse spaces in log messages ([90f3d9f](https://github.com/CleverCloud/clever-components/commit/90f3d9f0c0f8557308c53de313d1aa7cd91d8ec8)), closes [#965](https://github.com/CleverCloud/clever-components/issues/965)
* **cc-logs:** do not include hidden metadata into clipboard ([ca7cacb](https://github.com/CleverCloud/clever-components/commit/ca7cacb3caf9838e0cd42cffe017d7a5ab4d2a2a))
* **cc-logs:** fix spacing between metadata and message ([a7534ef](https://github.com/CleverCloud/clever-components/commit/a7534ef5b3e4673283facdd8bc71ad33b42b6ab2))

## [13.1.0](https://github.com/CleverCloud/clever-components/compare/13.0.0...13.1.0) (2024-04-03)


### 🚀 Features

* **cc-addon-credentials:** add support for materiadb-kv ([5fce8de](https://github.com/CleverCloud/clever-components/commit/5fce8def6fa136924408e145309911908ca1d978)), closes [#992](https://github.com/CleverCloud/clever-components/issues/992)
* **cc-addon-credentials:** add support for port ([d474dbc](https://github.com/CleverCloud/clever-components/commit/d474dbc115802829487f3e0b6e2229c5a88061df)), closes [#992](https://github.com/CleverCloud/clever-components/issues/992)
* **cc-addon-credentials:** adjust translations for host and token ([21f13f8](https://github.com/CleverCloud/clever-components/commit/21f13f8c616bfbe1d6407ce8d06c1691a09706c1)), closes [#992](https://github.com/CleverCloud/clever-components/issues/992)
* **cc-addon-credentials:** adjust translations for Pulsar ([53e6370](https://github.com/CleverCloud/clever-components/commit/53e6370bc01af4aa3584666262c61bb32ffd43dd))
* **cc-product-list:** init component ([a6454bf](https://github.com/CleverCloud/clever-components/commit/a6454bfa5f292fb11f290956ff77b91019cd21ed)), closes [#892](https://github.com/CleverCloud/clever-components/issues/892)


### 🐛 Bug Fixes

* **cc-button:** prevent click events in skeleton / waiting ([1239779](https://github.com/CleverCloud/clever-components/commit/123977936308c0659754cb78ef598dd2ab6f1fc8)), closes [#994](https://github.com/CleverCloud/clever-components/issues/994)
* **cc-link:** remove href in skeleton ([ae4719d](https://github.com/CleverCloud/clever-components/commit/ae4719dc769cfe07347c0e2b5e266a3eb3fb2ee8)), closes [#994](https://github.com/CleverCloud/clever-components/issues/994)

## [13.0.0](https://github.com/CleverCloud/clever-components/compare/12.0.0...13.0.0) (2024-03-07)


### ⚠ BREAKING CHANGES

* **cc-popover:** remove the `accessibleName` prop & associated attribute
* **cc-icon:** remove the `accessibleName` prop & associated attribute
* **cc-button:** remove the `accessibleName` prop & associated attribute
* **cc-badge:** remove the `iconAccessibleName` prop & associated attribute
* **cc-img:** remove the `accessibleName` prop & associated attribute
* **cc-env-var-linked-services:** the properties have changed
    - `state`: new property containing the whole state
    - `services`: property has been deleted as it is now part of the state
    - `error`: property has been deleted as it is now part of the state
* **cc-env-var-form:** the properties have changed
    - `state`: new property containing the whole state
    - `variables`: property has been deleted as it is now part of the state
    - `error`: property has been deleted as it is now part of the state
    - `parserOptions`: property has been deleted as it is now part of the state
    - `saving`: property has been deleted as it is now part of the state
* **cc-env-var-editor-json:** the properties have changed
    - `state`: new property containing the whole state
    - `variables`: property has been deleted as it is now part of the state
    - `parserOptions`: property has been deleted as it is now part of the state
* **cc-env-var-editor-expert:** the properties have changed
    - `state`: new property containing the whole state
    - `variables`: property has been deleted as it is now part of the state
    - `parserOptions`: property has been deleted as it is now part of the state
* **cc-env-var-editor-simple:** the properties have changed
    - `state`: new property containing the whole state
    - `variables`: property has been deleted as it is now part of the state
    - `mode`: property has been deleted as it is now part of the state
* **cc-env-var-create:** change property `mode` to `validationMode`
* **cc-article-list:** the properties have changed
    - `state`: new property containing the whole state
    - `articles`: property has been deleted as it is now part of the state
    - `error`: property has been deleted as it is now part of the state
* **cc-invoice-list:** the properties have changed
    - `state`: new property containing the whole state
    - `invoices`: property has been deleted as it is now part of the state
    - `error`: property has been deleted as it is now part of the state
* **cc-tile-instances:** the properties have changed
    - `state`: new property containing the whole state
    - `instances`: property has been deleted as it is now part of the state
    - `error`: property has been deleted as it is now part of the state
* **cc-invoice:** the properties have changed
    - `state`: new property containing the whole state
    - `invoice`: property has been deleted as it is now part of the state
    - `error`: property has been deleted as it is now part of the state
    - `number`: property has been deleted as it is now part of the state
* **cc-addon-linked-apps:** the properties have changed
    - `state`: new property containing the whole state
    - `applications`: property has been deleted as it is now part of the state
    - `error`: property has been deleted as it is now part of the state
* **cc-tile-deployments:** the properties have changed
    - `state`: new property containing the whole state
    - `deployments`: property has been deleted as it is now part of the state
    - `error`: property has been deleted as it is now part of the state
* **cc-grafana-info:** all properties have been merged into a new `state` property.
* **cc-jenkins-info:** all properties have been merged into a new `state` property.
* **cc-tile-status-codes:** the properties have changed
    - `state`: new property containing the whole state
    - `statusCodes`: property has been deleted as it is now part of the state
    - `error`: property has been deleted as it is now part of the state

### 🚀 Features

* add error event from `sendToApi` calls ([4ac5415](https://github.com/CleverCloud/clever-components/commit/4ac541519ff2c47fb70f1b84d8ade5832c24ccae)), closes [#956](https://github.com/CleverCloud/clever-components/issues/956)
* **cc-badge:** remove the `iconAccessibleName` prop & associated attribute ([6c322c3](https://github.com/CleverCloud/clever-components/commit/6c322c3d0b8b40655322afcaf34ffd65a31f760c))
* **cc-button:** remove the `accessibleName` prop & associated attribute ([8a7a0f0](https://github.com/CleverCloud/clever-components/commit/8a7a0f0cbe39bed7262df770eb09975556585f41))
* **cc-icon:** remove the `accessibleName` prop & associated attribute ([5e311d0](https://github.com/CleverCloud/clever-components/commit/5e311d0e76521cc4f4fe1f4ff1c922b67daf339f))
* **cc-img:** remove the `accessibleName` prop & associated attribute ([9019da7](https://github.com/CleverCloud/clever-components/commit/9019da713bcbb6bfcbdf9c8cd0dbbe05b34e5779))
* **cc-input-date:** adds label style customization ([f6433c3](https://github.com/CleverCloud/clever-components/commit/f6433c30ffbd4b7af9533c75ec0717b92afad55b)), closes [#888](https://github.com/CleverCloud/clever-components/issues/888)
* **cc-input-number:** adds label style customization ([e0702d8](https://github.com/CleverCloud/clever-components/commit/e0702d80c9828c2872879863429fbc86103f5e0d)), closes [#888](https://github.com/CleverCloud/clever-components/issues/888)
* **cc-input-text:** adds label style customization ([51fa2f4](https://github.com/CleverCloud/clever-components/commit/51fa2f411f48f56bc4b1aa21bab228b632402a20)), closes [#888](https://github.com/CleverCloud/clever-components/issues/888)
* **cc-loader:** add accessibleName property ([d69a36a](https://github.com/CleverCloud/clever-components/commit/d69a36a3e5fbe589cef9e31f871095f9ed3102ba)), closes [#870](https://github.com/CleverCloud/clever-components/issues/870)
* **cc-logs-control:** init component ([24e6768](https://github.com/CleverCloud/clever-components/commit/24e6768b4a42f66189657d56680e048155af26e9)), closes [#908](https://github.com/CleverCloud/clever-components/issues/908)
* **cc-logs-instance:** init component ([d87e87a](https://github.com/CleverCloud/clever-components/commit/d87e87a1621d2b9543943af407f2ee66e1c74cbe)), closes [#877](https://github.com/CleverCloud/clever-components/issues/877)
* **cc-popover:** remove the `accessibleName` prop & associated attribute ([4b47ebb](https://github.com/CleverCloud/clever-components/commit/4b47ebb64e37163b5b3f3487a319e8252e421ac4))
* **cc-product-card:** init component ([9b63536](https://github.com/CleverCloud/clever-components/commit/9b63536dd704ed8de5d2dc9ccf52ba9ad9205be4)), closes [#891](https://github.com/CleverCloud/clever-components/issues/891)
* **cc-select:** adds label style customization ([e0edcc0](https://github.com/CleverCloud/clever-components/commit/e0edcc0f76f5495b5c1878f2c20b90a7f629e55b)), closes [#888](https://github.com/CleverCloud/clever-components/issues/888)
* **cc-toggle:** adds label style customization ([1556ecc](https://github.com/CleverCloud/clever-components/commit/1556ecc49bb620280376767aba9b616e69b50705)), closes [#888](https://github.com/CleverCloud/clever-components/issues/888)


### 🐛 Bug Fixes

* **cc-badge:** use `iconA11yName` in `iconAccessibleName` getter/setter ([92af579](https://github.com/CleverCloud/clever-components/commit/92af579377aa7bf659ffae39412549ce6df85ecc)), closes [#934](https://github.com/CleverCloud/clever-components/issues/934)
* **smart-component:** protect from abortController nullity when smart component is disconnected ([c714dcd](https://github.com/CleverCloud/clever-components/commit/c714dcd095e3376de1b254b7338e77dbb9487cd3)), closes [#968](https://github.com/CleverCloud/clever-components/issues/968)


### 🛠 Code Refactoring

* **cc-addon-linked-apps:** migrate to the new smart component design ([69a999b](https://github.com/CleverCloud/clever-components/commit/69a999b9d38d4c43c5fed8f9984aed3dd563788c))
* **cc-article-list:** migrate to the new smart component design ([4711406](https://github.com/CleverCloud/clever-components/commit/4711406f02450cbcf629627592fd89d2a334cd02)), closes [#921](https://github.com/CleverCloud/clever-components/issues/921)
* **cc-env-var-create:** change property `mode` to `validationMode` ([264208b](https://github.com/CleverCloud/clever-components/commit/264208b8b8c8bff8f5180f7192040992f7eecda9))
* **cc-env-var-editor-expert:** rework properties to make impossible state impossible ([b3c26de](https://github.com/CleverCloud/clever-components/commit/b3c26de64be3247d47f87b32f9d1bf28936b34df)), closes [#926](https://github.com/CleverCloud/clever-components/issues/926)
* **cc-env-var-editor-json:** rework properties to make impossible state impossible ([901cfac](https://github.com/CleverCloud/clever-components/commit/901cfac772bfb58e47e1ea319fead5fdf32e7c62)), closes [#926](https://github.com/CleverCloud/clever-components/issues/926)
* **cc-env-var-editor-simple:** rework properties to make impossible state impossible ([201b8af](https://github.com/CleverCloud/clever-components/commit/201b8afafa460f493dec3ad66c04b7c5ae8118e6)), closes [#926](https://github.com/CleverCloud/clever-components/issues/926)
* **cc-env-var-form:** migrate to the new smart component design ([0425b6c](https://github.com/CleverCloud/clever-components/commit/0425b6c741e9b3bf5ae4d3c578763a9ad64e7042)), closes [#926](https://github.com/CleverCloud/clever-components/issues/926)
* **cc-env-var-linked-services:** rework properties to make impossible state impossible ([069f8cd](https://github.com/CleverCloud/clever-components/commit/069f8cda0358657c4c3399281f45c922be60670c)), closes [#926](https://github.com/CleverCloud/clever-components/issues/926)
* **cc-grafana-info:** migrate to the new smart component design ([9e404f6](https://github.com/CleverCloud/clever-components/commit/9e404f691e956a5b22328f5b4d7be29276b11462)), closes [#923](https://github.com/CleverCloud/clever-components/issues/923)
* **cc-invoice-list:** migrate to the new smart component design ([488d928](https://github.com/CleverCloud/clever-components/commit/488d928fe97be801f5eb17337339a4dd653e952d)), closes [#922](https://github.com/CleverCloud/clever-components/issues/922)
* **cc-invoice:** migrate to the new smart component design ([2e9764e](https://github.com/CleverCloud/clever-components/commit/2e9764eb43719e936382494daba573e63998e93d)), closes [#920](https://github.com/CleverCloud/clever-components/issues/920)
* **cc-jenkins-info:** migrate to the new smart component design ([6228419](https://github.com/CleverCloud/clever-components/commit/622841957e7b775c3747b7542159031fc7f05be8)), closes [#925](https://github.com/CleverCloud/clever-components/issues/925)
* **cc-tile-deployments:** rework properties to make impossible state impossible ([45e9a96](https://github.com/CleverCloud/clever-components/commit/45e9a96080cb152a356002b4abdaec6519788373)), closes [#942](https://github.com/CleverCloud/clever-components/issues/942)
* **cc-tile-instances:** rework properties to make impossible state impossible ([e469f81](https://github.com/CleverCloud/clever-components/commit/e469f811f082352995c48f51f596b00ad40aa75f))
* **cc-tile-status-codes:** migrate to the new smart component design ([fc5dc71](https://github.com/CleverCloud/clever-components/commit/fc5dc7142c119ea9abd5d6693465f9192ff81024)), closes [#924](https://github.com/CleverCloud/clever-components/issues/924)

## [12.0.0](https://github.com/CleverCloud/clever-components/compare/11.2.1...12.0.0) (2023-12-18)


### ⚠ BREAKING CHANGES

* **cc-header-orga:** check the `HeaderOrgaState` type to adapt your code to the new state API.
* **cc-img:** replace prop text by accessibleName

### 🚀 Features

* **cc-ansi-palette:** init component ([9b01309](https://github.com/CleverCloud/clever-components/commit/9b0130916883ca4d281a18fac50b7ca3bfab3e07)), closes [#883](https://github.com/CleverCloud/clever-components/issues/883)
* **cc-badge:** deprecate `icon-accessible-name` in favor of `icon-a11y-name` ([8b25182](https://github.com/CleverCloud/clever-components/commit/8b251825c27e28009068d8fcfc4f188a033473f6)), closes [#893](https://github.com/CleverCloud/clever-components/issues/893)
* **cc-button:** deprecate `accessible-name` in favor of `a11y-name` ([8ceaab5](https://github.com/CleverCloud/clever-components/commit/8ceaab5684be2eab18d0a15d48a1cf46eda9076d)), closes [#893](https://github.com/CleverCloud/clever-components/issues/893)
* **cc-button:** implement parts of ARIA API ([014c592](https://github.com/CleverCloud/clever-components/commit/014c592f879aa879520cc0ba0e6619c628fc5b82)), closes [#699](https://github.com/CleverCloud/clever-components/issues/699)
* **cc-header-orga:** add a `footer` slot  and small design tweaks ([dfb4624](https://github.com/CleverCloud/clever-components/commit/dfb462449fb61a72020e3fdd066a664ab29b4ae2)), closes [#869](https://github.com/CleverCloud/clever-components/issues/869)
* **cc-header-orga:** rework state and types ([727d2f9](https://github.com/CleverCloud/clever-components/commit/727d2f91fad64a6ea46c76e8fb869fbd8f7e52c0)), closes [#884](https://github.com/CleverCloud/clever-components/issues/884)
* **cc-icon:** deprecate `accessible-name` in favor of `a11y-name` ([12e2e73](https://github.com/CleverCloud/clever-components/commit/12e2e73bc9e4a2c0a922f5a5c8f8e13096b87eff)), closes [#893](https://github.com/CleverCloud/clever-components/issues/893)
* **cc-img:** deprecate `accessible-name` in favor of `a11y-name` ([fa2e860](https://github.com/CleverCloud/clever-components/commit/fa2e8605c82b942be48680744b6e520d2fe2d5f0)), closes [#893](https://github.com/CleverCloud/clever-components/issues/893)
* **cc-input-date:** init component ([40c978b](https://github.com/CleverCloud/clever-components/commit/40c978b89d16e275efbe9b1e000235df5c826cd3)), closes [#842](https://github.com/CleverCloud/clever-components/issues/842)
* **cc-logs:** init ([f83a784](https://github.com/CleverCloud/clever-components/commit/f83a7841e01e5359dfa0324fcb547eaf682897b1)), closes [#697](https://github.com/CleverCloud/clever-components/issues/697)
* **cc-popover:** deprecate `accessible-name` in favor of `a11y-name` ([a41f5a1](https://github.com/CleverCloud/clever-components/commit/a41f5a1242a54390015350e5e7c7ac905c3d2692)), closes [#893](https://github.com/CleverCloud/clever-components/issues/893)
* **cc-popover:** init component ([0887067](https://github.com/CleverCloud/clever-components/commit/088706780d467b87d6b4d1790c87392d0bf1b757)), closes [#829](https://github.com/CleverCloud/clever-components/issues/829)
* **i18n:** add the ability to specify minimum and maximum fraction digits when formating number ([e101776](https://github.com/CleverCloud/clever-components/commit/e101776ecabde9e498a0b2f91a1e61471880e3d6))


### 🐛 Bug Fixes

* **cc-header-orga:** hide initials from screen readers ([8196779](https://github.com/CleverCloud/clever-components/commit/8196779c0710c7bb902025325b063bb7a9de6585)), closes [#885](https://github.com/CleverCloud/clever-components/issues/885)
* **cc-header-orga:** trim orga name in case it starts with spaces ([cdd6b04](https://github.com/CleverCloud/clever-components/commit/cdd6b048391bb4a0ca0b699def73aca80cd65d09)), closes [#886](https://github.com/CleverCloud/clever-components/issues/886)
* **cc-img:** populate `alt` value ([a5d2d2b](https://github.com/CleverCloud/clever-components/commit/a5d2d2b988666ca8da92c114b1944a2e7bfc7f09)), closes [#726](https://github.com/CleverCloud/clever-components/issues/726)
* **cc-toggle:** fix extra margin on top of cc-toggle when legend is inlined and when inside a grid ([a59ba34](https://github.com/CleverCloud/clever-components/commit/a59ba346952e855556471ce92f10a8ac6160d95e)), closes [#896](https://github.com/CleverCloud/clever-components/issues/896)
* **i18n-sanitize:** handle cases where origin equals empty string ([0852482](https://github.com/CleverCloud/clever-components/commit/08524828ee7db03b36297a7713e9e25ed1da07cd)), closes [#906](https://github.com/CleverCloud/clever-components/issues/906)


### 🛠 Code Refactoring

* **cc-img:** replace prop text by accessibleName ([c8586f9](https://github.com/CleverCloud/clever-components/commit/c8586f91231758b2325bedae4513cdd25f4ec8cd))

## [11.2.1](https://github.com/CleverCloud/clever-components/compare/11.2.0...11.2.1) (2023-10-19)


### Bug Fixes

* **cc-article-list:** fix broken XML with the new website ([0319784](https://github.com/CleverCloud/clever-components/commit/03197842097c25a4226184ae99469a9ab1bd76fe)), closes [#867](https://github.com/CleverCloud/clever-components/issues/867)
* **cc-icon:** improve SVG aria attributes behavior ([e8645f7](https://github.com/CleverCloud/clever-components/commit/e8645f7734b0c34269ddb5f8f30d8f2c590d204d)), closes [#770](https://github.com/CleverCloud/clever-components/issues/770)

## [11.2.0](https://github.com/CleverCloud/clever-components/compare/11.1.0...11.2.0) (2023-10-11)


### Features

* add component dependencies/dependants CLI ([903d1b9](https://github.com/CleverCloud/clever-components/commit/903d1b940d650ff504274d2065db07a6733297f1)), closes [#806](https://github.com/CleverCloud/clever-components/issues/806)
* **cem:** add dependencies/dependants graph to the components description ([ac63307](https://github.com/CleverCloud/clever-components/commit/ac63307c1bb8a14ecf7cdc82b54f4a2ea5b0f816)), closes [#826](https://github.com/CleverCloud/clever-components/issues/826)


### Bug Fixes

* **cc-pricing-product:** filter addon plans without zones ([9247f35](https://github.com/CleverCloud/clever-components/commit/9247f35bf5e63da9c19284f4dfca979bd3d887d6)), closes [#858](https://github.com/CleverCloud/clever-components/issues/858)
* **cc-select:** reflect name attribute on the native `&lt;select&gt;` element ([f244497](https://github.com/CleverCloud/clever-components/commit/f24449704759366da62caf720049358906b2772e)), closes [#581](https://github.com/CleverCloud/clever-components/issues/581)
* **cc-toggle:** add `name` attribute ([2d971a9](https://github.com/CleverCloud/clever-components/commit/2d971a956031ed5ad7c4033213a2855ba41fb5e3)), closes [#581](https://github.com/CleverCloud/clever-components/issues/581)

## [11.1.0](https://github.com/CleverCloud/clever-components/compare/11.0.0...11.1.0) (2023-09-19)


### Features

* **cc-pricing-product:** add translations for `dedicated` and `is-migratable` features ([ae2a95d](https://github.com/CleverCloud/clever-components/commit/ae2a95d818d7a9281fa9ab23cde1ee847bd5dbd8)), closes [#804](https://github.com/CleverCloud/clever-components/issues/804)


### Bug Fixes

* **cc-pricing-header:** add error state ([ee06075](https://github.com/CleverCloud/clever-components/commit/ee06075b1ab9187fd83c2edb4bba8c934a2d32ab)), closes [#470](https://github.com/CleverCloud/clever-components/issues/470)
* **cc-tile-metrics:** add missing plugin import for chat.js ([0343b4d](https://github.com/CleverCloud/clever-components/commit/0343b4d5aa01b8ad6f3c4a57ede819b318b206d0)), closes [#822](https://github.com/CleverCloud/clever-components/issues/822)
* **tests:** add another resize loop error message to the ignore list ([b3010a4](https://github.com/CleverCloud/clever-components/commit/b3010a47623f7006603ed8445c9bccf580998e3e)), closes [#821](https://github.com/CleverCloud/clever-components/issues/821)

## [11.0.0](https://github.com/CleverCloud/clever-components/compare/10.5.0...11.0.0) (2023-07-18)


### ⚠ BREAKING CHANGES

* **cc-pricing-product:** the component now displays features that have no translations registered as long as they have a `name` property. Make sure you filter out unwanted features using the `addonFeatures` (smart component usage) or `productFeatures` prop (directly set on the `cc-pricing-product` component). See the related issue for more info.
* **cc-addon-encryption-at-rest-option:** The `price` in the `options` property is no more needed on components:
    - cc-addon-elasticsearch-options
    - cc-addon-jenkins-options
    - cc-addon-mongodb-options
    - cc-addon-mysql-options
    - cc-addon-postgresql-options
    - cc-addon-redis-options
* **cc-error:** remove component
* **cc-addon-admin:** change `error` property from an enum to a boolean.
* **cc-addon-credentials:** the `icon` property is now `image`. It still requires a URL.
* **cc-block:** the `icon` property now requires an icon object instead of a URL. If you want to pass a URL nevertheless, use the new `image` property instead.
* **cc-badge:** the `icon-alt` property is now `icon-accessible-name`.
* **cc-badge:** the `icon-src` property is now `icon` and requires an icon object instead of a URL.
* **cc-icon:** `IconModel` interface should be imported from `src/components/common.types.d.ts` file and not `src/components/cc-icon/cc-icon.types.d.ts` file anymore.
* **cc-flex-gap:** remove component
* **cc-tile-consumption:** remove component
* **cc-action-dispatcher:** remove component
* **cc-pricing-page:** We needed to be able to style and move the pricing components inside the `cc-pricing-page` component a lot more. For instance, the `cc-pricing-header` can now be positioned wherever one wants within the `cc-pricing-page` because everything is slotted within the `cc-pricing-page`. The smart `cc-pricing-page` smart component was mainly interacting with `cc-pricing-header` data (fetching `zones`). This is why we removed the `cc-pricing-page.smart` part and added a `cc-pricing-header.smart`.
* **cc-pricing-estimation:** see more details below
    - add new way of handling the component state and passing data to the component.
    - use the new smart API.
* **cc-pricing-header:** see more details below
    - add new way of handling the component state and passing data to the component.
    - use the new smart API.
    - add a temporality selector component.
* **cc-pricing-product-consumption:** see more details below
    - add new way of handling the component state and passing data to the component.
    - the smart component now uses the new smart API.
    - remove the slots for heading, description and image.
* **cc-pricing-table:** The `cc-pricing-table` component has been merged into the `cc-pricing-product` component.
* **cc-pricing-product:** see details below
    - add new way of handling the component state and passing data to the component.
    - remove the heading, desc and image/logo slots.
    - use the new smart API.
    - directly render a table within the component instead of relying on a
     `cc-pricing-table` sub-component to do so.
    - merge the `cc-pricing-table` component and stories into `cc-pricing-product`.

### Features

* add missing notice a11y translations ([9957264](https://github.com/CleverCloud/clever-components/commit/9957264ea00e16bd10103d89867300fa6c07502e))
* **cc-action-dispatcher:** remove component ([879bc30](https://github.com/CleverCloud/clever-components/commit/879bc30d2ecea40fdba67748f30a901a7dd44ff2))
* **cc-addon-admin:** make use of the cc-notice instead of cc-error ([c22a4cc](https://github.com/CleverCloud/clever-components/commit/c22a4cc7291ea857c8df6070ce9f4897aea0ee35))
* **cc-addon-backups:** implement `cc-icon` ([0097bed](https://github.com/CleverCloud/clever-components/commit/0097bedbd37fab6b9ce4d03e8c56d84752f21072))
* **cc-addon-backups:** make use of the cc-notice instead of cc-error ([422815c](https://github.com/CleverCloud/clever-components/commit/422815cbd6297a76875082ab22e967a067b96cae))
* **cc-addon-credentials:** make use of the cc-notice instead of cc-error ([7b8e4c3](https://github.com/CleverCloud/clever-components/commit/7b8e4c3a387aa15c5b44fb96dddfaddf6ddef913))
* **cc-addon-credentials:** rename `icon` property to `image` ([1d0655a](https://github.com/CleverCloud/clever-components/commit/1d0655a6a3b2bee8dce8cc431d9616bedb46f65b))
* **cc-addon-elasticsearch-options:** replace error message to get rid of cc-error ([884a7ad](https://github.com/CleverCloud/clever-components/commit/884a7ad9a0e40e5ae7f7640fb605215a23756c92))
* **cc-addon-encryption-at-rest-option:** implement `cc-icon` ([629806c](https://github.com/CleverCloud/clever-components/commit/629806cd472cdba610ee028d3280326b90b6dac5))
* **cc-addon-encryption-at-rest-option:** Remove pricing notice on addon encryption at rest option ([ff4b89b](https://github.com/CleverCloud/clever-components/commit/ff4b89b043d1f80f6a85b7cc41e8ff12d0c9c911)), closes [#809](https://github.com/CleverCloud/clever-components/issues/809)
* **cc-addon-encryption-at-rest-option:** replace error message to get rid of cc-error ([137b7e9](https://github.com/CleverCloud/clever-components/commit/137b7e92ad60b7520eef02ad1de4a878a2261876))
* **cc-addon-features:** implement `cc-icon` ([14e6c28](https://github.com/CleverCloud/clever-components/commit/14e6c28d2418d2869921f4a7f2af9d891702da65))
* **cc-addon-features:** make use of the cc-notice instead of cc-error ([14a4495](https://github.com/CleverCloud/clever-components/commit/14a4495b7026b8c1c5a76faf4bed1e63a0116cdf))
* **cc-addon-jenkins-options:** get rid of cc-error ([b0b92c0](https://github.com/CleverCloud/clever-components/commit/b0b92c0c8adf62ad7c367f3c5ba500a8f77d994b))
* **cc-addon-linked-apps:** make use of the cc-notice instead of cc-error ([34caaf9](https://github.com/CleverCloud/clever-components/commit/34caaf9cef342ec4906ee857e7696390a51d32cf))
* **cc-addon-mongodb-options:** get rid of cc-error ([e4e1c77](https://github.com/CleverCloud/clever-components/commit/e4e1c7733c385eb80734d7d3afc2f1a7a4e9a76d))
* **cc-addon-mysql-options:** get rid of cc-error ([b5db7c1](https://github.com/CleverCloud/clever-components/commit/b5db7c1ac742c910df14dcf34d976724d3dfb1cb))
* **cc-addon-option-form:** add style for the addon components error message ([e88ec63](https://github.com/CleverCloud/clever-components/commit/e88ec633a385d4970b394b2e863c60d6033a6274))
* **cc-addon-option-form:** properly pass new `cc-addon-option` icon property ([fc76583](https://github.com/CleverCloud/clever-components/commit/fc7658341b36ac38ec60888c06bf724a9fa1da0e))
* **cc-addon-option:** add `icon` property to receive an IconModel ([b72e0b5](https://github.com/CleverCloud/clever-components/commit/b72e0b572185aadd11e9fcd62f8186bf976280a6))
* **cc-addon-option:** replace error message to get rid of cc-error ([b928866](https://github.com/CleverCloud/clever-components/commit/b9288664d7aa0d1856bcda480fa71de03ea30652))
* **cc-addon-postgresql-options:** get rid of cc-error ([144db10](https://github.com/CleverCloud/clever-components/commit/144db108ebadfdaa2b6c9f114474be0aeea4dffe))
* **cc-addon-redis-options:** get rid of cc-error ([727be87](https://github.com/CleverCloud/clever-components/commit/727be87de0c8e39c30aca67a0a4e8f194921f4a6))
* **cc-article-list:** make use of the cc-notice instead of cc-error ([4e8f1cd](https://github.com/CleverCloud/clever-components/commit/4e8f1cde97dcc0bab2ef3a6aa48ee5052b0463f7))
* **cc-badge:** rename `iconAlt` property to `iconAccessibleName` ([eb4494b](https://github.com/CleverCloud/clever-components/commit/eb4494b996d846232a9b63ba0c9d2908b91c7fbf))
* **cc-badge:** use `cc-icon` instead of `cc-img` ([b48032d](https://github.com/CleverCloud/clever-components/commit/b48032d6f9c2249bd9283cf26d0202bb84bbc92f))
* **cc-block:** get rid of overlay error story ([9cf782e](https://github.com/CleverCloud/clever-components/commit/9cf782e2d555465096931c8d5affd4b1f7926241))
* **cc-block:** implement `cc-icon` ([4f06188](https://github.com/CleverCloud/clever-components/commit/4f06188467f644c36013ff2eb64819b706af4ee8))
* **cc-block:** rename `icon` property to `image` and add `icon` property to receive an IconModel ([51e9bf9](https://github.com/CleverCloud/clever-components/commit/51e9bf95bb54d023dc6c646f37be1e12f6adfff8))
* **cc-doc-list:** make use of the cc-notice instead of cc-error ([0357ca2](https://github.com/CleverCloud/clever-components/commit/0357ca2d2b8f24962a75875b23a3d6718f6659c2))
* **cc-elasticsearch-info:** implement `cc-icon` ([12828bb](https://github.com/CleverCloud/clever-components/commit/12828bbe18822ae5996e03f955458f4828a03ffa))
* **cc-elasticsearch-info:** make use of the cc-notice instead of cc-error ([5ec6767](https://github.com/CleverCloud/clever-components/commit/5ec67679ec0b31946c45c8ac37858e82f42729a2))
* **cc-email-list:** implement `cc-icon` ([8619af3](https://github.com/CleverCloud/clever-components/commit/8619af3d5d00f6937515d9daa7d4366a90a82292))
* **cc-email-list:** make use of the cc-notice instead of cc-error ([46624bb](https://github.com/CleverCloud/clever-components/commit/46624bb68d411090229ec1e21266e41c5590f57b))
* **cc-env-var-create:** make use of the cc-notice instead of cc-error ([524d523](https://github.com/CleverCloud/clever-components/commit/524d523cfb43054456b937757878a858a74ac6cb))
* **cc-env-var-editor-expert:** make use of the cc-notice instead of cc-error ([37d8721](https://github.com/CleverCloud/clever-components/commit/37d87219a525749df0ea8123a92334a57d286c87))
* **cc-env-var-editor-json:** make use of the cc-notice instead of cc-error ([3120d93](https://github.com/CleverCloud/clever-components/commit/3120d93f18e0687667af1ea5b702d4b49b99f571))
* **cc-env-var-form:** make use of the cc-notice instead of cc-error ([c5e2594](https://github.com/CleverCloud/clever-components/commit/c5e25944012311fb4d90485a3b2dc36a3fe880cd))
* **cc-env-var-linked-services:** make use of the cc-notice instead of cc-error ([3676829](https://github.com/CleverCloud/clever-components/commit/36768292de8dbf74c02d7c9b66d0d92bd1afb015))
* **cc-error:** implement `cc-icon` ([205265d](https://github.com/CleverCloud/clever-components/commit/205265d0d5fa40c4ff834e13aa7278b44141bf94))
* **cc-error:** remove component ([b642530](https://github.com/CleverCloud/clever-components/commit/b642530bf93dcb39867e7356539d83b8099fee21))
* **cc-flex-gap:** remove component ([cb9f24c](https://github.com/CleverCloud/clever-components/commit/cb9f24cae55643e340ed92e254f83f90c753ff13))
* **cc-grafana-info:** implement `cc-icon` ([285af26](https://github.com/CleverCloud/clever-components/commit/285af26e5724985d4d6948b7cb83744d24987792))
* **cc-grafana-info:** make use of the cc-notice instead of cc-error ([0f424fd](https://github.com/CleverCloud/clever-components/commit/0f424fd3e73705e7403f39e83e98475bde9e79b1))
* **cc-header-addon:** make use of the cc-notice instead of cc-error ([f8574f9](https://github.com/CleverCloud/clever-components/commit/f8574f92b28e2df3a2b989ba4a08f5ab5a909316))
* **cc-header-app:** implement `cc-icon` ([3863243](https://github.com/CleverCloud/clever-components/commit/38632432e74ef4f718e8aff178f1c326727eded6))
* **cc-header-app:** make use of the cc-notice instead of cc-error ([d6c423a](https://github.com/CleverCloud/clever-components/commit/d6c423adba9325349015e04b4ea721a280bc6079))
* **cc-header-orga:** implement `cc-icon` ([eb3980a](https://github.com/CleverCloud/clever-components/commit/eb3980a07352403c999d231f905cbd94fcb2d037))
* **cc-header-orga:** make use of the cc-notice instead of cc-error ([3cd3b72](https://github.com/CleverCloud/clever-components/commit/3cd3b7228b8a42f66337a29859e90b3d76c9bf64))
* **cc-heptapod-info:** make use of the cc-notice instead of cc-error ([e475cc6](https://github.com/CleverCloud/clever-components/commit/e475cc6291331c3b3b26d66d55fd7942384e6bb9))
* **cc-icon:** delete unused legacy icons and update documentation ([df98f26](https://github.com/CleverCloud/clever-components/commit/df98f26f30b29438d7627d262ed20aaad7f9b835))
* **cc-input-number:** implement `cc-icon` ([a26c6c2](https://github.com/CleverCloud/clever-components/commit/a26c6c22ac203312c272827211511aa5aceab807))
* **cc-input-text:** implement `cc-icon` ([158c19e](https://github.com/CleverCloud/clever-components/commit/158c19e1a3457f62e6d768fa2679d25782db2593))
* **cc-invoice-list:** make use of the cc-notice instead of cc-error ([aceb9cc](https://github.com/CleverCloud/clever-components/commit/aceb9cc84cc0d52b4cd7ff99bc721b5eab419403))
* **cc-invoice-table:** implement `cc-icon` ([2296126](https://github.com/CleverCloud/clever-components/commit/22961262b221395a33353157ae8aca951409ebd9))
* **cc-invoice:** implement `cc-icon` ([e5d4b44](https://github.com/CleverCloud/clever-components/commit/e5d4b448aef2ae0e6febe5cbe75fb666212293d7))
* **cc-invoice:** make use of the cc-notice instead of cc-error ([59534d8](https://github.com/CleverCloud/clever-components/commit/59534d805781a92055e00e80f226ce516367073c))
* **cc-jenkins-info:** implement `cc-icon` ([3cebef0](https://github.com/CleverCloud/clever-components/commit/3cebef05759d8a80278d46700f5082afbf9ff45a))
* **cc-jenkins-info:** make use of the cc-notice instead of cc-error ([88429b0](https://github.com/CleverCloud/clever-components/commit/88429b005881c971d1c91837c2b9adf9bc01694c))
* **cc-map:** make use of the cc-notice instead of cc-error ([380baf3](https://github.com/CleverCloud/clever-components/commit/380baf3f99d23ae6c48d0a529c110f7e38ba441d))
* **cc-matomo-info:** implement `cc-icon` ([489e35d](https://github.com/CleverCloud/clever-components/commit/489e35d6ce661c202122eef2fa3cc6909f0d8eb4))
* **cc-matomo-info:** make use of the cc-notice instead of cc-error ([8e4a0f0](https://github.com/CleverCloud/clever-components/commit/8e4a0f0d00bc559f5b69e0e933b46af041e76993))
* **cc-notice:** implement `cc-icon` ([fac4c73](https://github.com/CleverCloud/clever-components/commit/fac4c735672e143392c0a7cb05f39aefa8567a64))
* **cc-orga-member-card:** implement `cc-icon` ([8951bdf](https://github.com/CleverCloud/clever-components/commit/8951bdfb1858dbfb163e6dffc2d1ce952e705957))
* **cc-orga-member-card:** make use of the cc-notice instead of cc-error ([44af4b1](https://github.com/CleverCloud/clever-components/commit/44af4b153db3de83e528390073d09ef1b5ae15fe))
* **cc-orga-member-list:** make use of the cc-notice instead of cc-error ([0380c1b](https://github.com/CleverCloud/clever-components/commit/0380c1befe8c9296f28d56f8a54780829499a58d))
* **cc-overview:** add error story overview stories ([7d3b06e](https://github.com/CleverCloud/clever-components/commit/7d3b06eeb80f5ea868258af929b0b892eb64f3d0))
* **cc-pricing-estimation:** display non translated features ([b7b1093](https://github.com/CleverCloud/clever-components/commit/b7b10934d7d6549894d513bfa3147030aaa5b13a)), closes [#796](https://github.com/CleverCloud/clever-components/issues/796)
* **cc-pricing-estimation:** update component styles and behavior ([3d85f83](https://github.com/CleverCloud/clever-components/commit/3d85f8328be7b4542fcec85cdc254669e1a0f5ee))
* **cc-pricing-header:** update component styles, smart and state ([46022fa](https://github.com/CleverCloud/clever-components/commit/46022fa86c6930977a3aea0006563831e9ba8f17))
* **cc-pricing-page stories:** add fake product to the stories ([2404aff](https://github.com/CleverCloud/clever-components/commit/2404aff2c8b69494a7bd95733c6e77c919cc4896))
* **cc-pricing-page:** update styles and behavior, remove smart ([68f4d67](https://github.com/CleverCloud/clever-components/commit/68f4d671002bb0d3c947c07c4e647d939e675c4b))
* **cc-pricing-product-consumption:** make use of the new cc-notice instead of cc-error ([a474a28](https://github.com/CleverCloud/clever-components/commit/a474a2865a82646077df7e113b1eb1e08ae95d2c))
* **cc-pricing-product-consumption:** rework assets ([b55f737](https://github.com/CleverCloud/clever-components/commit/b55f73762dfffda20882de2ed35c3731af1f67e2))
* **cc-pricing-product-consumption:** update styles, smart, and state ([cce27e2](https://github.com/CleverCloud/clever-components/commit/cce27e2e28fc14864d637665a7477ebeb38c19c0))
* **cc-pricing-product:** display non translated features ([24ec318](https://github.com/CleverCloud/clever-components/commit/24ec3189873ecf4fe0fee9d0bebd5cf0592319fc)), closes [#796](https://github.com/CleverCloud/clever-components/issues/796)
* **cc-pricing-product:** make use of the cc-notice instead of cc-error ([92b6f24](https://github.com/CleverCloud/clever-components/commit/92b6f24f0166bc25de5de9ec06525146f30345a9))
* **cc-pricing-product:** update styles, smart, and state ([5b79751](https://github.com/CleverCloud/clever-components/commit/5b79751a85137067074693fbbb6eb09c33c96b9d))
* **cc-ssh-key-list:** make use of the cc-notice instead of cc-error ([496d77d](https://github.com/CleverCloud/clever-components/commit/496d77df7d7bc254aca74d02e3548476907adbbd))
* **cc-tcp-redirection-form:** make use of the cc-notice instead of cc-error ([acc2a67](https://github.com/CleverCloud/clever-components/commit/acc2a67c729c893dc0c5b098cbc873e9bf7d997f))
* **cc-tcp-redirection:** implement `cc-icon` ([ec31ed4](https://github.com/CleverCloud/clever-components/commit/ec31ed465224fe01af1cac646dfff675cd3c5579))
* **cc-tile-consumption:** remove component ([e7a859f](https://github.com/CleverCloud/clever-components/commit/e7a859fd1c94fb0114392845b7c221a466190f85))
* **cc-tile-deployments:** replace error message to get rid of cc-error ([dd10c2a](https://github.com/CleverCloud/clever-components/commit/dd10c2a7c336f68f34d692f0a9031736fdcfea5c))
* **cc-tile-instances:** implement `cc-icon` ([ec67cf3](https://github.com/CleverCloud/clever-components/commit/ec67cf355cfede1cf8a165a6cbf7bb6613a692ea))
* **cc-tile-instances:** replace error message to get rid of cc-error ([42eacab](https://github.com/CleverCloud/clever-components/commit/42eacab913f00dbe5d1397c06564f68797a76ca9))
* **cc-tile-metrics:** implement `cc-icon` ([8450410](https://github.com/CleverCloud/clever-components/commit/8450410cbfdcf6bdc2c59c6c5358592f778ae529))
* **cc-tile-metrics:** replace error message to get rid of cc-error ([4482990](https://github.com/CleverCloud/clever-components/commit/448299075107b0acf19b3a88d20ee17c7fa8de06))
* **cc-tile-requests:** implement `cc-icon` ([73e98d6](https://github.com/CleverCloud/clever-components/commit/73e98d650471fbbcf35b2b7c9a4490bb8a1f0033))
* **cc-tile-requests:** replace error message to get rid of cc-error ([c76a297](https://github.com/CleverCloud/clever-components/commit/c76a297b7e901a0168339300aa92ff3340fea3bb))
* **cc-tile-scalability:** replace error message to get rid of cc-error ([4567dcf](https://github.com/CleverCloud/clever-components/commit/4567dcfe18e86251f5909a309520e8a13b7c8a6a))
* **cc-tile-status-codes:** implement `cc-icon` ([44a26b7](https://github.com/CleverCloud/clever-components/commit/44a26b77e2b84f986d2eeda9e5489d916f625b6c))
* **cc-tile-status-codes:** replace error message to get rid of cc-error ([2318d0b](https://github.com/CleverCloud/clever-components/commit/2318d0bb84f8e64afa6f4eeb67a6d4b653c8caef))
* **cc-toaster:** implement `cc-icon` ([29c03d9](https://github.com/CleverCloud/clever-components/commit/29c03d94f49154c3fd3fa797a44bb1c775860b2a))
* **cc-toast:** implement `cc-icon` ([3386f32](https://github.com/CleverCloud/clever-components/commit/3386f32ddaae7d0b3772d63da3ad12f8374f1286))
* **cc-zone-input:** make use of the cc-notice instead of cc-error ([73e44a1](https://github.com/CleverCloud/clever-components/commit/73e44a18f12a23e23c1dc1739733c30ddfe748ad))
* **cc-zone:** add new styling options for zone tags ([1d091b0](https://github.com/CleverCloud/clever-components/commit/1d091b043a90a144716dbf3df2ac54d555f86a01))
* **cc-zone:** remove `cc-flex-gap` ([64ab365](https://github.com/CleverCloud/clever-components/commit/64ab36506111825b88561560f93dcc5d71853882))
* **tokens:** add `--cc-border-radius-default` and use it when relevant ([a9f344a](https://github.com/CleverCloud/clever-components/commit/a9f344a7c4d1872becbb4c657d184fbab5dfcdfc))
* **tokens:** add `--cc-border-radius-small` and use it when relevant ([c321b79](https://github.com/CleverCloud/clever-components/commit/c321b793df736e85ecfc40fa8f7d11c4a1132129))
* **tokens:** add `--cc-color-border-neutral-disabled` and use it when relevant ([3034296](https://github.com/CleverCloud/clever-components/commit/3034296cc3916df6602ea69f666dde1523507322))
* **tokens:** add `--cc-color-border-neutral-focused` and use it when relevant ([593fe51](https://github.com/CleverCloud/clever-components/commit/593fe512359c86fd66ed366cf7a1b67feff3e925))
* **tokens:** add `--cc-color-border-neutral-hovered` and use it when relevant ([8445e1b](https://github.com/CleverCloud/clever-components/commit/8445e1b1e1f196163ec522b5aa72f87a93e271bd))
* **tokens:** add `--cc-color-border-neutral-strong` and use it when relevant ([03aed66](https://github.com/CleverCloud/clever-components/commit/03aed66d24b7a9ffb4c9eef6e4f83521613319b3))
* **tokens:** add `--cc-color-border-neutral-weak` and use it when relevant ([07fa2a6](https://github.com/CleverCloud/clever-components/commit/07fa2a60e8a356e00dcbd17c2f881fa4a6e9a960))
* **tokens:** add `--cc-color-border-neutral` and use it when relevant ([8021678](https://github.com/CleverCloud/clever-components/commit/802167813deac3d3c9d23c85ef90b0fd77847164))


### Bug Fixes

* **cc-block:** fix close button title ([50c8b46](https://github.com/CleverCloud/clever-components/commit/50c8b46fe9983bcaf25dafb74f45ec100da9e1a5)), closes [#721](https://github.com/CleverCloud/clever-components/issues/721)
* **cc-button:** apply proper opacity value on `cc-icon` in circle mode and loading state ([95d4187](https://github.com/CleverCloud/clever-components/commit/95d418723e7e8db70e1053e9e04ecbdc860017e4))
* **cc-email-list:** fix sample domain name ([2d6f6e4](https://github.com/CleverCloud/clever-components/commit/2d6f6e432c247c06cc2ce78a92a8167669a05e50)), closes [#642](https://github.com/CleverCloud/clever-components/issues/642)
* **cc-env-var-form:** fix textarea cropped focus outline ([f405788](https://github.com/CleverCloud/clever-components/commit/f405788e0b5add5d0c4c25409fe4c940b174fe40)), closes [#739](https://github.com/CleverCloud/clever-components/issues/739)
* **cc-input-*:** use `--cc-color-bg-neutral-readonly` when relevant ([22bbc9c](https://github.com/CleverCloud/clever-components/commit/22bbc9c9dd4d9798747321456e2d5e9465c1b27f)), closes [#511](https://github.com/CleverCloud/clever-components/issues/511)
* **cc-invoice:** move `&lt;template&gt;` inside `unsafeHTML` expression ([92b20ec](https://github.com/CleverCloud/clever-components/commit/92b20ec64f5fb425f259eb04d4e812515c1dfcef)), closes [#784](https://github.com/CleverCloud/clever-components/issues/784)
* **cc-pricing-page dollar story:** fix dollar currency not being set properly ([280c410](https://github.com/CleverCloud/clever-components/commit/280c410b841895288a8ac47295a94a9523feb7be))
* **cc-pricing-product-consumption:** add visible labels and legends ([4824ffb](https://github.com/CleverCloud/clever-components/commit/4824ffb4268fd65e6ccf4b96a4465521aa82057b)), closes [#561](https://github.com/CleverCloud/clever-components/issues/561)
* **cc-pricing-product:** update boolean i18n argument to match the expected parameter ([c919e70](https://github.com/CleverCloud/clever-components/commit/c919e70fdd44bac04acdef723498ea362329bdac))
* **default-theme:** add missing line break, reorder tokens and update doc ([816d0db](https://github.com/CleverCloud/clever-components/commit/816d0db358a4dd3a465147f5777e0c279e4207c8))
* **English translations:** change temporality translation ([b08f568](https://github.com/CleverCloud/clever-components/commit/b08f56895d9f7df0ff885e3e1600dab25583739c))
* issue in Custom Element Manifest generation when detecting [@typedef](https://github.com/typedef) imports ([2d1ab38](https://github.com/CleverCloud/clever-components/commit/2d1ab38ebbe880dcb4f103151a155e41a54e7c3a)), closes [#737](https://github.com/CleverCloud/clever-components/issues/737)


### Miscellaneous Chores

* **cc-pricing-table:** remove component ([157bd7a](https://github.com/CleverCloud/clever-components/commit/157bd7a829c016d638e69dbcc3a9f40bb419fc71))


### Code Refactoring

* **cc-icon:** refactor `IconModel` interface to `common.types.d.ts` ([89a6409](https://github.com/CleverCloud/clever-components/commit/89a640982386a6aef1b80c1e2f08539f52687739))

## [10.5.0](https://github.com/CleverCloud/clever-components/compare/10.4.0...10.5.0) (2023-03-17)


### Features

* **cc-overview:** add cc-tile-metrics to the app-mode story ([e710e61](https://github.com/CleverCloud/clever-components/commit/e710e61132f145655ea22515800e682e35670c1d)), closes [#722](https://github.com/CleverCloud/clever-components/issues/722)
* **cc-zone:** add infra if any to the getText() static method ([e0cfacb](https://github.com/CleverCloud/clever-components/commit/e0cfacb6be5f59c71203b43f7b7c1fa038282744)), closes [#724](https://github.com/CleverCloud/clever-components/issues/724)


### Bug Fixes

* **eslint:** check for improper sanitize function usage ([1947db0](https://github.com/CleverCloud/clever-components/commit/1947db0720477e15ee4d4512d175d368ba8b57d9))

## [10.4.0](https://github.com/CleverCloud/clever-components/compare/10.3.0...10.4.0) (2023-03-08)


### Features

* **cc-link:** add title property ([d5c2d8c](https://github.com/CleverCloud/clever-components/commit/d5c2d8c841382e0affb32116f50c6142483f282b))
* **cc-tile-metrics:** init component ([73aeb7c](https://github.com/CleverCloud/clever-components/commit/73aeb7c43b83241b24e20ffc5cc1c43d0fc48820)), closes [#240](https://github.com/CleverCloud/clever-components/issues/240)


### Bug Fixes

* **cc-ssh-key-list:** creation form mistakenly updated ([26cba28](https://github.com/CleverCloud/clever-components/commit/26cba289d26615dfc3596e12886b75dffcf8e146))
* **cc-ssh-key-list:** proper form validation when adding a new key in some cases ([ec0c6f1](https://github.com/CleverCloud/clever-components/commit/ec0c6f121667626b20a7a2cf54fb1301c8e2913b))
* **focus outline:** use contrasted focus outline ([bfd60c1](https://github.com/CleverCloud/clever-components/commit/bfd60c125204ce5fe5448a7ed8598bbb9026de08)), closes [#281](https://github.com/CleverCloud/clever-components/issues/281)

## [10.3.0](https://github.com/CleverCloud/clever-components/compare/10.2.1...10.3.0) (2023-01-09)


### Features

* **cc-button:** add 'icon' property with 'cc-icon' ([18724b6](https://github.com/CleverCloud/clever-components/commit/18724b6cc50d237a8c9e2d2a2462fabfbef19589))
* **cc-icon:** init ([64e87e1](https://github.com/CleverCloud/clever-components/commit/64e87e175a14111cef49d40933decefa4ca5237c))
* **cc-ssh-key-list:** implement 'cc-icon' ([e12dd10](https://github.com/CleverCloud/clever-components/commit/e12dd10cce4ee926346d6e22a306d4e896b0041a))
* **notifications:** dispatch notify events from window by default ([fcda35c](https://github.com/CleverCloud/clever-components/commit/fcda35c8cf19fda425a5418e5c1fd6ce6b666d37)), closes [#663](https://github.com/CleverCloud/clever-components/issues/663)


### Bug Fixes

* **cc-icon:** force svg size to resolve safari 15 issue ([6ca44c1](https://github.com/CleverCloud/clever-components/commit/6ca44c143339ff6ea9a7b104de03a85dd0e8e99e)), closes [#681](https://github.com/CleverCloud/clever-components/issues/681)
* **cc-invoice-table:** "WONTPAY" is part of pending invoices ([af244ed](https://github.com/CleverCloud/clever-components/commit/af244eda32dc081b80b271626a5b166da16b908d))
* **cc-stretch:** rollback width max-content rule ([245ac95](https://github.com/CleverCloud/clever-components/commit/245ac9559d6f12961d5a6a322c4a3e7f30691e48)), closes [#657](https://github.com/CleverCloud/clever-components/issues/657)

## [10.2.1](https://github.com/CleverCloud/clever-components/compare/10.2.0...10.2.1) (2022-12-02)


### Bug Fixes

* **cc-badge:** override border in skeleton mode ([ab57a57](https://github.com/CleverCloud/clever-components/commit/ab57a57bc738cbaef17f719e4c8e1e8871ca9535)), closes [#654](https://github.com/CleverCloud/clever-components/issues/654)

## [10.2.0](https://github.com/CleverCloud/clever-components/compare/10.1.0...10.2.0) (2022-12-01)


### Features

* **cc-notice:** init component ([60e811c](https://github.com/CleverCloud/clever-components/commit/60e811c6feb23f85928b86cd3d5a9b8e41ebfedc)), closes [#343](https://github.com/CleverCloud/clever-components/issues/343)
* **cc-orga-member-card:** init component ([e0c1888](https://github.com/CleverCloud/clever-components/commit/e0c1888cff2b991167eceacaa960b17889a67006)), closes [#412](https://github.com/CleverCloud/clever-components/issues/412)
* **cc-orga-member-list:** init component ([3bc272d](https://github.com/CleverCloud/clever-components/commit/3bc272d10dbff2a1bd623afde58ba362528dab81))
* **stylelint:** add new tool ([76e75b3](https://github.com/CleverCloud/clever-components/commit/76e75b36a359c7e4e5873f8028c37d45b3cde53f)), closes [#122](https://github.com/CleverCloud/clever-components/issues/122)


### Bug Fixes

* **cc-badge / cc-stretch:** prevent layout shifts on Safari ([ffd55ad](https://github.com/CleverCloud/clever-components/commit/ffd55add70ded8d470abe2228539902c0625bc4d)), closes [#647](https://github.com/CleverCloud/clever-components/issues/647)
* **cc-badge:** make the badge content grow with the badge ([c313f54](https://github.com/CleverCloud/clever-components/commit/c313f54ad80ed1ad26a50189ca0ec615bb414178))
* **cc-badge:** set consistent border display with webkit ([131aff7](https://github.com/CleverCloud/clever-components/commit/131aff79fbad527eaa8eb0bb4ca5984d4ca19f3c)), closes [#630](https://github.com/CleverCloud/clever-components/issues/630)
* **cc-button:** set default background color ([ba6e9c1](https://github.com/CleverCloud/clever-components/commit/ba6e9c1c8add174ba5fbea718613cf7c75334a9b)), closes [#643](https://github.com/CleverCloud/clever-components/issues/643)
* **email:** update pattern to forbid spaces ([30cbfbd](https://github.com/CleverCloud/clever-components/commit/30cbfbd8dfe0f1b03c0455ef71674e41f8bc1d3b))
* **with-resize-observer:** prevent layout shifts ([07cc728](https://github.com/CleverCloud/clever-components/commit/07cc7283ee11dc41d9b27984d60e22af5459d816))

## [10.1.0](https://github.com/CleverCloud/clever-components/compare/10.0.1...10.1.0) (2022-11-24)


### Features

* **cc-button:** display waiting state when in link mode ([f9cbe9d](https://github.com/CleverCloud/clever-components/commit/f9cbe9d57425d23687be7670594e03fda733acd8)), closes [#628](https://github.com/CleverCloud/clever-components/issues/628)
* **cc-email:** init component ([fb118e3](https://github.com/CleverCloud/clever-components/commit/fb118e399772b5690ae387c79985d7980024315e)), closes [#435](https://github.com/CleverCloud/clever-components/issues/435)


### Bug Fixes

* match typecheck tsconfig with typescript dependency version ([1d1e306](https://github.com/CleverCloud/clever-components/commit/1d1e306f8249d28f5d30743059dfcabd19cb8ba1))

## [10.0.1](https://github.com/CleverCloud/clever-components/compare/10.0.0...10.0.1) (2022-11-08)


### Bug Fixes

* **cc-env-var-editor-expert:** set proper value for the editor hidden label ([e63c282](https://github.com/CleverCloud/clever-components/commit/e63c2820ada376501b8b9c10bec045200c15261a))
* **cc-env-var-editor-json:** set proper value for the editor hidden label ([eddad2f](https://github.com/CleverCloud/clever-components/commit/eddad2f423a59b70eed44c983da5cf567aaec2bb))
* **cc-ssh-key-list:** improve UX when adding a new key ([befe7aa](https://github.com/CleverCloud/clever-components/commit/befe7aa20f73eacf5fa6d618db6e28da8ed5c0eb))

## 10.0.0 (2022-11-07)

### ⚠️ BREAKING CHANGES

* `<cc-toggle>`: update component host default `display` CSS property (BREAKING CHANGE).
* `<cc-input-text>`: set default font back to `--cc-ff-monospace` when the input contains tags (BREAKING CHANGE).
* Introduce a new project file structure (BREAKING CHANGE).
* all components: change `rem` units to `em` (BREAKING CHANGE).
* `<cc-select>`: use the `value` property of the select element instead of the `selected` attribute. The `value` prop should always be set when using the `<cc-select>` component. It may be set to an empty string if a `placeholder` is provided (BREAKING CHANGE).
* `<cc-html-frame>`: change `title` prop to `iframeTitle` (`iframe-title` when used as an attribute) to avoid conflicts with the native `title` attribute (BREAKING CHANGE).

### Components

* `<cc-map>`: make dot markers not focusable.
* `<cc-zone-input>`: make server markers not focusable.
* `<cc-addon-admin>`:
  * fix skeleton mode
  * add visually hidden label for `addon name` and `addon tags` input fields so that these fields can be identified by assistive technologies.
* `<cc-env-var-form>`: fix toggling to JSON mode while in skeleton state.
* `<cc-button>`: display progress bar during waiting state when button is in link mode.
* `<cc-badge>`: add skeleton mode
* `<cc-input-text>`:
  * remove the unique id generation technique and rely on Shadow DOM isolation instead.
  * add `hiddenLabel` prop to allow the label to be visually hidden in some cases.
  * add red border and redish focus ring when error slot is used
* `<cc-input-number>`:
  * remove the unique id generation technique and rely on Shadow DOM isolation instead.
  * update stories to always show visible labels.
  * remove `tagsWithLabel` story since there is always a visible label now.
  * add `alt` attribute values for controls (+ / -) so that they can be identified by assistive technologies.
  * add `hiddenLabel` prop to allow the label to be visually hidden in some cases.
  * add red border and redish focus ring when error slot is used
* `<cc-select>`:
  * remove the unique id generation technique and rely on Shadow DOM isolation instead.
  * only disable the placeholder option if the component is in required mode.
  * add red border and redish focus ring when error slot is used.
* `<cc-toggle>`: remove the unique name generation technique and rely on Shadow DOM isolation instead.
* `accessibility styles`: add new `accessibilityStyles` containing a `visually-hidden` class to hide content visually but not from assistive technologies.
* `<cc-env-var-create>`: add visually hidden label for all input fields so that these fields can be identified by assistive technologies.
* `<cc-env-var-editor-expert>`: add visually hidden label for the `<textarea>` so that it can be identified by assistive technologies.
* `<cc-env-var-editor-json>`: add visually hidden label for the `<textarea>` so that it can be identified by assistive technologies.
* `<cc-env-var-editor>`: add visually hidden label for the `<textarea>` so that it can be identified by assistive technologies.
* `<cc-env-var-input>`: add visually hidden label for the input field so that it can be identified by assistive technologies.
* `<cc-header-addon>`: add visually hidden label for `addonId` and `realAddonId` input fields so that these fields can be identified by assistive technologies.
* `<cc-html-frame> loading story`: add a `title` attribute so that it can be identified by assistive technologies.
* `<cc-invoice>`: add a `title` on the `<cc-html-frame>` so that the `<iframe>` can be identified by assistive technologies.
* `<cc-pricing-estimation>`: add visually hidden label for `<cc-input-number>` showing the quantity so that they can be identified by assistive technologies.
* `<cc-pricing-product-consumption>`:
  * add text content to `<cc-button>` elements (toggle State buttons) so that they can be identified by assistive technologies.
  * add visually hidden label for `<cc-input-number>` showing the size or the quantity so that they can be identified by assistive technologies.
* `<cc-pricing-table>`: add text content to `<cc-button>` elements (toggle State and add buttons) so that they can be identified by assistive technologies.
* `resizeObserver`: add `window.requestAnimationFrame` in the resize observer callback to mitigate the `resize observer loop limit exceeded issue`.
* stories: fix several stories not being passed to `enhancedStoryNames`.
* `<cc-tile-status-codes>`: fix JavaScript errors in case initial loading fails (error state).
* `<cc-button>`:
  * add a new `accessibleName` prop to override the `aria-label` and `title` values.
  * fix layout bug that occurred on Safari with the `<cc-header-app>` component.
* New component:
  * `<cc-action-dispatcher>`
  * `<cc-ssh-key-list>`
  * `<cc-stretch>`
  * `<cc-email-list>`

### For devs

* Improve display of `components:check-i18n` task.
* Upgrade from `lit-element@2.5.1` to `lit@2.3.1`.
* Upgrade from `@web/dev-server@0.1.29` to `@web/dev-server@0.1.34`.
* Upgrade from `@open-wc/dev-server-hmr@0.1.2` to `@web/dev-server@0.1.3`.
* Upgrade from `@open-wc/dev-server-hmr@0.1.2` to `@web/dev-server@0.1.3`.
* Upgrade from `@web/dev-server-rollup@0.3.13` to `@web/dev-server@0.3.19`.
* Upgrade from `@web/dev-server-storybook@0.4.1` to `@web/dev-server@0.5.4`.
* Upgrade from `@web/rollup-plugin-import-meta-assets@0.4.1` to `@web/dev-server@0.5.4`.
* Upgrade from `@web/rollup-plugin-import-meta-assets@1.0.6` to `@web/rollup-plugin-import-meta-assets@1.0.7`.
* Upgrade from `@web/test-runner@0.13.4` to `@web/test-runner@0.14.0`.
* Upgrade from `@web/test-runner-mocha@0.7.2` to `@web/test-runner-mocha@0.7.5`.
* Upgrade from `@custom-elements-manifest/analyzer@0.4.1` to `@custom-elements-manifest/analyzer@0.6.4`.
* Fix Custom Element Manifest generation web dev server plugin: disable caching.
* Add JSDoc based typechecking with TypeScript's CLI (just utils.js for now).
* Rollback the smart-manager to the old low level API and move the observable API to a different module.
* Introduce a new defineSmartComponent function.
* Add `FocusLostController`, a Lit Reactive Controller that helps manage focus loss.
* Add new eslint plugin `eslint-plugin-lit-a11y` to prevent accessibility issues.
* Add new dependency `@open-wc/testing` to allow Web Test Runner to run tests for accessibility issues.
* Add new dependency `@web/test-runner-commands` so that Web Test Runner can test both on desktop and mobile.
* Add new helpers to extract stories and run accessibility test on them.
* Add new test files in most of the component folders. These test files only contain accessibility tests for the moment.
* Update eslint `no-new` rule from "error" to "off".
* `<cc-tcp-redirection-form>`: rework state, types and smart for TCP redirection components.
* Refactor type files from the new file structure.
* Update our CEM support-typedef-jsdoc plugin with some tests and new features.

## 9.0.1 (2022-10-28)

* `<cc-button>`: fix layout bug that occurred on Safari with the `<cc-header-app>` component.

## 9.0.0 (2022-07-19)

### ⚠️ BREAKING CHANGES

* `<cc-input-text>`:
  * change default font-family to inherit instead of monospace (BREAKING CHANGE),
  * add CSS Custom Prop to change the `<input>` font-family.
* `<cc-input-number>`:
  * change default font-family to inherit instead of monospace (BREAKING CHANGE),
  * add CSS Custom Prop to change the `<input>` font-family.
* `<cc-toggle>`:
  * rename `--cc-text-transform` to `--cc-toggle-text-transform` (BREAKING CHANGE),
  * add CSS Custom Prop to customize `border-radius`, `font-weight`.
* Introduce a public theme based on a CSS files (BREAKING CHANGE):
  * move `default-theme` (design tokens) from a JavaScript file to a CSS file (BREAKING CHANGE),
  * remove `default-theme` import from all components (BREAKING CHANGE),
  * prefix decision design tokens with `cc-` (BREAKING CHANGE),
  * define default text color using `cc-color-text-default` where necessary (BREAKING CHANGE),
  * define default background colors using `cc-color-bg-default` where necessary (BREAKING CHANGE).
* colors: change color decision names finishing with `-light` to `-weak` (for instance: `cc-color-text-weak`). (BREAKING CHANGE)

### Components

* Replace error state after user action by `cc-toast` notification (`cc-grafana-info`, `cc-tcp-redirection-form`, `cc-env-var-form`).
* New components:
  * `<cc-toaster>`
  * `<cc-toast>`
* `<cc-button>`: add CSS Custom Props to customize `border-radius`, `font-weight` and `text-transform`.

### For devs

* `rollup`:
  * add new plugin `rollup-plugin-styles-assets` to bundle the `default-theme` CSS file.
  * add new property (array) `styles` in `deps-manifest` to specify the hashed name of the `default-theme` CSS file corresponding to a specific version (to be used by the CDN).

...
## 8.0.1 (2022-07-15)

### Components

* `<cc-env-var-form>`: fix the reset button not working.

### For devs

* storybook: limit the width of the preview (and center it)
* storybook: add a `displayMode` option in `makeStory` to simplify story layout and code

## 8.0.0 (2022-07-01)

### ⚠️ BREAKING CHANGES

* `<cc-doc-card>`: rename title property to heading to fix a conflict.
* `<cc-doc-list>`: use heading when initializing the cards instead of title.

### Components

* `<cc-article-list>`: fix error mode not triggering on XML parsing failure (smart).
* `parseRssFeed()`: trim XML string before parse to avoid whitespaces error.
* `<cc-button>`: update waiting loader animation in circle state.
* Color design tokens: add darker shades for light colors.
* New component:
  * `<cc-badge>`
* `<cc-tcp-redirection-form>`: Use `<cc-badge>` to display redirection count.
* `<cc-header-app>`: Change footer background to neutral.
* `<cc-header-addon>`: Change footer background to neutral.
* `<cc-header-orga>`: Use `<cc-badge>` to display org status and hotline number.
* `<cc-input-text>`: add `inline` prop to place the label on the left of the `<input>` element. Add new `inline` story to show this behavior.
* `<cc-input-number>`: add `inline` prop to place the label on the left of the `<input>` element. Add new `inline` story to show this behavior.
* `<cc-select>`: add `inline` prop to place the label on the left of the `<select>` element. Add new `inline` story to show this behavior.
* `<cc-toggle>`: add `inline` prop to place the label on the left of the group of radio input elements. Add new `inline` story to show this behavior.
* `<cc-invoice-list>`: inline year filters (`<cc-toggle>` for desktop and `<cc-select>` for mobile).

## 7.13.1 (2023-06-23)

**⚠️ Caution:**

The goal of this release is to fix issues with the version 7.12 of the `pricing` components for our Website (see [#791](https://github.com/CleverCloud/clever-components/issues/791) [#787](https://github.com/CleverCloud/clever-components/issues/787) [#781](https://github.com/CleverCloud/clever-components/issues/781)).
Changes described below are specific to this version.
They are not part of versions between `8.0.0` and `11.0.0`.

If you need to use the `pricing` components, please update to a version >= `11.0.0` of our components that contains a rework of these components.

* `<cc-pricing-header>`: make sure the initial value of the zones dropdown is set after loading the zones.

## 7.13.0 (2023-06-23)

**⚠️ Caution:**

The goal of this release is to fix issues with the version 7.12 of the `pricing` components for our Website (see [#787](https://github.com/CleverCloud/clever-components/issues/787) [#781](https://github.com/CleverCloud/clever-components/issues/781)).
Changes described below are specific to this version.
They are not part of versions between `8.0.0` and `11.0.0`.

If you need to use the `pricing` components, please update to a version >= `11.0.0` of our components that contains a rework of these components.

* update `Shoelace` dependency from `2.0.0-beta.47` to `2.5.0` to fix an issue with Chrome > 114.
* `<cc-pricing-table>`: make it possible to add custom features. Stop filtering out features that have no registered translation.

## 7.12.0 (2022-05-20)

* `cc-link`: remove `defaultThemeStyles` insertion in CSS.
* `<cc-addon-linked-apps>`: add `defaultThemeStyles` import so that variables can be used by `cc-link`.
* `<cc-addon-option-form>`: add `defaultThemeStyles` import so that variables can be used by `cc-link`.
* `<cc-elasticsearch-info>`: add `defaultThemeStyles` import so that variables can be used by `cc-link`.
* `<cc-jenkins-info>`: add `defaultThemeStyles` import so that variables can be used by `cc-link`.
* `<cc-matomo-info>`: add `defaultThemeStyles` import so that variables can be used by `cc-link`.
* `<cc-env-var-form>`: add `defaultThemeStyles` import so that variables can be used by `cc-link`.
* `<cc-article-card>`: add `defaultThemeStyles` import so that variables can be used by `cc-link`.
* `<cc-invoice>`: add `defaultThemeStyles` import so that variables can be used by `cc-link`.
* `<cc-grafana-info>`: add `defaultThemeStyles` import so that variables can be used by `cc-link`.
* `cc-link` story: update documentation following the color update. Add `defaultThemeStyles` import inside the example.
* `cc-link`: fix `:visited` and `:active` color so that they are the same as the link with default state (primary highlight).
* `<cc-input-text>`: set line-height to 1.25em for the `<label>` element.
* `<cc-input-number>`: set line-height to 1.25em for the `<label>` element.
* `<cc-select>`: set line-height to 1.25em for the `<label>` element.
* `<cc-toggle>`: set line-height to 1.25em for the `<legend>` element.
* `defaultThemeStyles`: add variable to be used as `margin-top` value on a `<cc-button>` when one wants to align all form elements horizontally.
* `all-form-controls` story: add new story with help message and add a note about how to handle horizontal layout inside forms.
* New components:
  * `<cc-article-card>`
  * `<cc-article-list>` (with smart definition)
  * `<cc-doc-card>`
  * `<cc-doc-list>`

## 7.11.0 (2022-04-14)

* colors: use variables to specify colors and swap old colors for new contrasted ones. Add ADR about colors and Design Tokens.
* all-form-controls story: display disabled and readonly form controls next to each other to make sure they look the same.
* New component:
  * `<cc-warning-payment>`
* cc-input-text: add help text and error message support as well as their related stories. Remove label stories and add label inside all stories.
* cc-input-number: add help text and error message support as well as their related stories. Remove label stories and add label inside all stories.
* cc-select: add help text support as well as its related story.

## 7.10.1 (2022-03-23)

`<cc-matomo-info>`: fix logo URLs for PHP, MySQL and Redis

## 7.10.0 (2022-03-23)

* `<cc-input-number>`: fix controls mode not working properly from types introduction
* `<cc-pricing-header>`: fix `skeleton` animation still displaying on the select on Safari after loading of data
* New component:
  * `<cc-matomo-info>`

## 7.9.1 (2022-03-15)

* `<cc-tcp-redirection-form>`: fix smart definition (wrong operator caused race conditions)

## 7.9.0 (2022-03-14)

* `<cc-tcp-redirection-form>`: add smart definition
* New component:
  * `<cc-select>`
* `<cc-button>`, `<cc-input-number>`, `<cc-input-text>`, `<cc-select>`, `<cc-toggle>`: add new story showing all form controls together
* `<cc-invoice-list>`: implement `<cc-select>` to display the year list when component width is lower than 520px
* Remove `engines.node` from `package.json` and rely on Volta's versions fields
  * We use the `CC_PRE_BUILD_HOOK` env var to select the versions for Node.js and npm
* `<cc-header-addon>`: add missing import to cc-zone

### For devs

* Use specific Docker image for the CDN deployment job
* Fix npm task components:check-lit (was only applied on atoms)
* `<cc-env-var-editor-simple>`: remove unused mode attribute on cc-env-var-input

## 7.8.0 (2022-03-10)

* `<cc-env-var-*>`: fix links to the doc
* `<cc-pricing-product>`: add details for Heptapod runners

### For devs

* Improve the CEM analyzer generate behaviour in dev mode

## 7.7.1 (2022-02-10)

* `<cc-tile-requests>`: rollback usage of `getCssCustomProperties()` (broken on Chrome)
* `<cc-tile-status-codes>`: rollback usage of `getCssCustomProperties()` (broken on Chrome)

## 7.7.0 (2022-02-10)

* New component:
  * `<cc-env-var-editor-json>`
* `<cc-datetime-relative>`: fix first initialization of datetime attribute/property
* `<cc-img>`: fix type for `skeleton` (boolean)
* `<cc-map-marker-*>`: fix the way we document readonly properties (anchor, size, tooltip)
* `<cc-zone-input>`: fix type for `_hovered` (string|null)
* Storybook: fix logo URL
* `<cc-env-var-form>`:
  * add JSON mode
  * add context for add-on configuration provider
  * add smart definition for add-on configuration provider
* `<cc-env-var-editor-expert>`: keeping only valid values when leaving expert mode
* `<cc-env-var-editor-simple>`: add a strict mode
* `<cc-env-var-create>`: add a strict mode
* `<cc-error>`: add a notice mode
* Update all static assets URLs to Cellar v2
* `<cc-header-addon>`:
  * display realId in a readonly cc-input-text next to the ID
  * fix title on add-on icon
  * display zone in the bottom right corner
  * add `noVersion` property to hide the version

### For devs

* Improve type definitions documentation:
  * move types to a `types.d.ts` for each web components section
  * add a script to automate type definition generation
  * moved typedef imports to above class declaration to avoid events not showing up on the docs
* Storybook: update prebuilt Storybook to `0.1.32` (Storybook `6.4.9`)
  * Use new CEM format (and ditch the old/temp WCA transformer)
  * Move the language selection to a [toolbar + globals](https://storybook.js.org/docs/web-components/essentials/toolbars-and-globals)
    * Remove lots of ugly React voodoo hacks
  * Use the story "props" and the CEM for the controls (with the new CSF args system)
    * Only the first item can be updated
    * The table props displays types for events
    * The table props doesn't display the default slot anymore :-(
    * Some controls in the table props are weird (union between `string|null` or `boolean|string`) :-(
  * Display the stories in docs mode in alphabetical order
    * This is not something we decided nor can change
  * Change the display of events name in the actions panel
    * `cc-foobar:the-event` => `onCcFoobarTheEvent`
    * This is not something we decided nor can change
  * Add an env var config system to use credentials in smart components stories
  * Improve HMR for i18n
* Introduce a new `getCssCustomProperties()` helper to define variables in CSS and use them in JavaScript
* Move color definitions to default them and use `getCssCustomProperties()` to inject them in Chart.js
  * `<cc-tile-requests>`
  * `<cc-tile-status-codes>`

## 7.6.0 (2021-10-28)

* `<cc-grafana-info>`:
  * fix API path in smart definition
  * remove warning (not needed anymore)
  * move disable section at the bottom
  * fix wording and descriptions

## 7.5.0 (2021-10-18)

* New components:
  * `<cc-grafana-info>` (with smart definition)

## 7.4.0 (2021-10-14)

* `<cc-pricing-table>`: add new `temporality` type `1000-minutes`

## 7.3.0 (2021-10-07)

* `<cc-pricing-table>`: add `temporality` feature
* `<cc-pricing-product>`:
  * add `temporality` feature
  * add plans and features for Jenkins runner (hard coded in the smart definition)
* `<cc-pricing-product-consumption>`: fix plan name for non bytes with cc-pricing-product:add-plan event
* `<cc-input-text>`: fix tags underline

### For devs

* Add an env param to disable generating docs on each change

## 7.2.1 (2021-09-30)

* `<cc-jenkins-info>`: Update documentation URL

## 7.2.0 (2021-09-27)

* `<cc-addon-backups>`: Add support for PostgreSQL, MySQL, MongoDB, Redis and Jenkins add-ons.

## 7.1.0 (2021-09-15)

* `<cc-env-var-form>`: fix small issues in exposed-config smart definition
* `<cc-pricing-product-consumption>`:
  * consider empty number values as `0`
  * add `progressive` support
  * add support for users (non byte type) and `secability`
  * add support for Heptapod in smart definition

### For devs

* with-resize-observer: remove "resize-observer-polyfill" dependency
* `<cc-input-text>`: remove "clipboard-copy" dependency
* refactor: use `??` instead of `||` when it makes more sense
* refactor: try to use `?.` when it's a bit simpler
* i18n: use Intl.PluralRules instead of custom code
* refactor: move sub render methods `_renderFoo()` below the main `render()` method
* refactor: use code folding regions in CSS (especially for responsive with COMMON/BIG/SMALL modes)
* pricing:
  * fix tests for PricingConsumptionSimulator
  * rename and update documentation for PricingConsumptionSimulator
  * add `progressive` to PricingConsumptionSimulator
  * add `secability` to PricingConsumptionSimulator
* product: refactor data API extraction for consumption based products

## 7.0.0 (2021-09-03)

### ⚠️ BREAKING CHANGES

* Browser support updated (Safari >=14), see [browser support reference](https://github.com/CleverCloud/clever-components/blob/7.0.0/docs/references/browser-support.reference.md) for details (BREAKING CHANGE).
* `<cc-pricing-product-cellar>`: delete component and replace it with a more generic component (BREAKING CHANGE)
* `<cc-pricing-table>`:
  * rename `items` to `plans` (BREAKING CHANGE)
  * replace `currencyCode` with `currency` in smart definition (BREAKING CHANGE)
* `<cc-pricing-product>`:
  * rename `items` to `plans` (BREAKING CHANGE)
  * replace `currencyCode` with `currency` in smart definition (BREAKING CHANGE)

### Components

* `<cc-beta>`: replace rem with em
* `<cc-button>`: replace rem with em
* `<cc-img>`: replace rem with em
* `<cc-input-number>`: replace rem with em
* `<cc-input-text>`: replace rem with em
* `<cc-loader>`: replace rem with em
* `<cc-toggle>`: replace rem with em
* `<cc-block>`: introduce a ribbon and a noHead property
* `<cc-zone>`:
  * add CSS custom properties to customize colors
  * replace rem with em
* `<cc-zone-input>`:
  * fix zone list sort
  * move `sortZones` out in a lib
* New components:
  * `<cc-pricing-product-consumption>` (with smart definition)
    * this is the replacement for `<cc-pricing-product-cellar>`, it works for Cellar, FS Bucket, Pulsar
  * `<cc-pricing-header>`
  * `<cc-pricing-estimation>`
  * `<cc-pricing-page>` (with smart definition)
  * `<cc-jenkins-info>` (with smart definition)

### For devs

* Replace `aws-sdk` with `@aws-sdk/s3-client` so we can stop relying on `s3cmd` for previews
  * You no longer need the `.clever-components-previews.s3cfg` but you will need env vars (see docs)

## 6.10.0 (2021-07-08)

* `<cc-toggle>`: add `--cc-text-transform` CSS custom property
* New component:
  * `<cc-pricing-product-cellar>` (with smart definition)

## 6.9.1 (2021-06-30)

* Release a `custom-elements.json` following the new CEM format on npm

## 6.9.0 (2021-06-30)

### For devs

* Replace WCA with OpenWC's CEM analyzer
  * This includes a few simplifications on how we write JSDoc

## 6.8.1 (2021-06-25)

* Improve display of `preview:list` task
* `events.js`:
  * removed the `options` parameter as it was not used anymore
  * add the possibility to provide a suffix instead of just being able to provide an event name => It gives the possibility to create a suffix with a `tagName:suffix` directly if needed
* Remove exports from package.json

## 6.8.0 (2021-06-01)

* Introduce new custom esbuild WDS plugin (experimental)
* `<cc-tile-status-codes>`: add smart definition
* `<cc-tile-requests>`: fix label position

## 6.7.2 (2021-05-22)

* Fix Leaflet ESM treeshaking (handle side effects)

## 6.7.1 (2021-05-21)

* Internalize leaflet.heat (and simpleheat) and transform them into ESM

## 6.7.0 (2021-05-20)

* `<cc-map>`: use leaflet from ESM source to improve treeshaking
* Update chart.js v2 => v3 (with ESM and treeshaking)

## 6.6.0 (2021-05-19)

* Add new custom ESLint rules to enforce conventions over translation files
* cc-toggle: remove padding when legend is empty
* Introduce new docs template/system for smart components
* `<cc-pricing-table>`:
  * replace `rem` with `em` units (it's a fix)
  * add action property (add/none)
* `<cc-pricing-product>`:
  * replace `rem` with `em` units (it's a fix)
  * add action property (add/none)
  * add head slot to override the whole head section

## 6.5.1 (2021-05-07)

* Fix: the new pricing components where not correctly packaged

## 6.5.0 (2021-05-07)

* `<cc-button>`: Add a circle form when in hide-text with an image
* New component:
  * `<cc-pricing-table>`
  * `<cc-pricing-product>` (with smart definition for add-ons and runtimes)

### For devs

* i18n: simplify formatter system and add JSDoc
* i18n: remove country flags (it makes no sense for a language)
* Update deps

## 6.4.0 (2021-04-21)

* Introduce a preview system
* `<cc-html-frame>`:
  * call `revokeObjectURL` when the component is disconnected
  * add `loading` feature
* `<cc-invoice>`: use `loading` feature from `<cc-html-frame>`

## 6.3.0 (2021-04-13)

* Introduce `defaultThemeStyles` with monospace font-family
* `<cc-invoice>`: adjust spacing around "Download PDF" for narrow mode
* `<cc-invoice-table>`: introduce a responsive system (big/small render modes)
* Update `@clevercloud/client` (new billing/payment API endpoints)

## 6.2.4 (2021-04-09)

* `<cc-input-number>`
  * When in controls mode and in a disabled state the buttons also appear in a disabled state
    with a slight opacity change
  * Fixed a bug that allowed to change the value of the input in controls mode
    when the component was in a readonly state
  * The buttons in controls mode now get the state of disabled when min or max value is reached
    (e.g: If we have a value of `0` and the min is `0` the `decrement` button will change to `disabled`. The same would
    happen  for the `increment` button if we had a value of `10` and a max of `10`)


## 6.2.3 (2021-04-01)

* `<cc-invoice-table>`: fix pending statuses

## 6.2.2 (2021-04-01)

* `<cc-invoice-table>`: change sort order to desc

## 6.2.1 (2021-04-01)

* `<cc-invoice-table>`: fix i18n for emission date

## 6.2.0 (2021-03-31)

* New components:
  * `<cc-html-frame>`
  * `<cc-invoice>` (with smart definition)
  * `<cc-invoice-list>` (with smart definition)
  * `<cc-invoice-table>`

## 6.1.0 (2021-03-25)

* New component:
  * `<cc-input-number>`

## 6.0.1 (2021-03-15)

* `<cc-addon-linked-apps>`: fix CSS alignment

## 6.0.0 (2021-03-15)

### ⚠️ BREAKING CHANGES

* `<cc-addon-linked-apps>`: use `<cc-zone>` instead of just zone name (BREAKING CHANGE)

### Components

* Add check on `apiConfig` in cc-env-var-form.smart-exposed-config
* `<cc-addon-linked-apps>`: add smart definition
* `<cc-env-var-form>`:
  * add env-var-addon context
  * add smart definition (env-var-addon)

## 5.6.0 (2021-03-09)

* Introduce smart components system
* Update @clevercloud/client
* Pin Node.js and npm versions with volta and update lock to v2
* Add smart definition for `<cc-env-var-form>` (exposed config)

## 5.5.0 (2021-01-27)

* New components:
  * `<cc-addon-redis-options>`
  * `<cc-addon-jenkins-options>`

* `<cc-addon-elasticsearch-options>`
  * Add encryption at rest option

* `cc-addon-encryption-at-rest-option` template
  * Drop documentation URL parameter

...

## 5.4.0 (2020-12-08)

* `<cc-addon-credentials>`
  * Add `"pulsar"` type
  * Add `"url"` credential type

### For devs

* Use `@web/rollup-plugin-import-meta-assets` for assets instead of `rollup-plugin-copy`
* Replace `assetUrl()` helper with raw `new URL('../asset.svg', import.meta.url).href`
* Move rollup configs to specific dir and rework plugin usage
* Introduce rollup-plugin-deps-manifest to list dependencies for CDN
* Add new npm script `components:build-cdn` to prepare files for CDN
* Add new npm script `components:publish-cdn` to published files to Cellar
* Add manual CSS to style not yet defined components (will be reworked and automated later)
* Add new npm script `components:build-cdn:versions-list` to update the list of available versions (published on CDN)
* Add Jenkinsfile to automate CDN publication on new tag

## 5.3.1 (2020-11-16)

* `<cc-tile-requests>`: fix broken display when value is 0

## 5.3.0 (2020-11-10)

* `<cc-zone-input>`: fix scrolling behaviour (again)

## 5.2.0 (2020-11-09)

* `<cc-zone-input>`: fix scrollIntoView behaviour
* `<cc-zone-input>`: center the map
* `<cc-map>`: fix race conditions on view-zoom update (and other attrs)

## 5.1.0 (2020-11-03)

* `<cc-zone-input>`: change default internal `view-zoom` to `1`

## 5.0.0 (2020-11-03)

### ⚠️ BREAKING CHANGES

* `<cc-map>`: rework the API to place markers with something more generic
* `<cc-heptapod-info>`:
  * rename `statistics` properties
  * set default display to `block`
  * remove max-width
  * rework `loading`/`skeleton` logic
* Remove `<cc-elasticsearch-options>`, replaced by `<cc-addon-elasticsearch-options>`
  * Merge many attrs/props into `options`

### Components

* New components:
  * `<cc-addon-option>`
  * `<cc-addon-option-form>`
  * `<cc-addon-elasticsearch-options>`
  * `<cc-addon-postgresql-options>`
  * `<cc-addon-mysql-options>`
  * `<cc-addon-mongodb-options>`
  * `<cc-map-marker-dot>`
  * `<cc-map-marker-server>`
  * `<cc-zone>`
  * `<cc-zone-input>`
* `<cc-header-app>`: add `zone` details
* `<cc-img>`: add CSS custom prop `--cc-img-fit` to customize object-fit (default is cover)
* `<cc-env-var-form>`: fix restart button margin
* `<cc-flex-gap>`: add `--cc-align-items` CSS property
* Rework the way we format bytes and use it in `<cc-heptapod-info>`, `<cc-tile-scalability>` and `<cc-addon-elasticsearch-options>`

### For devs

* Update @clevercloud/client to 7.0.0
* docs: add some details about properties/attributes in cc-example-component.js
* Replace cypress by web-test-runner (and fix a test)
* Add tests for `prepareNumberUnitFormatter()`, refine implementation and adapt tests
* Refactor:
  * `<cc-logsmap>`: absorb logic that was in `<cc-map>` and use `<cc-map-marker-dot>`
  * `<cc-map>`: simplify setters and remove useless country property in point object
  * `<cc-heptapod-info>`: fix small issues (lint, CSS, story, API...)

## 4.1.2 (2020-08-14)

### Components

* `<cc-heptapod-info>`: Fix heptapod about link href

## 4.1.1 (2020-08-13)

### Components

* `<cc-heptapod-info>`:
  * Fix price translations
  * Change default width from 500px to 600px

## 4.1.0 (2020-08-13)

### Components

* New component: `<cc-heptapod-info>`

## 4.0.0 (2020-07-16)

### ⚠️ BREAKING CHANGES

* We moved our internal build to rollup and changed the way we link to images from non-standard syntax to `import.meta.url`.
  * Depending on the way you bundle our components, you may need some config to support this.
* We removed the outter margin on `:host` of several components:
  * `<cc-toggle>`
  * `<cc-input-text>`
  * `<cc-button>`
* We renamed all `<env-var-*>` components to `<cc-env-var-*>`
* `<cc-button>`: always display text when `image` is used
* We removed `index.js`, if you were using it, you now need to import the components one by one with their direct paths

### Components

* You can now set objects and arrays via attributes (as JSON)
* New components:
  * `<cc-flex-gap>`
  * `<cc-tcp-redirection-form>`
  * `<cc-tcp-redirection>`
* `<cc-addon-admin>`: simplify i18n (fix #103)
* `<cc-block>`: align icon on top (flex-start)
* `<cc-button>`:
  * Add `waiting` state
  * Handle `delay=0`
  * Fix image height with new inner grid system
  * Fix JSDoc
  * Fix story doc
* `<cc-env-form>`: fix overflow pb with inner button focus rings
* `<cc-env-var-form>`: fix overflow behaviour with inner input focus rings
* `<cc-env-var-input>`: fix story data (was broken for ages...)
* `<cc-expand>`: fix spring effect
* `<cc-header-orga>`: fix vertical alignment
* `<cc-input-text>`:
  * Adjust tag border-radius
  * Display placeholders in italics
  * Fix undefined behaviour
  * Force white background
* `<cc-link>`: fix lint issue
* `<cc-toggle>`:
  * Add multiple mode (with checkboxes)
  * Add color story and rework examples
  * Add subtle display mode
  * Add image feature (and image only feature)
  * Add `--cc-toggle-img-filter*` custom props and a toolbar story
  * Add a legend to describe the whole group
  * Add active state with small change on background size
  * Enhance backgroud display (hover & selected)
  * Fix component's and stories' docs
  * Fix CSS order
  * Fix JSDoc for event `cc-toggle:input-multiple`
  * Fix vertical text alignement
  * Only show focus ring when not hovered
  * Refactor CSS and move borders on labels
  * Refactor CSS to group and comment sections
  * Remove box-shadow when hovered (we already have a cursor:pointer)
  * Revert to button like border-radius
  * Show boolean example with "activated" choice on the right in the story
  * Switch layout strategy (txt+padding => height+line-height)

### Docs

* Update CONTRIBUTING.md
* Storybook
  * Show list of images used by a component in docs page
  * Add link to source for each component in docs page
  * Add details about component default CSS `display` in docs page
  * Force white background in preview (iPad gets dark auto mode)
  * Improve show code display (and remove hack)
* Startup examples/docs:
  * Rename `ExampleComponent.js` to `cc-example-component.js` and improve examples and docs
  * Introduce `cc-example-component.stories.js` with examples and docs

### For devs

* Update deps
* Update gitlab-ci scaling config
* build: use rollup to build the components
* Storybook
  * Remove useless hacks
  * Simplify i18n-knob hack
  * Use proper story root separator "/" ("|" is deprecated)
  * Load event names from custom-elements.json (addon action)
  * Simplify markdown docs loading
* Refactor:
  * Rename "skeleton" to "skeletonStyles" (fix #92)
  * Rename "instanceDetails" to "instanceDetailsStyles" (fix #92)
  * Change the way we declare skeleton constant data
  * Move all assets (svg icons and geojson) into "assets" dir
  * Big bang rename from `components` to `src`
  * Remove dead code in `<cc-button>` method `_cancelClick()`
  * Add `.cc-waiting` for subtle blinking animations
* ESLint:
  * add custom rule "sort-lit-element-css-declarations"
  * add lit-html specific rules
  * add ES import rules (sort, extensions, dev deps...)
* Add `component:check-lit` task using lit-analyzer to lint/check our components

## 3.0.2 (2020-03-27)

* Update @clevercloud/client to 5.0.1

## 3.0.1 (2020-03-26)

* Change `<cc-beta>` default to `display:grid` so it fixes `<cc-overview>` in Safari with `<cc-logsmap>`

## 3.0.0 (2020-03-14)

### Components

* New component: `<env-var-linked-services>`
* `<env-var-form>`:
  * center overlay blocks in env editor
  * introduce `context` (and `appName`) to provide several translated heading & descriptions
  * pause skeleton on loading errors
  * remove `@env-var-form:dismissed-error` for loading errors
  * just mention "variables" without environment in i18n
  * add docs for default slot
  * remove promise based API

### For devs

* Add Apache 2 license
* Update dev deps (build, tasks...)
* Update to Storybook 5.3.17

### ⚠️ BREAKING CHANGES

* `<env-var-full>`: remove component

NOTE: This component was a bit too high level and the composition was hard to struggle with

## 2.0.2 (2020-03-06)

* `<env-var-form>`: fix parsing/serialization pb with simple/export mode

NOTE: This is a bug fix but if you copy/paste stuffs in the expert mode that was serialized in the old version you could have some problems.

## 2.0.1 (2020-03-05)

* `<cc-elasticsearch-options>`: fix translations/wording
* `<cc-elasticsearch-info>`: fix translations/wording

## 2.0.0 (2020-03-04)

* Update `@clevercloud/client` to `2.3.1`
* New component: `<cc-elasticsearch-options>`
* `<cc-toggle>`:
  * reflect attribute `value`
  * allow `choices` as JSON attribute
  * expose and document cc-toggle-color

### ⚠️ BREAKING CHANGES

* `<cc-elasticsearch-info>`: make all links optional

## 1.4.0 (2020-02-11)

### Components

#### New components for add-ons:

* New component: `<cc-header-addon>`
* New component: `<cc-elasticsearch-info>`
* New component: `<cc-addon-credentials>`
* New component: `<cc-addon-features>`
* New component: `<cc-addon-admin>`
* New component: `<cc-addon-backups>`
* New component: `<cc-addon-linked-apps>`

#### New molecules for all our components:

* New component: `<cc-block>` and `<cc-block-section>`
* New component: `<cc-error>` (and remove `iconStyles`)
* New template: `ccLink()` (with `linkStyles`)

#### Existing components

* `<cc-button>`:
  * add `.focus()` method
  * add `link` feature
  * fix image alignement
  * prevent native click events from propagating/bubbling
  * unset `font-size`
* `<cc-input-text>`:
  * add `tags` feature
  * add `label` feature
  * add `requestimplicitsubmit` event
  * fix hover behaviour on clipboard/secret buttons
* `<cc-logsmap>`: add `<strong>` tags in i18n strings to highlight orga/app name in legend
* `<cc-map>`: don't display no heatmap points when there is an error
* `<cc-overview>`: allow multiple heads with `--cc-overview-head-count`
* `<cc-tile-requests>`: add `<strong>` tags in i18n strings to highlight time window in help
* `<env-var-create>`: add `<code>` tags in i18n strings to highlight error messages
* `<env-var-create>`: use `cc-input-text:requestimplicitsubmit`
* `<env-var-editor-expert>`: add `<code>` tags in i18n strings to highlight error messages
* `<env-var-form>`: use `cc-input-text:requestimplicitsubmit`
* `<env-var-input>`: fix alignment between name and value

### For devs

* Skeleton: add paused state
* Add `sanitize` tag template function to be used in i18n strings containing HTML
  * With cypress test runner
* i18n: Add "Missing lang" to help identify hard coded strings
* Add ADR describing our Storybook migration
* Storybook: update to Storybook 5.3.x ;-)
* Storybook: reload stories when translations are updated
* Tasks: add total count to tasks size
* Removed twemoji depencendy
* Update deps

## 1.3.0 (2019-12-21)

### Components

- New component: `<cc-beta>`
- New component: `<cc-datetime-relative>`
- New component: `<cc-img>`
- New component: `<cc-logsmap>`
- New component: `<cc-map>`
- New component: `<cc-header-app>`
- New component: `<cc-header-orga>`
- New component: `<cc-overview>`
- New component: `<cc-tile-consumption>`
- New component: `<cc-tile-deployments>`
- New component: `<cc-tile-instances>`
- New component: `<cc-tile-requests>`
- New component: `<cc-tile-scalability>`
- New component: `<cc-tile-status-codes>`
- New mixin: `withResizeObserver()`
- `<cc-button>`
  * move away from native click event to custom event `cc-button:click`
  * add warning mode
  * add delay mechanism
- `<cc-input-text>`
  * add copy-to-clipboard feature with `clipboard`
  * add show/hide secret feature with `secret`

### For devs

- New task: `size`
- New i18n system
- New dependencies:
  * [chart.js](https://www.npmjs.com/package/chart.js)
  * [chartjs-plugin-datalabels](https://www.npmjs.com/package/chartjs-plugin-datalabels)
  * [clipboard-copy](https://www.npmjs.com/package/clipboard-copy)
  * [leaflet](https://www.npmjs.com/package/leaflet)
  * [leaflet.heat](https://www.npmjs.com/package/leaflet.heat)
  * [resize-observer-polyfill](https://www.npmjs.com/package/resize-observer-polyfill)
  * [statuses](https://www.npmjs.com/package/statuses)
  * [twemoji](https://www.npmjs.com/package/twemoji)

### Storybook

- Update storybook to 5.3.0-rc
- Update stories to CSF (with a `makeStory` helper) and some MDX documents
- Move from `@storybook/html` to `@storybook/web-components`
- Add a11y addon
- Add viewport addon

## 1.2.0 (2019-07-25)

- Use @clevercloud/client utils to handle env vars

## 1.1.0 (2019-07-15)

- env-var-create: rename button "create" => "add"

## 1.0.7 (2019-07-10)

- cc-toggle: fix isolation of name in shadow DOM for Safari
- cc-input-text: remove Safari box-shadow

## 1.0.6 (2019-07-10)

- cc-input-text: update monospace font

## 1.0.5 (2019-07-10)

- env-var-input: fix button alignment
- env-var-create: fix button alignment
- env-var-input: switch outline for delete/keep button

## 1.0.4 (2019-07-10)

- env-var-input: switch colors for delete/keep button

## 1.0.3 (2019-07-09)

- env-var-input: fix keep/delete
- env-var-form: fix reset form
- env-var-create: fix focus after click on create

## 1.0.2 (2019-07-09)

- cc-input-text: stop propagation on keypress as well

## 1.0.1 (2019-07-09)

- Update npm scripts (move stuffs from `install` to `prestart`)

## 1.0.0 (2019-07-09)

First public stable release

- Expose env-var utils
- Expose i18n helper (with fr and en translations)
- New component: `cc-button`
- New component: `cc-expand`
- New component: `cc-input-text`
- New component: `cc-loader`
- New component: `cc-toggle`
- New component: `env-var-create`
- New component: `env-var-editor-expert`
- New component: `env-var-editor-simple`
- New component: `env-var-form`
- New component: `env-var-full`
- New component: `env-var-input`
