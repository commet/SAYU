"""Data processing helpers for SAYU datasets."""

from __future__ import annotations

import re
from collections.abc import Mapping
from pathlib import Path

import pandas as pd


def normalize_column_name(name: str) -> str:
    """Normalize column names to snake_case."""

    name = name.strip().lower()
    name = re.sub(r"[^0-9a-zA-Z]+", "_", name)
    return re.sub(r"_+", "_", name).strip("_")


def normalize_dataframe_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Return a copy of *df* with normalized column names."""

    normalized = df.copy()
    normalized.columns = [normalize_column_name(col) for col in df.columns]
    return normalized


def add_source_column(df: pd.DataFrame, source_name: str) -> pd.DataFrame:
    """Return a copy of *df* with an added ``source`` column."""

    enriched = df.copy()
    enriched["source"] = source_name
    return enriched


def consolidate_frames(frames: Mapping[str, pd.DataFrame]) -> pd.DataFrame:
    """Normalize and combine multiple frames into a single dataframe."""

    processed_frames = []
    for source, frame in frames.items():
        normalized = normalize_dataframe_columns(frame)
        processed_frames.append(add_source_column(normalized, source))
    if not processed_frames:
        return pd.DataFrame()
    return pd.concat(processed_frames, ignore_index=True, sort=False)


def to_csv(df: pd.DataFrame, path: str | Path, *, index: bool = False) -> None:
    """Persist a dataframe to CSV."""

    df.to_csv(path, index=index)
