# DataSpliter

**DataSpliter** is a Python script designed to categorize dataset entries based on validation progress recorded in **ValidationHelper**. It separates the data into **Good Data** (valid entries) and **Weird Data** (flagged entries).

## Module Structure

```
DataSpliter/
│
├── data/
│   ├── filtered/            # Contains filtered (approved/rejected) data
│   └── raw/                 # Contains raw dataset files
│
├── progress/                # Contains progress tracking files for validation
│   └── validationProgress-*.txt
│
├── split-data.ipynb        # Jupyter notebook for filtering data based on validation progress
│
└── README.md                # This readme file

```

## Features

- Reads dataset from CSV files
- Uses the **progress file** downloaded from **ValidationHelper**
- Automatically categorizes and saves the processed data
- Handles multiple validation states (OK, Weird, Skipped)

## How It Works

1. Reads the **raw dataset** from the `DataSpliter/data/raw/` directory.
2. Loads the **progress file** from `DataSpliter/progress/`, which contains validation history from **ValidationHelper**.
3. Categorizes data based on validation history:
   - **OK** → Marked as valid
   - **Weird** → Flagged as problematic
   - **Skipped** → Ignored but retained in raw form
4. Saves the categorized data into separate files.

## Usage

### Prepare the Data

- **Download raw data** and place it inside `DataSpliter/data/raw/`.
- **Download the progress file** from **ValidationHelper** after dataset validation.
  - The progress file name will follow this format: `validationProgress-{raw_data_filename_without_extension}.csv`. If you download the progress from ValidationHelper and you didn't change the dataset file name, no further action is required.
- **Place the progress file** inside `DataSpliter/progress/`.

## Run the Script

1. Open `filter-data.ipynb` in Jupyter Notebook.
2. Change the `fn` variable to the filename of the dataset you want to process. You can input just the filename without the extension (the default file extension is `.csv`).
3. Execute the cells in order to filter the data based on the validation results.

Make sure **pandas** and **Jupyter Notebook** are installed:

## Output

Processed data will be saved in the `DataSpliter/data/filtered/{filename}/` directory as:

📄 `{filename}_approved.csv` → Contains **validated good data**  
📄 `{filename}_rejected.csv` → Contains **flagged weird data**

## Notes

- Ensure that **raw data and progress files match** (same filename).
- The script skips missing data but logs any inconsistencies.

## Contributing

- You can modify filtering logic inside `split-data.ipynb` via **pull requests** if needed.
