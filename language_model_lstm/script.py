import os
import pandas as pd

def find_txt_files(root_dir):
    """Rekursiv alle txt-Dateien in einem Verzeichnisbaum finden"""
    txt_files = []
    for dirpath, _, filenames in os.walk(root_dir):
        for file in filenames:
            if file.endswith('.txt'):
                txt_files.append(os.path.join(dirpath, file))
    return txt_files

def read_txt_files(txt_files):
    """Inhalte aller txt-Dateien lesen und in einer Liste speichern"""
    texts = []
    for file in txt_files:
        with open(file, 'r', encoding='utf-8') as f:
            texts.append(f.read())
    return texts

def prepare_data(texts):
    """Daten in ein pandas DataFrame laden"""
    df = pd.DataFrame({'text': texts})
    return df

# Hauptverzeichnis mit den Email-Daten
root_dir = 'data/CodEAlltag_pXL_GERMAN-master/1-/10-'

# Alle txt-Dateien finden
txt_files = find_txt_files(root_dir)

# Inhalte der txt-Dateien lesen
texts = read_txt_files(txt_files)

# Daten in einem DataFrame speichern
data = prepare_data(texts)

# Optional: Daten speichern
data.to_csv('emails.txt', index=False)

print("Anzahl der gefundenen Dateien:", len(txt_files))
print("Beispielinhalt einer Datei:", texts[0][:200])  # Ersten 200 Zeichen einer Datei anzeigen
