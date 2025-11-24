# SAYU Data Workspace Setup

## Virtual Environment

Create and activate a virtual environment before installing dependencies:

```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\\Scripts\\activate
pip install -r requirements.txt
```

## Directory Overview

- `data/raw/csv/` – Original CSV exports collected from source systems.
- `data/raw/pdf/` – Source PDF documents to be referenced or parsed.
- `data/processed/` – Cleaned datasets generated from raw inputs.
- `notebooks/` – Jupyter notebooks for exploratory analyses and prototyping.
- `src/` – Application and pipeline source code.
- `reports/` – Generated reports, figures, and presentation assets.

Update each folder's README with more details as the project evolves.

## Running the data pipeline

The repository ships with a lightweight orchestration layer for combining the
raw CSV files under `data/raw/csv`. To execute the pipeline and generate the
processed dataset:

```bash
python -m src.main --root . --summary reports/pipeline-summary.json
```

The command outputs a JSON summary describing the processed dataframe and writes
`data/processed/combined.csv` if at least one source CSV is present.
