"""Command line interface for running the SAYU data pipeline."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

import pandas as pd

from .sayu_data import DataPipeline, DataWorkspaceConfig


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the SAYU data processing pipeline")
    parser.add_argument(
        "--root",
        type=Path,
        default=Path.cwd(),
        help="Repository root. Defaults to the current working directory.",
    )
    parser.add_argument(
        "--summary",
        type=Path,
        default=None,
        help="Optional path to write a JSON summary of the run.",
    )
    return parser.parse_args()


def dataframe_summary(frame: pd.DataFrame) -> dict[str, Any]:
    """Compute a lightweight summary for the processed dataframe."""

    if frame.empty:
        return {"rows": 0, "columns": 0}
    return {
        "rows": int(frame.shape[0]),
        "columns": int(frame.shape[1]),
        "column_names": list(frame.columns),
    }


def main() -> None:
    args = parse_args()
    config = DataWorkspaceConfig.from_root(args.root)
    pipeline = DataPipeline(config)
    result = pipeline.run()

    summary = {
        "processed_file": str(config.processed_dir / "combined.csv"),
        "sources": sorted(result.sources.keys()),
        "dataframe": dataframe_summary(result.combined_frame),
    }

    if args.summary is not None:
        args.summary.parent.mkdir(parents=True, exist_ok=True)
        args.summary.write_text(json.dumps(summary, indent=2, ensure_ascii=False))

    print(json.dumps(summary, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
