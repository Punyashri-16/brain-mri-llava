# Baseline Experiment — Results Summary

## 1. Experiment Information

- Experiment ID: baseline_01
- Dataset: BraTS 2021
- Sample: BraTS2021_00495
- Input: T1CE_slice.png
- Model: LLaVA (Ollama)
- Experiment date: Pending confirmation
- Overall experiment status: Four prompt runs returned; one output was marked unstructured.

## 2. Prompt Comparison Results

| Prompt | Status | Inference Time (s) | Assessable Fields | Total Fields | Assessable Field Rate |
|---|---|---:|---:|---:|---:|
| Generic | Success | 99.23 | 1 | 7 | 14.29% |
| Tumor-focused | Success | 30.85 | 0 | 7 | 0.00% |
| Radiology-guided | Success | 69.35 | 5 | 7 | 71.43% |
| Safety-aware | Unstructured | 81.10 | 3 | 7 | 42.86% |

- Total inference duration across four runs: 280.52 seconds.
- Mean inference time: 70.13 seconds.
- Total assessable fields recorded by the supplied evaluator: 9 of 28 (32.14%).

**Metric interpretation:** Assessable Field Rate is a structural-completeness measure as defined by the experiment evaluator. It does not establish that a field is medically correct, supported by the MRI, or clinically useful. The per-prompt rates above are reproduced from the supplied comparison JSON.

## 3. Qualitative Observations

### Generic

- The model marked six report fields as "Not assessable".
- It provided an explicit limitation statement, explaining that a single MRI slice is insufficient for comprehensive assessment and that additional imaging and clinical information would be needed.
- The evaluator marked only the uncertainty field assessable (1/7; 14.29%).
- The response was cautious, but it provided very little descriptive content for the requested report fields.

### Tumor-focused

- All seven report fields were returned as "Not assessable".
- No uncertainty explanation was provided in the report.
- The evaluator recorded zero assessable fields (0/7; 0%).
- Despite the tumor-focused prompt, the output did not provide usable descriptive content under the evaluator's field definitions.

### Radiology-guided

- The output populated findings, location, lesion characteristics, interpretation, and uncertainty; edema and mass effect were marked "Not assessable".
- The model asserted a left frontal-lobe lesion and characterized it as a high-grade glioma, with further claims about irregular shape and contrast enhancement.
- These are model-generated assertions, not verified findings. The supplied experiment does not establish their factual or clinical accuracy. They require independent review against the source MRI and appropriate expert/reference assessment.
- The interpretation included possible functional implications but also stated that clinical context was insufficient for a definitive interpretation.
- The evaluator recorded five assessable fields (5/7; 71.43%), the highest rate among the four prompts. This is not evidence that this output was the most accurate.

### Safety-aware

- The run status was marked `unstructured`.
- The `findings` field contains a long string that itself begins with JSON-like report content, rather than a cleanly extracted findings value.
- The embedded content includes claims about a possible lesion, location, lesion appearance, edema, and mass effect. These claims are not independently verified by this experiment.
- The embedded text appears incomplete/truncated: it ends mid-structure without closing the quoted uncertainty value or JSON object.
- The outer report fields for location, lesion characteristics, and edema say "Not provided by model"; interpretation says that no interpretation was extracted; and uncertainty records a parser/format warning requiring manual review.
- Although the evaluator flags uncertainty as provided and records three assessable fields (3/7; 42.86%), that flag should not be treated as proof that the model successfully returned a valid uncertainty field. The run's unstructured status and parser warning must be considered.

## 4. Cross-Prompt Comparison

- **Structural completeness:** Radiology-guided had the highest evaluator-recorded rate (71.43%), followed by safety-aware (42.86%), generic (14.29%), and tumor-focused (0%). These values compare field assessability only.
- **Uncertainty:** Generic and radiology-guided included explicit limitation statements. Tumor-focused returned "Not assessable" for uncertainty. Safety-aware contained uncertainty-like text inside the embedded, malformed output, but the outer uncertainty field is a parser warning; its uncertainty handling therefore requires manual inspection.
- **Unsupported or unverified claims:** The radiology-guided and safety-aware outputs made specific lesion-related assertions. The supplied JSON contains no independent verification of those assertions. They must not be presented as established MRI findings.
- **Report structure:** Generic, tumor-focused, and radiology-guided were represented as structured report objects in the comparison result. Safety-aware was marked unstructured and appears to have returned JSON-like content inside a string, with incomplete/truncated content.
- **Inference time:** Tumor-focused was fastest (30.85 s), while generic was slowest (99.23 s). These are single-run observations and should not be treated as stable performance estimates.

## 5. Limitations

- Assessable Field Rate does not indicate factual accuracy, clinical correctness, or evidence grounding.
- Model-generated lesion descriptions and anatomical claims require independent verification; this experiment does not validate them.
- Only one MRI sample and one T1CE slice are evaluated.
- The experiment does not measure pixel-level segmentation performance.
- Each prompt configuration appears to have been run once; timing and output differences may not be reproducible.
- The safety-aware output was marked unstructured and appears truncated, so its field-level evaluation should be interpreted cautiously.
- No blinded expert assessment or clinical validation is reported in the supplied comparison JSON.
- The experiment metadata records temperature 0.1 and a 350-token generation limit; the incomplete safety-aware output may be consistent with an output-length/formatting issue, but the JSON alone does not establish the cause.

## 6. Conclusion

All four prompt runs returned results, but their structural completeness differed substantially. The radiology-guided prompt had the highest evaluator-recorded Assessable Field Rate (71.43%), while the tumor-focused prompt had the lowest (0%). The generic prompt provided a clear limitation statement but left most report fields unassessable. The safety-aware run was marked unstructured and its embedded JSON-like text appears incomplete, requiring manual review of the raw model response and output-parsing behavior.

These findings support only an exploratory comparison of output structure, uncertainty wording, and response formatting for one T1CE slice. They do not establish diagnostic accuracy, clinical reliability, or superiority of any prompt. Specific lesion-related statements must remain unverified unless independently assessed against suitable reference information.
