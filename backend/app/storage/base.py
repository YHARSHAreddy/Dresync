"""
Abstract storage backend interface.
Swap local storage → S3 by implementing this class and changing one env variable.
"""

from abc import ABC, abstractmethod


class StorageBackend(ABC):
    @abstractmethod
    def save(self, file_bytes: bytes, filename: str, subfolder: str = "") -> str:
        """Save file and return the relative URL path."""
        ...

    @abstractmethod
    def delete(self, path: str) -> None:
        """Delete a file by its relative URL path."""
        ...

    @abstractmethod
    def get_url(self, path: str) -> str:
        """Return the full accessible URL for a given path."""
        ...
