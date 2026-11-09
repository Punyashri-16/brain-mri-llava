import json
import ollama

from app.prompts import get_prompt
from app.schemas import MRIReport


MODEL_NAME = "llava"


def generate_mri_report(image_bytes: bytes, prompt_type: str):
    """
    Send an MRI image and a selected research prompt to LLaVA.
    Returns a structured report and an inference status.
    """

    prompt = get_prompt(prompt_type)

    prompt += """

    Return your response as a valid JSON object with exactly these keys:
    {
        "findings": "string",
        "location": "string",
        "lesion_characteristics": "string",
        "edema": "string",
        "mass_effect": "string",
        "interpretation": "string",
        "uncertainty": "string"
    }

    If something cannot be assessed from this image, say "Not assessable".
    Do not invent information.
    Return JSON only. Do not include Markdown code fences.
    Remember this is an educational research task, not a clinical diagnosis.
    """

    response = ollama.chat(
        model=MODEL_NAME,
        messages=[
            {
                "role": "user",
                "content": prompt,
                "images": [image_bytes]
            }
        ],
        format="json",
        options={
            "temperature": 0.1,
            "num_predict": 350
        }
    )

    raw_output = response.message.content

    try:
        data = json.loads(raw_output)

        report = MRIReport(
            findings=str(data.get("findings", "Not provided by model")),
            location=str(data.get("location", "Not provided by model")),
            lesion_characteristics=str(
                data.get("lesion_characteristics", "Not provided by model")
            ),
            edema=str(data.get("edema", "Not provided by model")),
            mass_effect=str(data.get("mass_effect", "Not provided by model")),
            interpretation=str(
                data.get("interpretation", "Not provided by model")
            ),
            uncertainty=str(
                data.get("uncertainty", "Not provided by model")
            )
        )

        return report, "success"

    except (json.JSONDecodeError, TypeError, ValueError):
        report = MRIReport(
            findings=raw_output or "The model returned an empty response.",
            location="Not provided by model",
            lesion_characteristics="Not provided by model",
            edema="Not provided by model",
            mass_effect="Not provided by model",
            interpretation="Unstructured model output; no interpretation extracted.",
            uncertainty=(
                "The model did not return valid structured JSON. "
                "Manual review is required."
            )
        )

        return report, "unstructured"