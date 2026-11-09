
from pathlib import Path
import json

import cv2
import nibabel as nib
import numpy as np
from PIL import Image, ImageDraw


# --------------------------------------------------
# CONFIGURATION
# --------------------------------------------------

DATASET_DIR = Path("data/dataset/samples/BraTS2021_00495")
OUTPUT_DIR = Path("data/processed/BraTS2021_00495")

PATIENT_ID = "BraTS2021_00495"
IMAGE_SIZE = (336, 336)

MODALITIES = ["t1", "t1ce", "t2", "flair"]


# --------------------------------------------------
# HELPER: CONVERT NUMPY VALUES TO JSON-SAFE TYPES
# --------------------------------------------------

def convert_numpy_types(obj):
    if isinstance(obj, dict):
        return {
            key: convert_numpy_types(value)
            for key, value in obj.items()
        }

    elif isinstance(obj, list):
        return [convert_numpy_types(value) for value in obj]

    elif isinstance(obj, np.ndarray):
        return obj.tolist()

    elif isinstance(obj, np.generic):
        return obj.item()

    return obj


# --------------------------------------------------
# LOAD MRI VOLUMES
# --------------------------------------------------

def load_volumes():

    print("Loading MRI volumes...")

    volumes = {}

    for modality in MODALITIES + ["seg"]:

        file_path = DATASET_DIR / f"{PATIENT_ID}_{modality}.nii.gz"

        if not file_path.exists():
            raise FileNotFoundError(
                f"Missing MRI file: {file_path}"
            )

        image = nib.load(str(file_path))

        volumes[modality] = image

        print(
            f"Loaded {modality.upper()}: "
            f"shape={image.shape}"
        )

    # Validate dimensions
    shapes = [image.shape for image in volumes.values()]

    if len(set(shapes)) != 1:
        raise ValueError("MRI volumes have mismatched dimensions.")

    # Validate affine alignment
    reference_affine = volumes["seg"].affine

    for modality, image in volumes.items():
        if not np.allclose(image.affine, reference_affine):
            raise ValueError(
                f"Affine mismatch detected in {modality.upper()}."
            )

    return volumes


# --------------------------------------------------
# CONVERT TO CANONICAL RAS ORIENTATION
# --------------------------------------------------

def convert_orientation(volumes):

    print("\nConverting volumes to RAS orientation...")

    canonical = {}

    for modality, image in volumes.items():
        canonical[modality] = nib.as_closest_canonical(image)

    # Confirm alignment after conversion
    reference_shape = canonical["seg"].shape
    reference_affine = canonical["seg"].affine

    for modality, image in canonical.items():

        if image.shape != reference_shape:
            raise ValueError(
                f"Shape mismatch after orientation conversion: {modality}"
            )

        if not np.allclose(image.affine, reference_affine):
            raise ValueError(
                f"Affine mismatch after orientation conversion: {modality}"
            )

    return canonical


# --------------------------------------------------
# SELECT AXIAL SLICE USING SEGMENTATION MASK
# --------------------------------------------------

def select_tumour_slice(segmentation):

    tumour_areas = np.count_nonzero(
        segmentation > 0,
        axis=(0, 1)
    )

    if tumour_areas.max() == 0:
        raise ValueError("No tumour labels found in segmentation mask.")

    max_area = tumour_areas.max()

    candidate_slices = np.flatnonzero(
        tumour_areas == max_area
    )

    centre = segmentation.shape[2] // 2

    selected_slice = min(
        candidate_slices,
        key=lambda index: abs(index - centre)
    )

    tumour_pixels = int(tumour_areas[selected_slice])

    print(f"Selected axial slice: {selected_slice}")
    print(f"Tumour pixels on selected slice: {tumour_pixels}")

    return int(selected_slice), tumour_pixels


# --------------------------------------------------
# NORMALIZE MRI INTENSITY
# --------------------------------------------------

def normalize_image(image_slice):

    image_slice = image_slice.astype(np.float32)

    # Use non-zero voxels for intensity statistics
    brain_voxels = image_slice[image_slice > 0]

    if brain_voxels.size == 0:
        raise ValueError("MRI slice contains no non-zero voxels.")

    lower = float(np.percentile(brain_voxels, 1))
    upper = float(np.percentile(brain_voxels, 99))

    if upper <= lower:
        raise ValueError("Invalid intensity range in MRI slice.")

    clipped = np.clip(image_slice, lower, upper)

    normalized = (
        (clipped - lower) / (upper - lower) * 255
    )

    normalized[image_slice <= 0] = 0

    normalized = normalized.astype(np.uint8)

    # Resize using linear interpolation
    resized = cv2.resize(
        normalized,
        IMAGE_SIZE,
        interpolation=cv2.INTER_LINEAR
    )

    # Convert grayscale to RGB
    rgb_image = cv2.cvtColor(
        resized,
        cv2.COLOR_GRAY2RGB
    )

    return rgb_image, lower, upper


# --------------------------------------------------
# SAVE INDIVIDUAL MRI IMAGES
# --------------------------------------------------

def save_mri_images(volumes, slice_index):

    print("\nProcessing MRI modalities...")

    output_images = {}
    normalization_info = {}

    for modality in MODALITIES:

        volume = np.asarray(
            volumes[modality].dataobj,
            dtype=np.float32
        )

        image_slice = volume[:, :, slice_index]

        rgb_image, lower, upper = normalize_image(
            image_slice
        )

        filename = f"{modality.upper()}_slice.png"

        output_path = OUTPUT_DIR / filename

        Image.fromarray(rgb_image).save(output_path)

        output_images[modality] = rgb_image

        normalization_info[modality] = {
            "percentile_lower": lower,
            "percentile_upper": upper,
            "method": "1st-99th percentile clipping",
            "resize": list(IMAGE_SIZE)
        }

        print(f"Saved: {output_path}")

    return output_images, normalization_info


# --------------------------------------------------
# SAVE SEGMENTATION MASK
# --------------------------------------------------

def save_segmentation_mask(segmentation, slice_index):

    mask_slice = segmentation[:, :, slice_index]

    # Preserve original labels: 0, 1, 2, 4
    mask_slice = mask_slice.astype(np.uint8)

    resized_mask = cv2.resize(
        mask_slice,
        IMAGE_SIZE,
        interpolation=cv2.INTER_NEAREST
    )

    output_path = OUTPUT_DIR / "segmentation_mask.png"

    Image.fromarray(resized_mask).save(output_path)

    print(f"Saved: {output_path}")

    return resized_mask


# --------------------------------------------------
# CREATE FOUR-PANEL MRI IMAGE
# --------------------------------------------------

def create_combined_image(output_images):

    print("\nCreating combined MRI image...")

    panel_width, panel_height = IMAGE_SIZE

    label_height = 35

    combined = Image.new(
        "RGB",
        (
            panel_width * 2,
            (panel_height + label_height) * 2
        ),
        "black"
    )

    draw = ImageDraw.Draw(combined)

    labels = [
        ("t1", "T1"),
        ("t1ce", "T1CE"),
        ("t2", "T2"),
        ("flair", "FLAIR")
    ]

    positions = [
        (0, 0),
        (panel_width, 0),
        (0, panel_height + label_height),
        (panel_width, panel_height + label_height)
    ]

    for (modality, label), (x, y) in zip(labels, positions):

        image = Image.fromarray(
            output_images[modality]
        )

        combined.paste(
            image,
            (x, y + label_height)
        )

        draw.text(
            (x + 10, y + 10),
            label,
            fill="white"
        )

    output_path = OUTPUT_DIR / "combined_mri.png"

    combined.save(output_path)

    print(f"Saved: {output_path}")


# --------------------------------------------------
# SAVE METADATA
# --------------------------------------------------

def save_metadata(
    original_volumes,
    canonical_volumes,
    slice_index,
    tumour_pixels,
    normalization_info,
    mask
):

    reference = original_volumes["seg"]

    metadata = {

        "patient_id": PATIENT_ID,

        "original_dimensions": list(reference.shape),

        "original_voxel_spacing": [
            float(value)
            for value in reference.header.get_zooms()
        ],

        "original_orientation": list(
            nib.aff2axcodes(reference.affine)
        ),

        "canonical_orientation": list(
            nib.aff2axcodes(
                canonical_volumes["seg"].affine
            )
        ),

        "selected_axial_slice": slice_index,

        "slice_selection_method": (
            "Largest non-zero segmentation area; "
            "ties resolved nearest to volume centre"
        ),

        "tumour_pixels_on_selected_slice": tumour_pixels,

        "selection_note": (
            "Ground-truth-guided slice selection using "
            "segmentation mask; not an AI prediction."
        ),

        "image_resize": list(IMAGE_SIZE),

        "image_channels": 3,

        "interpolation": "Linear for MRI, nearest-neighbour for mask",

        "normalization": normalization_info,

        "segmentation_labels": [
            int(value)
            for value in np.unique(mask)
        ],

        "output_files": [
            "T1_slice.png",
            "T1CE_slice.png",
            "T2_slice.png",
            "FLAIR_slice.png",
            "segmentation_mask.png",
            "combined_mri.png"
        ]
    }

    metadata = convert_numpy_types(metadata)

    output_path = OUTPUT_DIR / "metadata.json"

    with open(output_path, "w", encoding="utf-8") as file:

        json.dump(
            metadata,
            file,
            indent=4
        )

    print(f"Saved: {output_path}")


# --------------------------------------------------
# MAIN FUNCTION
# --------------------------------------------------

def main():

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    original_volumes = load_volumes()

    canonical_volumes = convert_orientation(
        original_volumes
    )

    segmentation = np.asarray(
        canonical_volumes["seg"].dataobj
    )

    slice_index, tumour_pixels = select_tumour_slice(
        segmentation
    )

    output_images, normalization_info = save_mri_images(
        canonical_volumes,
        slice_index
    )

    resized_mask = save_segmentation_mask(
        segmentation,
        slice_index
    )

    create_combined_image(output_images)

    save_metadata(
        original_volumes,
        canonical_volumes,
        slice_index,
        tumour_pixels,
        normalization_info,
        resized_mask
    )

    print("\n" + "=" * 50)
    print("PREPROCESSING COMPLETED SUCCESSFULLY!")
    print("=" * 50)


if __name__ == "__main__":
    main()
