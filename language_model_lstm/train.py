import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Embedding, LSTM, Dense, Dropout
from tensorflow.keras.utils import Sequence
import pickle
import os

# Load the dataset
file_path = 'emails.txt'
with open(file_path, 'r', encoding='utf-8') as file:
    data = file.read()

# Tokenize the text
tokenizer = Tokenizer()
tokenizer.fit_on_texts([data])
total_words = len(tokenizer.word_index) + 1

# Save the tokenizer
with open('tokenizer.pickle', 'wb') as handle:
    pickle.dump(tokenizer, handle, protocol=pickle.HIGHEST_PROTOCOL)

# Create input sequences
input_sequences = []
for line in data.split('\n'):
    token_list = tokenizer.texts_to_sequences([line])[0]
    for i in range(1, len(token_list)):
        n_gram_sequence = token_list[:i+1]
        input_sequences.append(n_gram_sequence)

# Pad sequences and create predictors and labels
max_sequence_len = max([len(x) for x in input_sequences])
input_sequences = np.array(pad_sequences(input_sequences, maxlen=max_sequence_len, padding='pre'))

predictors, label = input_sequences[:,:-1], input_sequences[:,-1]

# Define a data generator
class DataGenerator(Sequence):
    def __init__(self, predictors, label, batch_size, total_words):
        self.predictors = predictors
        self.label = label
        self.batch_size = batch_size
        self.total_words = total_words
        self.indices = np.arange(len(self.predictors))
    
    def __len__(self):
        return int(np.floor(len(self.predictors) / self.batch_size))
    
    def __getitem__(self, index):
        batch_indices = self.indices[index * self.batch_size:(index + 1) * self.batch_size]
        batch_x = self.predictors[batch_indices]
        batch_y = tf.keras.utils.to_categorical(self.label[batch_indices], num_classes=self.total_words)
        return batch_x, batch_y

    def on_epoch_end(self):
        np.random.shuffle(self.indices)

# Parameters
batch_size = 128

# Instantiate the data generator
data_gen = DataGenerator(predictors, label, batch_size, total_words)

# Define the model
model = Sequential()
model.add(Embedding(total_words, 100, input_length=max_sequence_len-1))
model.add(LSTM(150, return_sequences=True))
model.add(Dropout(0.2))
model.add(LSTM(100))
model.add(Dense(total_words, activation='softmax'))

# Compile the model
model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])
model.summary()

# Train the model
history = model.fit(data_gen, epochs=50, verbose=1)

# Save the model
model.save('lennart_model.h5')
print("Model saved as next_word_model.h5")

# Save the tokenizer
with open('lennart_tokenizer.pickle', 'wb') as handle:
    pickle.dump(tokenizer, handle, protocol=pickle.HIGHEST_PROTOCOL)
print("Tokenizer saved as tokenizer.pickle")