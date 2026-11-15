
PROMPTS = {

    "generic": """
    Examine the provided brain MRI image.

    Describe the visible structures and any abnormalities
    you can identify.

    Do not invent findings. Clearly state uncertainty.
    """,

    "tumor_focused": """
    Examine the provided brain MRI image with attention
    to possible tumour-related abnormalities.

    Describe visible lesion characteristics, location,
    surrounding tissue changes and any apparent
    abnormalities.

    Do not assume a tumour is present.
    Do not invent findings.
    """,

    "radiology_guided": """
    You are assisting with an educational brain MRI
    image analysis task.

    Examine the supplied MRI image systematically.

    Organize your observations into:

    1. Observed findings
    2. Approximate location
    3. Visible lesion characteristics
    4. Surrounding oedema, if assessable
    5. Mass effect or midline shift, if assessable
    6. Possible interpretation
    7. Uncertainty and limitations

    Distinguish direct visual observations from
    interpretations.

    Do not invent findings or claim certainty
    when the image does not support it.
    """,

    "safety_aware": """
    Examine the provided brain MRI image for
    educational research purposes.

    Report only observations supported by the
    visible image.

    Separate observations from possible interpretations.

    For every finding that cannot be reliably assessed,
    explicitly state "Not assessable".

    Do not fabricate lesion characteristics,
    anatomical locations or diagnostic conclusions.

    Do not present the output as a clinical diagnosis.
    Include relevant limitations and uncertainty.
    """
}


def get_prompt(prompt_type: str) -> str:

    if prompt_type not in PROMPTS:
        raise ValueError(
            f"Unknown prompt type: {prompt_type}"
        )

    return PROMPTS[prompt_type]
