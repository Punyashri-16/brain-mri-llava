# Independent Methodology Audit
## Radiology-Guided Explainable Brain MRI Analysis Using LLaVA

**Audit branch:** research-validation
**Audited baseline commit:** c446643
**Audit scope:** Dataset, preprocessing, model configuration, prompts, structured output, evaluation methodology, and experimental limitations.

---

## 1. Audit Objective

This audit independently examines whether the project's research documentation accurately describes its implementation.

The audit focuses on identifying:

- Differences between documented and implemented methods.
- Missing experimental configuration details.
- Weaknesses in the evaluation methodology.
- Potential sources of bias.
- Limitations affecting interpretation and reproducibility.

This is a documentation and methodology audit. No backend code, prompt definitions, or evaluation logic are modified.

## 2. Dataset and Sample Verification

### 2.1 Verified implementation

The repository identifies the dataset as BraTS 2021.

The documented baseline sample is:

`BraTS2021_00495`

The sample contains:

- T1
- T1ce
- T2
- FLAIR
- Segmentation mask

The dataset documentation reports original volume dimensions of 240 × 240 × 155 and voxel spacing of 1 × 1 × 1 mm.

### 2.2 Audit observations

The preprocessing script uses a hardcoded dataset directory and patient identifier for `BraTS2021_00495`.

The current baseline implementation therefore represents a single-sample preprocessing pipeline rather than a configurable multi-patient experiment.

The four modalities are processed independently, but the experiment metadata specifies T1CE as the model input.

### 2.3 Limitations

- One sample cannot establish generalisability across the BraTS dataset.
- The current experiment does not compare all four modalities.
- Dataset-level performance cannot be inferred from one selected sample.
- Dataset provenance and usage permissions should remain documented.

**Audit status:** Implementation and documentation are broadly consistent for the baseline sample.

---

## 3. MRI Preprocessing Audit

### 3.1 Verified implementation

The preprocessing script performs the following operations:

1. Loads four MRI modalities and the segmentation volume.
2. Checks that the volumes have matching dimensions.
3. Checks affine alignment using `numpy.allclose`.
4. Converts volumes to closest canonical RAS orientation using NiBabel.
5. Selects an axial slice using segmentation-mask area.
6. Normalizes each MRI modality independently.
7. Resizes MRI slices to 336 × 336 using linear interpolation.
8. Converts grayscale MRI images into RGB.
9. Resizes the segmentation mask using nearest-neighbour interpolation.
10. Saves metadata and generated images.

The original NIfTI volumes are not modified.

### 3.2 Intensity normalization

The implementation selects positive-valued voxels:

`brain_voxels = image_slice[image_slice > 0]`

It calculates the 1st and 99th percentiles independently for each modality and uses these values for clipping and scaling.

Pixels whose original values are zero or negative are reset to zero after normalization.

### 3.3 Documentation discrepancy

The documentation describes normalization using non-zero voxels.

The implementation specifically uses positive-valued voxels. These descriptions are not exactly equivalent.

**Recommendation:** Update the documentation to state that percentile statistics are calculated from positive-valued voxels.

### 3.4 Orientation handling

The code uses `nib.as_closest_canonical()` to convert image orientation to canonical RAS.

This is an orientation transformation, not an independent spatial resampling operation.

**Recommendation:** Avoid describing this step as resampling unless an additional resampling operation is implemented.

### 3.5 Slice-selection methodology

The implementation counts non-background segmentation pixels across axial slices and selects the slice with the largest annotated area.

If multiple slices have the same maximum area, the slice nearest to the volume centre is selected.

### 3.6 Potential selection bias

The segmentation mask is used to choose the input slice.

This means the selected image is ground-truth-guided rather than selected independently of the annotation.

The mask is not supplied as an input to LLaVA, according to the experiment metadata.

Nevertheless, the selection procedure may favour slices containing more visible annotated abnormality.

**Recommendation:** Clearly describe the experiment as ground-truth-guided slice selection. Do not describe it as unbiased random or representative slice selection.

### 3.7 Resizing

MRI images are resized using OpenCV linear interpolation.

Segmentation masks are resized using nearest-neighbour interpolation, preserving categorical label values.

The MRI images are converted to three-channel RGB images for model input.

**Audit status:** Preprocessing operations are identifiable and documented. The positive-voxel normalization detail and ground-truth-guided slice-selection limitation require explicit attention.

---

## 4. Segmentation-Mask Interpretation

### 4.1 Verified implementation

The preprocessing script preserves the segmentation labels:

- 0
- 1
- 2
- 4

The reference-mask evaluation script calculates:

- Total pixel count.
- Annotated pixel count.
- Annotated area percentage.
- Per-label pixel counts.
- Per-label area percentages.
- Bounding boxes.
- Centroids.

### 4.2 Important distinction

The reference-mask evaluation script measures properties of the dataset annotation.

It does not calculate:

- LLaVA segmentation accuracy.
- Tumour detection accuracy.
- Dice score.
- Intersection over Union.
- Model sensitivity or specificity.

The mask statistics must not be presented as AI prediction performance.

### 4.3 Mask availability versus model input

The experiment metadata states:

- Reference mask available: true.
- Mask used as model input: false.

This distinction should be retained in all experiment descriptions.

### 4.4 Label terminology

The evaluation script assigns descriptions to labels 1, 2, and 4.

These descriptions should be checked against the official BraTS 2021 annotation documentation before being treated as authoritative terminology.

**Audit status:** Annotation statistics are separate from model evaluation. Label terminology requires authoritative dataset verification.

---

## 5. LLaVA Input Configuration Audit

### 5.1 Verified implementation

The model service defines:

`MODEL_NAME = "llava"`

It uses the Ollama Python client and sends:

- A user prompt.
- The uploaded image bytes.
- JSON output formatting.
- Temperature of 0.1.
- Maximum prediction length of 350 tokens.

The experiment metadata specifies:

- Dataset: BraTS 2021.
- Sample: BraTS2021_00495.
- Input modality: T1CE.
- Input image: T1CE_slice.png.
- Image dimensions: 336 × 336.

### 5.2 Model identity limitation

The implementation uses the Ollama alias `llava`.

The repository does not pin an exact model tag, checkpoint digest, or model version in the inspected configuration.

Therefore, the exact model build used for an inference run cannot be established from the alias alone.

The project must not describe the deployed model as LLaVA-Med unless a corresponding model checkpoint is actually used.

### 5.3 API input validation

The analysis endpoint accepts PNG and JPEG images and checks:

- Whether the uploaded file is empty.
- Whether it exceeds 10 MB.
- Whether the image can be opened and verified.
- Whether the format is supported.

However, the API does not independently verify that the uploaded image is the specified BraTS sample or a T1CE image.

The T1CE restriction is part of the documented experimental procedure, not an enforced API-level validation rule.

### 5.4 Reproducibility recommendations

Record the following for every actual experiment:

- Ollama version.
- Exact model tag.
- Model digest, if available.
- Backend dependency versions.
- Operating environment.
- Input image filename and checksum.
- Inference date and time.
- Prompt configuration.
- Temperature and token limit.

**Audit status:** The model configuration is identifiable at alias level, but exact model version reproducibility is incomplete.

---

## 6. Prompt Configuration Audit

The backend defines four prompt configurations.

### 6.1 Generic

Requests a description of visible structures and abnormalities.

It instructs the model not to invent findings and to state uncertainty.

### 6.2 Tumor-focused

Directs attention towards possible tumour-related abnormalities, visible lesion characteristics, location, and surrounding tissue changes.

It also instructs the model not to assume that a tumour is present.

### 6.3 Radiology-guided

Uses a structured observation approach.

It requests findings, approximate location, lesion characteristics, oedema, mass effect, interpretation, and uncertainty.

It also instructs the model to distinguish direct visual observations from interpretations.

### 6.4 Safety-aware

Emphasizes observations supported by the image, explicit use of "Not assessable" when appropriate, and separation of observations from interpretations.

It also instructs the model not to present its response as a clinical diagnosis.

### 6.5 Audit observations

The four configurations differ in scope, organization, and safety instructions.

However, they do not isolate a single experimental variable.

For example, the radiology-guided prompt changes both the structure of the requested response and the instructions about observations and interpretation.

The safety-aware prompt adds explicit restrictions and uncertainty requirements.

Consequently, differences between generated reports cannot necessarily be attributed to one individual instruction.

**Recommendation:** Treat the experiment as a comparison of complete prompting strategies, not as a controlled test of one isolated prompt feature.

---

## 7. Structured Report Audit

### 7.1 Verified implementation

The `MRIReport` schema contains seven required string fields:

1. Findings
2. Location
3. Lesion characteristics
4. Edema
5. Mass effect
6. Interpretation
7. Uncertainty

The model service requests JSON output containing these fields.

It also provides fallback text when fields are missing from parsed model output.

### 7.2 Strengths

- A consistent report structure is used.
- All four prompt configurations share the same report schema.
- Uncertainty is represented explicitly.
- The model is instructed to return JSON only.

### 7.3 Limitations

A valid JSON response does not guarantee that its contents are medically correct.

The seven fields do not include:

- Image-region coordinates.
- Evidence links connecting claims to image regions.
- Confidence scores for individual findings.
- Independent verification of anatomical claims.

The current report format is structured text generation rather than fully grounded visual explainability.

**Audit status:** The seven-field structure is implemented. Factual grounding and image-region explainability are not established by the schema.

---

## 8. Evaluation Methodology Audit

### 8.1 Verified evaluation approach

The backend evaluates seven report fields.

It identifies fields as assessable or non-assessable based on whether they contain text and whether certain predefined phrases occur.

The implementation recognizes:

- `not assessable`
- `not provided`
- `unable to assess`
- `cannot be assessed`
- `not available`

The resulting percentage is calculated as:

`Assessable Field Rate = (Number of assessable fields / 7) × 100`

The evaluator also checks whether the uncertainty field contains text that is not recognized as non-assessable.

### 8.2 Critical wording mismatch

The API's mock report uses:

`Not assessed`

However, this phrase is not included in the evaluator's list of non-assessable indicators.

Consequently, a field containing `Not assessed` may be counted as assessable.

This is a verified implementation inconsistency.

### 8.3 Metric validity

Assessable Field Rate measures structural content availability according to predefined text rules.

It does not measure:

- Medical factual correctness.
- Anatomical localization accuracy.
- Tumour detection accuracy.
- Image-text grounding.
- Clinical diagnostic performance.
- Hallucination frequency.
- Uncertainty calibration.

A report can achieve a high score while containing unsupported or incorrect statements.

### 8.4 Uncertainty measurement

The current uncertainty check determines whether the uncertainty field contains text that is not classified as non-assessable.

It does not determine whether the model's uncertainty is appropriate or calibrated.

### 8.5 Recommended evaluation dimensions

Future evaluation could separately examine:

1. Structural completeness.
2. Factual correctness.
3. Image-grounded evidence.
4. Unsupported claims and hallucinations.
5. Anatomical consistency.
6. Cross-prompt consistency.
7. Uncertainty communication.

These are recommendations for research evaluation, not implemented metrics.

**Audit status:** The existing metric is suitable only as a basic structural completeness indicator.

---

## 9. Four-Prompt Comparison Procedure

### 9.1 Verified implementation

The comparison endpoint processes prompts in this fixed order:

1. Generic.
2. Tumor-focused.
3. Radiology-guided.
4. Safety-aware.

Each prompt receives the same uploaded image bytes.

Inference time is recorded separately for each prompt, and total comparison duration is also recorded.

### 9.2 Methodological limitations

The implementation uses a fixed sequential order.

The inspected endpoint does not implement:

- Randomized prompt order.
- Repeated trials.
- Multiple independent input samples.
- Statistical significance testing.
- Blinded human evaluation.

The absence of repeated trials limits the ability to estimate run-to-run variability.

The fixed order also means prompt configuration and execution order are not separated experimentally.

**Recommendation:** Describe the comparison as a single-run sequential prompt comparison unless actual experimental records establish otherwise.

---

## 10. Experimental Limitations

The following limitations are supported by the inspected documentation and implementation:

1. Only one BraTS 2021 sample is specified.
2. Only one T1CE slice is specified as the model input.
3. Slice selection uses the reference segmentation mask.
4. The exact Ollama model version is not pinned in the inspected model configuration.
5. The evaluation metric measures structural completeness, not medical accuracy.
6. The report schema does not establish image-region grounding.
7. The comparison endpoint uses a fixed prompt order.
8. Repeated inference trials are not implemented in the inspected comparison endpoint.
9. No clinical validation is demonstrated.
10. Results from a single sample cannot establish generalisability.

These limitations should be reflected in the interpretation of any experimental results.

---

## 11. Summary of Audit Findings

| Area | Finding | Priority |
|---|---|---|
| Dataset | Single-sample baseline | High |
| Slice selection | Ground-truth-guided selection | High |
| Normalization | Documentation says non-zero; code uses positive values | Medium |
| Model identity | Exact Ollama model version not pinned | High |
| API input | Does not enforce the documented T1CE sample | Medium |
| Prompt design | Multiple prompt features change simultaneously | Medium |
| Report structure | Seven fields implemented, but no image-region grounding | High |
| Evaluation | "Not assessed" is not recognized | High |
| Evaluation metric | Structural completeness only | High |
| Prompt comparison | Fixed sequential order, no repeated trials | Medium |
| Clinical validity | Not established | High |

## 12. Overall Conclusion

The inspected implementation provides a reproducible structure for an exploratory comparison of four prompting strategies using a single brain MRI image.

The preprocessing pipeline, prompt configurations, structured report schema, and basic completeness evaluator are identifiable in the source code.

However, several limitations affect the interpretation of generated reports. In particular, structural completeness must not be confused with factual correctness, the exact model version is not pinned, and the experiment uses ground-truth-guided slice selection.

The current system should therefore be described as an exploratory research prototype for structured MRI image explanation, not as a clinically validated diagnostic system.

No backend code or evaluation logic was modified as part of this audit.

## 13. Files Inspected

- `data/README.md`
- `data/scripts/preprocess_brats.py`
- `data/scripts/evaluate_reference_mask.py`
- `backend/app/prompts.py`
- `backend/app/routes/analysis.py`
- `backend/app/services/evaluation.py`
- `backend/app/services/llava_service.py`
- `backend/app/schemas.py`
- `research/documentation/experiment_protocol.md`
- `research/experiments/experiment_metadata.json`
- `research/experiments/results_summary.md`

**Audit baseline:** Repository commit `c446643`.
