# DataSpliter

**DataSpliter** is a Python script designed to categorize dataset entries based on validation progress recorded in **ValidationHelper**. It separates data into **Good Data** (valid entries) and **Weird Data** (flagged entries).

## Project Structure

```
DataSpliter/
│
├── data/
│   ├── filtered/            # Contains filtered (approved/rejected) data
│   └── raw/                 # Contains raw dataset files
│
├── progress/                # Stores validation progress files
│   └── validationProgress-*.txt
│
├── split-data.ipynb         # Jupyter notebook for filtering and categorizing data
│
└── README.md                # This README file
```

## Features

- Reads dataset from CSV files.
- Utilizes progress files from **ValidationHelper**.
- Automatically categorizes and saves processed data.
- Handles multiple validation states: **OK, Weird, Skipped**.

## How It Works

1. Reads the **raw dataset** from `data/raw/`.
2. Loads the **progress file** from `progress/`, containing validation history.
3. Categorizes data based on validation history:
   - **OK** → Marked as valid.
   - **Weird** → Flagged as problematic.
   - **Skipped** → Ignored but retained in raw form.
4. Saves categorized data in the `data/filtered/{filename}/` directory.

## Usage

### Preparing the Data

1. **Download raw data** and place it inside `data/raw/`.
2. **Download the progress file** from **ValidationHelper** and place it in `progress/`.
   - The progress file name should follow the format: `validationProgress-{raw_data_filename_without_extension}.csv`.
3. Ensure that raw data and progress files have **matching filenames**.

### Running the Script

1. Open `split-data.ipynb` in Jupyter Notebook.
2. Modify the `fn` variable to specify the dataset filename (without extension if using `.csv`).
3. Execute the notebook cells in order.

### Output Files

The categorized data will be saved in:

- 📄 `{filename}_approved.csv` → **Validated good data**
- 📄 `{filename}_rejected.csv` → **Flagged weird data**

## Notes

- The script skips missing data but logs inconsistencies.
- Ensure progress files match the raw dataset filenames.
- Modify filtering logic inside `split-data.ipynb` as needed.

## Contributing

Contributions are welcome! Feel free to submit **pull requests** to improve the filtering logic or add features.
