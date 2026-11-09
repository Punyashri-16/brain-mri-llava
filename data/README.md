# BraTS MRI Dataset and Preprocessing

## 1. Dataset

- **Dataset:** BraTS 2021
- **Source:** Kaggle - dschettler8845/brats-2021-task1
- **Sample:** BraTS2021_00495

The sample contains four MRI modalities:
- T1
- T1ce
- T2
- FLAIR

It also contains a segmentation mask.

Original MRI volumes are preserved in NIfTI (`.nii.gz`) format.

## 2. Dataset Inspection

The sample volume has the following properties:

- Dimensions: 240 x 240 x 155
- Voxel spacing: 1 x 1 x 1 mm
- Original orientation: LPS
- Modalities: T1, T1ce, T2, FLAIR
- Segmentation labels: 0, 1, 2, 4

## 3. Preprocessing Pipeline

1. Load all four MRI modalities and the segmentation mask.
2. Verify matching dimensions and affine information.
3. Convert volumes to canonical RAS orientation for processing.
4. Select the axial slice containing the largest non-zero tumour-mask area. If multiple slices have the same area, select the one nearest the volume centre.
5. Normalize each MRI modality independently using the 1st and 99th percentiles of non-zero voxels.
6. Resize MRI slices to 336 x 336 pixels using linear interpolation.
7. Convert grayscale MRI slices into RGB images.
8. Resize segmentation masks using nearest-neighbour interpolation to preserve label values.
9. Generate a combined four-panel MRI image.

**Important:** Slice selection uses the ground-truth segmentation mask for sample preparation and evaluation. It is not an AI tumour prediction.

## 4. Generated Outputs

Generated files are stored in:

`data/processed/BraTS2021_00495/`

The output includes:

- `T1_slice.png`
- `T1CE_slice.png`
- `T2_slice.png`
- `FLAIR_slice.png`
- `segmentation_mask.png`
- `combined_mri.png`
- `metadata.json`

Individual MRI images are 336 x 336 RGB PNG files.

The segmentation mask is a 336 x 336 grayscale PNG.

The combined image contains all four MRI modalities in a labelled four-panel layout.

## 5. Metadata

The `metadata.json` file records:

- Patient/sample identifier
- Original dimensions and voxel spacing
- Original and canonical orientations
- Selected slice index
- Tumour pixel count
- Normalization parameters
- Image dimensions and interpolation methods
- Generated output filenames

## 6. Scripts

The preprocessing scripts are stored in `data/scripts/`:

- `inspect_brats.py` - Inspects MRI volume dimensions, spacing, orientation and segmentation labels.
- `preprocess_brats.py` - Performs MRI preprocessing, slice selection, mask processing and image generation.

## 7. Important Notes

- Original NIfTI volumes are not modified.
- Raw dataset files should not be committed to GitHub.
- Dataset attribution and usage permissions must be respected.
- Processed images are intended for research and educational purposes, not clinical diagnosis.
