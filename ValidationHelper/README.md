# Dataset Validation Helper

[![Deploy](https://img.shields.io/badge/deploy_in-vercel-blue)](https://dataset-validate-helper.vercel.app/)

## About The Project

Dataset Validation Helper is a tool designed to assist users in validating datasets by providing an intuitive interface for reviewing and marking data entries. This project is particularly useful for manually validating machine learning datasets.

## Tech Stack

- **Package Manager**: Bun
- **Frontend**: Next.js, React, TypeScript
- **Styling**: TailwindCSS
- **UI Components**: ShadCN, Radix UI
- **Parsing**: PapaParse

## Structure

```
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/
│   ├── app/
│   │   └── page.tsx       # Homepage
│   ├── components/
│   │   ├── ui/            # ShadCN Components
│   │   ├── DataRow.tsx
│   │   └── FileUploadButton.tsx
│   ├── lib/
│   │   └── utils.ts       # Utility functions
│   ├── types/
│   │   └── validation.ts  # Type
│   ├── utils/
│   │   └── parseCsv.ts    # CSV parsing utility
```

## Features

- Upload and parse CSV files
- Validate dataset entries manually
- Save and load validation progress
- User-friendly UI with keyboard shortcuts for efficient marking
- Export validation progress for send the progress to other user or using in **DataSpliter**

### How to Use the Web

1. **Import the dataset**: Upload a CSV file to begin the validation process.
   - CSV field header must be `thai sentence,english sentence`
2. **Mark the data**:
   - Press `Space` to mark data as **Good**.
   - Press `W` to mark data as **Weird**.
   - Press `<-` to **undo** the last action.
   - Press `->` to **skip** the current entry.
3. **Auto-save progress**: The progress is automatically saved in local storage using the dataset filename as the key. If the dataset filename changes, the history will not load. If you upload the dataset file and the progress for that dataset exists, it will automatically load the progress to allow you to continue where you left off.
4. **Download & Share Progress**: You can download your progress and share it with other users, allowing them to continue from where you left off. The saved progress can also be used in **DataSpliter** for further processing.
5. **Reset Progress**: You can reset the progress (current file) by pressing reset progress button.

## Screenshots

### Landing Page

![alt text](public/screenshots/image.png)

### Uploaded Data

![alt text](public/screenshots/image2.png)
![alt text](public/screenshots/image3.png)

### Wried Data Preview

![alt text](public/screenshots/image4.png)

### Validation Finised

![alt text](public/screenshots/image5.png)

## Notes

- Ensure the uploaded CSV file is correctly formatted.
- Progress is saved in your browser's local storage using the dataset filename as the key, tied to your browser profile and device. Switching devices or clearing cache may result in data loss. To prevent this, exporting progress for backup is recommended.
