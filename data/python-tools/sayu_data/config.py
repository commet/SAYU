"""Configuration helpers for the SAYU data workspace."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class DataWorkspaceConfig:
    """File-system configuration for the SAYU data workspace.

    Parameters
    ----------
    root : str | Path
        Base directory for the repository.
    raw_csv_dir : str | Path | None, optional
        Override for the directory that stores raw CSV files.
    raw_pdf_dir : str | Path | None, optional
        Override for the directory that stores raw PDF files.
    processed_dir : str | Path | None, optional
        Override for the directory that stores processed data outputs.
    """

    root: Path
    raw_csv_dir: Path
    raw_pdf_dir: Path
    processed_dir: Path

    @classmethod
    def from_root(
        cls,
        root: str | Path,
        *,
        raw_csv_dir: str | Path | None = None,
        raw_pdf_dir: str | Path | None = None,
        processed_dir: str | Path | None = None,
    ) -> "DataWorkspaceConfig":
        base_path = Path(root).expanduser().resolve()
        raw_csv = Path(raw_csv_dir) if raw_csv_dir is not None else base_path / "data" / "raw" / "csv"
        raw_pdf = Path(raw_pdf_dir) if raw_pdf_dir is not None else base_path / "data" / "raw" / "pdf"
        processed = (
            Path(processed_dir)
            if processed_dir is not None
            else base_path / "data" / "processed"
        )

        return cls(
            root=base_path,
            raw_csv_dir=raw_csv,
            raw_pdf_dir=raw_pdf,
            processed_dir=processed,
        )

    def ensure_directories(self) -> None:
        """Create all configured directories if they do not already exist."""

        for directory in (self.raw_csv_dir, self.raw_pdf_dir, self.processed_dir):
            directory.mkdir(parents=True, exist_ok=True)
