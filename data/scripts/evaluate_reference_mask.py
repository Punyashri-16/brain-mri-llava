
from pathlib import Path
import json

import numpy as np
from PIL import Image

# Project paths
BASE_DIR = Path(__file__).resolve().parents[2]

MASK_PATH = (
    BASE_DIR
    / "data"
    / "processed"
    / "BraTS2021_00495"
    / "segmentation_mask.png"
)

OUTPUT_PATH = (
    BASE_DIR
    / "data"
    / "processed"
    / "BraTS2021_00495"
    / "reference_mask_metrics.json"
)

LABELS = {
    1: "Necrotic / non-enhancing tumour core",
    2: "Peritumoral edema",
    4: "Enhancing tumour",
}


def evaluate_mask():
    if not MASK_PATH.exists():
        raise FileNotFoundError(f"Mask not found: {MASK_PATH}")

    mask = np.array(Image.open(MASK_PATH).convert("L"))

    total_pixels = int(mask.size)
    tumour_pixels = int(np.count_nonzero(mask))

    results = {
        "patient_id": "BraTS2021_00495",
        "image_dimensions": list(mask.shape),
        "total_pixels": total_pixels,
        "annotated_pixels": tumour_pixels,
        "annotated_area_percentage": round(
            tumour_pixels / total_pixels * 100, 4
        ),
        "labels": {},
        "evaluation_note": (
            "Statistics from the dataset reference annotation. "
            "These are not AI predictions or clinical measurements."
        ),
    }

    observed_labels = set(np.unique(mask).tolist())
    expected_labels = {0, 1, 2, 4}

    if not observed_labels.issubset(expected_labels):
        raise ValueError(
            f"Unexpected mask values: {observed_labels}"
        )

    for label, description in LABELS.items():
        ys, xs = np.where(mask == label)
        count = int(len(xs))

        if count == 0:
            results["labels"][str(label)] = {
                "description": description,
                "pixel_count": 0,
                "area_percentage": 0.0,
                "bounding_box": None,
                "centroid": None,
            }
            continue

        results["labels"][str(label)] = {
            "description": description,
            "pixel_count": count,
            "area_percentage": round(
                count / total_pixels * 100, 4
            ),
            "percentage_of_annotated_area": round(
                count / tumour_pixels * 100, 2
            ),
            "bounding_box": {
                "x_min": int(xs.min()),
                "y_min": int(ys.min()),
                "x_max": int(xs.max()),
                "y_max": int(ys.max()),
            },
            "centroid": {
                "x": round(float(xs.mean()), 2),
                "y": round(float(ys.mean()), 2),
            },
        }

    OUTPUT_PATH.write_text(
        json.dumps(results, indent=4),
        encoding="utf-8",
    )

    print(json.dumps(results, indent=4))
    print(f"\nSaved metrics to: {OUTPUT_PATH}")


if __name__ == "__main__":
    evaluate_mask()
