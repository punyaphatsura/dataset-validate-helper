# Data Validation

This repository contains two main modules:

## 1. ValidationHelper

A web-based tool designed to assist with dataset validation through an intuitive UI. Built with:

- **Next.js** – for server-side rendering and performance
- **Tailwind CSS** – for flexible and modern styling
- **ShadCN** – for pre-styled UI components

### Features:

- CSV file upload and parsing
- Keyboard shortcuts for quick validation
- Tracks progress and allows resuming validation
- Supports exporting and importing validation history

## 2. DataSpliter

A Python script for categorizing dataset entries into:

- **Good Data** – entries marked as valid
- **Weird Data** – entries flagged for issues

### How it Works:

- Reads a dataset (CSV format)
- Uses the **progress file downloaded from ValidationHelper** to determine categorized data
- Saves the categorized data into separate files
