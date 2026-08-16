# Multimodal Decision Fusion Strategy

## 1. Objective

Digital identity attacks (such as AI clones, deepfakes, and automated persona impersonation) frequently exhibit subtle synthetic traces across multiple modalities. Decision-level fusion aggregates the outputs of independent unimodal classifiers (Visual CNN and Text NLP) to produce a calibrated, holistic authenticity verdict.

---

## 2. Mathematical Formulation

Let:
- $S_{img} \in [0, 1]$: Predicted authenticity probability from the visual CNN.
- $S_{txt} \in [0, 1]$: Predicted authenticity probability from the NLP/LLM stylometric module.
- $w_{img} \in [0, 1]$: Configurable weight assigned to visual features (Default: $0.60$).
- $w_{txt} \in [0, 1]$: Configurable weight assigned to textual features (Default: $0.40$).
- Subject to the constraint:
  $$w_{img} + w_{txt} = 1.0$$

The fused authenticity score $F$ is computed as:
$$F = w_{img} \cdot S_{img} + w_{txt} \cdot S_{txt}$$

---

## 3. Modality Routing Strategies

1. **Unimodal Facial Image Input**:
   - Effective weights: $w_{img} = 1.0, w_{txt} = 0.0$
   - $F = S_{img}$
   - Strategy: Direct visual artifact assessment.

2. **Unimodal Text Input**:
   - Effective weights: $w_{img} = 0.0, w_{txt} = 1.0$
   - $F = S_{txt}$
   - Strategy: Stylometric and linguistic pattern assessment.

3. **Multimodal Dual Input**:
   - Normalized weights: $w_{img} = 0.60, w_{txt} = 0.40$
   - $F = (0.60 \times S_{img}) + (0.40 \times S_{txt})$
   - **Cross-Modal Calibration**:
     - *Corroboration Bonus*: If both modalities yield congruent predictions ($\text{sign}(S_{img} - 0.5) == \text{sign}(S_{txt} - 0.5)$), confidence is enhanced ($C_{fused} = \min(C_{base} \times 1.05, 0.99)$).
     - *Divergence Penalty*: If modalities present conflicting signals, confidence is attenuated to reflect uncertainty ($C_{fused} = \max(C_{base} \times 0.88, 0.45)$).

---

## 4. Classification Thresholds

| Authenticity Score Range ($F$) | Final Classification Verdict | Action / Recommendation |
|---|---|---|
| $F \ge 0.70$ ($70\% - 100\%$) | **Authentic** | Content exhibits natural photographic and human linguistic traits. |
| $0.40 < F < 0.70$ ($41\% - 69\%$) | **Potential Clone / Suspect** | Cross-modal variance or ambiguous artifacts detected. Manual review recommended. |
| $F \le 0.40$ ($0\% - 40\%$) | **AI-Generated / Synthetic Content** | High probability of synthetic generation / manipulation. |
