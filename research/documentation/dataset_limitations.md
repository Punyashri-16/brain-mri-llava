# Dataset and Research Limitations

## 1. Overview

This document describes the limitations of the dataset, preprocessing pipeline and experimental design used in the project "Radiology-Guided Explainable Brain MRI Analysis using LLaVA".

The current baseline is an exploratory research experiment. Its findings must not be interpreted as evidence of clinical diagnostic performance.

## 2. Limited Dataset Coverage

The current baseline experiment uses one BraTS 2021 sample:

`BraTS2021_00495`

A single sample cannot represent the diversity of brain MRI appearances across different patients, acquisition settings, scanners or clinical populations.

The results of this experiment cannot establish that the approach generalizes to other samples or datasets.

Although additional samples have been processed locally in a separate workflow, they are not part of the baseline experiment configuration recorded in `experiment_metadata.json`.

## 3. Single-Slice Representation

The preprocessing pipeline selects one axial slice from each 3D MRI volume.

This reduces the original volumetric information to a two-dimensional representation.

Information present in other slices and in the three-dimensional spatial relationships between structures is not available to the baseline LLaVA input.

Consequently, the experiment does not evaluate complete volumetric MRI interpretation.

## 4. Ground-Truth-Guided Slice Selection

The selected slice is determined using the reference segmentation mask.

The pipeline selects the axial slice with the largest non-background annotated area. Ties are resolved by choosing the slice nearest the volume centre.

This introduces a methodological limitation:

- Slice selection depends on prior access to the reference annotation.
- The selected image may not represent an independently identified region of interest.
- The approach does not demonstrate automated tumour localization.
- Results may not reflect performance when an input slice is selected without ground-truth information.

This limitation must be considered when interpreting the generated reports.

## 5. Single-Modality Model Input

The preprocessing pipeline generates images for four MRI modalities:

- T1
- T1ce
- T2
- FLAIR

However, the baseline experiment metadata specifies only `T1CE_slice.png` as the LLaVA input.

Therefore, the baseline does not evaluate multi-modal fusion or the combined contribution of all four MRI modalities to report generation.

The other modality images are available as preprocessing outputs but are not specified as inputs to the baseline experiment.

## 6. Preprocessing Limitations

The preprocessing pipeline applies independent intensity normalization to each modality using the 1st and 99th percentiles of non-zero voxels on the selected two-dimensional slice.

This approach has several limitations:

- Intensity information is transformed during clipping and scaling.
- Independent normalization does not preserve a shared intensity scale across modalities.
- Slice-level normalization may produce different intensity mappings across samples and slices.
- Resizing changes the spatial sampling of the original image.

The processed PNG images should therefore not be treated as equivalent to the original quantitative MRI volumes.

## 7. Reference Segmentation Limitations

The segmentation mask is used for ground-truth-guided slice selection and separate annotation analysis.

The baseline metadata explicitly records that the reference mask is not used as a model input.

The reference-mask evaluation script calculates pixel counts, area percentages, bounding boxes and centroids from the resized PNG mask.

These measurements describe the reference annotation only.

They do not establish:

- AI segmentation performance
- Agreement between model predictions and ground truth
- Tumour detection accuracy
- Clinical tumour measurements

The evaluation script's label descriptions should also be checked against the official dataset annotation documentation before being treated as definitive terminology.

## 8. Reference Mask Measurement Considerations

The preprocessing metadata records the annotated pixel count on the selected original-resolution slice.

The separate reference-mask evaluation script calculates pixel counts after resizing the mask to 336 × 336 pixels.

These measurements use different pixel grids and should not be directly compared as if they represented identical pixel areas.

Furthermore, the generated `reference_mask_metrics.json` file was absent from the inspected baseline output directory during this documentation audit.

No numerical reference-mask evaluation results are claimed in this document.

## 9. Vision-Language Model Limitations

The baseline uses LLaVA through Ollama to generate structured descriptions from an MRI image.

Vision-language models can produce statements that are incomplete, ambiguous or unsupported by the visual input.

Potential limitations include:

- Incorrect interpretation of image features
- Unsupported descriptions of anatomical structures
- Inconsistent findings across prompt configurations
- Omission of relevant observations
- Inadequate communication of uncertainty

A structured or fluent report does not necessarily represent a factually correct interpretation.

The generated reports require careful research evaluation and must not be treated as clinical diagnoses.

## 10. Evaluation Metric Limitations

The baseline experiment uses Assessable Field Rate across seven report fields:

1. Findings
2. Location
3. Lesion characteristics
4. Edema
5. Mass effect
6. Interpretation
7. Uncertainty

The metric measures whether report fields contain assessable information.

It does not establish:

- Factual correctness
- Radiological interpretation accuracy
- Agreement with expert radiologists
- Tumour segmentation accuracy
- Clinical safety
- Diagnostic performance

A report may contain assessable information while still making unsupported or incorrect statements.

The evaluation therefore measures a limited aspect of report completeness rather than overall clinical quality.

## 11. Limited Experimental Scope

The baseline experiment compares four prompt configurations:

- Generic
- Tumor-focused
- Radiology-guided
- Safety-aware

All configurations use the same T1CE input image.

The experiment is currently marked as pending in `experiment_metadata.json`.

Until the experiment is completed and its outputs are reviewed, no comparative performance conclusions can be made.

Even after completion, a single-sample experiment would provide limited evidence about the relative performance of the prompt configurations.

## 12. Lack of Clinical Validation

The project is an exploratory educational research system.

It has not established clinical validity or diagnostic reliability.

The current experimental setup does not include sufficient evidence to demonstrate:

- Clinical diagnostic accuracy
- Clinical safety
- Generalisability to patient populations
- Suitability for clinical decision-making

The generated outputs must not replace professional radiological interpretation or medical assessment.

## 13. Dataset Access and Reproducibility

Reproduction of the experiment depends on access to the original BraTS 2021 sample, the preprocessing implementation, compatible software dependencies and the recorded experiment configuration.

Dataset access and redistribution are subject to the applicable source terms and permissions.

Raw dataset files should not be committed to the public repository.

The configurable preprocessing implementation exists on a separate `data-processing` branch and has not been assumed to be part of the current baseline `main` implementation.

## 14. Future Work

Future research could address the limitations identified above by:

1. Evaluating additional BraTS samples.
2. Including multiple slices or volumetric information.
3. Investigating slice-selection methods that do not depend on reference annotations.
4. Comparing single-modality and multi-modal inputs.
5. Evaluating consistency and factual support in generated reports.
6. Comparing generated reports with suitable expert-reviewed references.
7. Investigating additional evaluation measures beyond field completeness.
8. Conducting broader validation before making any claims about clinical applicability.

These are potential future research directions, not completed project results.

## 15. Conclusion

The current baseline provides an initial framework for exploring structured, radiology-guided MRI report generation using a vision-language model.

Its single-sample, single-slice design, reference-guided preprocessing and limited completeness-based evaluation constrain the conclusions that can be drawn.

All findings must be interpreted within these limitations. The project does not establish clinical diagnostic performance or readiness for clinical use.
