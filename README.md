# Venus Pinata Github Action

## Introduction

A GitHub Action to upload a directory to IPFS and pin it using [Pinata](https://pinata.cloud).

## Usage

```yaml
- name: Upload to IPFS and pin
  uses: VenusProtocol/pinata-action
  with:
    path: ./testUploadDirectory
    pinName: "test-upload"
    maxPinsToKeep: 10
    pinataApiKey: ${{ secrets.PINATA_API_KEY }}
    pinataSecretApiKey: ${{ secrets.PINATA_SECRET_API_KEY }}
```
