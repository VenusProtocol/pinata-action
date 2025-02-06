# Venus Globalping Github Action

## Introduction

A GitHub Action to ping a website from multiple locations using [Globalping](https://globalping.io).

## Usage

```yaml
- name: Ping
  uses: VenusProtocol/globalping-action
  with:
    target: venus.io
    countryCodes: |
      US
      HK
      SG
      DE
```