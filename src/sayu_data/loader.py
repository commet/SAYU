"""Data loading utilities for SAYU data workspace."""

from __future__ import annotations

from collections.abc import Iterable
from pathlib import Path
from typing import Dict

import pandas as pd


def list_csv_files(directory: Path) -> list[Path]:
    """Return all CSV files in *directory* sorted by name."""

    return sorted(path for path in directory.glob("*.csv") if path.is_file())


def load_csv_files(files: Iterable[Path]) -> Dict[str, pd.DataFrame]:
    """Load CSV files into pandas DataFrames keyed by stem name."""

    dataframes: Dict[str, pd.DataFrame] = {}
    for file_path in files:
        df = pd.read_csv(file_path)
        dataframes[file_path.stem] = df
    return dataframes


def load_all_csv(directory: Path) -> Dict[str, pd.DataFrame]:
    """Convenience wrapper that loads every CSV in *directory*."""

    return load_csv_files(list_csv_files(directory))
