# MRI Preprocessing Methodology

## 1. Overview

The preprocessing pipeline converts the original BraTS 2021 MRI volumes into standardized 2D images suitable for exploratory vision-language model experiments.

The baseline implementation processes the sample `BraTS2021_00495`.

Four MRI modalities are processed independently:

- T1
- T1ce
- T2
- FLAIR

The segmentation volume is processed separately as a reference annotation.

The original NIfTI files are not modified.

## 2. Input Data

The pipeline expects five NIfTI volumes in:

`data/dataset/samples/BraTS2021_00495/`

The expected files are:

- `BraTS2021_00495_t1.nii.gz`
- `BraTS2021_00495_t1ce.nii.gz`
- `BraTS2021_00495_t2.nii.gz`
- `BraTS2021_00495_flair.nii.gz`
- `BraTS2021_00495_seg.nii.gz`

The four MRI volumes contain image intensities. The segmentation volume contains reference annotation labels.

## 3. Volume Loading and Validation

The preprocessing script loads all five NIfTI volumes using NiBabel.

Before processing, it performs the following checks:

1. Verifies that all expected input files exist.
2. Checks that the five volumes have matching dimensions.
3. Compares the affine matrices against the segmentation volume's affine matrix.
4. Raises an error if dimensions or affine alignment do not match.

This validation helps ensure that the MRI modalities and reference segmentation correspond spatially before further processing.

## 4. Orientation Standardization

The loaded volumes are converted to canonical RAS orientation using NiBabel's `as_closest_canonical()` function.

RAS represents:

- Right
- Anterior
- Superior

After conversion, the script checks the dimensions and affine alignment of the canonical volumes again.

Slice selection and subsequent processing use these canonical volumes.

The original source orientation recorded for the baseline sample is LPS. Canonical orientation conversion provides a consistent orientation convention for processing.

## 5. Axial Slice Selection

The preprocessing pipeline selects one axial slice using the reference segmentation volume.

The procedure is:

1. Identify all non-background voxels in the segmentation volume.
2. Calculate the number of non-background voxels in each axial slice.
3. Identify the slice or slices with the largest annotated area.
4. If multiple slices have the same maximum area, select the slice nearest the volume centre.

The selected slice index refers to the canonical RAS volume.

**Important methodological consideration:** This is ground-truth-guided slice selection. It uses the reference segmentation annotation to identify a slice containing the largest annotated region. It is not an AI prediction and does not represent an independently selected clinical input.

This selection method introduces potential selection bias and should be considered when interpreting experimental findings.

## 6. MRI Intensity Normalization

Each MRI modality is normalized independently on the selected 2D axial slice.

The procedure is:

1. Convert the selected slice to 32-bit floating-point values.
2. Identify non-zero intensity voxels.
3. Calculate the 1st percentile and 99th percentile of those voxels.
4. Clip intensities to the calculated percentile range.
5. Scale the clipped values to the range 0–255.
6. Set background voxels to zero.
7. Convert the normalized image to an 8-bit unsigned integer representation.

If a selected slice contains no non-zero voxels, the normalization function raises an error.

The lower and upper percentile values are recorded in the preprocessing metadata for each modality.

The normalization statistics are calculated separately for each modality and selected slice. They are not shared across modalities or calculated across the complete 3D volume.

## 7. Image Resizing and RGB Conversion

After normalization, each MRI slice is resized to:

`336 × 336 pixels`

The pipeline uses linear interpolation (`INTER_LINEAR`) for MRI image resizing.

The resized grayscale image is then converted to a three-channel RGB image.

This produces standardized image dimensions and channel representation for the downstream vision-language model input.

## 8. Segmentation Mask Processing

The segmentation volume is processed independently from the MRI intensity images.

The mask slice corresponding to the selected axial index is extracted.

The mask is resized to 336 × 336 pixels using nearest-neighbour interpolation.

Nearest-neighbour interpolation is used to preserve discrete segmentation label values rather than introducing interpolated intensity values.

The mask is saved as a grayscale PNG.

The reference mask is retained for annotation inspection and separate reference-mask analysis. It is not supplied as an input to LLaVA in the baseline experiment.

## 9. Combined MRI Image

The four resized MRI images are assembled into a labelled four-panel image.

The panel contains:

- T1
- T1CE
- T2
- FLAIR

The combined image is intended for visual inspection and comparison of the modalities.

It is not the input image specified by the baseline experiment metadata, which identifies `T1CE_slice.png` as the LLaVA input.

## 10. Generated Files

The baseline output directory is:

`data/processed/BraTS2021_00495/`

The preprocessing pipeline generates:

| Output | Description |
|---|---|
| `T1_slice.png` | Normalized T1 slice |
| `T1CE_slice.png` | Normalized T1ce slice |
| `T2_slice.png` | Normalized T2 slice |
| `FLAIR_slice.png` | Normalized FLAIR slice |
| `segmentation_mask.png` | Resized reference mask |
| `combined_mri.png` | Labelled four-panel MRI image |
| `metadata.json` | Preprocessing metadata |

## 11. Metadata Recording

The preprocessing script records metadata including:

- Sample identifier
- Original volume dimensions
- Voxel spacing
- Original and canonical orientations
- Selected axial slice index
- Reference annotation pixel count on the selected original slice
- Per-modality normalization percentile values
- Output image dimensions
- Interpolation methods
- Generated output filenames

The metadata supports traceability and reproducibility of the preprocessing procedure.

The reference annotation pixel count in the preprocessing metadata refers to the selected original slice before mask resizing. It should not be directly compared with pixel counts calculated from the resized PNG mask because the pixel grids differ.

## 12. Reference Mask Evaluation

The separate script:

`data/scripts/evaluate_reference_mask.py`

reads:

`data/processed/BraTS2021_00495/segmentation_mask.png`

It calculates:

- Total image pixels
- Annotated pixel count
- Annotated area percentage
- Per-label pixel counts
- Per-label area percentages
- Bounding boxes
- Centroids

The script uses the project-defined descriptions for labels 1, 2 and 4.

Its intended output is:

`data/processed/BraTS2021_00495/reference_mask_metrics.json`

These statistics describe the resized reference annotation. They are not model predictions, segmentation accuracy measurements or clinical measurements.

The metrics file was not present in the inspected baseline output directory at the time of documentation. Therefore, no generated reference-mask statistics are reported here.

## 13. Baseline Model Input

According to the experiment metadata, the baseline LLaVA experiment uses:

- Input image: `T1CE_slice.png`
- Dimensions: 336 × 336
- Model: LLaVA
- Runtime: Ollama
- Temperature: 0.1
- Maximum generated tokens: 350

The same MRI image is used across four prompt configurations.

The reference segmentation mask is not used as model input.

## 14. Reproducibility and Limitations

The documented preprocessing procedure describes the implementation currently present on the project `main` branch.

The separate `data-processing` branch contains configurable multi-sample preprocessing changes. Those changes are not assumed to be part of this baseline implementation.

Reproducing the experiment requires access to the original dataset sample, compatible dependencies, the preprocessing scripts and the recorded experiment configuration.

The selected slice depends on the reference segmentation annotation. Consequently, the pipeline should not be interpreted as an automated tumour-localization method.

The baseline uses one sample and one selected axial slice. Its outputs cannot establish general performance across patients, MRI acquisition settings or clinical populations.
