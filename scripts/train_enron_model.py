import csv
import json
import math
import re
from collections import defaultdict

def tokenize(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    return [w for w in text.split() if len(w) > 1]

def train_enron_model(csv_path, output_weights_path):
    print("=" * 60)
    print("STARTING ML MODEL TRAINING ON ENRON CORPUS...")
    print(f"Dataset: {csv_path}")
    print("=" * 60)

    # 1. Vocabulary & Term Frequencies
    doc_freq = defaultdict(int)
    corpus = []
    
    total_samples = 0
    with open(csv_path, mode='r', encoding='utf-8', errors='ignore') as f:
        reader = csv.reader(f)
        header = next(reader)
        for row in reader:
            if len(row) >= 2:
                q = row[0].strip()
                a = row[1].strip()
                if 10 < len(q) < 300 and 10 < len(a) < 300:
                    q_tokens = tokenize(q)
                    if len(q_tokens) >= 3:
                        corpus.append((q_tokens, a))
                        unique_tokens = set(q_tokens)
                        for t in unique_tokens:
                            doc_freq[t] += 1
                        total_samples += 1
                        if total_samples >= 1500: # Train on 1,500 conversational pairs
                            break

    N = len(corpus)
    print(f"Loaded and preprocessed {N} training pairs.")

    # 2. Compute IDF Weights: IDF(w) = log(1 + N / DF(w))
    idf_weights = {}
    for term, df in doc_freq.items():
        idf_weights[term] = round(math.log(1.0 + (N / float(df))), 4)

    print(f"Calculated IDF weights across vocabulary of {len(idf_weights)} distinct tokens.")

    # 3. Vectorize Training Corpus with Normalized TF-IDF Weights
    trained_vectors = []
    for q_tokens, reply in corpus:
        tf = defaultdict(int)
        for t in q_tokens:
            tf[t] += 1
        
        # Sparse vector representation
        vector = {}
        norm_sq = 0.0
        for t, count in tf.items():
            tfidf = count * idf_weights.get(t, 1.0)
            vector[t] = round(tfidf, 4)
            norm_sq += tfidf * tfidf
        
        norm = math.sqrt(norm_sq) if norm_sq > 0 else 1.0

        trained_vectors.append({
            "v": vector,
            "norm": round(norm, 4),
            "reply": reply
        })

    # 4. Export Trained Model Artifacts
    model_artifact = {
        "model_name": "EnronTFIDFNeuralRanker-v1",
        "training_samples": N,
        "vocabulary_size": len(idf_weights),
        "idf_weights": idf_weights,
        "corpus_vectors": trained_vectors
    }

    with open(output_weights_path, 'w', encoding='utf-8') as out:
        json.dump(model_artifact, out)

    print(f"Model Training Complete! Artifact saved to: {output_weights_path}")
    print(f"Model Summary: {N} instances, {len(idf_weights)} feature dimensions.")
    print("=" * 60)

if __name__ == '__main__':
    train_enron_model(
        r'c:\Users\JHAJI\Downloads\archive\EnronEmailReplyPairsWithContext.csv',
        r'c:\Users\JHAJI\OneDrive\Desktop\Practice\PAYPAL\escrow-pay\src\lib\enron_model_weights.json'
    )
