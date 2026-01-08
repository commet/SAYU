"""High level pipeline orchestration for the SAYU data workspace."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Mapping

import pandas as pd

from .config import DataWorkspaceConfig
from . import loader, processor


@dataclass
class PipelineResult:
    """Container for pipeline artifacts."""

    combined_frame: pd.DataFrame
    sources: Mapping[str, pd.DataFrame]


class DataPipeline:
    """Coordinates loading, normalization, and export of SAYU datasets."""

    def __init__(self, config: DataWorkspaceConfig) -> None:
        self.config = config

    def load_sources(self) -> Mapping[str, pd.DataFrame]:
        """Load all available raw CSV datasets."""

        self.config.ensure_directories()
        return loader.load_all_csv(self.config.raw_csv_dir)

    def transform(self, sources: Mapping[str, pd.DataFrame]) -> pd.DataFrame:
        """Normalize and consolidate raw dataframes."""

        return processor.consolidate_frames(sources)

    def export(self, frame: pd.DataFrame) -> Path:
        """Persist the processed dataset and return its path."""

        self.config.processed_dir.mkdir(parents=True, exist_ok=True)
        output_path = self.config.processed_dir / "combined.csv"
        processor.to_csv(frame, output_path)
        return output_path

    def run(self) -> PipelineResult:
        """Execute the pipeline end-to-end."""

        sources = self.load_sources()
        combined_frame = self.transform(sources)
        if not combined_frame.empty:
            self.export(combined_frame)
        return PipelineResult(combined_frame=combined_frame, sources=sources)
