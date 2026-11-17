# Literature Review: Radiology-Guided Explainable Brain MRI Analysis Using LLaVA

## 1. Introduction

This literature review examines research relevant to medical vision-language models (VLMs), LLaVA-based biomedical image interpretation, radiology prompt engineering, hallucination and reliability, and explainability and uncertainty in AI-generated radiology reports.

The reviewed work provides the research background for comparing four prompt configurations (Generic, Tumor-focused, Radiology-guided, and Safety-aware) in the project's exploratory brain MRI experiment.

An important distinction is that the current project implementation identifies its model as the Ollama model alias `llava`. It does not identify the deployed model as LLaVA-Med. LLaVA-Med is therefore discussed as related biomedical research, not as the model used in this experiment.

## 2. Medical Vision-Language Models

### Paper 1: Vision-language models for medical report generation and visual question answering: a review

**Authors:** Iryna Hartsock and Ghulam Rasool
**Year:** 2024
**Publication:** Frontiers in Artificial Intelligence, Volume 7
**DOI:** https://doi.org/10.3389/frai.2024.1430984
**Publication type:** Peer-reviewed review article.

**Research objective:**

To review publicly available medical vision-language models, particularly models developed for medical report generation and visual question answering.

**Methodology:**

The authors review medical VLM datasets, model architectures, pretraining strategies, and evaluation approaches. Their review covers 18 publicly available medical VLM datasets and discusses 16 notable medical VLM architectures.

**Relevant findings:**

The review describes how medical VLMs combine visual and language representations to support medical image understanding and text generation. It also identifies challenges including limited data availability, privacy concerns, and inadequate evaluation metrics.

**Relevance to this project:**

This paper provides the broader research background for using a VLM to interpret brain MRI images and generate structured explanations. Its discussion of evaluation limitations supports the need to distinguish structural completeness from factual accuracy.

---

### Paper 2: Med-Flamingo: A Multimodal Medical Few-shot Learner

**Authors:** Michael Moor, Qian Huang, Shirley Wu, Michihiro Yasunaga, Yash Dalmia, Jure Leskovec, Cyril Zakka, Eduardo Pontes Reis, and Pranav Rajpurkar
**Year:** 2023
**Publication:** Proceedings of the 3rd Machine Learning for Health Symposium, PMLR 225, pages 353–367
**Official publication:** https://proceedings.mlr.press/v225/moor23a.html
**Publication type:** Research conference proceedings.

**Research objective:**

To develop a medical vision-language model capable of learning from a small number of examples, reducing dependence on large task-specific fine-tuning datasets.

**Methodology:**

The authors adapt OpenFlamingo-9B through continued pretraining on paired and interleaved medical image-text data collected from publications and textbooks. They evaluate its few-shot medical visual question-answering capabilities across several datasets.

The study also includes human evaluation in which physicians assess generated responses.

**Relevant findings:**

The authors report improvements in generative medical VQA, including improvements of up to 20% in clinician ratings in their evaluated settings. The work demonstrates the potential of few-shot adaptation for medical image-language tasks.

**Relevance to this project:**

This work illustrates how a general multimodal model can be adapted to medical contexts. It also demonstrates the importance of human evaluation rather than relying exclusively on automated output measures.

---

## 3. LLaVA and Medical Image Interpretation

### Paper 3: Visual Instruction Tuning

**Authors:** Haotian Liu, Chunyuan Li, Qingyang Wu, and Yong Jae Lee
**Year:** 2023
**Publication:** Advances in Neural Information Processing Systems 36 (NeurIPS 2023)
**Official publication:** https://proceedings.neurips.cc/paper_files/paper/2023/hash/6dcf277ea32ce3288914faf369fe6de0-Abstract-Conference.html
**Publication type:** Peer-reviewed conference paper.

**Research objective:**

To improve multimodal instruction-following capabilities by connecting visual representations with a large language model.

**Methodology:**

The authors introduce LLaVA, a large language and vision assistant. Their approach uses a vision encoder connected to a language model and employs visual instruction-following data generated with assistance from GPT-4.

They also introduce evaluation benchmarks for multimodal instruction following.

**Relevant findings:**

The paper demonstrates that visual instruction tuning can improve the ability of a model to respond to questions about images and follow multimodal instructions.

**Relevance to this project:**

This paper provides the foundational background for the LLaVA architecture used by the project. It explains why instructions can influence the way visual information is described.

However, general-purpose visual instruction-following performance does not establish medical diagnostic reliability.

---

### Paper 4: LLaVA-Med: Training a Large Language-and-Vision Assistant for Biomedicine in One Day

**Authors:** Chunyuan Li, Cliff Wong, Sheng Zhang, Naoto Usuyama, Haotian Liu, Jianwei Yang, Tristan Naumann, Hoifung Poon, and Jianfeng Gao
**Year:** 2023
**Publication:** Advances in Neural Information Processing Systems 36, Datasets and Benchmarks Track
**DOI:** https://doi.org/10.52202/075280-1240
**Official publication:** https://papers.nips.cc/paper_files/paper/2023/hash/5abcdf8ecdcacba028c6662789194572-Abstract-Datasets_and_Benchmarks.html
**Publication type:** Peer-reviewed conference paper.

**Research objective:**

To adapt a general-purpose vision-language assistant for biomedical image understanding and open-ended biomedical conversations.

**Methodology:**

The authors use biomedical figure-caption pairs extracted from PubMed Central and GPT-4-generated instruction-following data.

Their curriculum learning approach consists of two stages:

1. Biomedical vocabulary alignment using image-caption pairs.
2. Instruction tuning to improve open-ended biomedical conversation.

The authors report training the model in less than 15 hours using eight A100 GPUs.

**Relevant findings:**

The paper reports improvements over previous supervised approaches on certain metrics across three biomedical visual question-answering datasets.

**Relevance to this project:**

LLaVA-Med is directly relevant because it demonstrates the adaptation of LLaVA to biomedical image interpretation.

It also establishes an important distinction for the present research: the project's current Ollama model alias is `llava`, not an explicitly identified LLaVA-Med checkpoint. Results from LLaVA-Med cannot automatically be attributed to the project's model.

---

## 4. Prompt Engineering in Radiology

### Paper 5: A Hitchhiker's Guide to Good Prompting Practices for Large Language Models in Radiology

**Authors:** Satvik Tripathi, Dana Alkhulaifat, Shawn Lyo, Rithvik Sukumaran, Bolin Li, Vedant Acharya, Rafe McBeth, and Tessa S. Cook
**Year:** 2025
**Publication:** Journal of the American College of Radiology, Volume 22, Issue 7, pages 841–847
**DOI:** https://doi.org/10.1016/j.jacr.2025.02.051
**Publication type:** Review article.

**Research objective:**

To explain prompt engineering approaches that can improve the usefulness and reliability of large language models in radiology.

**Methodology:**

The review discusses prompting approaches including:

- Zero-shot prompting.
- One-shot prompting.
- Few-shot prompting.
- Chain-of-thought prompting.
- Tree-of-thought prompting.

It also discusses prompt complexity and temperature settings.

**Relevant findings:**

The review emphasizes precise and iterative prompt design, along with methodological transparency, when applying LLMs to radiology tasks.

**Relevance to this project:**

This paper directly supports the project's comparison of different prompting strategies.

The four project prompts can be examined in terms of their instructions, reporting structure, uncertainty requirements, and restrictions against unsupported findings.

The paper does not establish that any one of the project's four prompts is superior; that requires evaluation using actual experiment outputs.

---

### Paper 6: Optimizing Large Language Models in Radiology and Mitigating Pitfalls: Prompt Engineering and Fine-tuning

**Authors:** Theodore Taehoon Kim, Michael Makutonin, Reza Sirous, and Ramin Javan
**Year:** 2025
**Publication:** RadioGraphics, Volume 45, Issue 4
**DOI:** https://doi.org/10.1148/rg.240073
**Publication type:** Review article.

**Research objective:**

To examine the use of prompt engineering and fine-tuning for radiology applications while discussing limitations and potential pitfalls of LLMs.

**Methodology:**

The authors review approaches for adapting language models to radiology, including prompt design, model fine-tuning, and methods for addressing limitations in medical applications.

**Relevant findings:**

The review discusses the importance of domain-specific instructions and adaptation, while recognizing that model outputs can be unreliable and require appropriate safeguards.

**Relevance to this project:**

This work supports the need to assess whether radiology-oriented prompts produce clearer and more appropriately qualified explanations than generic instructions.

It also supports documenting the limitations of the current exploratory model rather than treating generated reports as clinically validated interpretations.

---

## 5. Hallucination and Reliability of Medical Multimodal AI

### Paper 7: MedVH: Toward Systematic Evaluation of Hallucination for Large Vision Language Models in the Medical Context

**Authors:** Zishan Gu, Jiayuan Chen, Fenglin Liu, Changchang Yin, and Ping Zhang
**Year:** 2025
**Publication:** Advanced Intelligent Systems
**DOI:** https://doi.org/10.1002/aisy.202500255
**Publication type:** Journal research article.

**Research objective:**

To develop a systematic framework for evaluating hallucinations produced by medical and general-purpose large vision-language models.

**Methodology:**

The authors introduce the Medical Visual Hallucination Test (MedVH). The framework contains six evaluation tasks, including multiple-choice visual question answering and long-response generation.

The study evaluates models using six evaluation metrics.

**Relevant findings:**

The authors report that medical VLMs can remain susceptible to hallucinations despite their performance on standard medical tasks. Their findings highlight the importance of evaluating hallucination risks separately from general task performance.

**Relevance to this project:**

This paper is particularly relevant to checking whether generated brain MRI explanations contain claims that are not supported by the supplied image.

It supports the qualitative evaluation of unsupported anatomical descriptions, invented lesion characteristics, and inconsistent statements across prompt configurations.

The project's Assessable Field Rate cannot replace hallucination evaluation.

---

## 6. Explainability, Grounding, and Uncertainty

### Paper 8: MAIRA-2: Grounded Radiology Report Generation

**Authors:** Shruthi Bannur, Kenza Bouzid, Daniel Coelho de Castro, Anton Schwaighofer, Sam Bond-Taylor, Maximilian Ilse, Fernando Pérez-García, Valentina Salvatelli, Harshita Sharma, Felix Meissen, Mercy Ranjit, Shaury Srivastav, Julia Gong, Fabian Falck, Ozan Oktay, Anja Thieme, Matthew P. Lungren, Maria Teodora Wetscherek, Javier Alvarez-Valle, and Stephanie Hyland
**Year:** 2024
**Publication:** Microsoft Research Technical Report MSR-TR-2024-18
**Official publication:** https://www.microsoft.com/en-us/research/publication/maira-2-grounded-radiology-report-generation/
**Publication type:** Institutional technical report; not classified here as a peer-reviewed journal article.

**Research objective:**

To develop a radiology report generation approach that connects generated findings to their locations in the medical image.

**Methodology:**

The authors introduce MAIRA-2, a multimodal model combining a radiology-specific image encoder and a language model.

The system uses multiple chest X-ray inputs and associated report information. The authors also introduce RadFact, an evaluation framework for assessing sentence-level factuality and spatial localization.

**Relevant findings:**

The authors report that additional contextual inputs improve report quality and reduce hallucinations in their evaluated chest X-ray setting. The work also demonstrates grounded report generation as a richer task than producing text alone.

**Relevance to this project:**

This research highlights an important limitation of the current project: a structured text report does not itself demonstrate that each statement is visually grounded.

The current implementation produces text fields but does not provide image-region attribution or a direct mapping between individual report claims and image regions.

MAIRA-2 therefore provides a useful reference for future explainability and grounding research.

---

### Paper 9: Uncertainty Estimation in Large Vision Language Models for Automated Radiology Report Generation

**Author:** Jenny Xu
**Year:** 2025
**Publication:** Proceedings of the 4th Machine Learning for Health Symposium, PMLR 259, pages 1039–1052
**Official publication:** https://proceedings.mlr.press/v259/xu25a.html
**Publication type:** Research conference proceedings.

**Research objective:**

To investigate whether uncertainty estimation scores can help assess the reliability of automatically generated radiology reports.

**Methodology:**

The study evaluates the relationship between 16 LLM uncertainty scores and six radiology report evaluation metrics across four state-of-the-art vision-language models for chest X-ray report generation.

**Relevant findings:**

The authors report Pearson correlations ranging from approximately 0.4 to 0.6 for several uncertainty scores and evaluated models.

The work demonstrates that uncertainty estimation can be studied quantitatively rather than relying only on the presence of uncertainty-related words in a report.

**Relevance to this project:**

The current project includes an uncertainty field in its seven-field report structure. However, the presence of text in that field does not establish that the model is calibrated or that its uncertainty statements are reliable.

This paper supports treating uncertainty communication as a separate evaluation dimension.

---

## 7. Evaluation of AI-Generated Radiology Reports

### Paper 10: Evaluating Progress in Automatic Chest X-ray Radiology Report Generation

**Authors:** Feiyang Yu, Mark Endo, Rayan Krishnan, Ian Pan, Andy Tsai, Eduardo Pontes Reis, Eduardo Kaiser Ururahy Nunes Fonseca, Henrique Min Ho Lee, Zahra Shakeri Hossein Abad, Andrew Y. Ng, Curtis P. Langlotz, Vasantha Kumar Venugopal, and Pranav Rajpurkar
**Year:** 2023
**Publication:** Patterns, Volume 4, Issue 9, Article 100802
**DOI:** https://doi.org/10.1016/j.patter.2023.100802
**Official full text:** https://pmc.ncbi.nlm.nih.gov/articles/PMC10499844/
**Publication type:** Peer-reviewed journal research article.

**Research objective:**

To investigate whether automated metrics for radiology report generation align with the assessments made by radiologists.

**Methodology:**

The authors compare automated report evaluation metrics with radiologist assessments of report errors.

They introduce:

- RadGraph F1, which evaluates overlap in clinically relevant entities and their relationships.
- RadCliQ, a composite metric designed to better align automated evaluation with radiologist assessments.

**Relevant findings:**

The study identifies limitations in commonly used automated report evaluation metrics and reports improved alignment with radiologist assessments using the proposed measures.

**Relevance to this project:**

This paper supports the need for stronger evaluation than counting whether report fields contain text.

The current project's Assessable Field Rate measures structural completeness only. It does not measure the correctness of lesion descriptions, anatomical locations, or other medical claims.

The study also concerns chest X-ray reports, so its metrics and findings should not be assumed to transfer directly to brain MRI without validation.

---

## 8. Overall Research Gaps and Project Implications

The reviewed literature suggests several important research considerations.

### 8.1 Model specialization

General-purpose VLMs and medically adapted VLMs are not interchangeable. The project should clearly identify the exact model and version used in its experiments.

### 8.2 Prompt sensitivity

Radiology-specific prompting may influence report structure, terminology, and uncertainty communication. However, improvements in presentation do not automatically establish improvements in factual correctness.

### 8.3 Hallucination detection

A generated statement may be structurally valid and medically plausible while lacking support from the supplied image. Qualitative review must therefore examine the evidence for individual claims.

### 8.4 Grounded explainability

A text explanation is not equivalent to visual explainability. Stronger grounding would require a method to connect report statements to image regions or independently verified image evidence.

### 8.5 Uncertainty evaluation

A populated uncertainty field does not establish calibrated uncertainty. Further evaluation would need to examine whether uncertainty statements correspond to actual model reliability.

### 8.6 Evaluation methodology

Structural completeness, factual correctness, image grounding, consistency, and uncertainty calibration are separate evaluation dimensions. They should not be represented by one completeness percentage.

### 8.7 Dataset and generalisability

The current baseline experiment uses one BraTS 2021 sample and one T1CE slice. Findings from this experiment must remain exploratory and cannot establish performance across patients, modalities, or clinical settings.

## 9. Summary

The reviewed research establishes a foundation for investigating prompt-guided medical image explanations using vision-language models.

LLaVA and LLaVA-Med provide relevant architectural and biomedical adaptation background. Radiology prompting literature motivates the comparison of different instruction strategies. Hallucination, grounding, and uncertainty research demonstrate why structured output alone is insufficient to establish reliability.

For the present project, the most important research distinction is between producing a well-structured explanation and producing an explanation that is factually supported by the MRI image.

The literature therefore supports a cautious, evidence-based qualitative comparison of the four prompt configurations, while recognizing the limitations of the current single-sample experiment.

## 10. References

1. Hartsock, I., & Rasool, G. (2024). Vision-language models for medical report generation and visual question answering: a review. Frontiers in Artificial Intelligence, 7. https://doi.org/10.3389/frai.2024.1430984

2. Moor, M., et al. (2023). Med-Flamingo: a Multimodal Medical Few-shot Learner. Proceedings of the 3rd Machine Learning for Health Symposium, PMLR 225, 353–367. https://proceedings.mlr.press/v225/moor23a.html

3. Liu, H., Li, C., Wu, Q., & Lee, Y. J. (2023). Visual Instruction Tuning. Advances in Neural Information Processing Systems 36. https://proceedings.neurips.cc/paper_files/paper/2023/hash/6dcf277ea32ce3288914faf369fe6de0-Abstract-Conference.html

4. Li, C., et al. (2023). LLaVA-Med: Training a Large Language-and-Vision Assistant for Biomedicine in One Day. Advances in Neural Information Processing Systems 36, Datasets and Benchmarks Track. https://doi.org/10.52202/075280-1240

5. Tripathi, S., et al. (2025). A Hitchhiker's Guide to Good Prompting Practices for Large Language Models in Radiology. Journal of the American College of Radiology, 22(7), 841–847. https://doi.org/10.1016/j.jacr.2025.02.051

6. Kim, T. T., Makutonin, M., Sirous, R., & Javan, R. (2025). Optimizing Large Language Models in Radiology and Mitigating Pitfalls: Prompt Engineering and Fine-tuning. RadioGraphics, 45(4). https://doi.org/10.1148/rg.240073

7. Gu, Z., Chen, J., Liu, F., Yin, C., & Zhang, P. (2025). MedVH: Toward Systematic Evaluation of Hallucination for Large Vision Language Models in the Medical Context. Advanced Intelligent Systems. https://doi.org/10.1002/aisy.202500255

8. Bannur, S., et al. (2024). MAIRA-2: Grounded Radiology Report Generation. Microsoft Research Technical Report MSR-TR-2024-18. https://www.microsoft.com/en-us/research/publication/maira-2-grounded-radiology-report-generation/

9. Xu, J. (2025). Uncertainty Estimation in Large Vision Language Models for Automated Radiology Report Generation. Proceedings of the 4th Machine Learning for Health Symposium, PMLR 259, 1039–1052. https://proceedings.mlr.press/v259/xu25a.html

10. Yu, F., et al. (2023). Evaluating Progress in Automatic Chest X-ray Radiology Report Generation. Patterns, 4(9), 100802. https://doi.org/10.1016/j.patter.2023.100802
