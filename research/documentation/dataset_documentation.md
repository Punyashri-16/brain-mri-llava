# BraTS 2021 Dataset Documentation

## 1. Overview

This project, "Radiology-Guided Explainable Brain MRI Analysis using LLaVA", uses the Brain Tumor Segmentation (BraTS) 2021 dataset for exploratory research into structured MRI report generation using a vision-language model.

The dataset provides multi-modal brain MRI volumes and corresponding reference segmentation masks.

**Dataset details**

- Dataset: BraTS 2021
- Source: Kaggle - dschettler8845/brats-2021-task1
- Baseline sample: `BraTS2021_00495`
- Data format: Compressed NIfTI (`.nii.gz`)
- Intended use: Research and educational experimentation

The dataset source and its applicable usage and redistribution conditions should be acknowledged whenever the data is used or shared.

## 2. MRI Modalities

Each sample contains four MRI modalities:

| Modality | Description |
|---|---|
| T1 | T1-weighted MRI |
| T1ce | Contrast-enhanced T1-weighted MRI |
| T2 | T2-weighted MRI |
| FLAIR | Fluid-attenuated inversion recovery MRI |

A segmentation volume is also provided as a reference annotation.

The baseline experiment uses the preprocessed T1CE image as the input to LLaVA. The other modalities are retained in the preprocessing outputs for dataset inspection and research purposes.

## 3. Dataset Sample Structure

The baseline sample is:

`BraTS2021_00495`

The original sample contains five NIfTI volumes:

- `BraTS2021_00495_t1.nii.gz`
- `BraTS2021_00495_t1ce.nii.gz`
- `BraTS2021_00495_t2.nii.gz`
- `BraTS2021_00495_flair.nii.gz`
- `BraTS2021_00495_seg.nii.gz`

The original volumes are stored separately from the generated PNG images.

## 4. Dataset Inspection

The inspected baseline sample has the following properties:

| Property | Observed value |
|---|---|
| Original volume dimensions | 240 × 240 × 155 |
| Voxel spacing | 1 × 1 × 1 mm |
| Original orientation | LPS |
| MRI modalities | T1, T1ce, T2, FLAIR |
| Segmentation labels observed | 0, 1, 2, 4 |

The preprocessing pipeline converts the volumes to canonical RAS orientation before selecting and processing an axial slice.

The dimensions, spacing and orientation above describe the inspected baseline sample and should not be assumed to apply to every BraTS sample without verification.

## 5. Segmentation Reference Labels

The project evaluation script uses the following label descriptions:

| Label value | Project-defined description |
|---|---|
| 0 | Background |
| 1 | Necrotic / non-enhancing tumour core |
| 2 | Peritumoral edema |
| 4 | Enhancing tumour |

These descriptions reflect the current project implementation. They should be checked against the official dataset annotation documentation before being treated as definitive dataset terminology.

The segmentation mask is a reference annotation. It is used during preprocessing for slice selection and can be evaluated separately. It is not supplied as an input to LLaVA in the baseline experiment.

## 6. Preprocessed Dataset Outputs

The baseline preprocessing pipeline stores generated files under:

`data/processed/BraTS2021_00495/`

Expected outputs:

| File | Description |
|---|---|
| `T1_slice.png` | Selected T1 MRI slice |
| `T1CE_slice.png` | Selected T1ce MRI slice |
| `T2_slice.png` | Selected T2 MRI slice |
| `FLAIR_slice.png` | Selected FLAIR MRI slice |
| `segmentation_mask.png` | Resized reference segmentation mask |
| `combined_mri.png` | Labelled four-modality panel |
| `metadata.json` | Preprocessing metadata |

The individual MRI images are 336 × 336 RGB PNG files. The segmentation mask is a 336 × 336 grayscale PNG.

These are processed representations of the original volumes, not replacements for the original NIfTI data.

## 7. Baseline Experiment Dataset Configuration

According to `research/experiments/experiment_metadata.json`, the baseline experiment uses:

- Sample: `BraTS2021_00495`
- Input modality: T1CE
- Input image: `T1CE_slice.png`
- Input dimensions: 336 × 336
- Reference mask available: Yes
- Reference mask used as model input: No

The same MRI input is used across the four prompt configurations:

1. Generic
2. Tumor-focused
3. Radiology-guided
4. Safety-aware

The experiment is currently marked as pending. No completed experimental results are reported in this document.

## 8. Dataset Handling and Attribution

- Original NIfTI volumes should be preserved without modification.
- Raw dataset files should not be committed to the public Git repository.
- Dataset attribution and applicable usage permissions must be respected.
- Processed images and metadata should be handled in accordance with the dataset's terms and project privacy requirements.
- Dataset files should not be shared publicly unless redistribution is permitted.

## 9. Intended Use

The dataset is used for research and educational experimentation involving MRI preprocessing, reference annotations and structured report generation.

The project is not a clinically validated diagnostic system. Its generated descriptions must not be treated as medical diagnoses or substitutes for professional radiological assessment.

## 10. Documentation Scope

This document describes the baseline dataset sample and the dataset configuration recorded in the current project `main` branch.

The repository also contains a separate `data-processing` branch with configurable multi-sample preprocessing changes. Those changes have not been assumed to be part of the current baseline implementation.
